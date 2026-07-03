import getURL from "discourse/lib/get-url";

// DTLN operates on 16kHz mono audio. Running the whole graph at that rate
// hands the resampling to the browser's own resamplers (mic source in,
// WebRTC track out) so the worklet only has to frame samples.
const DTLN_RATE = 16000;

export default class NoiseSuppressionManager {
  #context = null;
  #source = null;
  #node = null;
  #epoch = 0;

  #onStreamReady;

  constructor({ onStreamReady }) {
    this.#onStreamReady = onStreamReady;
  }

  get active() {
    return this.#context !== null;
  }

  async setup(rawStream) {
    const epoch = ++this.#epoch;

    let audioContext;
    try {
      audioContext = new AudioContext({ sampleRate: DTLN_RATE });
    } catch {
      // Some browsers reject uncommon rates; the worklet resamples itself
      // when the context runs at the hardware rate.
      audioContext = new AudioContext();
    }

    // A fresh context starts suspended without recent user activation (e.g.
    // rejoining a room after a reload) and a suspended context outputs
    // silence. resume() can stay pending until the next user gesture, so it
    // is not awaited; statechange re-resumes after OS-level interruptions
    // (Bluetooth profile switches, phone calls).
    const keepRunning = () => {
      if (audioContext.state !== "running") {
        audioContext.resume().catch(() => {});
      }
    };
    keepRunning();
    audioContext.onstatechange = keepRunning;

    const abort = () => {
      audioContext.onstatechange = null;
      try {
        audioContext.close();
      } catch {
        // ignore
      }
    };

    try {
      await audioContext.audioWorklet.addModule(
        getURL("/plugins/resenha/javascripts/dtln-worklet.js")
      );
    } catch (error) {
      abort();
      throw error;
    }

    // A teardown() or newer setup() (device switch, leaving the room) may
    // have superseded this call while the module was loading.
    if (epoch !== this.#epoch) {
      abort();
      return;
    }

    const source = audioContext.createMediaStreamSource(rawStream);
    // DTLN is mono. Forcing one channel downmixes stereo microphones ahead
    // of the worklet; left at the defaults the node mirrors the input's
    // channel count and a stereo mic ships a silent right channel.
    const workletNode = new AudioWorkletNode(
      audioContext,
      "noise-suppression-processor",
      {
        channelCount: 1,
        channelCountMode: "explicit",
        outputChannelCount: [1],
      }
    );
    const destination = audioContext.createMediaStreamDestination();
    destination.channelCount = 1;

    source.connect(workletNode);
    workletNode.connect(destination);

    this.#context = audioContext;
    this.#source = source;
    this.#node = workletNode;

    this.#onStreamReady(destination.stream);
  }

  teardown() {
    this.#epoch++;

    if (this.#source) {
      try {
        this.#source.disconnect();
      } catch {
        // ignore
      }
      this.#source = null;
    }

    if (this.#node) {
      try {
        this.#node.disconnect();
      } catch {
        // ignore
      }
      this.#node = null;
    }

    if (this.#context) {
      this.#context.onstatechange = null;
      try {
        this.#context.close();
      } catch {
        // ignore
      }
      this.#context = null;
    }
  }

  isPreferred() {
    try {
      return localStorage.getItem("resenha:noise-suppression") === "1";
    } catch {
      return false;
    }
  }

  setPreference(enabled) {
    try {
      if (enabled) {
        localStorage.setItem("resenha:noise-suppression", "1");
      } else {
        localStorage.removeItem("resenha:noise-suppression");
      }
    } catch {
      // ignore storage errors
    }
  }
}
