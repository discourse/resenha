import Service from "@ember/service";
import { setupTest } from "ember-qunit";
import { module, test } from "qunit";
import pretender, { response } from "discourse/tests/helpers/create-pretender";
import { logIn } from "discourse/tests/helpers/qunit-helpers";

class ResenhaRoomsStub extends Service {
  #roomHandlers = new Map();
  #roomsById = new Map();

  seedRoom(room) {
    this.#roomsById.set(room.id, room);
  }

  roomById(id) {
    return this.#roomsById.get(id);
  }

  registerRoomHandler(roomId, callback) {
    let callbacks = this.#roomHandlers.get(roomId);

    if (!callbacks) {
      callbacks = new Set();
      this.#roomHandlers.set(roomId, callbacks);
    }

    callbacks.add(callback);
  }

  unregisterRoomHandler(roomId, callback) {
    const callbacks = this.#roomHandlers.get(roomId);
    if (!callbacks) {
      return;
    }

    callbacks.delete(callback);
    if (!callbacks.size) {
      this.#roomHandlers.delete(roomId);
    }
  }

  emit(roomId, payload) {
    const room = this.#roomsById.get(roomId);

    if (payload.type === "participants" && room) {
      room.active_participants = payload.participants;
    }

    this.#roomHandlers.get(roomId)?.forEach((callback) => callback(payload));
  }

  addParticipant(roomId, participant) {
    const room = this.#roomsById.get(roomId);
    if (!room) {
      return;
    }

    const existing = room.active_participants || [];
    if (existing.some((entry) => Number(entry.id) === Number(participant.id))) {
      return;
    }

    room.active_participants = [...existing, participant];
  }

  removeParticipant(roomId, userId) {
    const room = this.#roomsById.get(roomId);
    if (!room) {
      return;
    }

    room.active_participants = (room.active_participants || []).filter(
      (participant) => Number(participant.id) !== Number(userId)
    );
  }

  setParticipantMuted() {}
  setParticipantDeafened() {}
  setParticipantSpeaking() {}
  setParticipantIdleState() {}
}

class ToastsStub extends Service {
  error() {}
  success() {}
  default() {}
}

class FakeRTCPeerConnection {
  static created = 0;
  static instances = [];

  signalingState = "stable";
  connectionState = "new";
  iceConnectionState = "new";
  iceGatheringState = "new";
  localDescription = null;
  remoteDescription = null;
  senders = [];

  constructor() {
    FakeRTCPeerConnection.created++;
    FakeRTCPeerConnection.instances.push(this);
  }

  addTrack(track) {
    const sender = {
      track,
      replaceCalls: [],
      async replaceTrack(newTrack) {
        this.track = newTrack;
        this.replaceCalls.push(newTrack);
      },
    };

    this.senders.push(sender);
    return sender;
  }

  getSenders() {
    return this.senders;
  }

  async createOffer() {
    return { type: "offer", sdp: "fake-offer" };
  }

  async createAnswer() {
    return { type: "answer", sdp: "fake-answer" };
  }

  async setLocalDescription(description) {
    this.localDescription = description;

    if (description?.type === "offer") {
      this.signalingState = "have-local-offer";
    } else if (
      description?.type === "answer" ||
      description?.type === "rollback"
    ) {
      this.signalingState = "stable";
    }
  }

  async setRemoteDescription(description) {
    this.remoteDescription = description;

    if (description?.type === "offer") {
      this.signalingState = "have-remote-offer";
    } else if (description?.type === "answer") {
      this.signalingState = "stable";
    }
  }

  async addIceCandidate() {}

