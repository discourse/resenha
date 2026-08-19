import Resampler from "../../assets/javascripts/discourse/lib/resenha/resampler";

// After this many consecutive engine failures the processor gives up and
// passes audio through untouched; a broken filter must never mute the mic.
const MAX_CONSECUTIVE_ERRORS = 50;

// Shared AudioWorklet runtime for every noise-suppression engine. The main
// thread fetches the engine's assets (worklet scopes have no fetch) and
// posts them as {type:"init", assets:{wasm, model?}}; the engine factory
// instantiates them and the processor answers {type:"ready"} only after a
// successful warm-up denoise on a zero frame, so a resolved handshake means
// frames are actually being filtered. {type:"error"} reports init failures
// immediately, {type:"bypass"} reports a mid-call breakdown.
//
// An engine supplies:
//   engineRate  — the fixed sample rate it filters at
//   frameSize   — samples per denoise call at engineRate
//   createEngine(assets) → Promise<{ denoise(inFloat32, outFloat32) }>
export default function registerNoiseSuppressionProcessor({
  engineRate,
  frameSize,
  createEngine,
}) {
  class NoiseSuppressionProcessor extends AudioWorkletProcessor {
    constructor() {
      super();

      this.engine = null;
      this.bypass = false;
      this.consecutiveErrors = 0;
      this.initErrorReported = false;

      this.inputBuffer = new Float32Array(frameSize);
      this.outputBuffer = new Float32Array(frameSize);
      this.inputIndex = 0;

      this.outputQueue = [];
      this.outputQueueOffset = 0;

      this.downsampler = new Resampler(sampleRate, engineRate);
      this.upsampler = new Resampler(engineRate, sampleRate);

      this.port.onmessage = (event) => {
        if (event.data?.type === "init") {
          this.#initialize(event.data.assets);
        }
      };
    }

    async #initialize(assets) {
      try {
        const engine = await createEngine(assets);
        engine.denoise(new Float32Array(frameSize), this.outputBuffer);

        this.engine = engine;
        this.port.postMessage({ type: "ready" });
      } catch (error) {
        this.#reportInitError(error);
      }
    }

    #reportInitError(error) {
      if (this.initErrorReported) {
        return;
      }
      this.initErrorReported = true;
      this.port.postMessage({
        type: "error",
        message: String(error?.message || error),
      });
    }

    process(inputs, outputs) {
      const input = inputs?.[0]?.[0];
      const output = outputs?.[0]?.[0];

      if (!output) {
        return true;
      }

      if (!input) {
        output.fill(0);
        return true;
      }

      // Fail open: raw audio beats silently muting the speaker. The manager
      // never routes live audio through this node before "ready", so this
      // branch only matters after a mid-call bypass.
      if (!this.engine || this.bypass) {
        output.set(input);
        return true;
      }

      try {
        const downsampled = this.downsampler.process(input);

        for (let i = 0; i < downsampled.length; i++) {
          this.inputBuffer[this.inputIndex++] = downsampled[i];

          if (this.inputIndex >= frameSize) {
            this.engine.denoise(this.inputBuffer, this.outputBuffer);
            this.inputIndex = 0;

            this.outputQueue.push(this.upsampler.process(this.outputBuffer));
          }
        }

        let written = 0;
        while (written < output.length && this.outputQueue.length > 0) {
          const chunk = this.outputQueue[0];
          const available = chunk.length - this.outputQueueOffset;
          const needed = output.length - written;
          const toCopy = Math.min(available, needed);

          output.set(
            chunk.subarray(
              this.outputQueueOffset,
              this.outputQueueOffset + toCopy
            ),
            written
          );
          written += toCopy;
          this.outputQueueOffset += toCopy;

          if (this.outputQueueOffset >= chunk.length) {
            this.outputQueue.shift();
            this.outputQueueOffset = 0;
          }
        }

        if (written < output.length) {
          output.fill(0, written);
        }

        this.consecutiveErrors = 0;
      } catch (error) {
        output.set(input);

        this.consecutiveErrors++;
        if (this.consecutiveErrors === 1) {
          // eslint-disable-next-line no-console
          console.error("[resenha] noise suppression engine error:", error);
        }
        if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          this.bypass = true;
          this.port.postMessage({ type: "bypass" });
          // eslint-disable-next-line no-console
          console.error(
            "[resenha] engine keeps failing, noise suppression bypassed"
          );
        }
      }

      return true;
    }
  }

  registerProcessor("noise-suppression-processor", NoiseSuppressionProcessor);
}
