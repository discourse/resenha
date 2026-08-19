import getURL from "discourse/lib/get-url";
import {
  ORT_WASM_BASE,
  STT_WORKER_PATH,
  VAD_ASSET_BASE,
  VAD_BUNDLE_PATH,
  VAD_ORT_BASE,
} from "./stt-assets";

// Live subtitles for room participants.
//
// Viewer-side: the user who turns subtitles on runs speech-to-text locally
// on the audio they already receive, so nothing is required from the other
// participants and no audio ever leaves the browser. Each participant's mic
// stream gets its own Silero VAD (finding utterance boundaries); committed
// utterances are transcribed by a single shared Parakeet model living in a
// Web Worker (WebGPU encoder), which serializes jobs across speakers.
//
// The runtime bundles are served from the plugin's public dir and only
// fetched the first time subtitles are enabled; the ~2.5GB model weights
// come from the `resenha_stt_model_base_url` source (Discourse's
// HuggingFace model repository by default), kept in a durable Cache API store.

const PREFERENCE_KEY = "resenha:subtitles";

// If neither "ready" nor "error" arrives in this window, something wedged
// (e.g. a stalled model download on the last byte); fail like an error so
// the toggle never shows an enabled-but-dead state. Generous because it
// includes the first-run model download.
const READY_TIMEOUT_MS = 30 * 60 * 1000;

// The bundle stays resident after first use so re-enabling is instant.
let vadModulePromise = null;

// Same serving constraint as the worker itself: same-origin, anchored to
// the page URL because this compiled chunk may be served from a CDN origin.
function absoluteUrl(path) {
  return new URL(getURL(path), window.location).href;
}

async function loadVadModule() {
  vadModulePromise ||= import(/* @vite-ignore */ absoluteUrl(VAD_BUNDLE_PATH));
  try {
    return await vadModulePromise;
  } catch (error) {
    // Allow a retry after a transient failure (e.g. offline asset fetch).
    vadModulePromise = null;
    throw error;
  }
}

export default class SubtitlesManager {
  static isSupported() {
    return (
      typeof WebAssembly !== "undefined" &&
      typeof AudioWorkletNode !== "undefined" &&
      typeof Worker !== "undefined" &&
      !!navigator.gpu
    );
  }

  #taps = new Map();
  #enabled = false;
  #epoch = 0;

  #worker = null;
  #workerReady = false;
  #readyTimer = null;
  #jobCounter = 0;
  #modelBaseUrl = null;

  #onCaption;
  #onLoadingChange;
  #onProgress;
  #onError;
  #loadVad;
  #createWorker;

  constructor({
    onCaption,
    onLoadingChange,
    onProgress,
    onError,
    // Injectable for tests; production always uses the shipped assets.
    loadVad = loadVadModule,
    createWorker = () => new Worker(getURL(STT_WORKER_PATH)),
  }) {
    this.#onCaption = onCaption;
    this.#onLoadingChange = onLoadingChange;
    this.#onProgress = onProgress;
    this.#onError = onError;
    this.#loadVad = loadVad;
    this.#createWorker = createWorker;
  }

  get enabled() {
    return this.#enabled;
  }

  get loading() {
    if (this.#worker && !this.#workerReady) {
      return true;
    }
    for (const tap of this.#taps.values()) {
      if (!tap.ready) {
        return true;
      }
    }
    return false;
  }

