export default class NoiseSuppressionManager {
  #context = null;
  #source = null;
  #node = null;

  #onStreamReady;

  constructor({ onStreamReady }) {
    this.#onStreamReady = onStreamReady;
  }

  get active() {
    return this.#context !== null;
  }

  async setup(rawStream) {
    const audioContext = new AudioContext();

    await audioContext.audioWorklet.addModule(
      "/plugins/resenha/javascripts/dtln-worklet.js"
    );

    const source = audioContext.createMediaStreamSource(rawStream);
    const workletNode = new AudioWorkletNode(
      audioContext,
      "noise-suppression-processor"
    );
    const destination = audioContext.createMediaStreamDestination();

    source.connect(workletNode);
    workletNode.connect(destination);

    this.#context = audioContext;
    this.#source = source;
    this.#node = workletNode;

    this.#onStreamReady(destination.stream);
  }

  teardown() {
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
