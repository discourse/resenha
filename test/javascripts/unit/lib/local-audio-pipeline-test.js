import { module, test } from "qunit";
import LocalAudioPipeline from "discourse/plugins/resenha/discourse/lib/resenha/local-audio-pipeline";

function createFakeTrack(id) {
  return { id, kind: "audio", enabled: true, stop() {} };
}

function createFakeStream(id, track) {
  return {
    id,
    getTracks: () => [track],
    getAudioTracks: () => [track],
  };
}

// A controllable stand-in for the DTLN worklet environment: tests decide
// when (and how) each AudioWorkletNode answers the ready handshake.
function installFakeEnvironment(context, { rawStream, processedStream }) {
  const workletNodes = [];

  class FakeAudioContext {
    state = "running";
    audioWorklet = {
      addModule: async () => {},
    };

    resume() {
      this.state = "running";
      return Promise.resolve();
    }

    createMediaStreamSource() {
      return {
        connect: (target) => target,
        disconnect() {},
      };
    }

    createMediaStreamDestination() {
      return { stream: processedStream };
    }

    close() {
      return Promise.resolve();
    }
  }

  class FakeAudioWorkletNode {
    port = {
      onmessage: null,
      postMessage: (data) => {
        if (data?.type === "wasm") {
          this.wasmReceived = true;
        }
      },
    };

    constructor() {
      workletNodes.push(this);
    }

    emit(message) {
      this.port.onmessage?.({ data: message });
    }

    connect(target) {
      return target;
    }

    disconnect() {}
  }

  context.originals = {
    audioContext: globalThis.AudioContext,
    workletNode: globalThis.AudioWorkletNode,
    windowAudioContext: window.AudioContext,
    fetch: globalThis.fetch,
    getUserMedia: navigator.mediaDevices?.getUserMedia,
  };

  const originalFetch = globalThis.fetch;
  globalThis.AudioContext = FakeAudioContext;
  window.AudioContext = FakeAudioContext;
  globalThis.AudioWorkletNode = FakeAudioWorkletNode;
  globalThis.fetch = (url, options) => {
    if (String(url).includes("/plugins/resenha/javascripts/dtln/")) {
      return Promise.resolve({
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(8),
      });
    }
    return originalFetch(url, options);
  };
  navigator.mediaDevices ||= {};
  navigator.mediaDevices.getUserMedia = async () => rawStream;

  return { workletNodes };
}

function restoreEnvironment(context) {
  globalThis.AudioContext = context.originals.audioContext;
  window.AudioContext = context.originals.windowAudioContext;
  globalThis.AudioWorkletNode = context.originals.workletNode;
  globalThis.fetch = context.originals.fetch;
  if (context.originals.getUserMedia) {
    navigator.mediaDevices.getUserMedia = context.originals.getUserMedia;
  } else {
    delete navigator.mediaDevices.getUserMedia;
  }
}

