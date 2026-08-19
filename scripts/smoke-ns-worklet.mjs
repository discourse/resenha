// Loads a noise-suppression engine's shipped assets into a real AudioWorklet
// in headless Chromium and verifies the ready handshake plus that white
// noise is attenuated (i.e. the engine is filtering, not passing through).
//
// Usage:
//   node scripts/smoke-ns-worklet.mjs <engine> [maxRatio]
//   node scripts/smoke-ns-worklet.mjs dtln 0.1
//   node scripts/smoke-ns-worklet.mjs rnnoise 0.95
//
// <engine> resolves the worklet/wasm/model paths from the generated manifest
// in assets/javascripts/discourse/lib/resenha/ns-assets/<engine>.js.
// maxRatio is the maximum allowed output/input RMS ratio (a bit-exact
// passthrough scores 1.0; engines differ in how hard they cut white noise).
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const pluginDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [engine, maxRatioArg] = process.argv.slice(2);
if (!engine) {
  console.error("usage: node scripts/smoke-ns-worklet.mjs <engine> [maxRatio]");
  process.exit(2);
}
const maxRatio = Number(maxRatioArg ?? 0.95);

const manifestPath = path.join(
  pluginDir,
  `assets/javascripts/discourse/lib/resenha/ns-assets/${engine}.js`
);
const manifest = await import(pathToFileURL(manifestPath));
const localPath = (publicPath) =>
  path.join(pluginDir, "public", publicPath.replace("/plugins/resenha/", ""));

const NOISE_AMPLITUDE = 0.5;

const PAGE = `<!doctype html><script>
window.runTest = async (hasModel) => {
  const ctx = new AudioContext();
  await ctx.resume();
  const assets = { wasm: await (await fetch("/engine.wasm")).arrayBuffer() };
  if (hasModel) { assets.model = await (await fetch("/model.bin")).arrayBuffer(); }
  await ctx.audioWorklet.addModule("/worklet.js");
  const node = new AudioWorkletNode(ctx, "noise-suppression-processor", {
    channelCount: 1, channelCountMode: "explicit", outputChannelCount: [1],
  });
  const ready = new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("ready timeout (20s)")), 20000);
    node.port.onmessage = (e) => {
      clearTimeout(t);
      if (e.data?.type === "ready") { resolve(); }
      else { reject(new Error("worklet said: " + JSON.stringify(e.data))); }
    };
  });
  const transfers = [assets.wasm, assets.model].filter(Boolean);
  node.port.postMessage({ type: "init", assets }, transfers);
  await ready;

  const noise = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * ${NOISE_AMPLITUDE};
  }
  noise.buffer = buf; noise.loop = true;
  const analyser = ctx.createAnalyser();
  noise.connect(node); node.connect(analyser); noise.start();
  await new Promise((r) => setTimeout(r, 3000));
  const out = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(out);
  let rms = 0; for (const v of out) { rms += v * v; }
  rms = Math.sqrt(rms / out.length);
  let inRms = 0; for (const v of data) { inRms += v * v; }
  inRms = Math.sqrt(inRms / data.length);
  return { sampleRate: ctx.sampleRate, ratio: rms / inRms };
};
</script>`;

const files = {
  "/worklet.js": localPath(manifest.WORKLET_PATH),
  "/engine.wasm": localPath(manifest.WASM_PATH),
};
if (manifest.MODEL_PATH) {
  files["/model.bin"] = localPath(manifest.MODEL_PATH);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/") {
      res.setHeader("content-type", "text/html");
      res.end(PAGE);
    } else if (files[req.url]) {
      if (req.url.endsWith(".js")) {
        res.setHeader("content-type", "text/javascript");
      }
      res.end(await readFile(files[req.url]));
    } else {
      res.statusCode = 404;
      res.end();
    }
  } catch (e) {
    res.statusCode = 500;
    res.end(String(e));
  }
});
await new Promise((r) => server.listen(0, r));

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_BIN || undefined,
  args: ["--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/`);
try {
  const result = await page.evaluate(
    (m) => window.runTest(m),
    !!manifest.MODEL_PATH
  );
  console.log(`${engine}: output/input RMS ratio ${result.ratio.toFixed(3)}`);
  // Zero output is legitimate: a strong model gates speechless noise to
  // silence. Passthrough (ratio ≈ 1) is the failure this guards against; a
  // broken engine never reaches this point (the ready handshake includes a
  // real warm-up denoise and failures surface as "error" messages).
  if (!(result.ratio < maxRatio)) {
    console.log(`FAIL: ratio not < ${maxRatio} — engine is passing audio through`);
    process.exitCode = 1;
  } else {
    console.log("PASS");
  }
} catch (e) {
  console.log("FAILED", e.message);
  process.exitCode = 1;
}
await browser.close();
server.close();
