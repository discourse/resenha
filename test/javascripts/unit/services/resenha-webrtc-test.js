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

  addedCandidates = [];

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



  async addIceCandidate(candidate) {
    this.addedCandidates.push(candidate);
  }

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

// Flattens a signal POST into individual { recipientId, type, sdp } entries,
// tolerating the three payload shapes the signaling layer emits: a single
// event, a single recipient with multiple coalesced events, and multiple
// recipients. Use when signals to the same peer may land in one HTTP batch.
function signalsFrom(request) {
  const params = new URLSearchParams(request.requestBody);
  const get = (key) => params.get(key);

  if (get("payload[messages][0][recipient_id]")) {
    const signals = [];
    for (let m = 0; get(`payload[messages][${m}][recipient_id]`); m++) {
      const recipientId = Number(get(`payload[messages][${m}][recipient_id]`));
      for (let e = 0; get(`payload[messages][${m}][events][${e}][type]`); e++) {
        signals.push({
          recipientId,
          type: get(`payload[messages][${m}][events][${e}][type]`),
          sdp: get(`payload[messages][${m}][events][${e}][sdp]`),
        });
      }
    }
    return signals;
  }

  const recipientId = Number(get("payload[recipient_id]"));

  if (get("payload[events][0][type]")) {
    const signals = [];
    for (let e = 0; get(`payload[events][${e}][type]`); e++) {
      signals.push({
        recipientId,
        type: get(`payload[events][${e}][type]`),
        sdp: get(`payload[events][${e}][sdp]`),
      });
    }
    return signals;
  }

  return [
    { recipientId, type: get("payload[type]"), sdp: get("payload[sdp]") },
  ];
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

  test("join offers deterministically based on user id to avoid glare", async function (assert) {
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

    // Current user id is higher than the existing peer's, so it must NOT
    // offer immediately (that is what caused glare); the lower-id peer owns
    // the immediate offer. A short fallback offer fires only if the peer
    // never offers.
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
      await wait(50);

      assert.strictEqual(
        signalRequests.length,
        0,
        "does not send an immediate offer when the current user id is higher than the peer id"
      );

      await waitUntil(() => signalRequests.length === 1, 1500);

      assert.deepEqual(
        signalRequests[0],
        { recipientId: 2, type: "offer", sdp: "fake-offer" },
        "sends a fallback offer to the lower-id peer after the short retry delay"
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

  test("higher-id peer joining a populated room connects to the lower-id peer without glare", async function (assert) {
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

    // The reported regression: a new participant whose id is higher than an
    // already-connected peer's joins the room. With the deterministic
    // offerer the joiner does not offer; it answers the lower-id peer and
    // ends up connected with that peer's audio, without waiting for the 30s
    // connection timeout.
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
      await wait(50);

      assert.strictEqual(
        signalRequests.length,
        0,
        "does not send a competing offer that would collide with the peer's"
      );

      const pc = FakeRTCPeerConnection.instances[0];

      // The lower-id peer owns the immediate offer.
      this.rooms.emit(1, {
        type: "signal",
        sender_id: 2,
        data: { type: "offer", sdp: "peer-offer" },
      });
      await waitUntil(() => signalRequests.length === 1, 1500);

      assert.deepEqual(
        signalRequests[0],
        { recipientId: 2, type: "answer", sdp: "fake-answer" },
        "answers the lower-id peer's offer instead of racing it with its own"
      );
      assert.strictEqual(
        pc.signalingState,
        "stable",
        "negotiation completes without leaving a dangling local offer"
      );

      // The peer's audio track arrives and is exposed to the room.
      const remoteTrack = createFakeTrack("peer-2-track");
      const remoteStream = createFakeStream("peer-2-stream", remoteTrack);
      pc.ontrack({ streams: [remoteStream], track: remoteTrack });
      await wait(10);

      assert.true(
        this.subject
          .remoteStreamsFor(1)
          .some((stream) => stream.id === "peer-2-stream"),
        "exposes the peer's audio stream after negotiation completes"
      );
    } finally {
      audioEnvironment.restore();
    }
  });

  test("slow mic, lower-id local user: offer queued during the permission prompt connects via rollback", async function (assert) {
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
    const micGranted = deferred();
    navigator.mediaDevices.getUserMedia = () =>
      micGranted.promise.then(() => rawStream);

    // Local user is the designated (lower-id) offerer, but is slow to grant
    // mic access. The higher-id peer's fallback offer arrives while the
    // permission prompt is still open. The immediate offer and the rollback
    // answer to the same peer can land in one HTTP batch, so flatten them.
    this.currentUser.id = 2;
    this.room.room_type = "open";
    this.room.membership.role_name = "participant";
    this.room.active_participants = [
      { id: this.currentUser.id, role: "participant" },
      { id: 50, role: "participant" },
    ];

    pretender.post("/resenha/rooms/1/signal", (request) => {
      signalRequests.push(...signalsFrom(request));
      return response({});
    });

    try {
      const join = this.subject.join(this.room);
      await wait(20);

      this.rooms.emit(1, {
        type: "signal",
        sender_id: 50,
        data: { type: "offer", sdp: "peer-offer" },
      });
      await wait(20);

      assert.strictEqual(
        FakeRTCPeerConnection.created,
        0,
        "does not create peers or signal before microphone permission is granted"
      );
      assert.strictEqual(
        signalRequests.length,
        0,
        "queues the inbound offer instead of acting on it while connecting"
      );

      micGranted.resolve();
      await join;
      await waitUntil(() => signalRequests.length === 2, 1000);

      const pc = FakeRTCPeerConnection.instances[0];
      assert.deepEqual(
        signalRequests,
        [
          { recipientId: 50, type: "offer", sdp: "fake-offer" },
          { recipientId: 50, type: "answer", sdp: "fake-answer" },
        ],
        "offers immediately on grant, then rolls back and answers the queued offer"
      );
      assert.strictEqual(
        pc.signalingState,
        "stable",
        "ends negotiation in a stable state, not stuck on a dangling offer"
      );

      const remoteTrack = createFakeTrack("peer-50-track");
      const remoteStream = createFakeStream("peer-50-stream", remoteTrack);
      pc.ontrack({ streams: [remoteStream], track: remoteTrack });
      await wait(10);

      assert.true(
        this.subject
          .remoteStreamsFor(1)
          .some((stream) => stream.id === "peer-50-stream"),
        "exposes the peer's audio after a slow-permission join"
      );
    } finally {
      audioEnvironment.restore();
    }
  });

  test("slow mic, higher-id local user: queued offer is answered on grant without a competing offer", async function (assert) {
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
    const micGranted = deferred();
    navigator.mediaDevices.getUserMedia = () =>
      micGranted.promise.then(() => rawStream);

    // Local user is higher-id, so the lower-id peer owns the offer. That
    // offer lands while the mic prompt is open; on grant the local user
    // must answer it rather than racing it with a fallback offer.
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
      const join = this.subject.join(this.room);
      await wait(20);

      this.rooms.emit(1, {
        type: "signal",
        sender_id: 2,
        data: { type: "offer", sdp: "peer-offer" },
      });
      await wait(20);

      micGranted.resolve();
      await join;
      await waitUntil(() => signalRequests.length === 1, 1000);
      // Wait past the fallback delay to prove no late competing offer fires.
      await wait(500);

      const pc = FakeRTCPeerConnection.instances[0];
      assert.deepEqual(
        signalRequests,
        [{ recipientId: 2, type: "answer", sdp: "fake-answer" }],
        "answers the queued offer and never sends a competing fallback offer"
      );
      assert.strictEqual(
        pc.signalingState,
        "stable",
        "ends negotiation in a stable state"
      );

      const remoteTrack = createFakeTrack("peer-2-track");
      const remoteStream = createFakeStream("peer-2-stream", remoteTrack);
      pc.ontrack({ streams: [remoteStream], track: remoteTrack });
      await wait(10);

      assert.true(
        this.subject
          .remoteStreamsFor(1)
          .some((stream) => stream.id === "peer-2-stream"),
        "exposes the peer's audio after a slow-permission join"
      );
    } finally {
      audioEnvironment.restore();
    }
  });

  test("join with both a lower- and higher-id peer only offers to the higher-id one", async function (assert) {
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

    // Local id sits between the two peers: it owns the offer to the
    // higher-id peer (99) and waits for the lower-id peer (2) to offer.
    this.currentUser.id = 10;
    this.room.room_type = "open";
    this.room.membership.role_name = "participant";
    this.room.active_participants = [
      { id: this.currentUser.id, role: "participant" },
      { id: 2, role: "participant" },
      { id: 99, role: "participant" },
    ];

    pretender.post("/resenha/rooms/1/signal", (request) => {
      signalRequests.push(signalPayloadFrom(request));
      return response({});
    });

    try {
      await this.subject.join(this.room);
      await waitUntil(() => signalRequests.length === 1, 1000);

      assert.deepEqual(
        signalRequests,
        [{ recipientId: 99, type: "offer", sdp: "fake-offer" }],
        "offers immediately only to the higher-id peer, not the lower-id one"
      );

      this.rooms.emit(1, {
        type: "signal",
        sender_id: 2,
        data: { type: "offer", sdp: "peer-offer" },
      });
      await waitUntil(() => signalRequests.length === 2, 1000);

      assert.deepEqual(
        signalRequests[1],
        { recipientId: 2, type: "answer", sdp: "fake-answer" },
        "answers the lower-id peer when its offer arrives"
      );
      assert.false(
        signalRequests.some(
          (request) => request.recipientId === 2 && request.type === "offer"
        ),
        "never sends a competing offer to the lower-id peer"
      );
    } finally {
      audioEnvironment.restore();
    }
  });

  test("honors an early offer from a participant whose presence has not propagated yet", async function (assert) {
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

    // The regression: two peers join near-simultaneously. The other peer
    // gathers and offers before our presence broadcast lists it, so
    // active_participants still only contains us when its offer arrives.
    // Gating on presence used to silently drop that offer and strand the
    // connection; a targeted offer is implicit proof the sender shares the
    // room, so we must answer it.
    this.currentUser.id = 50;
    this.room.room_type = "open";
    this.room.membership.role_name = "participant";
    this.room.active_participants = [
      { id: this.currentUser.id, role: "participant" },
    ];

    pretender.post("/resenha/rooms/1/signal", (request) => {
      signalRequests.push(signalPayloadFrom(request));
      return response({});
    });

    try {
      await this.subject.join(this.room);
      await wait(50);

      assert.strictEqual(
        signalRequests.length,
        0,
        "is alone in the room per presence, so sends nothing on its own"
      );

      this.rooms.emit(1, {
        type: "signal",
        sender_id: 2,
        data: { type: "offer", sdp: "early-offer" },
      });
      await waitUntil(() => signalRequests.length === 1, 1500);

      assert.deepEqual(
        signalRequests[0],
        { recipientId: 2, type: "answer", sdp: "fake-answer" },
        "answers the early offer despite the sender being absent from presence"
      );

      const pc = FakeRTCPeerConnection.instances[0];
      assert.strictEqual(
        pc.remoteDescription.sdp,
        "early-offer",
        "applies the early offer as the remote description"
      );
      assert.strictEqual(
        pc.signalingState,
        "stable",
        "completes negotiation rather than dropping the offer"
      );
    } finally {
      audioEnvironment.restore();
    }
  });

  test("queues an early ICE candidate that arrives before its offer and applies it once engaged", async function (assert) {
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

    this.currentUser.id = 50;
    this.room.room_type = "open";
    this.room.membership.role_name = "participant";
    this.room.active_participants = [
      { id: this.currentUser.id, role: "participant" },
    ];

    pretender.post("/resenha/rooms/1/signal", () => response({}));

    const candidate = {
      candidate: "candidate:1 1 UDP 2122252543 127.0.0.1 3478 typ host",
      sdpMid: "0",
      sdpMLineIndex: 0,
    };

    try {
      await this.subject.join(this.room);
      await wait(50);

      // A candidate can land a beat ahead of its offer; with no peer yet it
      // must be stashed, not dropped.
      this.rooms.emit(1, {
        type: "signal",
        sender_id: 2,
        data: { type: "candidate", candidate },
      });
      await wait(20);

      assert.strictEqual(
        FakeRTCPeerConnection.created,
        0,
        "does not create a peer from a lone candidate"
      );

      // The offer then engages the peer, which flushes the queued candidate.
      this.rooms.emit(1, {
        type: "signal",
        sender_id: 2,
        data: { type: "offer", sdp: "early-offer" },
      });
      await waitUntil(() => FakeRTCPeerConnection.instances.length === 1, 1500);

      const pc = FakeRTCPeerConnection.instances[0];
      await waitUntil(() => pc.addedCandidates.length === 1, 1000);

      assert.strictEqual(
        pc.addedCandidates[0].candidate,
        candidate.candidate,
        "applies the candidate that arrived before the offer"
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
