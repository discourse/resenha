import { env as ortEnv } from "onnxruntime-web";
import { fromUrls } from "parakeet.js";

// Dedicated Worker owning the Parakeet ASR model for live subtitles. The
// main thread's SubtitlesManager sends one init message, then VAD-committed
// utterance windows ({type:"transcribe"}); results come back as captions.
// Protocol mirrors the noise-suppression worklet contract: init →
// progress*/ready | error, so the UI can show download progress and flip
// the toggle off on any failure.
//
// The encoder runs on WebGPU (fp32 — the fp16 variant silently decodes to
// empty strings on some GPU/driver combinations), the decoder on
// single-threaded WASM (int8) — single-threaded on purpose: multithreaded
// ort-wasm needs SharedArrayBuffer and therefore COOP/COEP headers
// Discourse doesn't set.

// Discourse's clone of ysdede/parakeet-tdt-0.6b-v3-onnx (models CC-BY-4.0);
// overridable per site via the resenha_stt_model_base_url setting.
const DEFAULT_MODEL_BASE =
  "https://huggingface.co/Discourse/parakeet-tdt-0.6b-v3-onnx/resolve/main";
const SAMPLE_RATE = 16000;
const MODEL_CACHE = "resenha-stt-model";

// Utterances shorter than this are VAD noise; transcribing them wastes an
// encoder pass and tends to hallucinate short filler words.
const MIN_UTTERANCE_SECONDS = 0.4;

// Backpressure: on a machine slower than the incoming speech the queue grows
// without bound and captions drift minutes behind live audio. Jobs are
// stamped when the main thread posts them and dropped at execution time once
// they are too old to still be worth showing — losing a line beats being
// permanently behind. Interims go stale almost immediately (a newer snapshot
// or the final supersedes them); finals get a longer grace.
const INTERIM_MAX_LAG_MS = 3_000;
const FINAL_MAX_LAG_MS = 15_000;

// Sustained-throughput tracking: an EMA of the realtime factor (transcribe
// time / audio duration). When the model can't keep up, the main thread is
// told to stop producing interim snapshots entirely (finals only), roughly
// halving the work; interims resume once there is comfortable headroom.
const RTF_SLOW_THRESHOLD = 1.0;
const RTF_RECOVER_THRESHOLD = 0.6;
const RTF_EMA_ALPHA = 0.3;
let rtfEma = null;
let reportedSlow = false;

let model = null;
let queue = Promise.resolve();

// Interim (mid-utterance) jobs are coalesced: only the newest snapshot per
// speaker is worth transcribing, and nothing interim may run once the
// utterance's final pass has been queued behind it.
const latestInterimJob = new Map();
const lastFinalUtterance = new Map();

// Bumped by a flush (speaker detached / room left); queued jobs from an
// older generation are discarded instead of transcribed.
const speakerGeneration = new Map();

// Cached files are stored as slices plus a small manifest written last (its
// presence marks the copy complete). WebKit rejects multi-GB single Cache
// API writes with QuotaExceededError long before the origin quota is
// reached; slice-sized entries work in every engine and also avoid holding
// the whole file in memory during the write.
const CACHE_CHUNK_BYTES = 128 * 1024 * 1024;

// The Cache API ignores URL fragments, so slice identity rides a query
// parameter no origin server ever sees.
function cacheKey(url, suffix) {
  return `${url}${url.includes("?") ? "&" : "?"}resenha_cache=${suffix}`;
}

// Fetches one model file with a durable Cache API copy and streamed byte
// progress, returning an object URL for fromUrls. The Cache API stores the
// multi-GB encoder weights on disk, so repeat enables skip the network even
// when the HTTP cache has evicted them; if the cache is unavailable (quota,
// private browsing) the fetch still works, just uncached.
async function fetchModelFile(url, filename) {
  const cache = await caches.open(MODEL_CACHE).catch(() => null);

  let blob = cache ? await readCachedFile(cache, url).catch(() => null) : null;
  if (!blob && cache) {
    try {
      blob = await downloadIntoCache(cache, url, filename);
    } catch {
      // Quota or write failure part-way through; drop the partial copy and
      // fall back to an uncached (in-memory) download.
      await discardCachedFile(cache, url).catch(() => {});
    }
  }
  blob ||= await downloadIntoMemory(url, filename);

  return URL.createObjectURL(blob);
}

