import { module, test } from "qunit";
import AudioMonitor from "discourse/plugins/resenha/discourse/lib/resenha/audio-monitor";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module("Resenha | Unit | Lib | audio-monitor", function (hooks) {
  hooks.beforeEach(function () {
    const testContext = this;

    this.originalWindowAudioContext = window.AudioContext;
    this.originalWindowWebkitAudioContext = window.webkitAudioContext;
    this.originalGlobalAudioContext = globalThis.AudioContext;
    this.originalRequestAnimationFrame = window.requestAnimationFrame;
    this.originalCancelAnimationFrame = window.cancelAnimationFrame;

    this.analyserSampleCount = 0;
    this.requestAnimationFrameCalls = 0;

    class FakeAudioContext {
      createMediaStreamSource() {
        return {
          connect(target) {
            return target;
          },
          disconnect() {},
        };
      }

      createAnalyser() {
        return {
          fftSize: 0,
          frequencyBinCount: 32,
          getByteTimeDomainData(array) {
            testContext.analyserSampleCount++;
            array.fill(140);
          },
        };
      }

      close() {
        return Promise.resolve();
      }
    }

    window.AudioContext = FakeAudioContext;
    window.webkitAudioContext = FakeAudioContext;
    globalThis.AudioContext = FakeAudioContext;
    window.requestAnimationFrame = () => {
      this.requestAnimationFrameCalls++;
      return 1;
    };
    window.cancelAnimationFrame = () => {};
  });

  hooks.afterEach(function () {
    window.AudioContext = this.originalWindowAudioContext;
    window.webkitAudioContext = this.originalWindowWebkitAudioContext;
    globalThis.AudioContext = this.originalGlobalAudioContext;
    window.requestAnimationFrame = this.originalRequestAnimationFrame;
    window.cancelAnimationFrame = this.originalCancelAnimationFrame;
  });

  test("keeps sampling voice activity when animation frames are stalled", async function (assert) {
    assert.timeout(2000);

    let voiceActivityCalls = 0;
    const monitor = new AudioMonitor({
      onSpeakingChange: () => {},
      onVoiceActivity: () => {
        voiceActivityCalls++;
      },
    });

    const stream = {
      getAudioTracks() {
        return [{ kind: "audio" }];
      },
    };

    monitor.ensure(1, 1, stream, true);
    await wait(250);
    monitor.teardown(1, 1);

    assert.true(
      voiceActivityCalls >= 2,
      "continues reporting voice activity without relying on requestAnimationFrame callbacks"
    );
    assert.strictEqual(
      this.requestAnimationFrameCalls,
      0,
      "does not depend on requestAnimationFrame for audio sampling"
    );
    assert.true(
      this.analyserSampleCount >= 2,
      "keeps polling the analyser after the initial sample"
    );
  });
});
