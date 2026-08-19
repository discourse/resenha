import { module, test } from "qunit";
import Resampler from "discourse/plugins/resenha/discourse/lib/resenha/resampler";

module("Resenha | Unit | Lib | resampler", function () {
  test("identity ratio copies the input without aliasing it", function (assert) {
    const resampler = new Resampler(16000, 16000);
    const input = new Float32Array([0.1, 0.2, 0.3]);
    const output = resampler.process(input);

    assert.deepEqual(Array.from(output), Array.from(input));
    assert.notStrictEqual(output, input, "returns a copy");
  });

  test("does not drift across many blocks", function (assert) {
    // 48kHz → 16kHz over 1 second of 128-frame blocks must produce exactly
    // one third of the samples on average; per-block rounding would
    // fabricate extra samples and grow latency unboundedly.
    const resampler = new Resampler(48000, 16000);
    const block = new Float32Array(128);
    let produced = 0;
    const blocks = 375; // 375 * 128 = 48000 samples = 1s

    for (let i = 0; i < blocks; i++) {
      produced += resampler.process(block).length;
    }

    assert.true(
      Math.abs(produced - 16000) <= 1,
      `produced ${produced} samples for 48000 input samples (expected ~16000)`
    );
  });

  test("upsampling keeps the exact average sample count", function (assert) {
    const resampler = new Resampler(16000, 48000);
    const block = new Float32Array(512);
    let produced = 0;
    const blocks = 125; // 125 * 512 = 64000 samples = 4s

    for (let i = 0; i < blocks; i++) {
      produced += resampler.process(block).length;
    }

    assert.true(
      Math.abs(produced - 192000) <= 3,
      `produced ${produced} samples for 64000 input samples (expected ~192000)`
    );
  });

  test("interpolates linearly between samples", function (assert) {
    const resampler = new Resampler(2, 4); // 2x upsample
    const output = resampler.process(new Float32Array([0, 1]));

    assert.deepEqual(Array.from(output), [0, 0.5, 1]);
  });
});
