import dtln from "./dtln.js";

const DTLN_FIXED_BUFFER_SIZE = 512;

class NoiseSuppressionProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.dtlnHandle = undefined;
    this.isModuleReady = false;

    this.inputBuffer = new Float32Array(DTLN_FIXED_BUFFER_SIZE);
    this.outputBuffer = new Float32Array(DTLN_FIXED_BUFFER_SIZE);
    this.inputIndex = 0;
    this.outputBytes = 0;

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

      this.inputBuffer.set(input, this.inputIndex);
      this.inputIndex += input.length;

      if (this.inputIndex >= DTLN_FIXED_BUFFER_SIZE) {
        dtln.dtln_denoise(this.dtlnHandle, this.inputBuffer, this.outputBuffer);
        this.inputIndex = 0;
        this.outputBytes = DTLN_FIXED_BUFFER_SIZE;
      }

      if (this.outputBytes > 0) {
        output.set(this.outputBuffer.subarray(0, input.length));
        this.outputBuffer.copyWithin(0, input.length);
        this.outputBytes -= input.length;
        this.outputBytes = Math.max(0, this.outputBytes);
      } else {
        output.fill(0);
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
