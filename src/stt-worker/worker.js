import { fromHub, fromUrls } from "parakeet.js";

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

const MODEL_KEY = "parakeet-tdt-0.6b-v3";
const SAMPLE_RATE = 16000;

// Utterances shorter than this are VAD noise; transcribing them wastes an
// encoder pass and tends to hallucinate short filler words.
const MIN_UTTERANCE_SECONDS = 0.4;

let model = null;
let queue = Promise.resolve();

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

    const options = {
      backend: config.backend || "webgpu",
      encoderQuant: config.encoderQuant || "fp32",
      decoderQuant: config.decoderQuant || "int8",
      cpuThreads: 1,
      wasmPaths: config.ortWasmBase,
      progress: ({ loaded, total, file }) =>
        self.postMessage({ type: "progress", loaded, total, file }),
    };

    if (config.modelBaseUrl) {
      const base = config.modelBaseUrl.replace(/\/$/, "");
      model = await fromUrls({
        ...options,
        encoderUrl: `${base}/encoder-model.onnx`,
        encoderDataUrl: `${base}/encoder-model.onnx.data`,
        decoderUrl: `${base}/decoder_joint-model.int8.onnx`,
        tokenizerUrl: `${base}/vocab.txt`,
        preprocessorBackend: "js",
      });
    } else {
      model = await fromHub(MODEL_KEY, options);
    }

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
