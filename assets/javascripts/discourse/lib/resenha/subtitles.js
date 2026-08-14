// Live subtitles for remote participants.
//
// Viewer-side: the user who turns subtitles on runs speech-to-text locally
// on the remote audio they already receive, so nothing is required from the
// other participants. Each remote mic stream gets its own MoonshineJS
// transcriber (Silero VAD deciding utterance boundaries, Moonshine tiny
// generating text at each utterance end); the model weights are shared
// across transcribers by the library. Everything — bundle, model, WASM
// runtime — is served from the plugin's public dir and only fetched the
// first time subtitles are enabled.

import getURL from "discourse/lib/get-url";
import Site from "discourse/models/site";

const PREFERENCE_KEY = "resenha:subtitles";
const MODEL_PATH = "model/tiny";

// The bundle and the (library-cached) model weights stay resident after
// first use so re-enabling subtitles is instant.
let moonshinePromise = null;

// Same serving constraints as the mediapipe assets: the files ride the
// app-proxying CDN, never the static asset CDN, and dynamic import() must
// be anchored to the page URL because this compiled chunk may itself be
// served from a CDN origin.
function sttBase() {
  const base =
    Site.current()?.resenha_stt_base_url ||
    getURL("/plugins/resenha/javascripts/stt");
  return new URL(base, window.location).href;
}

async function loadMoonshine() {
  moonshinePromise ||= (async () => {
    const base = sttBase();
    const moonshine = await import(
      /* @vite-ignore */ `${base}/moonshine.min.js`
    );
    moonshine.Settings.BASE_ASSET_PATH.MOONSHINE = `${base}/`;
    moonshine.Settings.BASE_ASSET_PATH.ONNX_RUNTIME = `${base}/onnxruntime/`;
    moonshine.Settings.BASE_ASSET_PATH.SILERO_VAD = `${base}/vad/`;
    return moonshine;
  })();

  try {
    return await moonshinePromise;
  } catch (error) {
    // Allow a retry after a transient failure (e.g. offline asset fetch).
    moonshinePromise = null;
    throw error;
  }
}

export default class SubtitlesManager {
  static isSupported() {
    return (
      typeof WebAssembly !== "undefined" &&
      typeof AudioWorkletNode !== "undefined"
    );
  }

  #taps = new Map();
  #enabled = false;
  #epoch = 0;

  #onCaption;
  #onLoadingChange;
  #onError;

  constructor({ onCaption, onLoadingChange, onError }) {
    this.#onCaption = onCaption;
    this.#onLoadingChange = onLoadingChange;
    this.#onError = onError;
  }

  get enabled() {
    return this.#enabled;
  }

  get loading() {
    for (const tap of this.#taps.values()) {
      if (!tap.ready) {
        return true;
      }
    }
    return false;
  }

  setEnabled(enabled) {
    if (this.#enabled === enabled) {
      return;
    }

    this.#enabled = enabled;
    if (!enabled) {
      this.#epoch++;
      for (const key of [...this.#taps.keys()]) {
        this.#removeTap(key);
      }
    }
  }

  async attach(roomId, userId, stream) {
    if (!this.#enabled || !stream) {
      return;
    }

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
    const tap = { roomId, userId, trackId, transcriber: null, ready: false };
    this.#taps.set(key, tap);
    this.#onLoadingChange();

    let moonshine;
    try {
      moonshine = await loadMoonshine();
    } catch (error) {
      this.#taps.delete(key);
      this.#onError(error);
      return;
    }

    if (epoch !== this.#epoch || this.#taps.get(key) !== tap) {
      return;
    }

    const noop = () => {};
    const transcriber = new moonshine.Transcriber(
      MODEL_PATH,
      {
        onTranscriptionCommitted: (text) =>
          this.#handleCaption(tap, epoch, text),
        onError: (error) => this.#handleTapError(key, tap, error),
        // The library's default callbacks log; these fire per audio frame.
        onPermissionsRequested: noop,
        onModelLoadStarted: noop,
        onModelLoaded: noop,
        onTranscribeStarted: noop,
        onTranscribeStopped: noop,
        onTranscriptionUpdated: noop,
        onFrame: noop,
        onSpeechStart: noop,
        onSpeechEnd: noop,
      },
      true // VAD mode: transcribe whole utterances instead of streaming
    );
    tap.transcriber = transcriber;
    transcriber.attachStream(stream);

    try {
      await transcriber.start();
    } catch (error) {
      if (this.#taps.get(key) === tap) {
        this.#removeTap(key);
        this.#onError(error);
      }
      return;
    }

    // A detach or disable may have superseded this tap while the model was
    // loading; start() has already re-engaged the transcriber, undo it.
    if (epoch !== this.#epoch || this.#taps.get(key) !== tap) {
      this.#teardownTranscriber(transcriber);
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

  #key(roomId, userId) {
    return `${roomId}:${userId}`;
  }

  #handleCaption(tap, epoch, text) {
    if (epoch !== this.#epoch || !this.#enabled) {
      return;
    }

    const trimmed = text?.trim();
    if (trimmed) {
      this.#onCaption(tap.roomId, tap.userId, trimmed);
    }
  }

  #handleTapError(key, tap, error) {
    if (this.#taps.get(key) !== tap) {
      return;
    }
    this.#removeTap(key);
    this.#onError(error);
  }

  #removeTap(key) {
    const tap = this.#taps.get(key);
    if (!tap) {
      return;
    }

    this.#taps.delete(key);
    if (tap.transcriber) {
      this.#teardownTranscriber(tap.transcriber);
    }
    this.#onLoadingChange();
  }

  #teardownTranscriber(transcriber) {
    try {
      transcriber.stop();
    } catch {
      // ignore
    }
    // The library's stop() only pauses the VAD; releasing the graph and the
    // per-transcriber AudioContext is on us.
    try {
      transcriber.vadModel?.destroy?.();
    } catch {
      // ignore
    }
    try {
      transcriber.audioContext?.close?.();
    } catch {
      // ignore
    }
  }
}
