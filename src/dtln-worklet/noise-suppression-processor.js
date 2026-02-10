import dtln from "./dtln.js";

const DTLN_RATE = 16000;
const DTLN_FRAME_SIZE = 512;

function resample(input, fromRate, toRate) {
  if (fromRate === toRate) {
    return input;
  }
  const ratio = fromRate / toRate;
  const outputLen = Math.round(input.length / ratio);
  const output = new Float32Array(outputLen);
  for (let i = 0; i < outputLen; i++) {
    const srcPos = i * ratio;
    const srcIndex = Math.floor(srcPos);
    const frac = srcPos - srcIndex;
    const a = input[srcIndex] || 0;
    const b = input[Math.min(srcIndex + 1, input.length - 1)] || 0;
    output[i] = a + frac * (b - a);
  }
  return output;
}

class NoiseSuppressionProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.dtlnHandle = undefined;
    this.isModuleReady = false;
    this.nativeRate = sampleRate;

    this.inputBuffer = new Float32Array(DTLN_FRAME_SIZE);
    this.outputBuffer = new Float32Array(DTLN_FRAME_SIZE);
    this.inputIndex = 0;

    this.outputQueue = [];
    this.outputQueueOffset = 0;

    dtln.postRun = [
      () => {
        this.isModuleReady = true;
        this.port.postMessage("ready");
      },
    ];
  }

  process(inputs, outputs) {
    if (
      !inputs ||
      !inputs.length ||
      !inputs[0] ||
      !inputs[0].length ||
      !outputs ||
      !outputs.length ||
      !outputs[0] ||
      !outputs[0].length
    ) {
      if (outputs?.[0]?.[0]) {
        outputs[0][0].fill(0);
      }
      return true;
    }

    const input = inputs[0][0];
    const output = outputs[0][0];

    if (!this.isModuleReady) {
      output.fill(0);
      return true;
    }

    try {
      if (!this.dtlnHandle) {
        this.dtlnHandle = dtln.dtln_create();
      }

      const downsampled = resample(input, this.nativeRate, DTLN_RATE);

      for (let i = 0; i < downsampled.length; i++) {
        this.inputBuffer[this.inputIndex++] = downsampled[i];

        if (this.inputIndex >= DTLN_FRAME_SIZE) {
          dtln.dtln_denoise(
            this.dtlnHandle,
            this.inputBuffer,
            this.outputBuffer
          );
          this.inputIndex = 0;

          const upsampled = resample(
            this.outputBuffer,
            DTLN_RATE,
            this.nativeRate
          );
          this.outputQueue.push(upsampled);
        }
      }

      let written = 0;
      while (written < output.length && this.outputQueue.length > 0) {
        const chunk = this.outputQueue[0];
        const available = chunk.length - this.outputQueueOffset;
        const needed = output.length - written;
        const toCopy = Math.min(available, needed);

        output.set(
          chunk.subarray(this.outputQueueOffset, this.outputQueueOffset + toCopy),
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
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[resenha] DTLN processing error:", error);
      output.fill(0);
    }

    return true;
  }
}

registerProcessor("noise-suppression-processor", NoiseSuppressionProcessor);
