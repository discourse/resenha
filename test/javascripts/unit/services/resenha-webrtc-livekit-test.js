import Service from "@ember/service";
import { setupTest } from "ember-qunit";
import { module, test } from "qunit";
import pretender, { response } from "discourse/tests/helpers/create-pretender";
import { logIn } from "discourse/tests/helpers/qunit-helpers";
import {
  setLivekitReconnectDelaysForTesting,
  setLivekitSdkLoaderForTesting,
} from "discourse/plugins/resenha/discourse/lib/resenha/livekit-session";

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
  setParticipantVideoState() {}
}

class RecordingToastsStub extends Service {
  errors = [];
  defaults = [];

  error(args) {
    this.errors.push(args);
  }

  success() {}

  default(args) {
    this.defaults.push(args);
  }
}

class FakeRTCPeerConnection {
  static created = 0;

  constructor() {
    FakeRTCPeerConnection.created++;
  }

  addTrack() {
    return { track: null, async replaceTrack() {} };
  }

  addTransceiver() {
    return {
      direction: "sendrecv",
      sender: { track: null, async replaceTrack() {} },
      receiver: { track: null },
    };
  }

  getTransceivers() {
    return [];
  }

  getSenders() {
    return [];
  }

  async createOffer() {
    return { type: "offer", sdp: "fake-offer" };
  }

  async setLocalDescription() {}

  close() {}
}

