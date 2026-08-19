// Linear resampler that carries its fractional read position and the last
// input sample across blocks, so the produced sample count stays exact on
// average for any rate ratio. Rounding each 128-frame block independently
// drifts: at 48kHz it fabricates ~0.8% extra audio, growing the output
// queue (and the speaker's latency) by ~8ms every second.
//
// Shared between the DTLN worklet bundle (via the build in
// src/dtln-worklet/) and unit tests, so it must stay dependency-free and
// safe to evaluate inside an AudioWorkletGlobalScope.
export default class Resampler {
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
