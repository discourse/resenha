// End-to-end smoke test for the live-subtitles pipeline: loads the shipped
// worker bundle in headless Chromium (WebGPU), downloads the real Parakeet
// model (cached in a persistent profile between runs), runs the shipped VAD
// bundle over a synthesized speech stream, and checks the utterances come
// back transcribed.
//
// Usage:
//   node scripts/smoke-stt-worker.mjs path/to/speech-fixture.wav
//
// Generate a fixture with e.g.:
//   flite -t "the quick brown fox jumps over the lazy dog" /tmp/fix.wav
//
// Requires a WebGPU-capable GPU. First run downloads ~2.5GB from
// HuggingFace into the profile at .local/stt-smoke-profile/.
//
// Env knobs: STT_MODEL_DIR=/path/to/mirror serves the model from a local
// directory (validates the resenha_stt_model_base_url mirror path);
// STT_MODEL_BASE_URL=https://... tests a remote mirror/bucket directly;
// STT_BACKEND / STT_ENCODER_QUANT override the worker defaults.
import http from "node:http";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const pluginDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = process.argv[2];
if (!fixturePath) {
  console.error("usage: node scripts/smoke-stt-worker.mjs <speech.wav>");
  process.exit(2);
}

const manifest = await import(
  pathToFileURL(
    path.join(
      pluginDir,
      "assets/javascripts/discourse/lib/resenha/stt-assets.js"
    )
  )
);

const PAGE = `<!doctype html><script type="module">
window.log = (...args) => console.log("[smoke]", ...args);

window.runTest = async (paths) => {
  // --- Phase 1: worker init (downloads/loads the model) ---
  const worker = new Worker(paths.worker);
  const ready = new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      const m = e.data;
      if (m.type === "progress") {
        window.log("download", m.file, Math.round((m.loaded / m.total) * 100) + "%");
      } else if (m.type === "ready") {
        resolve();
      } else if (m.type === "error") {
        reject(new Error(m.message));
      }
    };
  });
  worker.postMessage({
    type: "init",
    config: { modelBaseUrl: paths.modelBaseAbsolute || (paths.modelBase ? new URL(paths.modelBase, location).href : null), ortWasmJsUrl: new URL(paths.ortJs, location).href, ortWasmBinaryUrl: new URL(paths.ortBinary, location).href, backend: paths.backend, encoderQuant: paths.encoderQuant },
  });
  await ready;
  window.log("worker ready");

  // --- Phase 2: decode the fixture to 16kHz mono PCM ---
  const wavBytes = await (await fetch("/fixture.wav")).arrayBuffer();
  const probeCtx = new AudioContext();
  const decoded = await probeCtx.decodeAudioData(wavBytes.slice(0));
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * 16000), 16000);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start();
  const resampled = (await offline.startRendering()).getChannelData(0);
  let rms = 0;
  for (const v of resampled) { rms += v * v; }
  window.log("fixture:", decoded.duration.toFixed(1) + "s", "rms", Math.sqrt(rms / resampled.length).toFixed(4));

  // --- Phase 3: direct transcription through the worker ---
  const direct = await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("transcribe timeout")), 60000);
    const prev = worker.onmessage;
    worker.onmessage = (e) => {
      if (e.data.type === "caption") { clearTimeout(t); resolve(e.data.text); }
      else if (e.data.type === "job-error") { clearTimeout(t); reject(new Error(e.data.message)); }
      else { prev(e); }
    };
    const pcm = resampled.buffer.slice(0);
    worker.postMessage({ type: "transcribe", jobId: 1, roomId: 1, userId: 1, pcm }, [pcm]);
  });
  window.log("direct transcription:", JSON.stringify(direct));

  // --- Phase 4: full chain — VAD over a live MediaStream ---
  const vad = await import(new URL(paths.vadBundle, location).href);
  const ctx = new AudioContext();
  await ctx.resume();
  const dest = ctx.createMediaStreamDestination();
  const playSrc = ctx.createBufferSource();
  playSrc.buffer = decoded;
  playSrc.connect(dest);

  const utterances = [];
  const mic = await vad.MicVAD.new({
    model: "v5",
    baseAssetPath: new URL(paths.vadAssets, location).href,
    onnxWASMBasePath: {
      mjs: new URL(paths.ortJs, location).href,
      wasm: new URL(paths.ortBinary, location).href,
    },
    getStream: async () => dest.stream,
    pauseStream: async () => {},
    resumeStream: async () => dest.stream,
    startOnLoad: false,
    onSpeechEnd: (audio) => utterances.push(audio.length),
  });
  await mic.start();
  playSrc.start();
  await new Promise((r) => setTimeout(r, (decoded.duration + 3) * 1000));
  mic.destroy();

  return { direct, utterances };
};
</script>`;