async function readCachedFile(cache, url) {
  // Complete copies stored by the pre-slicing format keep working.
  const legacy = await cache.match(url);
  if (legacy) {
    return legacy.blob();
  }

  const manifestResponse = await cache.match(cacheKey(url, "manifest"));
  if (!manifestResponse) {
    return null;
  }

  const manifest = await manifestResponse.json();
  const parts = [];
  for (let index = 0; index < manifest.chunks; index++) {
    const slice = await cache.match(cacheKey(url, index));
    if (!slice) {
      return null;
    }
    parts.push(await slice.blob());
  }
  // Blob composition references the cache's disk-backed slices; nothing
  // multi-GB is materialized in memory here.
  return new Blob(parts);
}

async function downloadIntoCache(cache, url, filename) {
  // An interrupted earlier download (closed tab) can leave more slices than
  // this download will write; stale higher-index slices must not survive.
  await discardCachedFile(cache, url);

  const reader = await openModelDownload(url, filename);

  let chunkCount = 0;
  let parts = [];
  let partBytes = 0;

  const flush = async () => {
    await cache.put(cacheKey(url, chunkCount), new Response(new Blob(parts)));
    chunkCount++;
    parts = [];
    partBytes = 0;
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    parts.push(value);
    partBytes += value.length;
    reader.reportProgress();
    if (partBytes >= CACHE_CHUNK_BYTES) {
      await flush();
    }
  }
  if (partBytes) {
    await flush();
  }

  await cache.put(
    cacheKey(url, "manifest"),
    new Response(JSON.stringify({ chunks: chunkCount }))
  );

  const blob = await readCachedFile(cache, url);
  if (!blob) {
    throw new Error(`${filename} cache readback failed`);
  }
  return blob;
}

async function downloadIntoMemory(url, filename) {
  const reader = await openModelDownload(url, filename);

  const parts = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    parts.push(value);
    reader.reportProgress();
  }
  return new Blob(parts);
}

async function openModelDownload(url, filename) {
  const network = await fetch(url);
  if (!network.ok) {
    throw new Error(`${filename} fetch failed: ${network.status}`);
  }

  const total = Number(network.headers.get("content-length")) || 0;
  const reader = network.body.getReader();
  let loaded = 0;

  return {
    async read() {
      const result = await reader.read();
      loaded += result.value?.length || 0;
      return result;
    },
    reportProgress() {
      self.postMessage({ type: "progress", loaded, total, file: filename });
    },
  };
}

async function discardCachedFile(cache, url) {
  await cache.delete(cacheKey(url, "manifest"));
  // Slices are contiguous from zero; stop at the first miss.
  for (let index = 0; await cache.delete(cacheKey(url, index)); index++) {
    // deletion happens in the condition
  }
}

self.onmessage = (event) => {
  const message = event.data;
  if (message?.type === "init") {
    initialize(message.config);
  } else if (message?.type === "transcribe") {
    enqueue(message);
  } else if (message?.type === "flush") {
    flushSpeaker(message);
  }
};

function flushSpeaker({ roomId, userId }) {
  const speaker = `${roomId}:${userId}`;
  speakerGeneration.set(speaker, (speakerGeneration.get(speaker) || 0) + 1);
  latestInterimJob.delete(speaker);
  lastFinalUtterance.delete(speaker);
}

