import { setupTest } from "ember-qunit";
import { module, test } from "qunit";
import SubtitlesManager from "discourse/plugins/resenha/discourse/lib/resenha/subtitles";

function createFakeStream(id, trackId = `${id}-track`) {
  return {
    id,
    getAudioTracks: () => [{ id: trackId, kind: "audio" }],
    getTracks: () => [{ id: trackId, kind: "audio" }],
  };
}

// Speaks the worker protocol: init → ready (immediately), transcribe →
// caption echoing a canned text.
class FakeWorker {
  static instances = [];

  onmessage = null;
  onerror = null;
  terminated = false;
  jobs = [];

  constructor() {
    FakeWorker.instances.push(this);
  }

  postMessage(message) {
    if (message.type === "init") {
      Promise.resolve().then(() =>
        this.onmessage?.({ data: { type: "ready" } })
      );
    } else if (message.type === "transcribe") {
      this.jobs.push(message);
      Promise.resolve().then(() =>
        this.onmessage?.({
          data: {
            type: "caption",
            roomId: message.roomId,
            userId: message.userId,
            text: "hello world",
          },
        })
      );
    }
  }

  emit(data) {
    this.onmessage?.({ data });
  }

  terminate() {
    this.terminated = true;
  }
}

class FakeVad {
  static instances = [];

  destroyed = false;

  constructor(options) {
    this.options = options;
    FakeVad.instances.push(this);
  }

  async start() {}

  destroy() {
    this.destroyed = true;
  }

  speak(samples = 16000) {
    this.options.onSpeechEnd(new Float32Array(samples));
  }
}

function fakeVadModule() {
  return {
    MicVAD: {
      new: async (options) => new FakeVad(options),
    },
  };
}

module("Resenha | Unit | Lib | subtitles", function (hooks) {
  // The manager resolves asset URLs via Site.current(), which needs the
  // application container even though the tests inject fake loaders.
  setupTest(hooks);

  hooks.beforeEach(function () {
    localStorage.removeItem("resenha:subtitles");
    FakeWorker.instances = [];
    FakeVad.instances = [];

    this.captions = [];
    this.errors = [];
    this.progress = [];
    this.manager = new SubtitlesManager({
      onCaption: (roomId, userId, text) =>
        this.captions.push({ roomId, userId, text }),
      onLoadingChange: () => {},
      onProgress: (message) => this.progress.push(message),
      onError: (error) => this.errors.push(error),
      loadVad: async () => fakeVadModule(),
      createWorker: () => new FakeWorker(),
    });
  });

  hooks.afterEach(function () {
    this.manager.destroy();
    localStorage.removeItem("resenha:subtitles");
  });

  test("attaching taps a stream and captions flow end to end", async function (assert) {
    this.manager.setEnabled(true);
    await this.manager.attach(1, 42, createFakeStream("s1"));

    assert.strictEqual(FakeWorker.instances.length, 1, "one shared worker");
    assert.strictEqual(FakeVad.instances.length, 1, "one VAD per stream");

    FakeVad.instances[0].speak();
    await new Promise((resolve) => setTimeout(resolve, 10));

    assert.deepEqual(this.captions, [
      { roomId: 1, userId: 42, text: "hello world" },
    ]);
    assert.strictEqual(
      FakeWorker.instances[0].jobs[0].userId,
      42,
      "the utterance is attributed to its speaker"
    );
  });

  test("no worker or taps are created while disabled", async function (assert) {
    await this.manager.attach(1, 42, createFakeStream("s1"));

    assert.strictEqual(FakeWorker.instances.length, 0);
    assert.strictEqual(FakeVad.instances.length, 0);
  });

  test("re-attaching the same track is a no-op, a new track rebuilds the tap", async function (assert) {
    this.manager.setEnabled(true);
    const stream = createFakeStream("s1", "track-a");
    await this.manager.attach(1, 42, stream);
    await this.manager.attach(1, 42, stream);

    assert.strictEqual(FakeVad.instances.length, 1, "same track reuses tap");

    await this.manager.attach(1, 42, createFakeStream("s1", "track-b"));

    assert.strictEqual(FakeVad.instances.length, 2, "new track rebuilds");
    assert.true(FakeVad.instances[0].destroyed, "old tap is torn down");
  });

  test("disable tears everything down and drops in-flight utterances", async function (assert) {
    this.manager.setEnabled(true);
    await this.manager.attach(1, 42, createFakeStream("s1"));
    const vad = FakeVad.instances[0];

    this.manager.setEnabled(false);

    assert.true(vad.destroyed, "VAD destroyed");
    assert.true(FakeWorker.instances[0].terminated, "worker terminated");

    vad.speak();
    await new Promise((resolve) => setTimeout(resolve, 10));
    assert.deepEqual(this.captions, [], "stale utterances are ignored");
  });

  test("detachRoom only removes that room's taps", async function (assert) {
    this.manager.setEnabled(true);
    await this.manager.attach(1, 42, createFakeStream("s1"));
    await this.manager.attach(2, 43, createFakeStream("s2"));

    this.manager.detachRoom(1);

    assert.true(FakeVad.instances[0].destroyed);
    assert.false(FakeVad.instances[1].destroyed);
  });

  test("a worker error surfaces once and terminates the worker", async function (assert) {
    this.manager.setEnabled(true);
    await this.manager.attach(1, 42, createFakeStream("s1"));

    FakeWorker.instances[0].emit({ type: "error", message: "boom" });

    assert.strictEqual(this.errors.length, 1);
    assert.true(FakeWorker.instances[0].terminated);
  });

  test("short utterances still reach the worker with identity attached", async function (assert) {
    this.manager.setEnabled(true);
    await this.manager.attach(7, 9, createFakeStream("s1"));

    FakeVad.instances[0].speak(8000);

    const job = FakeWorker.instances[0].jobs[0];
    assert.strictEqual(job.roomId, 7);
    assert.strictEqual(job.userId, 9);
    assert.strictEqual(job.pcm.byteLength, 8000 * 4);
  });
});
