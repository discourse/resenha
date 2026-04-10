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

  signalingState = "stable";
  connectionState = "new";
  iceConnectionState = "new";
  iceGatheringState = "new";
  localDescription = null;
  remoteDescription = null;

  constructor() {
    FakeRTCPeerConnection.created++;
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
});