  setEnabled(enabled, { modelBaseUrl = null } = {}) {
    this.#modelBaseUrl = modelBaseUrl;
    if (this.#enabled === enabled) {
      return;
    }

    this.#enabled = enabled;
    if (!enabled) {
      this.#epoch++;
      for (const key of [...this.#taps.keys()]) {
        this.#removeTap(key);
      }
      this.#terminateWorker();
    }
  }

  async attach(roomId, userId, stream) {
    if (!this.#enabled || !stream) {
      return;
    }

    // The model (and its potentially long first download) only starts once
    // there is actually someone to transcribe — never on page load.
    this.#ensureWorker(this.#modelBaseUrl);

    const key = this.#key(roomId, userId);
    const trackId = stream.getAudioTracks()[0]?.id;
    const existing = this.#taps.get(key);
    if (existing?.trackId === trackId) {
      return;
    }
    // A restarted peer connection replaces the audio track inside the same
    // registry stream; the old source node only ever yields silence from
    // that point, so rebuild the tap on the new track.
    if (existing) {
      this.#removeTap(key);
    }

    const epoch = this.#epoch;
    const tap = { roomId, userId, trackId, vad: null, ready: false };
    this.#taps.set(key, tap);
    this.#onLoadingChange();

    let vadModule;
    try {
      vadModule = await this.#loadVad();
    } catch (error) {
      this.#taps.delete(key);
      this.#onError(error);
      return;
    }

    if (epoch !== this.#epoch || this.#taps.get(key) !== tap) {
      this.#onLoadingChange();
      return;
    }

    let vad;
    try {
      vad = await vadModule.MicVAD.new({
        model: "v5",
        baseAssetPath: absoluteUrl(VAD_ASSET_BASE),
        onnxWASMBasePath: absoluteUrl(VAD_ORT_BASE),
        // The "mic" is a remote WebRTC stream the registry owns; the VAD
        // must never stop its tracks when pausing.
        getStream: async () => stream,
        pauseStream: async () => {},
        resumeStream: async () => stream,
        startOnLoad: false,
        onSpeechEnd: (audio) => this.#handleUtterance(tap, epoch, audio),
      });
    } catch (error) {
      if (this.#taps.get(key) === tap) {
        this.#removeTap(key);
        this.#onError(error);
      }
      return;
    }

    // A detach or disable may have superseded this tap while the VAD was
    // loading.
    if (epoch !== this.#epoch || this.#taps.get(key) !== tap) {
      this.#teardownVad(vad);
      return;
    }

    tap.vad = vad;
    try {
      await vad.start();
    } catch (error) {
      if (this.#taps.get(key) === tap) {
        this.#removeTap(key);
        this.#onError(error);
      }
      return;
    }

    if (epoch !== this.#epoch || this.#taps.get(key) !== tap) {
      this.#teardownVad(vad);
      return;
    }

    tap.ready = true;
    this.#onLoadingChange();
  }

  detach(roomId, userId) {
    this.#removeTap(this.#key(roomId, userId));
  }

  detachRoom(roomId) {
    for (const [key, tap] of [...this.#taps]) {
      if (Number(tap.roomId) === Number(roomId)) {
        this.#removeTap(key);
      }
    }
  }

  destroy() {
    this.setEnabled(false);
  }

  isPreferred() {
    try {
      return localStorage.getItem(PREFERENCE_KEY) === "1";
    } catch {
      return false;
    }
  }

  setPreference(enabled) {
    try {
      if (enabled) {
        localStorage.setItem(PREFERENCE_KEY, "1");
      } else {
        localStorage.removeItem(PREFERENCE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }

  #ensureWorker(modelBaseUrl) {
    if (this.#worker) {
      return;
    }

    let worker;
    try {
      worker = this.#createWorker();
    } catch (error) {
      this.#onError(error);
      return;
    }

    this.#worker = worker;
    this.#workerReady = false;
    this.#onLoadingChange();

    worker.onmessage = (event) => this.#handleWorkerMessage(worker, event);
    worker.onerror = (event) => {
      if (this.#worker === worker) {
        this.#failWorker(new Error(event.message || "subtitles worker error"));
      }
    };

    this.#readyTimer = setTimeout(() => {
      if (this.#worker === worker && !this.#workerReady) {
        this.#failWorker(new Error("subtitles model load timed out"));
      }
    }, READY_TIMEOUT_MS);

    worker.postMessage({
      type: "init",
      config: {
        modelBaseUrl: modelBaseUrl || null,
        ortWasmBase: absoluteUrl(ORT_WASM_BASE),
      },
    });
  }

  #handleWorkerMessage(worker, event) {
    if (this.#worker !== worker) {
      return;
    }

    const message = event.data || {};
    switch (message.type) {
      case "progress":
        this.#onProgress(message);
        break;
      case "ready":
        clearTimeout(this.#readyTimer);
        this.#workerReady = true;
        this.#onLoadingChange();
        break;
      case "error":
        this.#failWorker(new Error(message.message));
        break;
      case "caption": {
        const text = message.text?.trim();
        if (text && this.#enabled) {
          this.#onCaption(message.roomId, message.userId, text);
        }
        break;
      }
      case "job-error":
        // A single bad utterance isn't fatal; keep going but surface it.
        // eslint-disable-next-line no-console
        console.warn("[resenha] subtitles transcription error", message);
        break;
    }
  }

  #handleUtterance(tap, epoch, audio) {
    if (
      epoch !== this.#epoch ||
      !this.#enabled ||
      !this.#worker ||
      !this.#workerReady
    ) {
      return;
    }

    const pcm = audio.buffer.slice(0);
    this.#worker.postMessage(
      {
        type: "transcribe",
        jobId: ++this.#jobCounter,
        roomId: tap.roomId,
        userId: tap.userId,
        pcm,
      },
      [pcm]
    );
  }

  #failWorker(error) {
    this.#terminateWorker();
    this.#onError(error);
  }

  #terminateWorker() {
    clearTimeout(this.#readyTimer);
    this.#readyTimer = null;
    if (this.#worker) {
      this.#worker.terminate();
      this.#worker = null;
    }
    this.#workerReady = false;
  }

  #key(roomId, userId) {
    return `${roomId}:${userId}`;
  }

  #removeTap(key) {
    const tap = this.#taps.get(key);
    if (!tap) {
      return;
    }

    this.#taps.delete(key);
    if (tap.vad) {
      this.#teardownVad(tap.vad);
    }
    this.#onLoadingChange();
  }

  #teardownVad(vad) {
    try {
      vad.destroy();
    } catch {
      // ignore
    }
  }
}