// A minimal livekit-client stand-in exposing exactly the surface
// LivekitRoomSession touches, injected via the module test loader.
function buildFakeSdk() {
  const RoomEvent = {
    TrackSubscribed: "trackSubscribed",
    TrackUnsubscribed: "trackUnsubscribed",
    TrackPublished: "trackPublished",
    ParticipantDisconnected: "participantDisconnected",
    Disconnected: "disconnected",
    Reconnecting: "reconnecting",
    Reconnected: "reconnected",
  };

  const DisconnectReason = {
    UNKNOWN_REASON: 0,
    CLIENT_INITIATED: 1,
    DUPLICATE_IDENTITY: 2,
    SERVER_SHUTDOWN: 3,
    0: "UNKNOWN_REASON",
    1: "CLIENT_INITIATED",
    2: "DUPLICATE_IDENTITY",
    3: "SERVER_SHUTDOWN",
  };

  const Track = {
    Source: {
      Camera: "camera",
      Microphone: "microphone",
      ScreenShare: "screen_share",
      ScreenShareAudio: "screen_share_audio",
    },
  };

  class FakeLivekitRoom {
    static instances = [];
    static connectErrors = [];

    options;
    connectCalls = [];
    disconnectCalls = 0;
    remoteParticipants = new Map();
    #handlers = new Map();

    constructor(options) {
      this.options = options;
      FakeLivekitRoom.instances.push(this);

      const room = this;
      this.localParticipant = {
        published: [],
        async publishTrack(track, publishOptions) {
          const publication = {
            source: publishOptions?.source,
            options: publishOptions,
            track: {
              mediaStreamTrack: track,
              replaceCalls: [],
              async replaceTrack(newTrack) {
                this.mediaStreamTrack = newTrack;
                this.replaceCalls.push(newTrack);
              },
            },
          };
          room.localParticipant.published.push(publication);
          return publication;
        },
      };
    }

    on(event, handler) {
      const handlers = this.#handlers.get(event) || [];
      handlers.push(handler);
      this.#handlers.set(event, handlers);
      return this;
    }

    emit(event, ...args) {
      (this.#handlers.get(event) || []).forEach((handler) => handler(...args));
    }

    async connect(url, token) {
      this.connectCalls.push({ url, token });

      const error = FakeLivekitRoom.connectErrors.shift();
      if (error) {
        throw error;
      }
    }

    async disconnect() {
      this.disconnectCalls++;
    }

    removeAllListeners() {
      this.#handlers.clear();
    }
  }

  return {
    sdk: {
      Room: FakeLivekitRoom,
      RoomEvent,
      DisconnectReason,
      Track,
      isBrowserSupported: () => true,
    },
    FakeLivekitRoom,
  };
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

function createFakeTrack(id, kind = "audio") {
  return {
    id,
    kind,
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
  const originalAudioContext = globalThis.AudioContext;
  const originalAudioWorkletNode = globalThis.AudioWorkletNode;
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;
  const originalWindowAudioContext = window.AudioContext;
  const originalWindowWebkitAudioContext = window.webkitAudioContext;
  const originalGetUserMedia = navigator.mediaDevices?.getUserMedia;

  class FakeAudioContext {
    currentTime = 0;
    state = "running";
    destination = {};
    audioWorklet = {
      addModule: async () => {},
    };

    resume() {
      this.state = "running";
      return Promise.resolve();
    }

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

module("Resenha | Unit | Service | resenha-webrtc-livekit", function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.currentUser = logIn(this.owner);
    this.currentUser.id = 10;
    this.siteSettings = this.owner.lookup("service:site-settings");
    this.siteSettings.resenha_auto_status_enabled = true;
    localStorage.removeItem("resenha:noise-suppression");

    this.owner.unregister("service:resenha-rooms");
    this.owner.register("service:resenha-rooms", ResenhaRoomsStub);
    this.owner.unregister("service:toasts");
    this.owner.register("service:toasts", RecordingToastsStub);

    this.rooms = this.owner.lookup("service:resenha-rooms");
    this.toasts = this.owner.lookup("service:toasts");
    this.room = {
      id: 1,
      name: "Voice",
      room_type: "open",
      membership: { role_name: "participant" },
      active_participants: [
        { id: this.currentUser.id, role: "participant" },
        { id: 2, role: "participant" },
      ],
    };
    this.rooms.seedRoom(this.room);

    ({ sdk: this.sdk, FakeLivekitRoom: this.FakeLivekitRoom } = buildFakeSdk());
    this.sdkLoads = 0;
    setLivekitSdkLoaderForTesting(async () => {
      this.sdkLoads++;
      return this.sdk;
    });
    setLivekitReconnectDelaysForTesting([0, 0, 0]);

    this.leaveRequests = 0;
    pretender.post("/resenha/rooms/1/join", () =>
      response({
        transport: "livekit",
        livekit: { url: "wss://sfu.example.com", token: "token-1" },
        room: JSON.parse(JSON.stringify(this.room)),
      })
    );
    pretender.post("/resenha/rooms/1/toggle_mute", () => response({}));
    pretender.post("/resenha/rooms/1/signal", () => response({}));
    pretender.delete("/resenha/rooms/1/leave", () => {
      this.leaveRequests++;
      return response({});
    });

    this.originalRTCPeerConnection = globalThis.RTCPeerConnection;
    this.originalMediaStream = globalThis.MediaStream;
    FakeRTCPeerConnection.created = 0;
    globalThis.RTCPeerConnection = FakeRTCPeerConnection;
    globalThis.MediaStream = class {
      constructor(tracks = []) {
        this.tracks = [...tracks];
      }

      getTracks() {
        return [...this.tracks];
      }

      getAudioTracks() {
        return this.tracks.filter((track) => track.kind === "audio");
      }

      getVideoTracks() {
        return this.tracks.filter((track) => track.kind === "video");
      }

      addTrack(track) {
        this.tracks.push(track);
      }

      removeTrack(track) {
        this.tracks = this.tracks.filter((existing) => existing !== track);
      }
    };

    const rawTrack = createFakeTrack("raw-track");
    this.rawTrack = rawTrack;
    this.rawStream = createFakeStream("raw-stream", rawTrack);
    this.processedTrack = createFakeTrack("processed-track");
    this.processedStream = createFakeStream(
      "processed-stream",
      this.processedTrack
    );
    this.audioEnvironment = installFakeAudioEnvironment({
      rawStream: this.rawStream,
      processedStream: this.processedStream,
    });

    this.subject = this.owner.lookup("service:resenha-webrtc");
  });

  hooks.afterEach(function () {
    this.subject?.leave({ id: 1 }, { keepLocalStream: true });

    setLivekitSdkLoaderForTesting(null);
    setLivekitReconnectDelaysForTesting(null);
    localStorage.removeItem("resenha:noise-suppression");
    this.audioEnvironment.restore();
    globalThis.RTCPeerConnection = this.originalRTCPeerConnection;
    globalThis.MediaStream = this.originalMediaStream;
  });

  test("mesh rooms never load the LiveKit SDK", async function (assert) {
    pretender.post("/resenha/rooms/1/join", () =>
      response({
        transport: "mesh",
        room: JSON.parse(JSON.stringify(this.room)),
      })
    );

    await this.subject.join(this.room);
    await wait(50);

    assert.strictEqual(
      this.subject.connectionStateFor(1),
      "connected",
      "the mesh join completes normally"
    );
    assert.strictEqual(
      this.sdkLoads,
      0,
      "the SDK loader is never invoked for a mesh room"
    );
    assert.strictEqual(
      this.FakeLivekitRoom.instances.length,
      0,
      "no LiveKit room object is ever constructed"
    );
  });

  test("livekit join connects to the SFU and publishes the microphone", async function (assert) {
    await this.subject.join(this.room);
    await wait(50);

    assert.strictEqual(this.sdkLoads, 1, "loads the SDK once");
    assert.strictEqual(
      this.subject.connectionStateFor(1),
      "connected",
      "the room reaches the connected state"
    );

    const lkRoom = this.FakeLivekitRoom.instances[0];
    assert.deepEqual(
      lkRoom.options,
      { adaptiveStream: false, dynacast: true },
      "constructs the room with adaptiveStream off and dynacast on"
    );
    assert.deepEqual(
      lkRoom.connectCalls,
      [{ url: "wss://sfu.example.com", token: "token-1" }],
      "connects with the url and token from the join response"
    );

    const publication = lkRoom.localParticipant.published[0];
    assert.strictEqual(
      publication.track.mediaStreamTrack,
      this.rawTrack,
      "publishes the local microphone track"
    );
    assert.deepEqual(
      publication.options,
      { source: "microphone", dtx: true, red: true },
      "publishes as a DTX+RED microphone source"
    );

    assert.strictEqual(
      FakeRTCPeerConnection.created,
      0,
      "never creates mesh peer connections for a livekit room"
    );
  });

  test("noise suppression toggle replaces the published audio track", async function (assert) {
    await this.subject.join(this.room);
    await wait(50);

    await this.subject.toggleNoiseSuppression();

    const publication =
      this.FakeLivekitRoom.instances[0].localParticipant.published[0];
    assert.deepEqual(
      publication.track.replaceCalls,
      [this.processedTrack],
      "moves the live publication onto the processed track"
    );
  });

  test("subscribed tracks land in the remote registry under numeric user ids", async function (assert) {
    await this.subject.join(this.room);
    await wait(50);

    const lkRoom = this.FakeLivekitRoom.instances[0];
    const micTrack = createFakeTrack("remote-mic-2");
    lkRoom.emit(
      "trackSubscribed",
      { kind: "audio", mediaStreamTrack: micTrack, mediaStream: null },
      { source: "microphone" },
      { identity: "2" }
    );
    await wait(10);

    const stream = this.subject.remoteStreamFor(1, 2);
    assert.true(!!stream, "registers a stream keyed by the numeric user id");
    assert.deepEqual(
      stream.getTracks().map((track) => track.id),
      ["remote-mic-2"],
      "the stream carries the subscribed microphone track"
    );

    const screenAudioTrack = createFakeTrack("remote-screen-audio-2");
    lkRoom.emit(
      "trackSubscribed",
      {
        kind: "audio",
        mediaStreamTrack: screenAudioTrack,
        mediaStream: null,
      },
      { source: "screen_share_audio" },
      { identity: "2" }
    );
    await wait(10);

    assert.deepEqual(
      this.subject.remoteScreenAudioStreams.map(
        (screenStream) => screenStream.getTracks()[0].id
      ),
      ["remote-screen-audio-2"],
      "a screen-share-audio source keeps the bare-track convention and lands in the screen audio registry"
    );
    assert.deepEqual(
      this.subject
        .remoteStreamFor(1, 2)
        .getTracks()
        .map((track) => track.id),
      ["remote-mic-2"],
      "screen audio never clobbers the participant's voice stream"
    );
  });

  test("a participant expelled from the roster loses their media", async function (assert) {
    await this.subject.join(this.room);
    await wait(50);

    const lkRoom = this.FakeLivekitRoom.instances[0];
    const subscribedCalls = [];
    lkRoom.remoteParticipants.set("2", {
      identity: "2",
      trackPublications: new Map([
        [
          "mic-sid",
          {
            setSubscribed(value) {
              subscribedCalls.push(value);
            },
          },
        ],
      ]),
    });

    lkRoom.emit(
      "trackSubscribed",
      {
        kind: "audio",
        mediaStreamTrack: createFakeTrack("remote-mic-2"),
        mediaStream: null,
      },
      { source: "microphone" },
      { identity: "2" }
    );
    await wait(10);

    assert.true(!!this.subject.remoteStreamFor(1, 2), "media is registered");

    this.rooms.emit(1, {
      type: "participants",
      participants: [{ id: this.currentUser.id, role: "participant" }],
    });
    await wait(20);

    assert.strictEqual(
      this.subject.remoteStreamFor(1, 2),
      undefined,
      "the registry entry is dropped when the roster no longer lists the user"
    );
    assert.deepEqual(
      subscribedCalls,
      [false],
      "their SFU subscriptions are dropped too"
    );
  });

  test("a duplicate-identity disconnect tears down locally without DELETE /leave", async function (assert) {
    await this.subject.join(this.room);
    await wait(50);

    const lkRoom = this.FakeLivekitRoom.instances[0];
    lkRoom.emit("disconnected", this.sdk.DisconnectReason.DUPLICATE_IDENTITY);
    await wait(50);

    assert.strictEqual(
      this.subject.connectionStateFor(1),
      "idle",
      "the local call state is torn down"
    );
    assert.strictEqual(
      this.toasts.defaults.length,
      1,
      "the user is told the call moved to another tab"
    );

    // The deferred room teardown runs 500ms after leave.
    await wait(600);

    assert.strictEqual(
      this.leaveRequests,
      0,
      "no DELETE /leave is issued — the presence/session now belongs to the newer tab"
    );
    assert.strictEqual(
      this.FakeLivekitRoom.instances.length,
      1,
      "no reconnection is attempted"
    );
  });

  test("a connect failure cleans up server presence and fails the join", async function (assert) {
    this.FakeLivekitRoom.connectErrors.push(new Error("firewall"));

    await this.subject.join(this.room);
    await wait(50);

    assert.strictEqual(
      this.subject.connectionStateFor(1),
      "idle",
      "the join fails instead of leaving a half-joined room"
    );
    assert.strictEqual(
      this.leaveRequests,
      1,
      "tells the server we left so the roster doesn't carry a ghost"
    );
    assert.strictEqual(
      this.toasts.errors.length,
      1,
      "shows the unreachable-voice-server toast"
    );
  });

  test("a terminal disconnect reconnects with a freshly minted token", async function (assert) {
    let mintCalls = 0;
    pretender.post("/resenha/rooms/1/livekit_token", () => {
      mintCalls++;
      return response({ url: "wss://sfu.example.com", token: "token-2" });
    });

    await this.subject.join(this.room);
    await wait(50);

    const lkRoom = this.FakeLivekitRoom.instances[0];
    lkRoom.emit("disconnected", this.sdk.DisconnectReason.SERVER_SHUTDOWN);
    await waitUntil(() => this.FakeLivekitRoom.instances.length === 2);
    await wait(20);

    assert.strictEqual(mintCalls, 1, "mints one fresh token");

    const reconnectedRoom = this.FakeLivekitRoom.instances[1];
    assert.deepEqual(
      reconnectedRoom.connectCalls,
      [{ url: "wss://sfu.example.com", token: "token-2" }],
      "reconnects with the newly minted token"
    );
    assert.strictEqual(
      reconnectedRoom.localParticipant.published.length,
      1,
      "republishes the microphone after reconnecting"
    );
    assert.strictEqual(
      this.subject.connectionStateFor(1),
      "connected",
      "the call stays up"
    );
    assert.strictEqual(this.leaveRequests, 0, "never leaves the room");
  });

  test("the reconnect ladder stops immediately on 410 Gone", async function (assert) {
    let mintCalls = 0;
    pretender.post("/resenha/rooms/1/livekit_token", () => {
      mintCalls++;
      return response(410, { errors: ["room instance ended"] });
    });

    await this.subject.join(this.room);
    await wait(50);

    const lkRoom = this.FakeLivekitRoom.instances[0];
    lkRoom.emit("disconnected", this.sdk.DisconnectReason.SERVER_SHUTDOWN);
    await waitUntil(() => this.subject.connectionStateFor(1) === "idle");
    await wait(20);

    assert.strictEqual(
      mintCalls,
      1,
      "gives up after the first 410 instead of burning the remaining attempts"
    );
    assert.strictEqual(
      this.FakeLivekitRoom.instances.length,
      1,
      "never constructs a new SFU connection"
    );
    assert.strictEqual(
      this.leaveRequests,
      1,
      "leaves cleanly so stale presence and session rows get closed"
    );
    assert.strictEqual(this.toasts.defaults.length, 1, "offers a rejoin toast");
  });

  test("an exhausted reconnect ladder leaves the room", async function (assert) {
    let mintCalls = 0;
    pretender.post("/resenha/rooms/1/livekit_token", () => {
      mintCalls++;
      return response({ url: "wss://sfu.example.com", token: "token-2" });
    });
    await this.subject.join(this.room);
    await wait(50);

    this.FakeLivekitRoom.connectErrors.push(
      new Error("down"),
      new Error("down"),
      new Error("down")
    );

    const lkRoom = this.FakeLivekitRoom.instances[0];
    lkRoom.emit("disconnected", this.sdk.DisconnectReason.SERVER_SHUTDOWN);
    await waitUntil(() => this.subject.connectionStateFor(1) === "idle", 1000);
    await wait(20);

    assert.strictEqual(mintCalls, 3, "retries three times with fresh tokens");
    assert.strictEqual(
      this.leaveRequests,
      1,
      "leaves the room after exhausting the ladder"
    );
    assert.strictEqual(
      this.toasts.errors.length,
      1,
      "tells the user the connection could not be recovered"
    );
  });
});