// Yields until the pipeline has posted the wasm to a worklet node, i.e. a
// setup() is parked on the ready handshake.
async function waitForWorkletNode(workletNodes, index = 0) {
  for (let i = 0; i < 50; i++) {
    if (workletNodes[index]?.wasmReceived) {
      return workletNodes[index];
    }
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error("worklet node never received wasm bytes");
}

module("Resenha | Unit | Lib | local-audio-pipeline", function (hooks) {
  hooks.beforeEach(function () {
    localStorage.removeItem("resenha:noise-suppression");

    this.rawTrack = createFakeTrack("raw-track");
    this.rawStream = createFakeStream("raw-stream", this.rawTrack);
    this.processedTrack = createFakeTrack("processed-track");
    this.processedStream = createFakeStream(
      "processed-stream",
      this.processedTrack
    );

    this.env = installFakeEnvironment(this, {
      rawStream: this.rawStream,
      processedStream: this.processedStream,
    });

    this.suppressionFailures = 0;
    this.trackReplacements = 0;
    this.pipeline = new LocalAudioPipeline({
      onStreamChanged: () => {},
      onSuppressionFailed: () => this.suppressionFailures++,
      replaceTrackOnPeers: async () => this.trackReplacements++,
    });
  });

  hooks.afterEach(function () {
    this.pipeline.stop();
    restoreEnvironment(this);
    localStorage.removeItem("resenha:noise-suppression");
  });

  test("enable resolves only after the worklet ready handshake", async function (assert) {
    await this.pipeline.acquireMicrophone();

    const toggle = this.pipeline.toggleNoiseSuppression();
    const node = await waitForWorkletNode(this.env.workletNodes);

    assert.strictEqual(
      this.pipeline.noiseSuppressionState,
      "starting",
      "stays in starting until the worklet confirms"
    );
    assert.strictEqual(
      this.pipeline.stream,
      this.rawStream,
      "keeps publishing the raw stream while starting"
    );

    node.emit({ type: "ready" });
    await toggle;

    assert.strictEqual(this.pipeline.noiseSuppressionState, "on");
    assert.strictEqual(
      this.pipeline.stream,
      this.processedStream,
      "publishes the suppressed stream after ready"
    );
    assert.strictEqual(
      localStorage.getItem("resenha:noise-suppression"),
      "1",
      "persists the preference only on success"
    );
    assert.strictEqual(this.trackReplacements, 1);
  });

  test("worklet init error reverts the toggle and notifies", async function (assert) {
    await this.pipeline.acquireMicrophone();

    const toggle = this.pipeline.toggleNoiseSuppression();
    const node = await waitForWorkletNode(this.env.workletNodes);
    node.emit({ type: "error", message: "boom" });
    await toggle;

    assert.strictEqual(this.pipeline.noiseSuppressionState, "off");
    assert.strictEqual(
      this.pipeline.stream,
      this.rawStream,
      "keeps the raw stream"
    );
    assert.strictEqual(this.suppressionFailures, 1, "notifies the failure");
    assert.strictEqual(
      localStorage.getItem("resenha:noise-suppression"),
      null,
      "does not persist the preference"
    );
    assert.strictEqual(
      this.trackReplacements,
      1,
      "re-publishes the raw track to peers"
    );
  });

  test("rapid toggles are serialized", async function (assert) {
    await this.pipeline.acquireMicrophone();

    const first = this.pipeline.toggleNoiseSuppression();
    const second = this.pipeline.toggleNoiseSuppression();

    const node = await waitForWorkletNode(this.env.workletNodes);
    node.emit({ type: "ready" });
    await first;
    await second;

    assert.strictEqual(
      this.pipeline.noiseSuppressionState,
      "off",
      "second toggle runs after the first completes and disables again"
    );
    assert.strictEqual(
      this.pipeline.stream,
      this.rawStream,
      "ends on the raw stream"
    );
    assert.strictEqual(
      this.env.workletNodes.length,
      1,
      "only one worklet setup ran"
    );
  });

  test("stop() during setup supersedes it without failure side effects", async function (assert) {
    await this.pipeline.acquireMicrophone();

    const toggle = this.pipeline.toggleNoiseSuppression();
    await waitForWorkletNode(this.env.workletNodes);

    this.pipeline.stop();
    await toggle;

    assert.strictEqual(
      this.suppressionFailures,
      0,
      "a superseded setup is not reported as a failure"
    );
    assert.strictEqual(this.pipeline.stream, null, "pipeline is stopped");
  });

  test("mid-call bypass falls back to the raw track", async function (assert) {
    localStorage.setItem("resenha:noise-suppression", "1");

    const acquired = this.pipeline.acquireMicrophone();
    const node = await waitForWorkletNode(this.env.workletNodes);
    node.emit({ type: "ready" });
    await acquired;

    assert.strictEqual(this.pipeline.noiseSuppressionState, "on");

    node.emit({ type: "bypass" });
    await new Promise((resolve) => setTimeout(resolve, 10));

    assert.strictEqual(this.pipeline.noiseSuppressionState, "off");
    assert.strictEqual(
      this.pipeline.stream,
      this.rawStream,
      "peers fall back to the raw stream"
    );
    assert.strictEqual(this.suppressionFailures, 1);
    assert.strictEqual(
      localStorage.getItem("resenha:noise-suppression"),
      null,
      "clears the preference so it doesn't loop"
    );
  });

  test("toggling without a microphone only stores the preference", async function (assert) {
    await this.pipeline.toggleNoiseSuppression();

    assert.strictEqual(this.pipeline.noiseSuppressionState, "on");
    assert.strictEqual(localStorage.getItem("resenha:noise-suppression"), "1");
    assert.strictEqual(
      this.env.workletNodes.length,
      0,
      "no worklet setup runs"
    );

    await this.pipeline.toggleNoiseSuppression();

    assert.strictEqual(this.pipeline.noiseSuppressionState, "off");
    assert.strictEqual(localStorage.getItem("resenha:noise-suppression"), null);
  });
});
