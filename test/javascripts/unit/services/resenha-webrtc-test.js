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

  constructor() {
    FakeRTCPeerConnection.created++;
    FakeRTCPeerConnection.instances.push(this);
  }

  addTrack() {}

  getSenders() {
    return [];
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
    } else if (description?.type === "rollback") {
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

function deferred() {
  let resolve;
  let reject;

  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
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
});
