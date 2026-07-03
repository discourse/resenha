import dtln from "./dtln.js";

const DTLN_RATE = 16000;
const DTLN_FRAME_SIZE = 512;

// After this many consecutive DTLN failures the processor gives up and
// passes audio through untouched; a broken filter must never mute the mic.
const MAX_CONSECUTIVE_ERRORS = 50;

// The Emscripten runtime initializes asynchronously while this bundle is
// evaluated, and its postRun hook fires exactly once. Registering the
// forwarding hook at module scope — before the first microtask can run —
// guarantees a processor constructed after initialization completes still
// learns the module is ready.
let wasmReady = false;
const wasmReadyCallbacks = [];
dtln.postRun = [
  () => {
    wasmReady = true;
    wasmReadyCallbacks.splice(0).forEach((callback) => callback());
  },
];

// Linear resampler that carries its fractional read position and the last
// input sample across blocks, so the produced sample count stays exact on
// average for any rate ratio. Rounding each 128-frame block independently
// drifts: at 48kHz it fabricates ~0.8% extra audio, growing the output
// queue (and the speaker's latency) by ~8ms every second.
class Resampler {
  constructor(fromRate, toRate) {
    this.ratio = fromRate / toRate;
    this.pos = 0;
    this.last = 0;
  }

  // The returned array is safe to retain; it never aliases `input`.
  process(input) {
    if (this.ratio === 1) {
      return input.slice();
    }

    const maxIndex = input.length - 1;
    const count = Math.max(
      0,
      Math.floor((maxIndex - this.pos) / this.ratio) + 1
    );
    const output = new Float32Array(count);

    let pos = this.pos;
    for (let i = 0; i < count; i++) {
      const index = Math.min(Math.floor(pos), maxIndex);
      const frac = pos - index;
      const a = index < 0 ? this.last : input[index];
      const b = index < maxIndex ? input[index + 1] : a;
      output[i] = a + frac * (b - a);
      pos += this.ratio;
    }

    this.pos = pos - input.length;
    this.last = input[maxIndex];
    return output;
  }
}

class NoiseSuppressionProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.dtlnHandle = undefined;
    this.isModuleReady = false;
    this.bypass = false;
    this.consecutiveErrors = 0;

    this.inputBuffer = new Float32Array(DTLN_FRAME_SIZE);
    this.outputBuffer = new Float32Array(DTLN_FRAME_SIZE);
    this.inputIndex = 0;

    this.outputQueue = [];
    this.outputQueueOffset = 0;

    this.downsampler = new Resampler(sampleRate, DTLN_RATE);
    this.upsampler = new Resampler(DTLN_RATE, sampleRate);

    if (wasmReady) {
      this.#markReady();
    } else {
      // Belt and suspenders for a runtime that initialized synchronously,
      // before the module-scope hook above was registered: a callable
      // export means the wasm is up.
      try {
        this.dtlnHandle = dtln.dtln_create();
        this.#markReady();
      } catch {
        wasmReadyCallbacks.push(() => this.#markReady());
      }
    }
  }

  #markReady() {
    this.isModuleReady = true;
    this.port.postMessage("ready");
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

    // Fail open: raw audio while the model loads or after it broke beats
    // silently muting the speaker.
    if (!this.isModuleReady || this.bypass) {
      output.set(input);
      return true;
    }

    try {
      if (this.dtlnHandle === undefined) {
        this.dtlnHandle = dtln.dtln_create();
      }

      const downsampled = this.downsampler.process(input);

      for (let i = 0; i < downsampled.length; i++) {
        this.inputBuffer[this.inputIndex++] = downsampled[i];

        if (this.inputIndex >= DTLN_FRAME_SIZE) {
          dtln.dtln_denoise(
            this.dtlnHandle,
            this.inputBuffer,
            this.outputBuffer
          );
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
        console.error("[resenha] DTLN processing error:", error);
      }
      if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
        this.bypass = true;
        this.port.postMessage("bypass");
        // eslint-disable-next-line no-console
        console.error(
          "[resenha] DTLN keeps failing, noise suppression bypassed"
        );
      }
    }

    return true;
  }
}

registerProcessor("noise-suppression-processor", NoiseSuppressionProcessor);
