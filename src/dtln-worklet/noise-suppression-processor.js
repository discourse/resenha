import Resampler from "../../assets/javascripts/discourse/lib/resenha/resampler";
import createDtln from "./dtln.js";

// AudioWorkletGlobalScope has no `self`; the Emscripten glue reads
// self.location.href for script-directory detection (unused here — the wasm
// bytes are always injected — but evaluated unconditionally).
globalThis.self ??= globalThis;
globalThis.self.location ??= { href: "" };

const DTLN_RATE = 16000;
const DTLN_FRAME_SIZE = 512;

// After this many consecutive DTLN failures the processor gives up and
// passes audio through untouched; a broken filter must never mute the mic.
const MAX_CONSECUTIVE_ERRORS = 50;

// The main thread fetches the .wasm and posts its bytes here; the Emscripten
// factory instantiates it without ever touching the network (worklet scopes
// have no fetch). "ready" is only reported after a successful warm-up
// denoise, so the manager can trust that a resolved handshake means frames
// are actually being filtered.
class NoiseSuppressionProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.dtln = null;
    this.dtlnHandle = undefined;
    this.bypass = false;
    this.consecutiveErrors = 0;

    this.inputBuffer = new Float32Array(DTLN_FRAME_SIZE);
    this.outputBuffer = new Float32Array(DTLN_FRAME_SIZE);
    this.inputIndex = 0;

    this.outputQueue = [];
    this.outputQueueOffset = 0;

    this.downsampler = new Resampler(sampleRate, DTLN_RATE);
    this.upsampler = new Resampler(DTLN_RATE, sampleRate);

    this.port.onmessage = (event) => {
      if (event.data?.type === "wasm") {
        this.#initialize(event.data.bytes);
      }
    };
  }

  async #initialize(wasmBinary) {
    try {
      // Emscripten 6 dropped the wasmBinary module input; the
      // instantiateWasm hook is the supported way to hand it precompiled
      // bytes. A rejected instantiation must be reported here — the factory
      // promise would otherwise never settle.
      const module = await createDtln({
        instantiateWasm: (imports, onSuccess) => {
          WebAssembly.instantiate(wasmBinary, imports)
            .then((result) => onSuccess(result.instance, result.module))
            .catch((error) => this.#reportInitError(error));
          return {};
        },
      });
      const handle = module.dtln.dtln_create();
      module.dtln.dtln_denoise(
        handle,
        new Float32Array(DTLN_FRAME_SIZE),
        this.outputBuffer
      );

      this.dtln = module.dtln;
      this.dtlnHandle = handle;
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
    if (!this.dtln || this.bypass) {
      output.set(input);
      return true;
    }

    try {
      const downsampled = this.downsampler.process(input);

      for (let i = 0; i < downsampled.length; i++) {
        this.inputBuffer[this.inputIndex++] = downsampled[i];

        if (this.inputIndex >= DTLN_FRAME_SIZE) {
          this.dtln.dtln_denoise(
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
        this.port.postMessage({ type: "bypass" });
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