async function initialize(config) {
  try {
    if (!navigator.gpu) {
      throw new Error("WebGPU is not available in this browser");
    }

    // Explicit URLs (not a directory prefix) for the ort runtime, set on
    // the bundled ort instance directly: the library's wasmPaths option is
    // never applied, and it falls back to a jsdelivr CDN when env is unset.
    // The glue ships under a .js name — nginx serves .mjs as
    // application/octet-stream, which module imports hard-reject.
    ortEnv.wasm.wasmPaths = {
      mjs: config.ortWasmJsUrl,
      wasm: config.ortWasmBinaryUrl,
    };

    const options = {
      backend: config.backend || "webgpu",
      encoderQuant: config.encoderQuant || "fp32",
      decoderQuant: config.decoderQuant || "int8",
      cpuThreads: 1,
      progress: ({ loaded, total, file }) =>
        self.postMessage({ type: "progress", loaded, total, file }),
    };

    const base = (config.modelBaseUrl || DEFAULT_MODEL_BASE).replace(/\/$/, "");
    const file = (name) => fetchModelFile(`${base}/${name}`, name);
    model = await fromUrls({
      ...options,
      encoderUrl: await file("encoder-model.onnx"),
      encoderDataUrl: await file("encoder-model.onnx.data"),
      decoderUrl: await file("decoder_joint-model.int8.onnx"),
      tokenizerUrl: await file("vocab.txt"),
      // Required for encoderDataUrl to take effect: ort maps the external
      // data to "<filenames.encoder>.data", which must match the path the
      // onnx file references internally.
      filenames: { encoder: "encoder-model.onnx" },
      preprocessorBackend: "js",
    });

    // Warm-up: catches broken backends now and primes the WebGPU pipelines
    // so the first real caption isn't slow.
    await model.transcribe(new Float32Array(SAMPLE_RATE), SAMPLE_RATE);

    self.postMessage({ type: "ready" });
  } catch (error) {
    model = null;
    self.postMessage({
      type: "error",
      message: String(error?.message || error),
    });
  }
}

function enqueue({ jobId, roomId, userId, utteranceId, interim, pcm, sentAt }) {
  const audio = new Float32Array(pcm);
  if (!model || audio.length < SAMPLE_RATE * MIN_UTTERANCE_SECONDS) {
    return;
  }

  const speaker = `${roomId}:${userId}`;
  const generation = speakerGeneration.get(speaker) || 0;
  if (interim) {
    latestInterimJob.set(speaker, jobId);
  } else {
    lastFinalUtterance.set(speaker, utteranceId);
  }

  // One job at a time: the model is stateless across jobs but a single
  // WebGPU queue serves everyone, and captions should arrive in order.
  queue = queue
    .then(async () => {
      // The speaker was flushed (detached, or their room was left) while
      // this job sat in the queue.
      if ((speakerGeneration.get(speaker) || 0) !== generation) {
        return;
      }

      // Superseded by a newer snapshot (or by the utterance's own final
      // pass) while waiting in the queue.
      if (
        interim &&
        (latestInterimJob.get(speaker) !== jobId ||
          (lastFinalUtterance.get(speaker) ?? -1) >= utteranceId)
      ) {
        return;
      }

      // Too old to still be live captioning: drop it and snap back to the
      // present instead of falling ever further behind. A dropped final
      // still emits an empty caption so any provisional line it would have
      // replaced gets withdrawn.
      const lag = sentAt ? Date.now() - sentAt : 0;
      if (lag > (interim ? INTERIM_MAX_LAG_MS : FINAL_MAX_LAG_MS)) {
        if (!interim) {
          self.postMessage({
            type: "caption",
            jobId,
            roomId,
            userId,
            utteranceId,
            interim: false,
            text: "",
          });
        }
        return;
      }

      const startedAt = Date.now();
      const result = await model.transcribe(audio, SAMPLE_RATE);
      trackThroughput(Date.now() - startedAt, audio.length);
      const text = result?.utterance_text ?? result?.text ?? "";
      // eslint-disable-next-line no-console
      console.debug(
        "[resenha] stt result",
        JSON.stringify({
          text,
          interim: !!interim,
          samples: audio.length,
          metrics: result?.metrics,
        })
      );
      self.postMessage({
        type: "caption",
        jobId,
        roomId,
        userId,
        utteranceId,
        interim: !!interim,
        text,
      });
    })
    .catch((error) => {
      self.postMessage({
        type: "job-error",
        jobId,
        roomId,
        userId,
        message: String(error?.message || error),
      });
    });
}

// Tells the main thread when transcription is running slower than realtime
// (with hysteresis so the signal doesn't flap) so it can shed the optional
// interim passes and keep finals flowing.
function trackThroughput(elapsedMs, samples) {
  const rtf = elapsedMs / 1000 / (samples / SAMPLE_RATE);
  rtfEma = rtfEma === null ? rtf : rtfEma + RTF_EMA_ALPHA * (rtf - rtfEma);

  const slow = reportedSlow
    ? rtfEma > RTF_RECOVER_THRESHOLD
    : rtfEma > RTF_SLOW_THRESHOLD;
  if (slow !== reportedSlow) {
    reportedSlow = slow;
    self.postMessage({ type: "throughput", slow });
  }
}