  close() {
    this.connectionState = "closed";
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitUntil(callback, timeout = 500) {
  const startedAt = Date.now();

  while (!callback()) {
    if (Date.now() - startedAt > timeout) {
      throw new Error("Timed out waiting for condition");
    }
    await wait(10);
  }
}

function signalPayloadFrom(request) {
  const params = new URLSearchParams(request.requestBody);

  return {
    recipientId: Number(params.get("payload[recipient_id]")),
    type: params.get("payload[type]"),
    sdp: params.get("payload[sdp]"),
  };
}

function deferred() {
  let resolve;
  let reject;

  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

function createFakeTrack(id) {
  return {
    id,
    kind: "audio",
    enabled: true,
    stop() {},
  };
}

function createFakeStream(id, track) {
  return {
    id,
    getTracks() {
      return [track];
    },
    getAudioTracks() {
      return [track];
    },
  };
}

function installFakeAudioEnvironment({ rawStream, processedStream }) {
  const sourceStreams = [];
  const originalAudioContext = globalThis.AudioContext;
  const originalAudioWorkletNode = globalThis.AudioWorkletNode;
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;
  const originalWindowAudioContext = window.AudioContext;
  const originalWindowWebkitAudioContext = window.webkitAudioContext;
  const originalGetUserMedia = navigator.mediaDevices?.getUserMedia;

  class FakeAudioContext {
    currentTime = 0;
    destination = {};
    audioWorklet = {
      addModule: async () => {},
    };

    createMediaStreamSource(stream) {
      sourceStreams.push(stream);

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
          array.fill(128);
        },
      };
    }

    createMediaStreamDestination() {
      return { stream: processedStream };
    }

    createOscillator() {
      return {
        frequency: { value: 0 },
        connect(target) {
          return target;
        },
        start() {},
        stop() {},
      };
    }

    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          exponentialRampToValueAtTime() {},
        },
        connect(target) {
          return target;
        },
      };
    }

    close() {
      return Promise.resolve();
    }
  }

  class FakeAudioWorkletNode {
    connect(target) {
      return target;
    }

    disconnect() {}
  }

  globalThis.AudioContext = FakeAudioContext;
  globalThis.AudioWorkletNode = FakeAudioWorkletNode;
  window.AudioContext = FakeAudioContext;
  window.webkitAudioContext = FakeAudioContext;
  window.requestAnimationFrame = () => 1;
  window.cancelAnimationFrame = () => {};

  navigator.mediaDevices ||= {};
  navigator.mediaDevices.getUserMedia = async () => rawStream;

  return {
    sourceStreams,
    restore() {
      globalThis.AudioContext = originalAudioContext;
      globalThis.AudioWorkletNode = originalAudioWorkletNode;
      window.AudioContext = originalWindowAudioContext;
      window.webkitAudioContext = originalWindowWebkitAudioContext;
      window.requestAnimationFrame = originalRequestAnimationFrame;
      window.cancelAnimationFrame = originalCancelAnimationFrame;

      if (originalGetUserMedia) {
        navigator.mediaDevices.getUserMedia = originalGetUserMedia;
      } else {
        delete navigator.mediaDevices.getUserMedia;
      }
    },
  };
}

