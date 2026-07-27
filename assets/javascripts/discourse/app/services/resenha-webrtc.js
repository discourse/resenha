import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import Service, { service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { i18n } from "discourse-i18n";
import AudioMonitor from "../../lib/resenha/audio-monitor";
import BackgroundBlurManager from "../../lib/resenha/background-blur";
import HeartbeatManager from "../../lib/resenha/heartbeat-manager";
import { iceServers, iceTransportPolicy } from "../../lib/resenha/ice-config";
import IdleTracker, { idleThresholds } from "../../lib/resenha/idle-tracker";
import InputGateManager, { sliderToRms } from "../../lib/resenha/input-gate";
import LivekitRoomSession from "../../lib/resenha/livekit-session";
import {
  applyOutputDevice,
  audioConstraints,
  cameraConstraints,
  preferredInputDeviceId,
  preferredOutputDeviceId,
  preferredVideoInputDeviceId,
  setPreferredInputDeviceId,
  setPreferredOutputDeviceId,
  setPreferredVideoInputDeviceId,
} from "../../lib/resenha/media-devices";
import NoiseSuppressionManager from "../../lib/resenha/noise-suppression";
import ParticipantAudio from "../../lib/resenha/participant-audio";
import PeerManager from "../../lib/resenha/peer-manager";
import PresencePendingPeers from "../../lib/resenha/presence-pending-peers";
import PttManager from "../../lib/resenha/ptt-manager";
import RemoteStreamRegistry from "../../lib/resenha/remote-stream-registry";
import RoomMessageQueue from "../../lib/resenha/room-message-queue";
import { iceUfrag } from "../../lib/resenha/sdp-utils";
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
import { participantCanSpeak } from "../../lib/resenha/stage-roles";
import {
  applyScreenAudioQuality,
  applyVideoQuality,
} from "../../lib/resenha/video-quality";

export default class ResenhaWebrtcService extends Service {
  @service currentUser;
  @service siteSettings;
  @service("resenha-rooms") resenhaRooms;
  @service toasts;

  @tracked localStream;
  @tracked localVideoStream;
  @tracked localVideoKind = null;
  @tracked activeRoomId = null;
  @tracked watchingRoomId = null;
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
  @tracked callWidgetHidden = false;
  @tracked gateThreshold = 0;
  @tracked inputDeviceId;
  @tracked outputDeviceId;
  @tracked videoBlurEnabled = BackgroundBlurManager.isPreferred();
  @tracked videoBlurAmount = BackgroundBlurManager.storedAmount();
  @tracked videoInputDeviceId = preferredVideoInputDeviceId();

  #connectingRoomIds = new Set();
  #roleChangeInProgress = new Set();
  #activeRoomIds = new Set();
  #joinRevision = 0;
  #connectingParticipantSnapshots = new Map();
  #connectingSignalQueue = new Map();
  // Per-room transport tag ("mesh" | "livekit"), read from the join response.
  // Rooms without a tag (older servers, messages arriving before the join
  // response, tests) default to mesh, so every guard below is a tautology on
  // pure-P2P installs.
  #roomTransports = new Map();
  #livekitSessions = new Map();
  // Last-seen roster ids per livekit room. Mesh derives join/leave sounds and
  // participant cleanup from peer churn; livekit rooms derive both from this
  // roster diff instead.
  #livekitRosterIds = new Map();
  #roomHandlerCallbacks = new Map();
  #deferredTeardownTimers = new Set();
  #pendingPlaybackElements = new WeakSet();
  #rawLocalStream = null;
  #upstreamStream = null;
  #rawLocalVideoStream = null;
  #backgroundBlur = null;

  // All async mutations of the video pipeline (blur toggle, device switch)
  // run through this queue so they can't interleave, and each op validates
  // the epoch after every await so a camera stop/restart during the await
  // (which can take seconds on first model load) is detected instead of
  // resurrecting streams that were already stopped.
  #videoPipelineQueue = Promise.resolve();
  #videoEpoch = 0;

  #signaling;
  #peerManager;
  #audioMonitor;
  #idleTracker;
  #noiseSuppression;
  #inputGate;
  #pttManager;
  #roomMessageQueue;
  #remoteStreamRegistry;
  #participantAudio;
  #heartbeat;
  #presencePending;

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
      getLocalVideoTrack: (roomId, uid) =>
        this.#localVideoTrackFor(roomId, uid),
      getLocalScreenAudioTrack: (roomId, uid) =>
        this.#localScreenAudioTrackFor(roomId, uid),
      sendSignal: (roomId, uid, payload) =>
        this.#signaling.send(roomId, uid, payload),
      flushQueuedSignals: (roomId, uid) =>
        this.#signaling.flushQueued(roomId, uid),
      onTrack: (roomId, uid, track, streams) =>
        this.#remoteStreamRegistry.register(roomId, uid, track, streams),
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
      getThresholds: () => idleThresholds(this.siteSettings),
    });

    this.#noiseSuppression = new NoiseSuppressionManager({
      onStreamReady: (stream) => this.#setOutgoingStream(stream),
    });
    this.noiseSuppressionEnabled = this.#noiseSuppression.isPreferred();

    this.#inputGate = new InputGateManager();
    this.gateThreshold = InputGateManager.storedSliderValue();
    this.inputDeviceId = preferredInputDeviceId();
    this.outputDeviceId = preferredOutputDeviceId();

    this.#roomMessageQueue = new RoomMessageQueue();

    this.#remoteStreamRegistry = new RemoteStreamRegistry({
      onChange: () => this.remoteStreamsRevision++,
      onMicTrack: (roomId, userId, stream) =>
        this.#audioMonitor.ensure(roomId, userId, stream, false),
    });

    this.#participantAudio = new ParticipantAudio({
      isDeafened: () => this.deafened,
    });

    this.#heartbeat = new HeartbeatManager({
      isActiveRoom: (roomId) => this.#activeRoomIds.has(roomId),
      buildPayload: () => this.#heartbeatPayload(),
      onExpelled: (roomId) => this.leave({ id: roomId }),
    });

    this.#presencePending = new PresencePendingPeers({
      onExpired: (roomId, userId) => {
        if (!this.#shouldMaintainPeerConnection(roomId, userId)) {
          this.#peerManager.destroy(roomId, userId);
        }
      },
    });

    try {
      const stored = localStorage.getItem("resenha_auto_status_enabled");
      this.autoStatusEnabled = stored !== "false";
    } catch {
      this.autoStatusEnabled = true;
    }

    try {
      this.callWidgetHidden =
        localStorage.getItem("resenha_call_widget_hidden") === "true";
    } catch {
      this.callWidgetHidden = false;
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);

    this.#joinRevision++;
    this.#pttManager.destroy();
    this.#idleTracker.stop();
    this.#audioMonitor.destroyAll();
    this.#peerManager.destroyAll();
    this.#livekitSessions.forEach((session) => session.disconnect());
    this.#livekitSessions.clear();
    this.#livekitRosterIds.clear();
    this.#signaling.destroy();
    this.#noiseSuppression.teardown();

    this.localVideoStream?.getTracks().forEach((track) => track.stop());
    this.localVideoStream = null;
    this.localVideoKind = null;
    this.#teardownVideoEffects();

    this.#stopLocalStream();

    this.#roomHandlerCallbacks.forEach((callback, roomId) => {
      this.resenhaRooms?.unregisterRoomHandler(roomId, callback);
    });
    this.#roomHandlerCallbacks.clear();
    this.#heartbeat.stopAll();
    this.#deferredTeardownTimers.forEach((timer) => clearTimeout(timer));
    this.#deferredTeardownTimers.clear();
    this.#connectingRoomIds.clear();
    this.#connectingParticipantSnapshots.clear();
    this.#connectingSignalQueue.clear();
    this.#roomTransports.clear();
    this.#presencePending.clearAll();
    this.#roomMessageQueue.clearAll();
  }

  get iceServers() {
    return iceServers(this.siteSettings);
  }

  get iceTransportPolicy() {
    return iceTransportPolicy(this.siteSettings);
  }

  get remoteStreams() {
    this.remoteStreamsRevision;
    return this.#remoteStreamRegistry.allStreams();
  }

  get remoteScreenAudioStreams() {
    this.remoteStreamsRevision;
    return this.#remoteStreamRegistry.allScreenAudioStreams();
  }

  remoteStreamsFor(roomId) {
    this.remoteStreamsRevision;
    return this.#remoteStreamRegistry.streamsFor(roomId);
  }

  remoteStreamFor(roomId, userId) {
    this.remoteStreamsRevision;
    return this.#remoteStreamRegistry.streamFor(roomId, userId);
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

  get hasActiveRoom() {
    return !!this.activeRoomId;
  }

  get activeRoom() {
    return this.activeRoomId
      ? this.resenhaRooms?.roomById(this.activeRoomId)
      : null;
  }

  isActiveRoom(roomId) {
    return Number(this.activeRoomId) === Number(roomId);
  }

  #setActiveRoomId(roomId) {
    this.activeRoomId = roomId ?? null;
  }

  #clearActiveRoomId(roomId) {
    if (Number(this.activeRoomId) !== Number(roomId)) {
      return;
    }

    this.activeRoomId = this.#activeRoomIds.values().next().value ?? null;
  }

  #canSpeakInRoom(room) {
    return participantCanSpeak(room, this.currentUser?.id);
  }

  #isMeshRoom(roomId) {
    return (this.#roomTransports.get(roomId) ?? "mesh") === "mesh";
  }

  isLivekitRoom(roomId) {
    return this.#roomTransports.get(roomId) === "livekit";
  }

  // The server already minted this room's token, so from here a failure is
  // client-side (firewall blocking the SFU, unsupported browser). Follow the
  // mic-failure precedent: tell the server we left, then unwind the local
  // join. Never fall back to mesh client-side — other clients may reach the
  // SFU fine, and a lone mesh joiner would split future joins.
  async #connectLivekitRoom(room, livekit, revision) {
    let failureMessage = null;

    if (!LivekitRoomSession.isBrowserSupported()) {
      failureMessage = "resenha.livekit.browser_unsupported";
    } else if (!livekit?.url || !livekit?.token) {
      failureMessage = "resenha.livekit.connect_failed";
    } else {
      const session = this.#buildLivekitSession(room.id);
      this.#livekitSessions.set(room.id, session);

      try {
        await session.connect(livekit.url, livekit.token);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          `[resenha-livekit] failed to connect to the media server for room ${room.id}`,
          error
        );
        failureMessage = error?.unsupportedBrowser
          ? "resenha.livekit.browser_unsupported"
          : "resenha.livekit.connect_failed";

        if (this.#livekitSessions.get(room.id) === session) {
          this.#livekitSessions.delete(room.id);
        }
        session.disconnect();
      }
    }

    if (failureMessage) {
      ajax(`/resenha/rooms/${room.id}/leave`, { type: "DELETE" });
      this.#handleJoinFailure(room.id);
      // The failure landed after the active-mark, which #handleJoinFailure
      // (built for pre-mark failures) doesn't unwind.
      this.#clearActiveRoomId(room.id);
      this.toasts.error({
        duration: 8000,
        data: { message: i18n(failureMessage) },
      });
      return false;
    }

    if (this.#joinRevision !== revision) {
      // Superseded while connecting; the superseding join already tore this
      // room down (disconnecting the session), so only the server needs
      // telling.
      ajax(`/resenha/rooms/${room.id}/leave`, { type: "DELETE" });
      return false;
    }

    return true;
  }

  #buildLivekitSession(roomId) {
    return new LivekitRoomSession({
      roomId,
      currentUserId: this.currentUser?.id,
      getLocalStream: () => this.localStream,
      getLocalVideoTrack: () => this.localVideoTrack,
      getLocalScreenAudioTrack: () => this.localScreenAudioTrack,
      getLocalVideoKind: () => this.localVideoKind,
      getVideoPublisherCount: () => this.videoPublisherCount(roomId),
      onTrack: (id, userId, track, streams) =>
        this.#remoteStreamRegistry.register(id, userId, track, streams),
      onParticipantGone: (id, userId) => this.#removeRemoteStream(id, userId),
      onDisconnected: (kind, reason) =>
        this.#handleLivekitDisconnected(roomId, kind, reason),
      onConnectionChange: () => this.#bumpConnectionRevision(),
      mintToken: () =>
        ajax(`/resenha/rooms/${roomId}/livekit_token`, { type: "POST" }),
    });
  }

  async #handleLivekitDisconnected(roomId, kind, reason) {
    const session = this.#livekitSessions.get(roomId);
    if (!session || !this.#activeRoomIds.has(roomId)) {
      return;
    }

    // eslint-disable-next-line no-console
    console.warn(
      `[resenha-livekit] disconnected from the media server for room ${roomId} (${reason})`
    );

    if (kind === "duplicate_identity") {
      // A newer tab for the same user took over the media session. Its join
      // overwrote our session id server-side, so a normal leave would close
      // the new tab's session row and drop the user from the roster —
      // tear down locally only.
      this.leave({ id: roomId }, { skipServer: true });
      this.toasts.default({
        duration: 8000,
        data: { message: i18n("resenha.livekit.duplicate_tab") },
      });
      return;
    }

    this.#bumpConnectionRevision();
    const outcome = await session.reconnectWithToken();

    if (outcome === "reconnected") {
      this.#bumpConnectionRevision();
    } else if (outcome === "gone") {
      // The room instance ended while we were disconnected; leave cleanly
      // and offer a rejoin.
      this.leave({ id: roomId });
      this.toasts.default({
        duration: 8000,
        data: { message: i18n("resenha.livekit.room_ended") },
      });
    } else if (outcome === "failed") {
      this.leave({ id: roomId });
      this.toasts.error({
        duration: 8000,
        data: { message: i18n("resenha.livekit.reconnect_failed") },
      });
    }
    // "aborted": the session was torn down (leave, new join) mid-ladder.
  }

  async join(room) {
    if (!room?.id) {
      return;
    }

    // Several call controls can request a join. Once this room already owns
    // a media session, a second request would connect another LiveKit client
    // with the same user identity and evict the first one.
    if (
      this.#activeRoomIds.has(room.id) ||
      this.#connectingRoomIds.has(room.id)
    ) {
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

    this.#roomTransports.set(room.id, response?.transport ?? "mesh");

    const joinedRoom = response?.room;
    if (joinedRoom) {
      // The join response is serialized as the (now participating) user, so
      // it carries the per-user chat fields the directory payloads gate off —
      // fold it in so the room page sees them.
      this.resenhaRooms?.upsertRoom?.(joinedRoom);
    }
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
    this.#setActiveRoomId(room.id);

    if (!this.#isMeshRoom(room.id)) {
      const connected = await this.#connectLivekitRoom(
        room,
        response?.livekit,
        revision
      );
      if (!connected) {
        return;
      }
    }

    this.#addLocalParticipant(room.id);

    if (this.localStream) {
      this.#audioMonitor.ensure(
        room.id,
        this.currentUser?.id,
        this.localStream,
        true
      );
    }

    this.#heartbeat.start(room.id);
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

    if (this.#isMeshRoom(room.id)) {
      for (const payload of queuedSignals) {
        await this.#handleSignal(room.id, payload);
      }
    }

    this.#connectingRoomIds.delete(room.id);
    this.#bumpConnectionRevision();

    if (this.pttEnabled && this.localStream) {
      this.#pttManager.startListening();
    }

    if (this.watchingRoomId === room.id) {
      this.setWatching(room.id, true);
    }

    playConnectedSound();
  }

  leave(room, options = {}) {
    if (!room?.id) {
      return;
    }

    const keepLocalStream = options.keepLocalStream === true;
    // Local-only teardown: everything below runs except DELETE /leave. Used
    // when the server must not close the presence/session that now belongs
    // to someone else (e.g. a newer tab after DUPLICATE_IDENTITY).
    const skipServer = options.skipServer === true;
    const wasConnecting = this.#connectingRoomIds.has(room.id);
    const wasConnected = this.#activeRoomIds.has(room.id);

    if (this.localVideoKind && (wasConnected || wasConnecting)) {
      this.#stopLocalVideo({ broadcast: false }).catch(() => {});
    }

    if (wasConnecting) {
      this.#joinRevision++;
    }

    this.#connectingParticipantSnapshots.delete(room.id);
    this.#connectingSignalQueue.delete(room.id);
    this.#pttManager.resetActive();
    this.pttActive = false;
    if (!skipServer) {
      ajax(`/resenha/rooms/${room.id}/leave`, { type: "DELETE" });
    }
    this.#connectingRoomIds.delete(room.id);
    this.#activeRoomIds.delete(room.id);
    this.#clearActiveRoomId(room.id);
    this.#bumpConnectionRevision();

    if (wasConnected && !keepLocalStream) {
      playDisconnectedSound();
    }
    this.#removeLocalParticipant(room.id);
    this.#heartbeat.stop(room.id);

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
      const timer = setTimeout(() => {
        this.#deferredTeardownTimers.delete(timer);
        teardown();
      }, 500);
      this.#deferredTeardownTimers.add(timer);
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
      const participant = this.#remoteStreamRegistry.participantFor(stream);
      if (participant) {
        const { roomId, userId, screenAudio } = participant;
        this.#participantAudio.trackElement(
          roomId,
          userId,
          element,
          screenAudio ? "screen" : "voice"
        );
        this.#participantAudio.apply(roomId, userId);
      }
      applyOutputDevice(element, this.outputDeviceId);
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

  setParticipantVolume(roomId, userId, volume) {
    this.#participantAudio.setVolume(roomId, userId, volume);
  }

  getParticipantVolume(roomId, userId) {
    return this.#participantAudio.volumeFor(roomId, userId);
  }

  toggleParticipantMute(roomId, userId) {
    const newMutedState = this.#participantAudio.toggleMuted(roomId, userId);
    this.resenhaRooms?.setParticipantMuted(roomId, userId, newMutedState);
    return newMutedState;
  }

  isParticipantMuted(roomId, userId) {
    return this.#participantAudio.isMuted(roomId, userId);
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

    this.#participantAudio.applyAll();

    this.#broadcastMuteState();
  }

  async toggleNoiseSuppression() {
    // Without a live mic (e.g. a stage listener) just store the preference;
    // it applies when the microphone is next acquired.
    if (!this.#rawLocalStream) {
      this.noiseSuppressionEnabled = !this.noiseSuppressionEnabled;
      this.#noiseSuppression.setPreference(this.noiseSuppressionEnabled);
      return;
    }

    if (this.noiseSuppressionEnabled) {
      this.#noiseSuppression.teardown();
      this.noiseSuppressionEnabled = false;
      this.#setOutgoingStream(this.#rawLocalStream);
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
        this.#revertNoiseSuppressionPreference();
        // #setOutgoingStream rebuilds the input gate, so localStream may be
        // a brand-new track; peers must be moved onto it or they keep the
        // torn-down gate's dead track and hear silence.
        this.#setOutgoingStream(this.#rawLocalStream);
        await this.#replaceTrackOnAllPeers();
        return;
      }
    }

    await this.#replaceTrackOnAllPeers();
  }

  #revertNoiseSuppressionPreference() {
    this.noiseSuppressionEnabled = false;
    this.#noiseSuppression.setPreference(false);
    this.toasts.error({
      duration: 5000,
      data: {
        message: i18n("resenha.voice_settings.noise_suppression_failed"),
      },
    });
  }

  // --- Device selection & input sensitivity ---

  async setInputDevice(deviceId) {
    this.inputDeviceId = deviceId;
    setPreferredInputDeviceId(deviceId);

    if (!this.#rawLocalStream) {
      return true;
    }

    let newRawStream;
    try {
      newRawStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints(deviceId),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[resenha] failed to switch input device", error);
      return false;
    }

    const oldRawStream = this.#rawLocalStream;
    this.#rawLocalStream = newRawStream;

    if (this.noiseSuppressionEnabled) {
      this.#noiseSuppression.teardown();
      try {
        await this.#noiseSuppression.setup(newRawStream);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          "[resenha] noise suppression setup failed after device switch",
          error
        );
        this.#revertNoiseSuppressionPreference();
        this.#setOutgoingStream(newRawStream);
      }
    } else {
      this.#setOutgoingStream(newRawStream);
    }

    oldRawStream.getTracks().forEach((track) => track.stop());
    await this.#replaceTrackOnAllPeers();
    return true;
  }

  setOutputDevice(deviceId) {
    this.outputDeviceId = deviceId;
    setPreferredOutputDeviceId(deviceId);
    this.#participantAudio.setOutputDevice(deviceId);
  }

  async setGateThreshold(value) {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    this.gateThreshold = clamped;
    InputGateManager.storeSliderValue(clamped);

    if (!this.#upstreamStream) {
      return;
    }

    // Adjusting an already-running gate is just a new compare value; only
    // crossing zero (gate off ↔ on) restructures the pipeline and needs the
    // peers' senders updated.
    if (this.#inputGate.active && clamped > 0) {
      this.#inputGate.setThreshold(sliderToRms(clamped));
      return;
    }
    if (!this.#inputGate.active && clamped === 0) {
      return;
    }

    this.#setOutgoingStream(this.#upstreamStream);
    await this.#replaceTrackOnAllPeers();
  }

  // --- Video & screen sharing ---

  get screenShareSupported() {
    return !!navigator.mediaDevices?.getDisplayMedia;
  }

  videoAllowedIn(room) {
    return !!(
      this.siteSettings.resenha_video_enabled &&
      room?.video_enabled &&
      (room?.room_type !== "stage" || this.#canSpeakInRoom(room))
    );
  }

  videoPublisherCount(roomId) {
    const room = this.resenhaRooms?.roomById(roomId);
    return (room?.active_participants || []).filter(
      (participant) =>
        participant?.is_video_on || participant?.is_screen_sharing
    ).length;
  }

  canPublishVideo(roomId) {
    const room = this.resenhaRooms?.roomById(roomId);
    if (!room || !this.videoAllowedIn(room)) {
      return false;
    }
    if (!this.#activeRoomIds.has(roomId)) {
      return false;
    }
    if (this.localVideoKind) {
      return true;
    }
    return (
      this.videoPublisherCount(roomId) <
      this.siteSettings.resenha_video_max_publishers
    );
  }

  async toggleCamera() {
    if (this.localVideoKind === "camera") {
      await this.#stopLocalVideo();
      return;
    }

    await this.#startLocalVideo("camera");
  }

  async toggleScreenShare() {
    if (this.localVideoKind === "screen") {
      await this.#stopLocalVideo();
      return;
    }

    await this.#startLocalVideo("screen");
  }

  // Whether the site allows background blur; distinct from browser support
  // so the UI can tell "turned off by admin" apart from "can't run here".
  get videoBlurAvailable() {
    return !!this.siteSettings.resenha_video_background_blur_enabled;
  }

  get videoBlurSupported() {
    return BackgroundBlurManager.isSupported();
  }

  #enqueueVideoOp(operation) {
    const run = this.#videoPipelineQueue.then(operation, operation);
    this.#videoPipelineQueue = run.catch(() => {});
    return run;
  }

  toggleVideoBlur() {
    return this.#enqueueVideoOp(() => this.#toggleVideoBlurOp());
  }

  async #toggleVideoBlurOp() {
    const enabled = !this.videoBlurEnabled;
    this.videoBlurEnabled = enabled;
    BackgroundBlurManager.setPreference(enabled);
    await this.#reconcileVideoBlurOp();
  }

  // Brings the pipeline in line with the current preference: wraps or
  // unwraps the published camera stream. A no-op when the camera is off
  // (the preference simply applies at the next camera start) or when the
  // pipeline already matches.
  async #reconcileVideoBlurOp() {
    if (this.localVideoKind !== "camera") {
      return;
    }

    const wantBlur =
      this.videoBlurEnabled &&
      this.videoBlurAvailable &&
      this.videoBlurSupported;

    if (wantBlur === !!this.#backgroundBlur) {
      return;
    }

    if (wantBlur) {
      const raw = this.localVideoStream;
      const epoch = this.#videoEpoch;
      const result = await this.#createBackgroundBlur(raw);

      // The camera may have been stopped or replaced, or blur toggled back
      // off, while the model loaded.
      if (epoch !== this.#videoEpoch || this.localVideoStream !== raw) {
        result?.manager.teardown();
        return;
      }

      if (!result) {
        this.#revertVideoBlurPreference();
        return;
      }

      if (!this.videoBlurEnabled) {
        result.manager.teardown();
        return;
      }

      this.#backgroundBlur = result.manager;
      this.#rawLocalVideoStream = raw;
      this.localVideoStream = result.processed;
    } else {
      this.localVideoStream = this.#rawLocalVideoStream;
      this.#teardownVideoEffects();
    }

    const roomId = this.#firstActiveRoomId();
    if (roomId) {
      await this.#syncVideoSenders(roomId);
    }
  }

  #revertVideoBlurPreference() {
    this.videoBlurEnabled = false;
    BackgroundBlurManager.setPreference(false);
    this.toasts.error({
      duration: 5000,
      data: { message: i18n("resenha.video_settings.blur_failed") },
    });
  }

  setVideoBlurAmount(value) {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    this.videoBlurAmount = clamped;
    BackgroundBlurManager.storeAmount(clamped);
    this.#backgroundBlur?.setAmount(clamped);
  }

  setVideoInputDevice(deviceId) {
    return this.#enqueueVideoOp(() => this.#setVideoInputDeviceOp(deviceId));
  }

  async #setVideoInputDeviceOp(deviceId) {
    const previousDeviceId = this.videoInputDeviceId;
    this.videoInputDeviceId = deviceId;

    if (this.localVideoKind !== "camera") {
      setPreferredVideoInputDeviceId(deviceId);
      return true;
    }

    const epoch = this.#videoEpoch;

    let newStream;
    try {
      newStream = await navigator.mediaDevices.getUserMedia({
        video: cameraConstraints(deviceId),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[resenha] failed to switch camera", error);
      this.videoInputDeviceId = previousDeviceId;
      this.toasts.error({
        duration: 5000,
        data: { message: i18n("resenha.video.capture_failed") },
      });
      return false;
    }

    setPreferredVideoInputDeviceId(deviceId);

    const track = newStream.getVideoTracks()[0];

    // The camera may have been stopped while the new capture started; the
    // preference is kept but nothing is swapped.
    if (epoch !== this.#videoEpoch || this.localVideoKind !== "camera") {
      newStream.getTracks().forEach((streamTrack) => streamTrack.stop());
      return true;
    }

    if (!track) {
      newStream.getTracks().forEach((streamTrack) => streamTrack.stop());
      return false;
    }

    track.contentHint = "motion";
    track.addEventListener("ended", () => this.#handleLocalVideoEnded(), {
      once: true,
    });

    const oldStream = this.localVideoStream;
    const oldRaw = this.#rawLocalVideoStream;

    let outgoingStream = newStream;
    let blurResult = null;

    if (this.#backgroundBlur) {
      blurResult = await this.#createBackgroundBlur(newStream);

      if (
        epoch !== this.#videoEpoch ||
        this.localVideoKind !== "camera" ||
        this.localVideoStream !== oldStream
      ) {
        blurResult?.manager.teardown();
        newStream.getTracks().forEach((streamTrack) => streamTrack.stop());
        return true;
      }

      if (blurResult) {
        outgoingStream = blurResult.processed;
      } else {
        this.#revertVideoBlurPreference();
      }
    }

    this.#backgroundBlur?.teardown();
    this.#backgroundBlur = blurResult?.manager ?? null;
    this.#rawLocalVideoStream = blurResult ? newStream : null;
    this.localVideoStream = outgoingStream;

    oldStream?.getTracks().forEach((streamTrack) => streamTrack.stop());
    if (oldRaw && oldRaw !== oldStream) {
      oldRaw.getTracks().forEach((streamTrack) => streamTrack.stop());
    }

    const roomId = this.#firstActiveRoomId();
    if (roomId) {
      await this.#syncVideoSenders(roomId);
    }

    return true;
  }

  // Builds the blur pipeline without touching service state, so callers can
  // validate that the world hasn't changed across the await before wiring
  // the result in. Returns null when the effect can't start (asset fetch
  // failed, GPU unavailable, …).
  async #createBackgroundBlur(rawStream) {
    const manager = new BackgroundBlurManager();
    try {
      const processed = await manager.setup(rawStream, this.videoBlurAmount);
      processed.getVideoTracks().forEach((track) => {
        track.contentHint = "motion";
      });
      return { manager, processed };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[resenha] failed to start background blur", error);
      manager.teardown();
      return null;
    }
  }

  #teardownVideoEffects() {
    this.#backgroundBlur?.teardown();
    this.#backgroundBlur = null;

    if (this.#rawLocalVideoStream) {
      if (this.#rawLocalVideoStream !== this.localVideoStream) {
        this.#rawLocalVideoStream.getTracks().forEach((track) => track.stop());
      }
      this.#rawLocalVideoStream = null;
    }
  }

  setWatching(roomId, watching, options = {}) {
    if (watching) {
      this.watchingRoomId = roomId;
    } else if (this.watchingRoomId === roomId) {
      this.watchingRoomId = null;
    }

    if (!this.#activeRoomIds.has(roomId)) {
      return;
    }

    // The room page used to hold the only controls that stop a camera or
    // screen share, so leaving it stopped publishing. A persistent call widget
    // is also a visible control surface; when it is present, route changes can
    // keep video alive without leaving capture running invisibly.
    const keepVideo = options.keepVideo === true;
    const stoppingVideo = !watching && !keepVideo && !!this.localVideoKind;
    if (stoppingVideo) {
      this.#stopLocalVideo({ broadcast: false }).catch((error) => {
        // eslint-disable-next-line no-console
        console.warn("[resenha] failed to stop video on page leave", error);
      });
    }

    const localState = { watching_video: watching };
    const data = { watching };
    if (stoppingVideo) {
      localState.is_video_on = false;
      localState.is_screen_sharing = false;
      data.video = false;
      data.screen = false;
    }

    this.resenhaRooms?.setParticipantVideoState(
      roomId,
      this.currentUser?.id,
      localState
    );

    ajax(`/resenha/rooms/${roomId}/state`, {
      type: "POST",
      data,
    }).catch(() => {});

    // The roster flag above drives tiles on both transports; on the SFU the
    // watching state additionally gates the actual video subscriptions.
    if (!this.#isMeshRoom(roomId)) {
      this.#livekitSessions.get(roomId)?.setVideoSubscriptionsEnabled(watching);
    }
  }

  @action
  attachVideoStream(stream, element) {
    if (!element || !stream) {
      return;
    }

    if (element.srcObject !== stream) {
      element.srcObject = stream;
    }

    // Remote audio plays through the voice canvas sinks; video elements stay
    // muted so the same stream never produces doubled audio.
    element.muted = true;
    element.autoplay = true;
    element.playsInline = true;

    try {
      element.play?.()?.catch?.(() => {});
    } catch {
      // ignore playback errors; the element retries on user interaction
    }
  }

  async #startLocalVideo(kind) {
    const roomId = this.#firstActiveRoomId();
    if (!roomId) {
      return;
    }

    if (!this.canPublishVideo(roomId)) {
      this.toasts.error({
        duration: 5000,
        data: { message: i18n("resenha.video.publisher_limit") },
      });
      return;
    }

    // Capture must be the first await: Firefox only allows getDisplayMedia
    // while the click's transient activation is alive, and awaiting anything
    // else first (e.g. stopping the current camera) consumes it. The old
    // stream is torn down after the picker succeeds, which also keeps the
    // camera running when the user cancels the picker.
    let stream;
    try {
      if (kind === "screen") {
        // Tab/system audio rides along for watch-along use. Voice processing
        // is disabled because it is tuned for speech and mangles content
        // audio; browsers without display-audio support just return no audio
        // track. The user can still untick audio in the picker.
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: { max: 15 } },
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
          systemAudio: "include",
        });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: cameraConstraints(this.videoInputDeviceId),
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`[resenha] failed to obtain ${kind} stream`, error);
      if (error?.name !== "NotAllowedError" && error?.name !== "AbortError") {
        this.toasts.error({
          duration: 5000,
          data: { message: i18n("resenha.video.capture_failed") },
        });
      }
      return;
    }

    // The user may have left the room while the capture picker was open.
    if (!this.#activeRoomIds.has(roomId)) {
      stream.getTracks().forEach((streamTrack) => streamTrack.stop());
      return;
    }

    if (this.localVideoKind) {
      await this.#stopLocalVideo({ broadcast: false });
    }

    const track = stream.getVideoTracks()[0];
    if (!track) {
      stream.getTracks().forEach((streamTrack) => streamTrack.stop());
      return;
    }

    const epoch = ++this.#videoEpoch;

    track.contentHint = kind === "screen" ? "detail" : "motion";
    track.addEventListener("ended", () => this.#handleLocalVideoEnded(), {
      once: true,
    });

    const audioTrack =
      kind === "screen" ? stream.getAudioTracks()[0] : undefined;
    if (audioTrack) {
      audioTrack.contentHint = "music";
    }

    let outgoingStream = stream;
    if (
      kind === "camera" &&
      this.videoBlurEnabled &&
      this.videoBlurAvailable &&
      this.videoBlurSupported
    ) {
      const result = await this.#createBackgroundBlur(stream);

      if (epoch !== this.#videoEpoch || !this.#activeRoomIds.has(roomId)) {
        result?.manager.teardown();
        stream.getTracks().forEach((streamTrack) => streamTrack.stop());
        return;
      }

      if (result) {
        this.#backgroundBlur = result.manager;
        this.#rawLocalVideoStream = stream;
        outgoingStream = result.processed;
      } else {
        this.#revertVideoBlurPreference();
      }
    }

    this.localVideoStream = outgoingStream;
    this.localVideoKind = kind;

    try {
      await this.#broadcastVideoState(roomId);
    } catch (error) {
      await this.#stopLocalVideo({ broadcast: false });
      popupAjaxError(error);
      return;
    }

    await this.#syncVideoSenders(roomId);

    // Applies any blur preference change that raced this startup (e.g. the
    // toggle was flipped while the model loaded for the initial wrap).
    this.#enqueueVideoOp(() => this.#reconcileVideoBlurOp());
  }

  async #stopLocalVideo({ broadcast = true } = {}) {
    // Invalidates any queued pipeline op that is mid-await on this session.
    this.#videoEpoch++;

    const roomId = this.#firstActiveRoomId();
    const stream = this.localVideoStream;

    this.localVideoStream = null;
    this.localVideoKind = null;

    stream?.getTracks().forEach((track) => track.stop());
    this.#teardownVideoEffects();

    if (roomId) {
      await this.#syncVideoSenders(roomId);
      if (broadcast) {
        this.#broadcastVideoState(roomId).catch(() => {});
      }
    }
  }

  #handleLocalVideoEnded() {
    if (!this.localVideoKind) {
      return;
    }
    this.#stopLocalVideo().catch((error) => {
      // eslint-disable-next-line no-console
      console.warn("[resenha] failed to stop local video", error);
    });
  }

  #firstActiveRoomId() {
    for (const roomId of this.#activeRoomIds) {
      return roomId;
    }
    return null;
  }

  get localVideoTrack() {
    return this.localVideoStream?.getVideoTracks()?.[0] || null;
  }

  get localScreenAudioTrack() {
    if (this.localVideoKind !== "screen") {
      return null;
    }
    return this.localVideoStream?.getAudioTracks()?.[0] || null;
  }

  #localScreenAudioTrackFor(roomId, remoteUserId) {
    if (!this.localScreenAudioTrack) {
      return null;
    }
    return this.#localVideoTrackFor(roomId, remoteUserId)
      ? this.localScreenAudioTrack
      : null;
  }

  #localVideoTrackFor(roomId, remoteUserId) {
    const track = this.localVideoTrack;
    if (!track) {
      return null;
    }

    if (
      !this.#activeRoomIds.has(roomId) &&
      !this.#connectingRoomIds.has(roomId)
    ) {
      return null;
    }

    const room = this.resenhaRooms?.roomById(roomId);
    const participant = (room?.active_participants || []).find(
      (entry) => Number(entry?.id) === Number(remoteUserId)
    );

    return participant?.watching_video ? track : null;
  }

  // Each peer has a dedicated sender, so video is only attached toward peers
  // currently watching the room page — every skipped peer saves an entire
  // encoder session, not just bandwidth.
  async #syncVideoSenders(roomId) {
    if (!this.#isMeshRoom(roomId)) {
      // The SFU is published to once regardless of watchers; per-watcher
      // receive gating happens on the subscriber side instead
      // (setVideoSubscriptionsEnabled).
      await this.#livekitSessions
        .get(roomId)
        ?.syncLocalVideo(
          this.localVideoTrack,
          this.localScreenAudioTrack,
          this.localVideoKind
        );
      return;
    }

    const peers = this.#peerManager.getRoomPeers(roomId);
    if (!peers) {
      return;
    }

    for (const [remoteUserId, pc] of peers) {
      const desired = this.#localVideoTrackFor(roomId, remoteUserId);

      const transceiver = PeerManager.videoTransceiverFor(pc);
      if (transceiver && transceiver.sender.track !== desired) {
        try {
          await transceiver.sender.replaceTrack(desired);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(
            `[resenha] failed to sync video sender for user ${remoteUserId}`,
            error
          );
        }
      }

      // Screen audio follows the same watching gate as the video track, so
      // non-watchers don't get a soundtrack without a picture.
      const desiredAudio = desired ? this.localScreenAudioTrack : null;
      const audioTransceiver = PeerManager.screenAudioTransceiverFor(pc);
      if (audioTransceiver && audioTransceiver.sender.track !== desiredAudio) {
        try {
          await audioTransceiver.sender.replaceTrack(desiredAudio);
          if (desiredAudio) {
            await applyScreenAudioQuality(audioTransceiver.sender);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(
            `[resenha] failed to sync screen audio sender for user ${remoteUserId}`,
            error
          );
        }
      }
    }

    await this.#applyVideoQuality(roomId);
  }

  async #applyVideoQuality(roomId) {
    const peers = this.#peerManager.getRoomPeers(roomId);
    if (!peers || !this.localVideoKind) {
      return;
    }

    const sendingSenders = [];
    for (const [, pc] of peers) {
      const sender = PeerManager.videoTransceiverFor(pc)?.sender;
      if (sender?.track) {
        sendingSenders.push(sender);
      }
    }

    await applyVideoQuality(sendingSenders, this.localVideoKind);
  }

  #broadcastVideoState(roomId) {
    const video = this.localVideoKind === "camera";
    const screen = this.localVideoKind === "screen";

    this.resenhaRooms?.setParticipantVideoState(roomId, this.currentUser?.id, {
      is_video_on: video,
      is_screen_sharing: screen,
    });

    return ajax(`/resenha/rooms/${roomId}/state`, {
      type: "POST",
      data: { video, screen },
    });
  }

  // Room state updates in resenhaRooms; this only surfaces the change to
  // people in the call. The moderator who pressed the button gets no toast —
  // their button state already changed under their pointer.
  #handleRecordingChanged(payload) {
    const startedBySelf =
      payload.recording?.started_by?.id === this.currentUser?.id;

    if (payload.recording) {
      if (!startedBySelf) {
        this.toasts.default({
          duration: 8000,
          data: {
            icon: "record-vinyl",
            message: i18n("resenha.room.recording_started_toast"),
          },
        });
      }
    } else {
      this.toasts.default({
        duration: 5000,
        data: { message: i18n("resenha.room.recording_stopped_toast") },
      });
    }
  }

  #handleRoomUpdated(roomId) {
    if (!this.localVideoKind) {
      return;
    }

    const room = this.resenhaRooms?.roomById(roomId);
    if (room && !this.videoAllowedIn(room)) {
      this.#stopLocalVideo().catch(() => {});
      this.toasts.default({
        duration: 5000,
        data: { message: i18n("resenha.video.room_disabled") },
      });
    }
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

  toggleCallWidgetHidden() {
    this.callWidgetHidden = !this.callWidgetHidden;
    try {
      localStorage.setItem(
        "resenha_call_widget_hidden",
        this.callWidgetHidden ? "true" : "false"
      );
    } catch {
      // ignore storage errors
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
    this.#roomTransports.delete(roomId);
    this.#livekitRosterIds.delete(roomId);
    this.#presencePending.clearAll(roomId);

    const livekitSession = this.#livekitSessions.get(roomId);
    if (livekitSession) {
      this.#livekitSessions.delete(roomId);
      livekitSession.disconnect();
    }

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
    if (this.isDestroying || this.isDestroyed) {
      return;
    }

    // Serialize all message processing per room to prevent async
    // handlers from interleaving (e.g. concurrent participant broadcasts,
    // signals arriving mid-peer-setup, role changes overlapping signals).
    this.#roomMessageQueue
      .enqueue(roomId, () => {
        if (this.isDestroying || this.isDestroyed) {
          return;
        }
        return this.#processRoomMessage(roomId, payload);
      })
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
      // Mesh-only: non-mesh transports never exchange WebRTC signals.
      if (this.#isMeshRoom(roomId)) {
        await this.#handleSignal(roomId, payload);
      }
    } else if (payload.type === "participants") {
      await this.#handleParticipants(roomId, payload);
    } else if (payload.type === "role_change") {
      await this.#handleRoleChange(roomId, payload);
    } else if (payload.type === "hand_raise") {
      this.#handleHandRaise(roomId, payload);
    } else if (payload.type === "kicked") {
      this.#handleKicked(roomId);
    } else if (payload.type === "room_updated") {
      this.#handleRoomUpdated(roomId);
    } else if (payload.type === "recording") {
      this.#handleRecordingChanged(payload);
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
    if (!hadPeer && data?.type === "candidate") {
      if (this.#canEngageEarlyOffer(roomId)) {
        this.#peerManager.queuePendingCandidate(
          roomId,
          remoteUserId,
          data.candidate
        );
      }
      return;
    }

    if (!hadPeer && !this.#shouldEngagePeer(roomId, remoteUserId, data?.type)) {
      return;
    }

    // eslint-disable-next-line no-console
    console.log(
      `[resenha] 📥 received ${data.type} from user ${remoteUserId} in room ${roomId}`
    );
    let pc = await this.#peerManager.create(roomId, remoteUserId);
    if (!pc) {
      return;
    }

    if (!this.#shouldEngagePeer(roomId, remoteUserId, data?.type)) {
      this.#peerManager.destroy(roomId, remoteUserId);
      return;
    }

    if (data.type === "offer") {
      this.#peerManager.clearOfferRetry(roomId, remoteUserId);
      if (!this.#shouldMaintainPeerConnection(roomId, remoteUserId)) {
        this.#presencePending.mark(roomId, remoteUserId);
      }

      // If the remote restarted its ICE session — it left and rejoined, so its
      // offer carries fresh ICE credentials — renegotiating on the old, dead
      // transport won't recover. Tear the stale peer down and rebuild it so ICE
      // starts clean. Detected by a changed ice-ufrag vs our current remote
      // description; a merely resent offer keeps the same ufrag and is left
      // alone. Skip while mid-glare (have-local-offer), which the block below
      // already resolves.
      if (pc.signalingState !== "have-local-offer") {
        const priorUfrag = iceUfrag(pc.remoteDescription?.sdp);
        const incomingUfrag = iceUfrag(data.sdp);
        if (priorUfrag && incomingUfrag && priorUfrag !== incomingUfrag) {
          // eslint-disable-next-line no-console
          console.log(
            `[resenha] remote ICE restart from user ${remoteUserId}; recreating peer`
          );
          this.#peerManager.destroy(roomId, remoteUserId);
          pc = await this.#peerManager.create(roomId, remoteUserId);
          if (!pc) {
            return;
          }
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
        PeerManager.alignVideoTransceiverForAnswer(pc);
        PeerManager.alignScreenAudioTransceiverForAnswer(pc);
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

        if (this.localVideoKind) {
          await this.#syncVideoSenders(roomId);
        }
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

    let hasPeerLeft = false;
    let hasNewPeer = false;

    // Peer create/destroy and the presence-pending machinery are mesh-only;
    // other transports carry media outside the roster diff.
    if (this.#isMeshRoom(roomId)) {
      const peers = this.#peerManager.getRoomPeers(roomId);
      const existingPeerIds = new Set(peers?.keys() || []);

      peers?.forEach((pc, remoteUserId) => {
        if (!participantIds.has(remoteUserId)) {
          if (this.#presencePending.has(roomId, remoteUserId)) {
            return;
          }
          hasPeerLeft = true;
          this.#peerManager.destroy(roomId, remoteUserId);
        }
      });

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
          if (
            existingPeerIds.size > 0 ||
            !this.#connectingRoomIds.has(roomId)
          ) {
            hasNewPeer = true;
          }
          // eslint-disable-next-line no-console
          console.log(
            `[resenha] creating peer connection to user ${participantId}`
          );

          await this.#createAndOfferPeer(roomId, participantId);
        } else {
          this.#presencePending.clear(roomId, participantId);
        }
      }
    } else {
      ({ hasNewPeer, hasPeerLeft } = this.#syncLivekitRoster(
        roomId,
        participants
      ));
    }

    if (this.#activeRoomIds.has(roomId)) {
      if (hasNewPeer) {
        playUserJoinedSound();
      } else if (hasPeerLeft) {
        playUserLeftSound();
      }
    }

    this.#syncRemoteVideoTracks(roomId, participants);

    if (!this.#isMeshRoom(roomId)) {
      // Publisher-count changes move camera subscriptions between simulcast
      // layers.
      this.#livekitSessions.get(roomId)?.updateSubscriberQuality();
    }

    if (this.localVideoKind) {
      await this.#syncVideoSenders(roomId);
    }
  }

  // Mesh gets participant cleanup for free by destroying peers on the roster
  // diff. The SFU doesn't consult our roster, so a participant expelled from
  // it (heartbeat TTL expiry, kick with a failed server-side eviction) would
  // stay audible forever — voice-canvas plays every stream in
  // `remoteStreams`. Drop registry entries and subscriptions for identities
  // absent from the roster, and derive the join/leave sounds mesh derives
  // from peer churn.
  #syncLivekitRoster(roomId, participants) {
    const known = this.#livekitRosterIds.get(roomId) || new Set();
    const next = new Set();
    let hasNewPeer = false;
    let hasPeerLeft = false;

    for (const participant of participants) {
      const participantId = Number(participant?.id);
      if (
        !participantId ||
        participantId <= 0 ||
        participantId === this.currentUser?.id
      ) {
        continue;
      }

      next.add(participantId);

      // Mirror the mesh rule: the initial roster processed while the join is
      // still connecting represents people already there, not arrivals.
      if (
        !known.has(participantId) &&
        (known.size > 0 || !this.#connectingRoomIds.has(roomId))
      ) {
        hasNewPeer = true;
      }
    }

    for (const knownId of known) {
      if (!next.has(knownId)) {
        hasPeerLeft = true;
      }
    }

    this.#livekitRosterIds.set(roomId, next);

    const session = this.#livekitSessions.get(roomId);
    for (const entryUserId of this.#remoteStreamRegistry.userIdsFor(roomId)) {
      if (
        entryUserId &&
        entryUserId !== this.currentUser?.id &&
        !next.has(entryUserId)
      ) {
        session?.dropParticipant(entryUserId);
        this.#removeRemoteStream(roomId, entryUserId);
      }
    }

    return { hasNewPeer, hasPeerLeft };
  }

  #syncRemoteVideoTracks(roomId, participants) {
    for (const participant of participants || []) {
      const participantId = Number(participant?.id);
      if (!participantId || participantId === this.currentUser?.id) {
        continue;
      }

      if (!participant.is_video_on && !participant.is_screen_sharing) {
        continue;
      }

      const track = this.#peerManager.remoteVideoTrack(roomId, participantId);
      if (track) {
        this.#remoteStreamRegistry.register(roomId, participantId, track);
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
        audio: audioConstraints(this.inputDeviceId),
      });
      // eslint-disable-next-line no-console
      console.log("[resenha] local stream obtained");

      this.#rawLocalStream = rawStream;

      if (this.#noiseSuppression.isPreferred()) {
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
          this.noiseSuppressionEnabled = false;
          this.#setOutgoingStream(rawStream);
        }
      } else {
        this.#setOutgoingStream(rawStream);
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

    // Destroy all existing peers immediately. Mesh-only: on other transports
    // the media session survives a role change untouched, so wiping the
    // remote registry would silence everyone until they republished.
    if (this.#isMeshRoom(roomId)) {
      this.#peerManager.destroyRoom(roomId);
      this.#removeAllRemoteStreams(roomId);
      this.#signaling.clearForRoom(roomId);
      this.#signaling.clearHttpQueue(roomId);
    }

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
      if (this.localVideoKind) {
        await this.#stopLocalVideo();
      }
      this.#stopLocalStream();
      this.audioEnabled = false;
      this.toasts.default({
        duration: 5000,
        data: { message: i18n("resenha.stage.demoted_to_listener") },
      });
    }

    this.#roleChangeInProgress.delete(roomId);

    // Rebuild peers now that localStream is ready (or stopped). Mesh-only:
    // peer rebuilds are meaningless on other transports.
    if (this.#isMeshRoom(roomId)) {
      this.#reconnectAllPeers(roomId);
    } else {
      // The SFU connection survives the role change; just publish or release
      // the microphone to match the new role.
      try {
        await this.#livekitSessions.get(roomId)?.refreshPublications();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          `[resenha-livekit] failed to refresh publications after a role change in room ${roomId}`,
          error
        );
      }
    }
  }

  #handleHandRaise(roomId, payload) {
    const targetUserId = Number(payload.user_id);
    const isSelf = targetUserId === this.currentUser?.id;

    if (isSelf && !payload.raised && payload.reason === "dismissed") {
      this.toasts.default({
        duration: 5000,
        data: { message: i18n("resenha.stage.request_dismissed") },
      });
      return;
    }

    const room = this.resenhaRooms?.roomById(roomId);
    if (!isSelf && payload.raised && room?.can_manage) {
      const participant = (room.active_participants || []).find(
        (p) => Number(p?.id) === targetUserId
      );
      if (participant) {
        this.toasts.default({
          duration: 5000,
          data: {
            message: i18n("resenha.stage.hand_raised_toast", {
              username: participant.username,
            }),
          },
        });
      }
    }
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
    return (
      (signalType === "offer" || signalType === "candidate") &&
      this.#canEngageEarlyOffer(roomId)
    );
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

      const theyCanSpeak = participantCanSpeak(room, participantId);
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
    participant.is_video_on = this.localVideoKind === "camera";
    participant.is_screen_sharing = this.localVideoKind === "screen";
    participant.watching_video = this.watchingRoomId === roomId;

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
    this.#remoteStreamRegistry
      .clearRoom(roomId)
      .forEach((userId) => this.#audioMonitor.teardown(roomId, userId));
  }

  #removeRemoteStream(roomId, remoteUserId) {
    if (!this.#remoteStreamRegistry.remove(roomId, remoteUserId)) {
      return;
    }

    this.#audioMonitor.teardown(roomId, remoteUserId);
    this.#participantAudio.untrackElement(roomId, remoteUserId);
  }

  #bumpConnectionRevision() {
    this.connectionRevision++;
  }

  #heartbeatPayload() {
    const data = {};
    if (this.idleState !== this.#idleTracker.lastBroadcastedIdleState) {
      data.idle_state = this.idleState;
      this.#idleTracker.lastBroadcastedIdleState = this.idleState;
    }
    return data;
  }

  #handleJoinFailure(roomId) {
    this.#connectingRoomIds.delete(roomId);
    this.#bumpConnectionRevision();
    this.#activeRoomIds.delete(roomId);
    this.#heartbeat.stop(roomId);
    this.#removeLocalParticipant(roomId);
    this.#teardownRoom(roomId);

    if (this.#activeRoomIds.size === 0) {
      this.#stopLocalStream();
    }
  }

  #stopLocalStream() {
    this.#noiseSuppression.teardown();
    this.noiseSuppressionEnabled = this.#noiseSuppression.isPreferred();
    this.#inputGate.teardown();
    this.#upstreamStream = null;

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

  // Final hop of the local pipeline: raw mic → optional noise suppression
  // (the `upstream` argument) → optional input gate → localStream.
  #setOutgoingStream(upstream) {
    this.#upstreamStream = upstream;
    this.#inputGate.teardown();

    let stream = upstream;
    if (upstream && this.gateThreshold > 0) {
      try {
        stream = this.#inputGate.setup(
          upstream,
          sliderToRms(this.gateThreshold)
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("[resenha] failed to set up input gate", error);
        stream = upstream;
      }
    }

    this.localStream = stream;
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

    for (const [roomId, session] of this.#livekitSessions) {
      try {
        await session.replaceAudioTrack(newTrack);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          `[resenha-livekit] failed to replace the published audio track for room ${roomId}`,
          error
        );
      }
    }

    for (const [, peers] of this.#peerManager.allPeerConnections()) {
      for (const [, pc] of peers) {
        // The screen-share audio sender also carries kind "audio"; a mic
        // device switch or noise suppression toggle must not stomp it.
        const screenAudioSender =
          PeerManager.screenAudioTransceiverFor(pc)?.sender;
        for (const sender of pc.getSenders()) {
          if (sender.track?.kind === "audio" && sender !== screenAudioSender) {
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
