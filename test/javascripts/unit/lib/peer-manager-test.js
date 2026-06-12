import { module, test } from "qunit";
import PeerManager from "discourse/plugins/resenha/discourse/lib/resenha/peer-manager";

class FakeRTCPeerConnection {
  signalingState = "stable";
  connectionState = "new";
  iceConnectionState = "new";
  iceGatheringState = "new";
  localDescription = null;
  #senders = [];
  #transceivers = [];

  constructor() {}

  addTrack(track) {
    const sender = { track };
    this.#senders.push(sender);
    return sender;
  }

  addTransceiver(kind) {
    const sender = {
      track: null,
      async replaceTrack(newTrack) {
        this.track = newTrack;
      },
    };
    const transceiver = {
      direction: "sendrecv",
      sender,
      receiver: { track: { kind } },
    };
    this.#transceivers.push(transceiver);
    this.#senders.push(sender);
    return transceiver;
  }

  getTransceivers() {
    return this.#transceivers;
  }

  getSenders() {
    return this.#senders;
  }

  async createOffer() {
    return { type: "offer", sdp: "fake-offer" };
  }

  async setLocalDescription(description) {
    this.localDescription = description;
  }

  close() {
    this.connectionState = "closed";
  }
}

module("Resenha | Unit | Lib | peer-manager", function (hooks) {
  hooks.beforeEach(function () {
    this.originalRTCPeerConnection = globalThis.RTCPeerConnection;
    globalThis.RTCPeerConnection = FakeRTCPeerConnection;
  });

  hooks.afterEach(function () {
    globalThis.RTCPeerConnection = this.originalRTCPeerConnection;
  });

  test("does not keep a restarted peer when the room becomes ineligible mid-restart", async function (assert) {
    let shouldRestart = true;
    let sentSignals = 0;

    const manager = new PeerManager({
      getIceServers: () => [],
      getLocalStream: () => null,
      sendSignal: () => {
        sentSignals++;
        return Promise.resolve();
      },
      flushQueuedSignals: () => Promise.resolve(),
      onTrack: () => {},
      clearSignalQueue: () => {},
      onPeerDestroyed: () => {},
      shouldRestartPeer: () => shouldRestart,
    });

    await manager.create(1, 2);
    assert.true(manager.has(1, 2), "creates the initial peer");

    const restart = manager.restart(1, 2);
    shouldRestart = false;
    await restart;

    assert.false(
      manager.has(1, 2),
      "does not keep a recreated peer when restart is no longer allowed"
    );
    assert.strictEqual(sentSignals, 0, "does not emit a new offer");
  });

  test("alignVideoTransceiverForAnswer makes the negotiated transceiver sendable and migrates the orphaned track", async function (assert) {
    const makeSender = (track = null) => ({
      track,
      async replaceTrack(newTrack) {
        this.track = newTrack;
      },
    });

    const cameraTrack = { id: "camera", kind: "video" };
    const orphan = {
      mid: null,
      direction: "sendrecv",
      sender: makeSender(cameraTrack),
      receiver: { track: { kind: "video" } },
    };
    const associated = {
      mid: "1",
      direction: "recvonly",
      sender: makeSender(),
      receiver: { track: { kind: "video" } },
    };
    const pc = {
      getTransceivers() {
        return [orphan, associated];
      },
    };

    PeerManager.alignVideoTransceiverForAnswer(pc);
    await Promise.resolve();

    assert.strictEqual(
      associated.direction,
      "sendrecv",
      "flips the negotiated transceiver to sendrecv before the answer"
    );
    assert.strictEqual(
      associated.sender.track,
      cameraTrack,
      "moves the camera track onto the negotiated transceiver"
    );
    assert.strictEqual(
      orphan.sender.track,
      null,
      "detaches the camera track from the orphaned transceiver"
    );
    assert.strictEqual(
      PeerManager.videoTransceiverFor(pc),
      associated,
      "videoTransceiverFor prefers the negotiated transceiver"
    );
  });
});