module("Resenha | Unit | Service | resenha-webrtc", function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.currentUser = logIn(this.owner);
    this.siteSettings = this.owner.lookup("service:site-settings");
    this.siteSettings.resenha_noise_suppression = false;
    this.siteSettings.resenha_auto_status_enabled = true;
    this.siteSettings.resenha_stun_servers = "";
    this.siteSettings.resenha_turn_servers = "";

    this.owner.unregister("service:resenha-rooms");
    this.owner.register("service:resenha-rooms", ResenhaRoomsStub);
    this.owner.unregister("service:toasts");
    this.owner.register("service:toasts", ToastsStub);

    this.rooms = this.owner.lookup("service:resenha-rooms");
    this.room = {
      id: 1,
      name: "Stage",
      room_type: "stage",
      membership: { role_name: "listener" },
      active_participants: [
        { id: this.currentUser.id, role: "listener" },
        { id: 2, role: "speaker" },
      ],
    };
    this.rooms.seedRoom(this.room);

    pretender.post("/resenha/rooms/1/join", () =>
      response({
        room: JSON.parse(JSON.stringify(this.room)),
      })
    );
    pretender.post("/resenha/rooms/1/signal", () => response({}));
    pretender.post("/resenha/rooms/1/toggle_mute", () => response({}));
    pretender.delete("/resenha/rooms/1/leave", () => response({}));

    this.originalRTCPeerConnection = globalThis.RTCPeerConnection;
    this.originalRTCIceCandidate = globalThis.RTCIceCandidate;
    this.originalRTCSessionDescription = globalThis.RTCSessionDescription;

    FakeRTCPeerConnection.created = 0;
    FakeRTCPeerConnection.instances = [];
    globalThis.RTCPeerConnection = FakeRTCPeerConnection;
    globalThis.RTCIceCandidate = class {
      constructor(candidate) {
        Object.assign(this, candidate);
      }
    };
    globalThis.RTCSessionDescription = class {
      constructor(description) {
        Object.assign(this, description);
      }
    };

    this.subject = this.owner.lookup("service:resenha-webrtc");
  });

  hooks.afterEach(function () {
    this.subject?.leave({ id: 1 }, { keepLocalStream: true });

    globalThis.RTCPeerConnection = this.originalRTCPeerConnection;
    globalThis.RTCIceCandidate = this.originalRTCIceCandidate;
    globalThis.RTCSessionDescription = this.originalRTCSessionDescription;
  });

  test("ignores stale signals after a participant has left the room", async function (assert) {
    await this.subject.join(this.room);
    await wait(50);

    assert.strictEqual(
      FakeRTCPeerConnection.created,
      1,
      "creates the initial peer for the active speaker"
    );

    this.rooms.emit(1, {
      type: "participants",
      participants: [{ id: this.currentUser.id, role: "listener" }],
    });
    await wait(10);

    this.rooms.emit(1, {
      type: "signal",
      sender_id: 2,
      data: {
        type: "candidate",
        candidate: {
          candidate: "candidate:1 1 UDP 2122252543 127.0.0.1 3478 typ host",
          sdpMid: "0",
          sdpMLineIndex: 0,
        },
      },
    });
    await wait(10);

    assert.strictEqual(
      FakeRTCPeerConnection.created,
      1,
      "does not recreate a peer from a delayed signal after the participant left"
    );
  });

  test("leave cancels a pending join before the late response can activate the room", async function (assert) {
    assert.timeout(2000);

    const joinResponse = deferred();

    pretender.post("/resenha/rooms/1/join", () =>
      joinResponse.promise.then(() =>
        response({
          room: JSON.parse(JSON.stringify(this.room)),
        })
      )
    );

    const join = this.subject.join(this.room);
    await wait(10);

    assert.strictEqual(
      this.subject.connectionStateFor(1),
      "connecting",
      "marks the room as connecting while the join is pending"
    );

    this.subject.leave({ id: 1 }, { keepLocalStream: true });

    assert.strictEqual(
      this.subject.connectionStateFor(1),
      "idle",
      "returns to idle immediately after leaving"
    );

    joinResponse.resolve();
    await join;
    await wait(10);

    assert.strictEqual(
      this.subject.connectionStateFor(1),
      "idle",
      "keeps the room idle after the late join response arrives"
    );
    assert.strictEqual(
      FakeRTCPeerConnection.created,
      0,
      "does not create peers for a canceled join"
    );
  });

  test("join uses the latest participant list when more users join during connect", async function (assert) {
    assert.timeout(2000);

    const joinResponse = deferred();
    const staleRoom = {
      ...this.room,
      active_participants: [{ id: this.currentUser.id, role: "listener" }],
    };

    pretender.post("/resenha/rooms/1/join", () =>
      joinResponse.promise.then(() =>
        response({
          room: JSON.parse(JSON.stringify(staleRoom)),
        })
      )
    );

    const join = this.subject.join(this.room);
    await wait(10);

    this.rooms.emit(1, {
      type: "participants",
      participants: [
        { id: this.currentUser.id, role: "listener" },
        { id: 2, role: "speaker" },
        { id: 30, role: "speaker" },
      ],
    });

    joinResponse.resolve();
    await join;
    await wait(10);

    assert.strictEqual(
      FakeRTCPeerConnection.created,
      2,
      "creates peers for participants that joined while the room was still connecting"
    );
  });

  test("join still uses the join response when no newer participant broadcast arrived", async function (assert) {
    const responseRoom = {
      ...this.room,
      active_participants: [
        { id: this.currentUser.id, role: "listener" },
        { id: 2, role: "speaker" },
        { id: 30, role: "speaker" },
      ],
    };

    pretender.post("/resenha/rooms/1/join", () =>
      response({
        room: JSON.parse(JSON.stringify(responseRoom)),
      })
    );

    await this.subject.join(this.room);
    await wait(10);

    assert.strictEqual(
      FakeRTCPeerConnection.created,
      2,
      "creates peers for participants only present in the fresher join response"
    );
  });

  test("kicked while connecting cancels the pending join", async function (assert) {
    assert.timeout(2000);

    const joinResponse = deferred();

    pretender.post("/resenha/rooms/1/join", () =>
      joinResponse.promise.then(() =>
        response({
          room: JSON.parse(JSON.stringify(this.room)),
        })
      )
    );

    const join = this.subject.join(this.room);
    await wait(10);

    this.rooms.emit(1, { type: "kicked" });
    await wait(10);

    assert.strictEqual(
      this.subject.connectionStateFor(1),
      "idle",
      "drops back to idle immediately after the kick"
    );

    joinResponse.resolve();
    await join;
    await wait(10);

    assert.strictEqual(
      this.subject.connectionStateFor(1),
      "idle",
      "stays idle after the late join response arrives"
    );
    assert.strictEqual(
      FakeRTCPeerConnection.created,
      0,
      "does not create peers after a connect-time kick"
    );
  });

  test("join replays queued connect-time signals for existing peers", async function (assert) {
    assert.timeout(2000);

    const joinResponse = deferred();
    let signalRequests = 0;

    pretender.post("/resenha/rooms/1/join", () =>
      joinResponse.promise.then(() =>
        response({
          room: JSON.parse(JSON.stringify(this.room)),
        })
      )
    );
    pretender.post("/resenha/rooms/1/signal", () => {
      signalRequests++;
      return response({});
    });

    const join = this.subject.join(this.room);
    await wait(10);

    this.rooms.emit(1, {
      type: "signal",
      sender_id: 2,
      data: { type: "offer", sdp: "queued-offer" },
    });

    joinResponse.resolve();
    await join;
    await wait(50);

    assert.strictEqual(
      signalRequests,
      1,
      "sends an answer immediately after join instead of waiting for the fallback retry"
    );
  });

  test("join sends an immediate offer to lower-id peers instead of waiting for retry fallback", async function (assert) {
    assert.timeout(2000);

    const rawTrack = createFakeTrack("raw-track");
    const rawStream = createFakeStream("raw-stream", rawTrack);
    const audioEnvironment = installFakeAudioEnvironment({
      rawStream,
      processedStream: createFakeStream(
        "processed-stream",
        createFakeTrack("processed-track")
      ),
    });
    const signalRequests = [];

    this.currentUser.id = 50;
    this.room.room_type = "open";
    this.room.membership.role_name = "participant";
    this.room.active_participants = [
      { id: this.currentUser.id, role: "participant" },
      { id: 2, role: "participant" },
    ];

    pretender.post("/resenha/rooms/1/signal", (request) => {
      signalRequests.push(signalPayloadFrom(request));
      return response({});
    });

    try {
      await this.subject.join(this.room);
      await waitUntil(() => signalRequests.length === 1);

      assert.deepEqual(
        signalRequests[0],
        { recipientId: 2, type: "offer", sdp: "fake-offer" },
        "sends an offer immediately even when the current user id is higher than the peer id"
      );
    } finally {
      audioEnvironment.restore();
    }
  });

  test("simultaneous join offers resolve glare by rolling back the lower user id side", async function (assert) {
    assert.timeout(2000);

    const rawTrack = createFakeTrack("raw-track");
    const rawStream = createFakeStream("raw-stream", rawTrack);
    const audioEnvironment = installFakeAudioEnvironment({
      rawStream,
      processedStream: createFakeStream(
        "processed-stream",
        createFakeTrack("processed-track")
      ),
    });
    const signalRequests = [];

    this.currentUser.id = 2;
    this.room.room_type = "open";
    this.room.membership.role_name = "participant";
    this.room.active_participants = [
      { id: this.currentUser.id, role: "participant" },
      { id: 50, role: "participant" },
    ];

    pretender.post("/resenha/rooms/1/signal", (request) => {
      signalRequests.push(signalPayloadFrom(request));
      return response({});
    });

    try {
      await this.subject.join(this.room);
      await waitUntil(() => signalRequests.length === 1);

      this.rooms.emit(1, {
        type: "signal",
        sender_id: 50,
        data: { type: "offer", sdp: "simultaneous-offer" },
      });
      await waitUntil(() => signalRequests.length === 2);

      const pc = FakeRTCPeerConnection.instances[0];
      assert.deepEqual(
        signalRequests[0],
        { recipientId: 50, type: "offer", sdp: "fake-offer" },
        "sends the initial offer before receiving the competing offer"
      );
      assert.deepEqual(
        signalRequests[1],
        { recipientId: 50, type: "answer", sdp: "fake-answer" },
        "answers the competing offer after rollback"
      );
      assert.strictEqual(
        pc.remoteDescription.sdp,
        "simultaneous-offer",
        "accepts the competing offer after rolling back local offer"
      );
      assert.strictEqual(
        pc.localDescription.type,
        "answer",
        "finishes glare resolution with an answer"
      );
    } finally {
      audioEnvironment.restore();
    }
  });

  test("inbound recovery signals cancel a pending peer restart", async function (assert) {
    assert.timeout(5000);

    let signalRequests = 0;

    pretender.post("/resenha/rooms/1/signal", () => {
      signalRequests++;
      return response({});
    });

    await this.subject.join(this.room);
    await wait(50);

    const pc = FakeRTCPeerConnection.instances[0];
    pc.connectionState = "disconnected";
    pc.onconnectionstatechange();

    this.rooms.emit(1, {
      type: "signal",
      sender_id: 2,
      data: { type: "offer", sdp: "recovery-offer" },
    });
    await wait(50);
    await wait(1600);

    assert.strictEqual(
      signalRequests,
      1,
      "sends only the recovery answer and does not fire a stale restart offer"
    );
    assert.strictEqual(
      FakeRTCPeerConnection.created,
      1,
      "keeps the existing peer instead of recreating it after recovery signaling"
    );
  });

  test("enabling noise suppression preserves mute state across multiple peers", async function (assert) {
    const rawTrack = createFakeTrack("raw-track");
    const processedTrack = createFakeTrack("processed-track");
    const rawStream = createFakeStream("raw-stream", rawTrack);
    const processedStream = createFakeStream(
      "processed-stream",
      processedTrack
    );
    const audioEnvironment = installFakeAudioEnvironment({
      rawStream,
      processedStream,
    });

    this.siteSettings.resenha_noise_suppression = true;
    this.room.membership.role_name = "speaker";
    this.room.active_participants = [
      { id: this.currentUser.id, role: "speaker" },
      { id: 2, role: "speaker" },
      { id: 30, role: "speaker" },
    ];

    try {
      await this.subject.join(this.room);
      await wait(50);

      this.subject.toggleMute();

      await this.subject.toggleNoiseSuppression();

      assert.true(
        this.subject.noiseSuppressionEnabled,
        "marks noise suppression as enabled"
      );
      assert.strictEqual(
        this.subject.localStream,
        processedStream,
        "swaps to the processed stream"
      );

      FakeRTCPeerConnection.instances.forEach((pc, index) => {
        const sender = pc.getSenders()[0];

        assert.strictEqual(
          sender.track,
          processedTrack,
          `peer ${index + 1} switches to the processed track`
        );
        assert.false(
          sender.track.enabled,
          `peer ${index + 1} keeps the muted state after the stream swap`
        );
      });
    } finally {
      audioEnvironment.restore();
    }
  });

  test("disabling noise suppression preserves mute state across multiple peers", async function (assert) {
    const rawTrack = createFakeTrack("raw-track");
    const processedTrack = createFakeTrack("processed-track");
    const rawStream = createFakeStream("raw-stream", rawTrack);
    const processedStream = createFakeStream(
      "processed-stream",
      processedTrack
    );
    const audioEnvironment = installFakeAudioEnvironment({
      rawStream,
      processedStream,
    });

    this.siteSettings.resenha_noise_suppression = true;
    this.room.membership.role_name = "speaker";
    this.room.active_participants = [
      { id: this.currentUser.id, role: "speaker" },
      { id: 2, role: "speaker" },
      { id: 30, role: "speaker" },
    ];

    localStorage.setItem("resenha:noise-suppression", "1");

    try {
      await this.subject.join(this.room);
      await wait(50);

      this.subject.toggleMute();
      await this.subject.toggleNoiseSuppression();

      assert.false(
        this.subject.noiseSuppressionEnabled,
        "marks noise suppression as disabled"
      );
      assert.strictEqual(
        this.subject.localStream,
        rawStream,
        "restores the raw microphone stream"
      );
      assert.strictEqual(
        audioEnvironment.sourceStreams.filter((stream) => stream === rawStream)
          .length,
        2,
        "rebinds the local speaking monitor to the restored raw stream"
      );

      FakeRTCPeerConnection.instances.forEach((pc, index) => {
        const sender = pc.getSenders()[0];

        assert.strictEqual(
          sender.track,
          rawTrack,
          `peer ${index + 1} switches back to the raw track`
        );
        assert.false(
          sender.track.enabled,
          `peer ${index + 1} keeps the muted state after restoring the raw stream`
        );
      });
    } finally {
      localStorage.removeItem("resenha:noise-suppression");
      audioEnvironment.restore();
    }
  });
});
