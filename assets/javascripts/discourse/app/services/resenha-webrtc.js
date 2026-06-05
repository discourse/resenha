import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import Service, { service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { i18n } from "discourse-i18n";
import AudioMonitor from "../../lib/resenha/audio-monitor";
import IdleTracker from "../../lib/resenha/idle-tracker";
import NoiseSuppressionManager from "../../lib/resenha/noise-suppression";
import PeerManager from "../../lib/resenha/peer-manager";
import PttManager from "../../lib/resenha/ptt-manager";
import RoomMessageQueue from "../../lib/resenha/room-message-queue";
import SignalingManager from "../../lib/resenha/signaling";
import {
  playConnectedSound,
  playDeafenSound,
  playDisconnectedSound,
  playMuteSound,
  playUndeafenSound,
  playUnmuteSound,
  playUserJoinedSound,
  playUserLeftSound,
  schedulePlaybackResume,
} from "../../lib/resenha/sound-effects";

export default class ResenhaWebrtcService extends Service {
  @service currentUser;
  @service siteSettings;
  @service("resenha-rooms") resenhaRooms;
  @service toasts;

  @tracked localStream;
  @tracked audioEnabled = true;
  @tracked noiseSuppressionEnabled = false;
  @tracked deafened = false;
  @tracked remoteStreamsRevision = 0;
  @tracked connectionRevision = 0;
  @tracked idleState = "active";
  @tracked pttEnabled = false;
  @tracked pttKey = "Space";
  @tracked pttActive = false;
  @tracked autoStatusEnabled = true;

  #connectingRoomIds = new Set();
  #roleChangeInProgress = new Set();
  #activeRoomIds = new Set();
  #joinRevision = 0;
  #connectingParticipantSnapshots = new Map();
  #connectingSignalQueue = new Map();
  #remoteStreams = new Map();
  #roomHandlerCallbacks = new Map();
  #heartbeatTimers = new Map();
  #heartbeatInFlight = new Set();
  #participantVolumes = new Map();
  #participantMuted = new Map();
  #audioElements = new Map();
  #streamToParticipant = new WeakMap();
  #pendingPlaybackElements = new WeakSet();
  #rawLocalStream = null;

  #signaling;
  #peerManager;
  #audioMonitor;
  #idleTracker;
  #noiseSuppression;
  #pttManager;
  #roomMessageQueue;

  constructor() {
    super(...arguments);

    this.#pttManager = new PttManager({
      onPress: () => this.#handlePttPress(),
      onReleaseImmediate: () => this.#handlePttRelease(),
      onReleaseDebounced: () => this.#broadcastMuteState(),
      isConnected: () => this.#activeRoomIds.size > 0,
    });

    this.pttEnabled = this.#pttManager.enabled;
    this.pttKey = this.#pttManager.key;

    this.#signaling = new SignalingManager({
      isActiveRoom: (id) => this.#activeRoomIds.has(id),
      hasPeer: (roomId, uid) => this.#peerManager.has(roomId, uid),
    });

    this.#peerManager = new PeerManager({
      getIceServers: () => this.iceServers,
      getIceTransportPolicy: () => this.iceTransportPolicy,
      getLocalStream: () => this.localStream,
      sendSignal: (roomId, uid, payload) =>
        this.#signaling.send(roomId, uid, payload),
      flushQueuedSignals: (roomId, uid) =>
        this.#signaling.flushQueued(roomId, uid),
      onTrack: (roomId, uid, stream) =>
        this.#registerRemoteStream(roomId, uid, stream),
      clearSignalQueue: (roomId, uid) =>
        this.#signaling.clearForPeer(roomId, uid),
      onPeerDestroyed: (roomId, uid) => this.#removeRemoteStream(roomId, uid),
      shouldRestartPeer: (roomId, uid) =>
        this.#shouldMaintainPeerConnection(roomId, uid),
    });

    this.#audioMonitor = new AudioMonitor({
      onSpeakingChange: (roomId, userId, speaking) =>
        this.resenhaRooms?.setParticipantSpeaking(roomId, userId, speaking),
      onVoiceActivity: () => this.#idleTracker?.onVoiceActivity(),
    });

    this.#idleTracker = new IdleTracker({
      onIdleStateChange: (state, wasAfk) =>
        this.#handleIdleStateChange(state, wasAfk),
      onAutoMute: () => this.#handleAutoMute(),
      onDisconnect: () => this.#handleIdleDisconnect(),
      getThresholds: () => this.#getIdleThresholds(),
    });

    this.#noiseSuppression = new NoiseSuppressionManager({
      onStreamReady: (stream) => {
        this.localStream = stream;
        this.#syncLocalStreamState();
      },
    });

    this.#roomMessageQueue = new RoomMessageQueue();

    try {
      const stored = localStorage.getItem("resenha_auto_status_enabled");
      this.autoStatusEnabled = stored !== "false";
    } catch {
      this.autoStatusEnabled = true;
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);

    this.#joinRevision++;
    this.#pttManager.destroy();
    this.#idleTracker.stop();
    this.#audioMonitor.destroyAll();
    this.#peerManager.destroyAll();
    this.#signaling.destroy();
    this.#noiseSuppression.teardown();

    this.#stopLocalStream();

    this.#roomHandlerCallbacks.forEach((callback, roomId) => {
      this.resenhaRooms?.unregisterRoomHandler(roomId, callback);
    });
    this.#roomHandlerCallbacks.clear();
    this.#heartbeatTimers.forEach((timer) => clearInterval(timer));
    this.#heartbeatTimers.clear();
    this.#heartbeatInFlight.clear();
    this.#connectingRoomIds.clear();
    this.#connectingParticipantSnapshots.clear();
    this.#connectingSignalQueue.clear();
    this.#roomMessageQueue.clearAll();
  }

  #parseServerList(setting) {
    return (setting || "")
      .split("|")
      .map((url) => url.trim())
      .filter(Boolean);
  }

  get iceServers() {
    const servers = [];

    this.#parseServerList(this.siteSettings.resenha_stun_servers).forEach(
      (url) => {
        servers.push({ urls: url });
      }
    );

    const turnServers = this.#parseServerList(
      this.siteSettings.resenha_turn_servers
    );
    if (turnServers.length) {
      const username = this.siteSettings.resenha_turn_username;
      const credential = this.siteSettings.resenha_turn_credential;

      turnServers.forEach((url) => {
        const server = { urls: url };
        if (username) {
          server.username = username;
        }
        if (credential) {
          server.credential = credential;
        }
        servers.push(server);
      });
    }

    return servers;
  }

  // When only TURN servers are configured (no STUN), force all traffic
  // through the relay so peers don't waste time on host/srflx candidates
  // that can never connect.
  get iceTransportPolicy() {
    const hasStun =
      this.#parseServerList(this.siteSettings.resenha_stun_servers).length > 0;
    const hasTurn =
      this.#parseServerList(this.siteSettings.resenha_turn_servers).length > 0;

    return !hasStun && hasTurn ? "relay" : "all";
  }

  get remoteStreams() {
    this.remoteStreamsRevision;
    return Array.from(this.#remoteStreams.values())
      .filter(Array.isArray)
      .flat()
      .map((entry) => entry.stream);
  }

  remoteStreamsFor(roomId) {
    this.remoteStreamsRevision;
    return (this.#remoteStreams.get(roomId) || []).map((entry) => entry.stream);
  }

  connectionStateFor(roomId) {
    this.connectionRevision;
    if (this.#connectingRoomIds.has(roomId)) {
      return "connecting";
    }
    if (this.#activeRoomIds.has(roomId)) {
      return "connected";
    }
    return "idle";
  }

  #canSpeakInRoom(room) {
    if (room.room_type !== "stage") {
      return true;
    }
    const participant = (room.active_participants || []).find(
      (p) => Number(p?.id) === this.currentUser?.id
    );
    const role = participant?.role;
    return role === "moderator" || role === "speaker";
  }

  #participantCanSpeak(room, participantId) {
    if (room.room_type !== "stage") {
      return true;
    }
    const participant = (room.active_participants || []).find(
      (p) => Number(p?.id) === Number(participantId)
    );
    const role = participant?.role;
    return role === "moderator" || role === "speaker";
  }

  async join(room) {
    if (!room?.id) {
      return;
    }

    // Bump the join revision so any in-flight join for a different room
    // will detect it has been superseded and abort.
    const revision = ++this.#joinRevision;

    this.#connectingRoomIds.add(room.id);
    this.#bumpConnectionRevision();

    // Leave rooms that are already active.
    for (const activeRoomId of this.#activeRoomIds) {
      if (activeRoomId !== room.id) {
        this.leave({ id: activeRoomId }, { keepLocalStream: true });
      }
    }

    // Abort any other in-progress joins (still in connecting state).
    for (const connectingId of this.#connectingRoomIds) {
      if (connectingId !== room.id) {
        this.#connectingRoomIds.delete(connectingId);
        this.#teardownRoom(connectingId);
      }
    }

    // eslint-disable-next-line no-console
    console.log(`[resenha] joining room ${room.id}`);

    this.#registerRoomHandler(room.id);

    let response;

    try {
      const joinData = {};
      if (
        !this.autoStatusEnabled ||
        !this.siteSettings.resenha_auto_status_enabled
      ) {
        joinData.skip_status = true;
      }
      response = await ajax(`/resenha/rooms/${room.id}/join`, {
        type: "POST",
        data: joinData,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[resenha] failed to join room", error);
      this.#handleJoinFailure(room.id);
      return;
    }

    if (this.#joinRevision !== revision) {
      ajax(`/resenha/rooms/${room.id}/leave`, { type: "DELETE" });
      return;
    }

    // eslint-disable-next-line no-console
    console.log(
      `[resenha] join response, active_participants:`,
      response?.room?.active_participants
    );

    const joinedRoom = response?.room;
    const isStageListener =
      joinedRoom?.room_type === "stage" && !this.#canSpeakInRoom(joinedRoom);

    if (!isStageListener && !this.localStream) {
      const acquired = await this.#acquireMicrophone();
      if (!acquired) {
        ajax(`/resenha/rooms/${room.id}/leave`, { type: "DELETE" });
        this.#handleJoinFailure(room.id);
        return;
      }
    }

    if (this.#joinRevision !== revision) {
      ajax(`/resenha/rooms/${room.id}/leave`, { type: "DELETE" });
      return;
    }

    if (this.localStream) {
      if (this.pttEnabled) {
        this.audioEnabled = false;
        for (const track of this.localStream.getAudioTracks()) {
          track.enabled = false;
        }
      } else {
        this.audioEnabled = true;
        for (const track of this.localStream.getAudioTracks()) {
          track.enabled = true;
        }
      }
    }

    // Only mark the room as active after the microphone is ready.
    // This prevents incoming MessageBus signals from creating peer
    // connections before localStream is available (race condition that
    // caused voice to fail on first join).
    this.#activeRoomIds.add(room.id);

    this.#addLocalParticipant(room.id);

    if (this.localStream) {
      this.#audioMonitor.ensure(
        room.id,
        this.currentUser?.id,
        this.localStream,
        true
      );
    }

    this.#startHeartbeat(room.id);
    this.#idleTracker.start();

    const latestParticipants =
      this.#connectingParticipantSnapshots.get(room.id) ??
      response?.room?.active_participants;
    this.#connectingParticipantSnapshots.delete(room.id);

    if (latestParticipants) {
      await this.#handleParticipants(room.id, {
        participants: latestParticipants,
      });
    }

    const queuedSignals = this.#connectingSignalQueue.get(room.id) || [];
    this.#connectingSignalQueue.delete(room.id);

    for (const payload of queuedSignals) {
      await this.#handleSignal(room.id, payload);
    }

    this.#connectingRoomIds.delete(room.id);
    this.#bumpConnectionRevision();

    if (this.pttEnabled && this.localStream) {
      this.#pttManager.startListening();
    }

    playConnectedSound();
  }

  leave(room, options = {}) {
    if (!room?.id) {
      return;
    }

    const keepLocalStream = options.keepLocalStream === true;
    const wasConnecting = this.#connectingRoomIds.has(room.id);
    const wasConnected = this.#activeRoomIds.has(room.id);

    if (wasConnecting) {
      this.#joinRevision++;
    }

    this.#connectingParticipantSnapshots.delete(room.id);
    this.#connectingSignalQueue.delete(room.id);
    this.#pttManager.resetActive();
    this.pttActive = false;
    ajax(`/resenha/rooms/${room.id}/leave`, { type: "DELETE" });
    this.#connectingRoomIds.delete(room.id);
    this.#activeRoomIds.delete(room.id);
    this.#bumpConnectionRevision();

    if (wasConnected && !keepLocalStream) {
      playDisconnectedSound();
    }
    this.#removeLocalParticipant(room.id);
    this.#stopHeartbeat(room.id);

    if (this.#activeRoomIds.size === 0) {
      this.#idleTracker.stop();
      this.#pttManager.stopListening();
    }

    const teardown = () => {
      this.#audioMonitor.teardown(room.id, this.currentUser?.id);
      this.#teardownRoom(room.id);

      if (!keepLocalStream && this.#activeRoomIds.size === 0) {
        this.#stopLocalStream();
      }
    };

    if (wasConnected && !keepLocalStream) {
      setTimeout(teardown, 500);
    } else {
      teardown();
    }
  }

  @action
  attachStream(stream, element) {
    if (!element || !stream) {
      return;
    }

    if (element.srcObject === stream) {
      return;
    }

    element.srcObject = stream;
    element.autoplay = true;
    element.playsInline = true;

    const isLocal = stream === this.localStream;
    if (isLocal) {
      element.muted = true;
      element.volume = 0;
    } else {
      const participant = this.#streamToParticipant.get(stream);
      if (participant) {
        const { roomId, userId } = participant;
        this.#trackAudioElement(roomId, userId, element);
        this.#applyAudioSettings(roomId, userId);
      }
    }

    if (typeof element.play === "function") {
      try {
        const playPromise = element.play();
        playPromise?.catch?.((error) => {
          if (error?.name === "NotAllowedError") {
            schedulePlaybackResume(element, this.#pendingPlaybackElements);
          } else {
            // eslint-disable-next-line no-console
            console.warn("[resenha] audio element failed to play", error);
          }
        });
      } catch (error) {
        if (error?.name === "NotAllowedError") {
          schedulePlaybackResume(element, this.#pendingPlaybackElements);
        } else {
          // eslint-disable-next-line no-console
          console.warn("[resenha] audio element failed to play", error);
        }
      }
    }
  }

  remotePeerKey(roomId, userId) {
    return `${roomId}:${userId}`;
  }

  setParticipantVolume(roomId, userId, volume) {
    const key = this.remotePeerKey(roomId, userId);
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.#participantVolumes.set(key, clampedVolume);
    this.#applyAudioSettings(roomId, userId);
  }

  getParticipantVolume(roomId, userId) {
    const key = this.remotePeerKey(roomId, userId);
    return this.#participantVolumes.get(key) ?? 1;
  }

  toggleParticipantMute(roomId, userId) {
    const key = this.remotePeerKey(roomId, userId);
    const currentlyMuted = this.#participantMuted.get(key) ?? false;
    const newMutedState = !currentlyMuted;
    this.#participantMuted.set(key, newMutedState);
    this.#applyAudioSettings(roomId, userId);
    this.resenhaRooms?.setParticipantMuted(roomId, userId, newMutedState);
    return newMutedState;
  }

  isParticipantMuted(roomId, userId) {
    const key = this.remotePeerKey(roomId, userId);
    return this.#participantMuted.get(key) ?? false;
  }

  toggleMute() {
    if (this.pttEnabled) {
      return;
    }

    this.audioEnabled = !this.audioEnabled;

    if (this.localStream) {
      for (const track of this.localStream.getAudioTracks()) {
        track.enabled = this.audioEnabled;
      }
    }

    if (this.audioEnabled) {
      playUnmuteSound();
      this.#idleTracker.wasAutoMuted = false;
      this.#idleTracker.resetActivity();
    } else {
      playMuteSound();
    }

    if (this.audioEnabled && this.deafened) {
      this.deafened = false;
    }

    this.#broadcastMuteState();
  }

  toggleDeafen() {
    this.deafened = !this.deafened;

    if (this.deafened) {
      playDeafenSound();
    } else {
      playUndeafenSound();
    }

    if (this.deafened) {
      this.audioEnabled = false;
      if (this.localStream) {
        for (const track of this.localStream.getAudioTracks()) {
          track.enabled = false;
        }
      }
    } else {
      if (this.pttEnabled) {
        this.audioEnabled = false;
        if (this.localStream) {
          for (const track of this.localStream.getAudioTracks()) {
            track.enabled = false;
          }
        }
      } else {
        this.audioEnabled = true;
        if (this.localStream) {
          for (const track of this.localStream.getAudioTracks()) {
            track.enabled = true;
          }
        }
      }
    }

    for (const [key, element] of this.#audioElements) {
      const muted = this.deafened || (this.#participantMuted.get(key) ?? false);
      const volume = this.#participantVolumes.get(key) ?? 1;
      element.muted = muted;
      if (!muted) {
        element.volume = volume;
      }
    }

    this.#broadcastMuteState();
  }

  async toggleNoiseSuppression() {
    if (!this.#rawLocalStream) {
      return;
    }

    if (this.noiseSuppressionEnabled) {
      this.#noiseSuppression.teardown();
      this.noiseSuppressionEnabled = false;
      this.localStream = this.#rawLocalStream;
      this.#syncLocalStreamState();
      this.#noiseSuppression.setPreference(false);
      // eslint-disable-next-line no-console
      console.log("[resenha] noise suppression disabled");
    } else {
      try {
        await this.#noiseSuppression.setup(this.#rawLocalStream);
        this.noiseSuppressionEnabled = true;
        this.#noiseSuppression.setPreference(true);
        // eslint-disable-next-line no-console
        console.log("[resenha] noise suppression enabled");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("[resenha] failed to enable noise suppression", error);
        this.localStream = this.#rawLocalStream;
        this.#syncLocalStreamState();
        return;
      }
    }

    await this.#replaceTrackOnAllPeers();
  }

  enablePtt() {
    this.#pttManager.enable();
    this.pttEnabled = true;
    this.pttActive = false;

    this.audioEnabled = false;
    if (this.localStream) {
      for (const track of this.localStream.getAudioTracks()) {
        track.enabled = false;
      }
    }

    this.#broadcastMuteState();

    if (this.#activeRoomIds.size > 0) {
      this.#pttManager.startListening();
    }
  }

  disablePtt() {
    this.#pttManager.disable();
    this.pttEnabled = false;
    this.pttActive = false;

    this.audioEnabled = true;
    if (this.localStream) {
      for (const track of this.localStream.getAudioTracks()) {
        track.enabled = true;
      }
    }

    this.#broadcastMuteState();
  }

  setPttKey(keyCode) {
    if (!this.#pttManager.setKey(keyCode)) {
      return false;
    }
    this.pttKey = keyCode;
    return true;
  }

  toggleAutoStatus() {
    this.autoStatusEnabled = !this.autoStatusEnabled;
    try {
      localStorage.setItem(
        "resenha_auto_status_enabled",
        this.autoStatusEnabled ? "true" : "false"
      );
    } catch {
      // ignore storage errors
    }

    if (!this.autoStatusEnabled && this.#activeRoomIds.size > 0) {
      ajax("/user-status.json", { type: "DELETE" }).catch(() => {});
    }
  }

  // --- Private orchestration ---

  #broadcastMuteState() {
    for (const roomId of this.#activeRoomIds) {
      this.resenhaRooms?.setParticipantMuted(
        roomId,
        this.currentUser?.id,
        !this.audioEnabled
      );
      this.resenhaRooms?.setParticipantDeafened(
        roomId,
        this.currentUser?.id,
        this.deafened
      );

      ajax(`/resenha/rooms/${roomId}/toggle_mute`, {
        type: "POST",
        data: { muted: !this.audioEnabled, deafened: this.deafened },
      });
    }
  }

  #applyAudioSettings(roomId, userId) {
    const key = this.remotePeerKey(roomId, userId);
    const element = this.#audioElements.get(key);
    if (!element) {
      return;
    }

    const muted = this.deafened || (this.#participantMuted.get(key) ?? false);
    const volume = this.#participantVolumes.get(key) ?? 1;

    element.muted = muted;
    if (!muted) {
      element.volume = volume;
    }
  }

  #trackAudioElement(roomId, userId, element) {
    const key = this.remotePeerKey(roomId, userId);
    this.#audioElements.set(key, element);
  }

  #untrackAudioElement(roomId, userId) {
    const key = this.remotePeerKey(roomId, userId);
    this.#audioElements.delete(key);
  }

  #registerRoomHandler(roomId) {
    if (this.#roomHandlerCallbacks.has(roomId)) {
      return;
    }

    const callback = (payload) => this.#handleRoomMessage(roomId, payload);
    this.resenhaRooms.registerRoomHandler(roomId, callback);
    this.#roomHandlerCallbacks.set(roomId, callback);
  }

  #teardownRoom(roomId) {
    this.#connectingParticipantSnapshots.delete(roomId);
    this.#connectingSignalQueue.delete(roomId);

    const callback = this.#roomHandlerCallbacks.get(roomId);
    if (callback) {
      this.resenhaRooms?.unregisterRoomHandler(roomId, callback);
      this.#roomHandlerCallbacks.delete(roomId);
    }

    this.#peerManager.destroyRoom(roomId);
    this.#removeAllRemoteStreams(roomId);
    this.#audioMonitor.teardownRoom(roomId);
    this.#signaling.clearForRoom(roomId);
    this.#signaling.clearHttpQueue(roomId);
    this.#roomMessageQueue.clear(roomId);
  }

  #handleRoomMessage(roomId, payload) {
    // Serialize all message processing per room to prevent async
    // handlers from interleaving (e.g. concurrent participant broadcasts,
    // signals arriving mid-peer-setup, role changes overlapping signals).
    this.#roomMessageQueue
      .enqueue(roomId, () => this.#processRoomMessage(roomId, payload))
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.warn("[resenha] failed to process room message", error);
      });
  }

  async #processRoomMessage(roomId, payload) {
    // eslint-disable-next-line no-console
    console.log(
      `[resenha] 📨 MessageBus message: room=${roomId}, type=${payload.type}, active=${this.#activeRoomIds.has(roomId)}`
    );

    if (!this.#activeRoomIds.has(roomId)) {
      if (
        payload.type === "participants" &&
        this.#connectingRoomIds.has(roomId)
      ) {
        this.#connectingParticipantSnapshots.set(
          roomId,
          payload.participants || []
        );
      } else if (
        payload.type === "signal" &&
        this.#connectingRoomIds.has(roomId)
      ) {
        const queue = this.#connectingSignalQueue.get(roomId) || [];
        queue.push(payload);
        this.#connectingSignalQueue.set(roomId, queue);
      } else if (
        payload.type === "kicked" &&
        this.#connectingRoomIds.has(roomId)
      ) {
        this.#handleKicked(roomId);
      }
      return;
    }

    if (payload.type === "signal") {
      await this.#handleSignal(roomId, payload);
    } else if (payload.type === "participants") {
      await this.#handleParticipants(roomId, payload);
    } else if (payload.type === "role_change") {
      await this.#handleRoleChange(roomId, payload);
    } else if (payload.type === "kicked") {
      this.#handleKicked(roomId);
    }
  }

  async #handleSignal(roomId, payload) {
    const remoteUserId = Number(payload.sender_id);
    const data = payload.data;

    if (!Number.isFinite(remoteUserId) || remoteUserId <= 0) {
      return;
    }

    if (remoteUserId === this.currentUser?.id) {
      return;
    }

    if (this.#roleChangeInProgress.has(roomId)) {
      return;
    }

    this.#peerManager.clearPeerRestart(roomId, remoteUserId);

    const hadPeer = this.#peerManager.has(roomId, remoteUserId);
    if (!hadPeer && !this.#shouldEngagePeer(roomId, remoteUserId, data?.type)) {
      // A candidate can arrive a beat ahead of its offer (the sender gathered
      // and trickled it before our presence view caught up). Stash it so the
      // offer can flush it once the peer exists, rather than dropping it.
      // Anything else is a delayed signal for a participant that already left
      // or no longer belongs in the current room topology.
      if (data?.type === "candidate" && this.#canEngageEarlyOffer(roomId)) {
        this.#peerManager.queuePendingCandidate(
          roomId,
          remoteUserId,
          data.candidate
        );
      }
      return;
    }

    // eslint-disable-next-line no-console
    console.log(
      `[resenha] 📥 received ${data.type} from user ${remoteUserId} in room ${roomId}`
    );
    let pc = await this.#peerManager.create(roomId, remoteUserId);

    if (!this.#shouldEngagePeer(roomId, remoteUserId, data?.type)) {
      this.#peerManager.destroy(roomId, remoteUserId);
      return;
    }

    if (data.type === "offer") {
      this.#peerManager.clearOfferRetry(roomId, remoteUserId);

      // If the remote restarted its ICE session — it left and rejoined, so its
      // offer carries fresh ICE credentials — renegotiating on the old, dead
      // transport won't recover. Tear the stale peer down and rebuild it so ICE
      // starts clean. Detected by a changed ice-ufrag vs our current remote
      // description; a merely resent offer keeps the same ufrag and is left
      // alone. Skip while mid-glare (have-local-offer), which the block below
      // already resolves.
      if (pc.signalingState !== "have-local-offer") {
        const priorUfrag = this.#iceUfrag(pc.remoteDescription?.sdp);
        const incomingUfrag = this.#iceUfrag(data.sdp);
        if (priorUfrag && incomingUfrag && priorUfrag !== incomingUfrag) {
          // eslint-disable-next-line no-console
          console.log(
            `[resenha] remote ICE restart from user ${remoteUserId}; recreating peer`
          );
          this.#peerManager.destroy(roomId, remoteUserId);
          pc = await this.#peerManager.create(roomId, remoteUserId);
        }
      }

      if (pc.signalingState === "have-local-offer") {
        if (this.currentUser?.id < remoteUserId) {
          // eslint-disable-next-line no-console
          console.log(
            `[resenha] glare detected, rolling back local offer for user ${remoteUserId}`
          );
          await pc.setLocalDescription({ type: "rollback" });
        } else {
          // eslint-disable-next-line no-console
          console.log(
            `[resenha] glare detected, ignoring remote offer from user ${remoteUserId}`
          );
          return;
        }
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data));
        await this.#peerManager.flushPendingCandidates(
          roomId,
          remoteUserId,
          pc
        );
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.#signaling.send(roomId, remoteUserId, answer).catch((error) => {
          // eslint-disable-next-line no-console
          console.warn("[resenha] failed to send answer", error);
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          `[resenha] failed to handle offer from user ${remoteUserId}`,
          error
        );
      }
    } else if (data.type === "answer") {
      this.#peerManager.clearOfferRetry(roomId, remoteUserId);

      if (pc.signalingState !== "have-local-offer") {
        // eslint-disable-next-line no-console
        console.warn(
          `[resenha] ignoring answer in state ${pc.signalingState} from user ${remoteUserId}`
        );
        return;
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data));
        await this.#peerManager.flushPendingCandidates(
          roomId,
          remoteUserId,
          pc
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          `[resenha] failed to handle answer from user ${remoteUserId}`,
          error
        );
      }
    } else if (data.type === "candidate") {
      this.#peerManager.clearOfferRetry(roomId, remoteUserId);

      if (!pc.remoteDescription) {
        this.#peerManager.queuePendingCandidate(
          roomId,
          remoteUserId,
          data.candidate
        );
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          `[resenha] failed to add ICE candidate from user ${remoteUserId}`,
          error
        );
      }
    }
  }

  async #handleParticipants(roomId, payload) {
    const participants = payload.participants || [];
    const participantIds = new Set(
      participants.map((participant) => Number(participant.id))
    );

    // eslint-disable-next-line no-console
    console.log(
      `[resenha] handleParticipants room=${roomId}, participants=[${Array.from(participantIds)}], currentUser=${this.currentUser?.id}`
    );

    if (this.#roleChangeInProgress.has(roomId)) {
      return;
    }

    const room = this.resenhaRooms?.roomById(roomId);
    const isStage = room?.room_type === "stage";
    const iCanSpeak = room ? this.#canSpeakInRoom(room) : true;

    let peers = this.#peerManager.getRoomPeers(roomId);
    const existingPeerIds = new Set(peers?.keys() || []);

    let hasPeerLeft = false;

    peers?.forEach((pc, remoteUserId) => {
      if (!participantIds.has(remoteUserId)) {
        hasPeerLeft = true;
        this.#peerManager.destroy(roomId, remoteUserId);
      }
    });

    let hasNewPeer = false;

    for (const participant of participants) {
      const participantId = Number(participant.id);
      if (!participantId || participantId <= 0) {
        continue;
      }
      if (participantId === this.currentUser?.id) {
        continue;
      }

      if (isStage) {
        const theyCanSpeak =
          participant.role === "moderator" || participant.role === "speaker";
        const shouldConnect = iCanSpeak || theyCanSpeak;

        if (!shouldConnect) {
          if (this.#peerManager.has(roomId, participantId)) {
            this.#peerManager.destroy(roomId, participantId);
          }
          continue;
        }
      }

      if (!this.#peerManager.has(roomId, participantId)) {
        if (existingPeerIds.size > 0 || !this.#connectingRoomIds.has(roomId)) {
          hasNewPeer = true;
        }
        // eslint-disable-next-line no-console
        console.log(
          `[resenha] creating peer connection to user ${participantId}`
        );

        await this.#createAndOfferPeer(roomId, participantId);
      }
    }

    if (this.#activeRoomIds.has(roomId)) {
      if (hasNewPeer) {
        playUserJoinedSound();
      } else if (hasPeerLeft) {
        playUserLeftSound();
      }
    }
  }

  #handleKicked(roomId) {
    // eslint-disable-next-line no-console
    console.log(`[resenha] kicked from room ${roomId}`);
    this.leave({ id: roomId });
  }

  async #acquireMicrophone() {
    try {
      const rawStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      // eslint-disable-next-line no-console
      console.log("[resenha] local stream obtained");

      this.#rawLocalStream = rawStream;

      if (
        this.siteSettings.resenha_noise_suppression &&
        this.#noiseSuppression.isPreferred()
      ) {
        try {
          await this.#noiseSuppression.setup(rawStream);
          this.noiseSuppressionEnabled = true;
          // eslint-disable-next-line no-console
          console.log("[resenha] noise suppression enabled");
        } catch (nsError) {
          // eslint-disable-next-line no-console
          console.warn(
            "[resenha] noise suppression setup failed, using raw stream",
            nsError
          );
          this.localStream = rawStream;
        }
      } else {
        this.localStream = rawStream;
      }

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[resenha] failed to obtain local stream", error);
      return false;
    }
  }

  async #handleRoleChange(roomId, payload) {
    const targetUserId = Number(payload.user_id);
    const newRole = payload.role;

    // eslint-disable-next-line no-console
    console.log(
      `[resenha] role_change: user=${targetUserId}, role=${newRole}, room=${roomId}`
    );

    if (targetUserId === this.currentUser?.id) {
      await this.#handleOwnRoleChange(roomId, newRole);
    } else {
      this.#handlePeerRoleChange(roomId, targetUserId);
    }
  }

  async #handleOwnRoleChange(roomId, newRole) {
    const canSpeak = newRole === "speaker" || newRole === "moderator";

    // Block #handleParticipants while we reconfigure the local stream,
    // so the subsequent "participants" broadcast doesn't create peers
    // before the mic is ready.
    this.#roleChangeInProgress.add(roomId);

    // Destroy all existing peers immediately.
    this.#peerManager.destroyRoom(roomId);
    this.#removeAllRemoteStreams(roomId);
    this.#signaling.clearForRoom(roomId);
    this.#signaling.clearHttpQueue(roomId);

    if (canSpeak) {
      if (!this.localStream) {
        const acquired = await this.#acquireMicrophone();
        if (!acquired) {
          this.#roleChangeInProgress.delete(roomId);
          this.toasts.error({
            duration: 5000,
            data: { message: i18n("resenha.stage.mic_denied") },
          });
          return;
        }

        this.audioEnabled = true;
        for (const track of this.localStream.getAudioTracks()) {
          track.enabled = true;
        }
      }

      this.#audioMonitor.ensure(
        roomId,
        this.currentUser?.id,
        this.localStream,
        true
      );

      this.toasts.success({
        duration: 5000,
        data: { message: i18n("resenha.stage.promoted_to_speaker") },
      });
    } else {
      this.#stopLocalStream();
      this.audioEnabled = false;
      this.toasts.default({
        duration: 5000,
        data: { message: i18n("resenha.stage.demoted_to_listener") },
      });
    }

    this.#roleChangeInProgress.delete(roomId);

    // Rebuild peers now that localStream is ready (or stopped).
    this.#reconnectAllPeers(roomId);
  }

  #handlePeerRoleChange(roomId, userId) {
    // Destroy the stale peer; the subsequent "participants" broadcast
    // from the server will rebuild connections with the correct topology.
    if (this.#peerManager.has(roomId, userId)) {
      this.#peerManager.destroy(roomId, userId);
      this.#removeRemoteStream(roomId, userId);
    }
  }

  async #createAndOfferPeer(roomId, remoteUserId) {
    await this.#peerManager.create(roomId, remoteUserId);
    if (this.currentUser?.id <= remoteUserId) {
      await this.#peerManager.initiateOffer(roomId, remoteUserId);
    } else {
      this.#peerManager.scheduleOfferRetry(roomId, remoteUserId);
    }
  }

  #shouldMaintainPeerConnection(roomId, remoteUserId) {
    if (!this.#activeRoomIds.has(roomId)) {
      return false;
    }

    const room = this.resenhaRooms?.roomById(roomId);
    if (!room) {
      return false;
    }

    const participant = (room.active_participants || []).find(
      (entry) => Number(entry?.id) === Number(remoteUserId)
    );

    if (!participant) {
      return false;
    }

    if (room.room_type !== "stage") {
      return true;
    }

    const iCanSpeak = this.#canSpeakInRoom(room);
    const theyCanSpeak =
      participant.role === "moderator" || participant.role === "speaker";

    return iCanSpeak || theyCanSpeak;
  }

  // A targeted offer is implicit proof the sender shares this room with us:
  // presence (active_participants) lags behind WebRTC signaling when two peers
  // join near-simultaneously, so #shouldMaintainPeerConnection can still be
  // false at the instant the offer arrives. Gating offers on presence silently
  // drops that legitimate first offer and strands the media connection (the
  // sender finishes gathering before we ever engage, so its candidates are
  // never re-sent). Honor early offers in non-stage rooms, where peering does
  // not depend on the sender's presence-derived speaker role. Stage rooms keep
  // strict gating for exactly that reason.
  #canEngageEarlyOffer(roomId) {
    if (!this.#activeRoomIds.has(roomId)) {
      return false;
    }
    const room = this.resenhaRooms?.roomById(roomId);
    return !!room && room.room_type !== "stage";
  }

  // Whether we should set up / keep a peer for a signal of the given type.
  // Falls back to the implicit-presence rule above for offers.
  #shouldEngagePeer(roomId, remoteUserId, signalType) {
    if (this.#shouldMaintainPeerConnection(roomId, remoteUserId)) {
      return true;
    }
    return signalType === "offer" && this.#canEngageEarlyOffer(roomId);
  }

  // Extract the ICE username fragment from an SDP. A new value vs the prior
  // remote description signals the peer restarted its ICE session (e.g. left
  // and rejoined), which needs a fresh peer rather than a renegotiation.
  #iceUfrag(sdp) {
    const match = sdp?.match(/^a=ice-ufrag:(\S+)/m);
    return match ? match[1] : null;
  }

  #reconnectAllPeers(roomId) {
    this.#peerManager.destroyRoom(roomId);
    this.#removeAllRemoteStreams(roomId);
    this.#signaling.clearForRoom(roomId);
    this.#signaling.clearHttpQueue(roomId);

    const room = this.resenhaRooms?.roomById(roomId);
    if (!room) {
      return;
    }

    const participants = room.active_participants || [];
    const iCanSpeak = this.#canSpeakInRoom(room);

    for (const participant of participants) {
      const participantId = Number(participant?.id);
      if (participantId === this.currentUser?.id) {
        continue;
      }

      const theyCanSpeak = this.#participantCanSpeak(room, participantId);
      const shouldConnect = iCanSpeak || theyCanSpeak;

      if (shouldConnect) {
        this.#createAndOfferPeer(roomId, participantId);
      }
    }
  }

  #currentUserParticipant() {
    if (!this.currentUser) {
      return null;
    }

    return {
      id: this.currentUser.id,
      username: this.currentUser.username,
      name: this.currentUser.name,
      avatar_template: this.currentUser.avatar_template,
    };
  }

  #addLocalParticipant(roomId) {
    const participant = this.#currentUserParticipant();
    if (!participant) {
      return;
    }

    participant.is_muted = !this.audioEnabled;
    participant.is_deafened = this.deafened;

    const room = this.resenhaRooms?.roomById(roomId);
    if (room?.membership?.role_name) {
      participant.role = room.membership.role_name;
    }

    this.resenhaRooms?.addParticipant(roomId, participant);
  }

  #removeLocalParticipant(roomId) {
    if (!this.currentUser) {
      return;
    }

    this.resenhaRooms?.removeParticipant(roomId, this.currentUser.id);
  }

  #removeAllRemoteStreams(roomId) {
    const entries = this.#remoteStreams.get(roomId);
    if (!entries?.length) {
      if (this.#remoteStreams.delete(roomId)) {
        this.#bumpRemoteStreamsRevision();
      }
      return;
    }

    entries.forEach((entry) =>
      this.#audioMonitor.teardown(roomId, Number(entry.userId))
    );
    this.#remoteStreams.delete(roomId);
    this.#bumpRemoteStreamsRevision();
  }

  #registerRemoteStream(roomId, remoteUserId, stream) {
    if (!roomId || !remoteUserId || !stream) {
      return;
    }

    const roomStreams = this.#remoteStreams.get(roomId) || [];
    const existingIndex = roomStreams.findIndex(
      (entry) => Number(entry?.userId) === Number(remoteUserId)
    );

    if (existingIndex >= 0 && roomStreams[existingIndex]?.stream === stream) {
      return;
    }

    const next = [...roomStreams];
    if (existingIndex >= 0) {
      next[existingIndex] = { userId: remoteUserId, stream };
    } else {
      next.push({ userId: remoteUserId, stream });
    }

    this.#remoteStreams.set(roomId, next);
    this.#streamToParticipant.set(stream, { roomId, userId: remoteUserId });
    this.#bumpRemoteStreamsRevision();
    this.#audioMonitor.ensure(roomId, remoteUserId, stream, false);
  }

  #removeRemoteStream(roomId, remoteUserId) {
    if (!roomId || !remoteUserId) {
      return;
    }

    const roomStreams = this.#remoteStreams.get(roomId);
    if (!roomStreams?.length) {
      return;
    }

    const filtered = roomStreams.filter(
      (entry) => Number(entry?.userId) !== Number(remoteUserId)
    );

    if (filtered.length === roomStreams.length) {
      return;
    }

    if (filtered.length) {
      this.#remoteStreams.set(roomId, filtered);
    } else {
      this.#remoteStreams.delete(roomId);
    }

    this.#bumpRemoteStreamsRevision();
    this.#audioMonitor.teardown(roomId, remoteUserId);
    this.#untrackAudioElement(roomId, remoteUserId);
  }

  #bumpRemoteStreamsRevision() {
    this.remoteStreamsRevision++;
  }

  #bumpConnectionRevision() {
    this.connectionRevision++;
  }

  #startHeartbeat(roomId) {
    if (this.#heartbeatTimers.has(roomId)) {
      return;
    }

    const timer = setInterval(async () => {
      if (!this.#activeRoomIds.has(roomId)) {
        this.#stopHeartbeat(roomId);
        return;
      }

      if (this.#heartbeatInFlight.has(roomId)) {
        return;
      }

      this.#heartbeatInFlight.add(roomId);

      try {
        const data = {};
        if (this.idleState !== this.#idleTracker.lastBroadcastedIdleState) {
          data.idle_state = this.idleState;
          this.#idleTracker.lastBroadcastedIdleState = this.idleState;
        }
        await ajax(`/resenha/rooms/${roomId}/heartbeat`, {
          type: "POST",
          data,
        });
        // eslint-disable-next-line no-console
        console.log(`[resenha] heartbeat sent for room ${roomId}`);
      } catch (error) {
        const status = error?.jqXHR?.status || error?.status;
        // eslint-disable-next-line no-console
        console.warn(`[resenha] heartbeat failed for room ${roomId}`, error);

        if (status === 403 || status === 404 || status === 410) {
          this.leave({ id: roomId });
        }
      } finally {
        this.#heartbeatInFlight.delete(roomId);
      }
    }, 10000);

    this.#heartbeatTimers.set(roomId, timer);
  }

  #stopHeartbeat(roomId) {
    const timer = this.#heartbeatTimers.get(roomId);
    if (timer) {
      clearInterval(timer);
      this.#heartbeatTimers.delete(roomId);
      this.#heartbeatInFlight.delete(roomId);
      // eslint-disable-next-line no-console
      console.log(`[resenha] heartbeat stopped for room ${roomId}`);
    }
  }

  #handleJoinFailure(roomId) {
    this.#connectingRoomIds.delete(roomId);
    this.#bumpConnectionRevision();
    this.#activeRoomIds.delete(roomId);
    this.#stopHeartbeat(roomId);
    this.#removeLocalParticipant(roomId);
    this.#teardownRoom(roomId);

    if (this.#activeRoomIds.size === 0) {
      this.#stopLocalStream();
    }
  }

  #stopLocalStream() {
    this.#noiseSuppression.teardown();
    this.noiseSuppressionEnabled = false;

    if (this.#rawLocalStream) {
      this.#rawLocalStream.getTracks().forEach((track) => track.stop());
      this.#rawLocalStream = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    this.#syncLocalStreamState();
  }

  #syncLocalStreamState() {
    this.#applyLocalTrackState(this.localStream);

    if (!this.currentUser?.id) {
      return;
    }

    for (const roomId of this.#activeRoomIds) {
      if (this.localStream) {
        this.#audioMonitor.ensure(
          roomId,
          this.currentUser.id,
          this.localStream,
          true
        );
      } else {
        this.#audioMonitor.teardown(roomId, this.currentUser.id);
      }
    }
  }

  #applyLocalTrackState(stream) {
    for (const track of stream?.getAudioTracks?.() || []) {
      track.enabled = this.audioEnabled;
    }
  }

  async #replaceTrackOnAllPeers() {
    const newTrack = this.localStream?.getAudioTracks()?.[0];
    if (!newTrack) {
      return;
    }

    for (const [, peers] of this.#peerManager.allPeerConnections()) {
      for (const [, pc] of peers) {
        for (const sender of pc.getSenders()) {
          if (sender.track?.kind === "audio") {
            try {
              await sender.replaceTrack(newTrack);
            } catch (error) {
              // eslint-disable-next-line no-console
              console.warn("[resenha] failed to replace track on peer", error);
            }
          }
        }
      }
    }
  }

  // --- Idle tracker callbacks ---

  #handleIdleStateChange(newState, wasAfk) {
    if (newState === "active" && this.idleState !== "active") {
      this.idleState = "active";
      this.#idleTracker.lastBroadcastedIdleState = null;

      for (const roomId of this.#activeRoomIds) {
        this.resenhaRooms?.setParticipantIdleState(
          roomId,
          this.currentUser?.id,
          "active"
        );
      }

      if (wasAfk && this.#idleTracker.wasAutoMuted) {
        this.toasts.success({
          duration: 5000,
          data: {
            message: i18n("resenha.idle.auto_muted"),
            actions: [
              {
                label: i18n("resenha.idle.click_to_unmute"),
                class: "btn-primary",
                action: () => this.toggleMute(),
              },
            ],
          },
        });
      }
    } else if (newState === "idle" && this.idleState !== "idle") {
      this.idleState = "idle";
      this.#idleTracker.lastBroadcastedIdleState = null;

      for (const roomId of this.#activeRoomIds) {
        this.resenhaRooms?.setParticipantIdleState(
          roomId,
          this.currentUser?.id,
          "idle"
        );
      }
    }
  }

  #handleAutoMute() {
    if (this.idleState !== "afk") {
      this.idleState = "afk";
      this.#idleTracker.lastBroadcastedIdleState = null;

      if (this.audioEnabled) {
        this.audioEnabled = false;
        if (this.localStream) {
          for (const track of this.localStream.getAudioTracks()) {
            track.enabled = false;
          }
        }
        this.#broadcastMuteState();
      }

      for (const roomId of this.#activeRoomIds) {
        this.resenhaRooms?.setParticipantIdleState(
          roomId,
          this.currentUser?.id,
          "afk"
        );
      }
    }
  }

  #handleIdleDisconnect() {
    const roomNames = [];
    for (const roomId of this.#activeRoomIds) {
      const room = this.resenhaRooms?.roomById(roomId);
      if (room) {
        roomNames.push(room.name);
      }
    }

    for (const roomId of [...this.#activeRoomIds]) {
      this.leave({ id: roomId });
    }

    const name = roomNames[0] || "the room";
    this.toasts.default({
      duration: 8000,
      data: { message: i18n("resenha.idle.disconnected", { room: name }) },
    });
  }

  #getIdleThresholds() {
    let idleMs = this.siteSettings.resenha_idle_threshold_minutes * 60 * 1000;
    let afkMs =
      this.siteSettings.resenha_afk_auto_mute_threshold_minutes * 60 * 1000;
    let disconnectMs =
      this.siteSettings.resenha_afk_disconnect_threshold_minutes * 60 * 1000;

    if (afkMs > 0 && idleMs > 0 && idleMs >= afkMs) {
      idleMs = 0;
    }
    if (disconnectMs > 0 && afkMs > 0 && afkMs >= disconnectMs) {
      afkMs = 0;
    }
    if (disconnectMs > 0 && idleMs > 0 && idleMs >= disconnectMs) {
      idleMs = 0;
    }

    return { idleMs, afkMs, disconnectMs };
  }

  // --- Push-to-Talk ---

  #handlePttPress() {
    this.pttActive = true;
    this.audioEnabled = true;

    if (this.localStream) {
      for (const track of this.localStream.getAudioTracks()) {
        track.enabled = true;
      }
    }

    this.#broadcastMuteState();
  }

  #handlePttRelease() {
    this.pttActive = false;
    this.audioEnabled = false;

    if (this.localStream) {
      for (const track of this.localStream.getAudioTracks()) {
        track.enabled = false;
      }
    }
  }
}