const sttDir = path.join(pluginDir, "public/javascripts/stt");
const server = http.createServer(async (req, res) => {
  try {
    const url = req.url.split("?")[0];
    if (url === "/") {
      res.setHeader("content-type", "text/html");
      res.end(PAGE);
    } else if (url === "/fixture.wav") {
      res.end(await readFile(fixturePath));
    } else if (url.startsWith("/model/") && process.env.STT_MODEL_DIR) {
      // Streamed: the encoder external-data file is >2GiB, past readFile's cap.
      const file = path.join(process.env.STT_MODEL_DIR, url.slice(7));
      res.setHeader("content-length", (await stat(file)).size);
      createReadStream(file).pipe(res);
    } else if (url.startsWith("/stt/")) {
      const file = path.join(sttDir, url.slice(5));
      if (file.endsWith(".js") || file.endsWith(".mjs")) {
        res.setHeader("content-type", "text/javascript");
      } else if (file.endsWith(".wasm")) {
        res.setHeader("content-type", "application/wasm");
      }
      res.end(await readFile(file));
    } else {
      res.statusCode = 404;
      res.end();
    }
  } catch (e) {
    res.statusCode = 404;
    res.end(String(e));
  }
});
// Fixed port: the model cache (Cache API/IndexedDB) is origin-scoped, so a
// random port would defeat cross-run caching in the persistent profile.
await new Promise((r) => server.listen(Number(process.env.STT_SMOKE_PORT || 8873), r));

const toLocal = (publicPath) =>
  publicPath.replace("/plugins/resenha/javascripts/stt/", "/stt/");

const context = await chromium.launchPersistentContext(
  path.join(pluginDir, ".local/stt-smoke-profile"),
  {
    executablePath: process.env.CHROMIUM_BIN || undefined,
    headless: true,
    args: [
      "--enable-unsafe-webgpu",
      "--enable-features=Vulkan",
      "--use-angle=vulkan",
      "--autoplay-policy=no-user-gesture-required",
    ],
  }
);
const page = await context.newPage();
// The ort runtime must come from our vendored files, never a CDN — the
// library silently falls back to jsdelivr when env.wasm.wasmPaths is unset.
await page.route("**cdn.jsdelivr.net**", (route) => {
  console.log("FAIL: attempted CDN fetch", route.request().url());
  route.abort();
});
page.on("console", (m) => {
  const text = m.text();
  if (text.startsWith("[smoke]") || text.startsWith("[resenha]")) {
    console.log(text);
  }
});
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/`);

try {
  const result = await page.evaluate((paths) => window.runTest(paths), {
    worker: toLocal(manifest.STT_WORKER_PATH),
    vadBundle: toLocal(manifest.VAD_BUNDLE_PATH),
    ortJs: toLocal(manifest.ORT_WASM_JS),
    ortBinary: toLocal(manifest.ORT_WASM_BINARY),
    vadAssets: toLocal(manifest.VAD_ASSET_BASE),
    modelBase: process.env.STT_MODEL_DIR ? "/model/" : undefined,
    modelBaseAbsolute: process.env.STT_MODEL_BASE_URL || undefined,
    backend: process.env.STT_BACKEND || undefined,
    encoderQuant: process.env.STT_ENCODER_QUANT || undefined,
  });
  console.log("RESULT", JSON.stringify(result));
  const pass = result.direct?.trim().length > 0 && result.utterances.length > 0;
  console.log(pass ? "PASS" : "FAIL: empty transcription or no VAD utterances");
  process.exitCode = pass ? 0 : 1;
} catch (e) {
  console.log("FAILED", e.message);
  process.exitCode = 1;
}
await context.close();
server.close();
