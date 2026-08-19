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

let model = null;
let queue = Promise.resolve();

// Fetches one model file with a durable Cache API copy and streamed byte
// progress, returning an object URL for fromUrls. The Cache API stores the
// multi-GB encoder weights on disk, so repeat enables skip the network even
// when the HTTP cache has evicted them; if the cache is unavailable (quota,
// private browsing) the fetch still works, just uncached.
async function fetchModelFile(url, filename) {
  const cache = await caches.open(MODEL_CACHE).catch(() => null);

  let response = cache ? await cache.match(url) : null;
  if (!response) {
    const network = await fetch(url);
    if (!network.ok) {
      throw new Error(`${filename} fetch failed: ${network.status}`);
    }

    const total = Number(network.headers.get("content-length")) || 0;
    const [progressStream, dataStream] = network.body.tee();

    // The data branch streams straight into the cache (no multi-GB buffer
    // in memory) while the progress branch just counts bytes.
    const stored = cache
      ? cache
          .put(url, new Response(dataStream))
          .then(() => true)
          .catch(() => false)
      : Promise.resolve(false);

    const reader = progressStream.getReader();
    const counted = [];
    let loaded = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      loaded += value.length;
      if (!cache) {
        counted.push(value);
      }
      self.postMessage({ type: "progress", loaded, total, file: filename });
    }

    if (cache) {
      if (await stored) {
        response = await cache.match(url);
      }
      // Quota/write failure consumed the data branch; refetch uncached.
      response ??= await fetch(url);
    } else {
      response = new Response(new Blob(counted));
    }
  }

  return URL.createObjectURL(await response.blob());
}

self.onmessage = (event) => {
  const message = event.data;
  if (message?.type === "init") {
    initialize(message.config);
  } else if (message?.type === "transcribe") {
    enqueue(message);
  }
};

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

function enqueue({ jobId, roomId, userId, pcm }) {
  const audio = new Float32Array(pcm);
  if (!model || audio.length < SAMPLE_RATE * MIN_UTTERANCE_SECONDS) {
    return;
  }

  // One utterance at a time: the model is stateless across jobs but a single
  // WebGPU queue serves everyone, and captions should arrive in order.
  queue = queue
    .then(async () => {
      const result = await model.transcribe(audio, SAMPLE_RATE);
      const text = result?.utterance_text ?? result?.text ?? "";
      // eslint-disable-next-line no-console
      console.debug(
        "[resenha] stt result",
        JSON.stringify({
          text,
          samples: audio.length,
          metrics: result?.metrics,
        })
      );
      self.postMessage({ type: "caption", jobId, roomId, userId, text });
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
