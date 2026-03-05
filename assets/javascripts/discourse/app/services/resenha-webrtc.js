import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import Service, { service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { i18n } from "discourse-i18n";
import AudioMonitor from "../../lib/resenha/audio-monitor";
import IdleTracker from "../../lib/resenha/idle-tracker";
import NoiseSuppressionManager from "../../lib/resenha/noise-suppression";
import PeerManager from "../../lib/resenha/peer-manager";
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

  #connectingRoomIds = new Set();
  #activeRoomIds = new Set();
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

  constructor() {
    super(...arguments);

    this.#signaling = new SignalingManager({
      isActiveRoom: (id) => this.#activeRoomIds.has(id),
      hasPeer: (roomId, uid) => this.#peerManager.has(roomId, uid),
    });

    this.#peerManager = new PeerManager({
      getIceServers: () => this.iceServers,
      getLocalStream: () => this.localStream,
      sendSignal: (roomId, uid, payload) =>
        this.#signaling.send(roomId, uid, payload),
      flushQueuedSignals: (roomId, uid) =>
        this.#signaling.flushQueued(roomId, uid),
      onTrack: (roomId, uid, stream) =>
        this.#registerRemoteStream(roomId, uid, stream),
      clearSignalQueue: (roomId, uid) =>
        this.#signaling.clearForPeer(roomId, uid),
      onPeerDestroyed: (roomId, uid) =>
        this.#removeRemoteStream(roomId, uid),
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
      },
    });
  }

  willDestroy() {
    super.willDestroy(...arguments);

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
  }

  get iceServers() {
    const servers = [];

    const stunServers = this.siteSettings.resenha_stun_servers;
    if (stunServers) {
      stunServers
        .split("|")
        .map((url) => url.trim())
        .filter(Boolean)
        .forEach((url) => {
          servers.push({ urls: url });
        });
    }

    const turnServers = this.siteSettings.resenha_turn_servers;
    if (turnServers) {
      const username = this.siteSettings.resenha_turn_username;
      const credential = this.siteSettings.resenha_turn_credential;

      turnServers
        .split("|")
        .map((url) => url.trim())
        .filter(Boolean)
        .forEach((url) => {
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

  async join(room) {
    if (!room?.id) {
      return;
    }

    this.#connectingRoomIds.add(room.id);
    this.#bumpConnectionRevision();

    for (const activeRoomId of this.#activeRoomIds) {
      if (activeRoomId !== room.id) {
        this.leave({ id: activeRoomId }, { keepLocalStream: true });
      }
    }

    // eslint-disable-next-line no-console
    console.log(`[resenha] joining room ${room.id}`);

    if (!this.localStream) {
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
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("[resenha] failed to obtain local stream", error);
        this.#connectingRoomIds.delete(room.id);
        this.#bumpConnectionRevision();
        return;
      }
    }

    this.audioEnabled = true;
    if (this.localStream) {
      for (const track of this.localStream.getAudioTracks()) {
        track.enabled = true;
      }
    }

    this.#registerRoomHandler(room.id);
    this.#activeRoomIds.add(room.id);

    let response;

    try {
      response = await ajax(`/resenha/rooms/${room.id}/join`, {
        type: "POST",
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[resenha] failed to join room", error);
      this.#handleJoinFailure(room.id);
      return;
    }

    // eslint-disable-next-line no-console
    console.log(
      `[resenha] join response, active_participants:`,
      response?.room?.active_participants
    );

    this.#addLocalParticipant(room.id);
    this.#audioMonitor.ensure(
      room.id,
      this.currentUser?.id,
      this.localStream,
      true
    );
    this.#startHeartbeat(room.id);
    this.#idleTracker.start();

    if (response?.room?.active_participants) {
      await this.#handleParticipants(room.id, {
        participants: response.room.active_participants,
      });
    }

    this.#connectingRoomIds.delete(room.id);
    this.#bumpConnectionRevision();
    playConnectedSound();
  }

  leave(room, options = {}) {
    if (!room?.id) {
      return;
    }

    const keepLocalStream = options.keepLocalStream === true;
    const wasConnected = this.#activeRoomIds.has(room.id);

    ajax(`/resenha/rooms/${room.id}/leave`, { type: "DELETE" });
    this.#connectingRoomIds.delete(room.id);
    this.#activeRoomIds.delete(room.id);
    this.#bumpConnectionRevision();

    if (wasConnected && !keepLocalStream) {
      playDisconnectedSound();
    }
    this.#removeLocalParticipant(room.id);
    this.#audioMonitor.teardown(room.id, this.currentUser?.id);
    this.#stopHeartbeat(room.id);
    this.#teardownRoom(room.id);

    if (this.#activeRoomIds.size === 0) {
      this.#idleTracker.stop();
    }

    if (!keepLocalStream && this.#activeRoomIds.size === 0) {
      this.#stopLocalStream();
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
      this.audioEnabled = true;
      if (this.localStream) {
        for (const track of this.localStream.getAudioTracks()) {
          track.enabled = true;
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
        return;
      }
    }

    await this.#replaceTrackOnAllPeers();
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
  }

  async #handleRoomMessage(roomId, payload) {
    // eslint-disable-next-line no-console
    console.log(
      `[resenha] 📨 MessageBus message: room=${roomId}, type=${payload.type}, active=${this.#activeRoomIds.has(roomId)}`
    );

    if (!this.#activeRoomIds.has(roomId)) {
      return;
    }

    if (payload.type === "signal") {
      await this.#handleSignal(roomId, payload);
    } else if (payload.type === "participants") {
      await this.#handleParticipants(roomId, payload);
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
    // eslint-disable-next-line no-console
    console.log(
      `[resenha] 📥 received ${data.type} from user ${remoteUserId} in room ${roomId}`
    );
    const pc = await this.#peerManager.create(roomId, remoteUserId);

    if (data.type === "offer") {
      this.#peerManager.clearOfferRetry(roomId, remoteUserId);

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
    const participantIds = new Set(
      (payload.participants || []).map((participant) => Number(participant.id))
    );

    // eslint-disable-next-line no-console
    console.log(
      `[resenha] handleParticipants room=${roomId}, participants=[${Array.from(participantIds)}], currentUser=${this.currentUser?.id}`
    );

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

    for (const participantId of participantIds) {
      if (participantId === this.currentUser?.id) {
        continue;
      }

      if (!this.#peerManager.has(roomId, participantId)) {
        if (existingPeerIds.size > 0 || !this.#connectingRoomIds.has(roomId)) {
          hasNewPeer = true;
        }
        // eslint-disable-next-line no-console
        console.log(
          `[resenha] creating peer connection to user ${participantId}`
        );
        await this.#peerManager.create(roomId, participantId);

        if (this.currentUser?.id <= participantId) {
          // eslint-disable-next-line no-console
          console.log(`[resenha] initiating offer to user ${participantId}`);
          await this.#peerManager.initiateOffer(roomId, participantId);
        } else {
          // eslint-disable-next-line no-console
          console.log(
            `[resenha] scheduling offer retry for user ${participantId}`
          );
          this.#peerManager.scheduleOfferRetry(roomId, participantId);
        }
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
    let idleMs =
      this.siteSettings.resenha_idle_threshold_minutes * 60 * 1000;
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
}
