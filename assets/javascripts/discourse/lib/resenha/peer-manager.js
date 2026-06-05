export default class PeerManager {
  static #maxRestartAttempts = 5;
  static #maxOfferRetries = 8;
  static #maxOfferRetryDelayMs = 5000;
  static #connectionTimeoutMs = 30000;

  static peerKey(roomId, userId) {
    return `${roomId}:${userId}`;
  }

  #peerConnections = new Map();
  #offerRetryTimers = new Map();
  #offerRetryAttempts = new Map();
  #peerReconnectTimers = new Map();
  #restartAttempts = new Map();
  #connectionTimeouts = new Map();
  #pendingCandidates = new Map();

  #getIceServers;
  #getIceTransportPolicy;
  #getLocalStream;
  #sendSignal;
  #flushQueuedSignals;
  #onTrack;
  #clearSignalQueue;
  #onPeerDestroyed;
  #shouldRestartPeer;

  constructor({
    getIceServers,
    getIceTransportPolicy = () => "all",
    getLocalStream,
    sendSignal,
    flushQueuedSignals,
    onTrack,
    clearSignalQueue,
    onPeerDestroyed,
    shouldRestartPeer = () => true,
  }) {
    this.#getIceServers = getIceServers;
    this.#getIceTransportPolicy = getIceTransportPolicy;
    this.#getLocalStream = getLocalStream;
    this.#sendSignal = sendSignal;
    this.#flushQueuedSignals = flushQueuedSignals;
    this.#onTrack = onTrack;
    this.#clearSignalQueue = clearSignalQueue;
    this.#onPeerDestroyed = onPeerDestroyed;
    this.#shouldRestartPeer = shouldRestartPeer;
  }

  has(roomId, userId) {
    const peers = this.#peerConnections.get(roomId);
    return peers?.has(userId) ?? false;
  }

  get(roomId, userId) {
    return this.#peerConnections.get(roomId)?.get(userId);
  }

  getRoomPeers(roomId) {
    return this.#peerConnections.get(roomId);
  }

  allPeerConnections() {
    return this.#peerConnections;
  }

  async create(roomId, remoteUserId) {
    let roomPeers = this.#peerConnections.get(roomId);
    if (!roomPeers) {
      roomPeers = new Map();
      this.#peerConnections.set(roomId, roomPeers);
    }

    if (roomPeers.has(remoteUserId)) {
      return roomPeers.get(remoteUserId);
    }

    const pc = new RTCPeerConnection({
      iceServers: this.#getIceServers(),
      iceTransportPolicy: this.#getIceTransportPolicy(),
    });
    roomPeers.set(remoteUserId, pc);

    const localStream = this.#getLocalStream();
    if (localStream) {
      for (const track of localStream.getTracks()) {
        pc.addTrack(track, localStream);
      }
    }

    pc.ontrack = (event) => {
      const stream = event.streams?.[0] || new MediaStream([event.track]);
      this.#onTrack(roomId, remoteUserId, stream);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidatePayload =
          typeof event.candidate.toJSON === "function"
            ? event.candidate.toJSON()
            : {
                candidate: event.candidate.candidate,
                sdpMid: event.candidate.sdpMid,
                sdpMLineIndex: event.candidate.sdpMLineIndex,
                usernameFragment: event.candidate.usernameFragment,
              };

        this.#sendSignal(roomId, remoteUserId, {
          type: "candidate",
          candidate: candidatePayload,
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.warn("[resenha] failed to send candidate", error);
        });
      } else {
        this.#flushQueuedSignals(roomId, remoteUserId).catch((error) => {
          // eslint-disable-next-line no-console
          console.warn("[resenha] failed to flush signal queue", error);
        });
      }
    };

    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === "complete") {
        this.#flushQueuedSignals(roomId, remoteUserId).catch((error) => {
          // eslint-disable-next-line no-console
          console.warn("[resenha] failed to flush signal queue", error);
        });
      }
    };

    pc.onicecandidateerror = (event) => {
      // eslint-disable-next-line no-console
      console.warn(
        `[resenha] ICE candidate error for user ${remoteUserId}`,
        event
      );
    };

    pc.onconnectionstatechange = () => {
      // eslint-disable-next-line no-console
      console.log(
        `[resenha] connectionState ${pc.connectionState} for user ${remoteUserId}`
      );
      if (pc.connectionState === "connected") {
        this.#clearOfferRetry(roomId, remoteUserId);
        this.#clearPeerRestart(roomId, remoteUserId);
        this.#clearConnectionTimeout(roomId, remoteUserId);
        return;
      }

      if (pc.connectionState === "failed") {
        this.#clearOfferRetry(roomId, remoteUserId);
        this.#clearConnectionTimeout(roomId, remoteUserId);
        this.#schedulePeerRestart(roomId, remoteUserId, { immediate: true });
        return;
      }

      if (pc.connectionState === "disconnected") {
        this.#schedulePeerRestart(roomId, remoteUserId);
        return;
      }

      if (pc.connectionState === "closed") {
        this.destroy(roomId, remoteUserId, { closeConnection: false });
      }
    };

    pc.oniceconnectionstatechange = () => {
      // eslint-disable-next-line no-console
      console.log(
        `[resenha] iceConnectionState ${pc.iceConnectionState} for user ${remoteUserId}`
      );
      if (pc.iceConnectionState === "failed") {
        this.#schedulePeerRestart(roomId, remoteUserId, { immediate: true });
      } else if (pc.iceConnectionState === "disconnected") {
        this.#schedulePeerRestart(roomId, remoteUserId);
      }
    };

    this.#startConnectionTimeout(roomId, remoteUserId, pc);

    return pc;
  }

  destroy(
    roomId,
    remoteUserId,
    { resetRestartAttempts = true, closeConnection = true } = {}
  ) {
    const peers = this.#peerConnections.get(roomId);
    const pc = peers?.get(remoteUserId);

    if (pc) {
      pc.ontrack = null;
      pc.onicecandidate = null;
      pc.onconnectionstatechange = null;
      pc.oniceconnectionstatechange = null;
      pc.onicegatheringstatechange = null;
      pc.onicecandidateerror = null;

      if (closeConnection) {
        try {
          pc.close();
        } catch {
          // ignore close errors
        }
      }

      peers.delete(remoteUserId);
    }

    this.#clearOfferRetry(roomId, remoteUserId);
    if (resetRestartAttempts) {
      this.#clearPeerRestart(roomId, remoteUserId);
    } else {
      this.#clearPeerRestartTimer(roomId, remoteUserId);
    }
    this.#clearConnectionTimeout(roomId, remoteUserId);
    this.#clearPendingCandidates(roomId, remoteUserId);
    this.#clearSignalQueue(roomId, remoteUserId);
    this.#onPeerDestroyed(roomId, remoteUserId);
  }

  destroyRoom(roomId) {
    const peers = this.#peerConnections.get(roomId);
    if (peers) {
      Array.from(peers.keys()).forEach((remoteUserId) => {
        this.destroy(roomId, remoteUserId);
      });
      this.#peerConnections.delete(roomId);
    }
  }

  async initiateOffer(roomId, remoteUserId) {
    const peers = this.#peerConnections.get(roomId);
    const pc = peers?.get(remoteUserId);

    if (!pc) {
      return;
    }

    if (pc.signalingState !== "stable") {
      // An inbound offer/answer is already mid-flight on this peer; the
      // inbound handler will drive negotiation. The connection timeout in
      // #startConnectionTimeout is the safety net if it stalls.
      // eslint-disable-next-line no-console
      console.log(
        `[resenha] skipping offer for user ${remoteUserId}: signalingState=${pc.signalingState}`
      );
      return;
    }

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.#sendSignal(roomId, remoteUserId, offer).catch((error) => {
        // eslint-disable-next-line no-console
        console.warn("[resenha] failed to send offer", error);
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[resenha] failed to create offer", error);
    }
  }

  scheduleOfferRetry(roomId, remoteUserId, delay = 400) {
    const key = PeerManager.peerKey(roomId, remoteUserId);

    if (this.#offerRetryTimers.has(key)) {
      return;
    }

    const attempts = this.#offerRetryAttempts.get(key) || 0;

    if (attempts >= PeerManager.#maxOfferRetries) {
      // eslint-disable-next-line no-console
      console.warn(
        `[resenha] max offer retries (${PeerManager.#maxOfferRetries}) reached for user ${remoteUserId}`
      );
      return;
    }

    const actualDelay = Math.min(
      delay * Math.pow(2, attempts),
      PeerManager.#maxOfferRetryDelayMs
    );

    // eslint-disable-next-line no-console
    console.log(
      `[resenha] scheduling offer retry for user ${remoteUserId} (attempt ${attempts + 1}/${PeerManager.#maxOfferRetries}, delay ${actualDelay}ms)`
    );

    const timer = setTimeout(async () => {
      this.#offerRetryTimers.delete(key);
      this.#offerRetryAttempts.set(key, attempts + 1);
      await this.initiateOffer(roomId, remoteUserId);
    }, actualDelay);

    this.#offerRetryTimers.set(key, timer);
  }

  clearOfferRetry(roomId, remoteUserId) {
    this.#clearOfferRetry(roomId, remoteUserId);
  }

  clearPeerRestart(roomId, remoteUserId) {
    this.#clearPeerRestart(roomId, remoteUserId);
  }

  queuePendingCandidate(roomId, remoteUserId, candidate) {
    const key = PeerManager.peerKey(roomId, remoteUserId);
    const queue = this.#pendingCandidates.get(key) || [];
    queue.push(candidate);
    this.#pendingCandidates.set(key, queue);
    // eslint-disable-next-line no-console
    console.log(
      `[resenha] queued ICE candidate for user ${remoteUserId} (${queue.length} pending)`
    );
  }

  async flushPendingCandidates(roomId, remoteUserId, pc) {
    const key = PeerManager.peerKey(roomId, remoteUserId);
    const candidates = this.#pendingCandidates.get(key);

    if (!candidates?.length) {
      return;
    }

    this.#pendingCandidates.delete(key);
    // eslint-disable-next-line no-console
    console.log(
      `[resenha] flushing ${candidates.length} queued ICE candidates for user ${remoteUserId}`
    );

    for (const candidate of candidates) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          `[resenha] failed to add queued ICE candidate for user ${remoteUserId}`,
          error
        );
      }
    }
  }

  async restart(roomId, remoteUserId) {
    if (!this.#shouldRestartPeer(roomId, remoteUserId)) {
      this.#clearPeerRestart(roomId, remoteUserId);
      return;
    }

    this.destroy(roomId, remoteUserId, { resetRestartAttempts: false });

    await this.create(roomId, remoteUserId);

    if (!this.#shouldRestartPeer(roomId, remoteUserId)) {
      this.destroy(roomId, remoteUserId);
      return;
    }

    await this.initiateOffer(roomId, remoteUserId);
  }

  destroyAll() {
    for (const [roomId, peers] of this.#peerConnections) {
      for (const remoteUserId of Array.from(peers.keys())) {
        this.destroy(roomId, remoteUserId);
      }
    }
    this.#peerConnections.clear();

    this.#peerReconnectTimers.forEach((timer) => clearTimeout(timer));
    this.#peerReconnectTimers.clear();
    this.#offerRetryTimers.forEach((timer) => clearTimeout(timer));
    this.#offerRetryTimers.clear();
    this.#offerRetryAttempts.clear();
    this.#restartAttempts.clear();
    this.#connectionTimeouts.forEach((timer) => clearTimeout(timer));
    this.#connectionTimeouts.clear();
    this.#pendingCandidates.clear();
  }

  // --- private ---

  #startConnectionTimeout(roomId, remoteUserId, pc) {
    const key = PeerManager.peerKey(roomId, remoteUserId);

    if (this.#connectionTimeouts.has(key)) {
      return;
    }

    const timer = setTimeout(() => {
      this.#connectionTimeouts.delete(key);

      if (
        pc.connectionState !== "connected" &&
        pc.connectionState !== "closed"
      ) {
        // eslint-disable-next-line no-console
        console.warn(
          `[resenha] connection timeout (${PeerManager.#connectionTimeoutMs}ms) for user ${remoteUserId}, state: ${pc.connectionState}`
        );
        this.#schedulePeerRestart(roomId, remoteUserId, { immediate: true });
      }
    }, PeerManager.#connectionTimeoutMs);

    this.#connectionTimeouts.set(key, timer);
  }

  #clearConnectionTimeout(roomId, remoteUserId) {
    const key = PeerManager.peerKey(roomId, remoteUserId);
    const timer = this.#connectionTimeouts.get(key);

    if (timer) {
      clearTimeout(timer);
      this.#connectionTimeouts.delete(key);
    }
  }

  #clearOfferRetry(roomId, remoteUserId) {
    const key = PeerManager.peerKey(roomId, remoteUserId);
    const timer = this.#offerRetryTimers.get(key);

    if (timer) {
      clearTimeout(timer);
      this.#offerRetryTimers.delete(key);
    }

    this.#offerRetryAttempts.delete(key);
  }

  #schedulePeerRestart(roomId, remoteUserId, options = {}) {
    const key = PeerManager.peerKey(roomId, remoteUserId);

    if (this.#peerReconnectTimers.has(key)) {
      return;
    }

    const attempts = this.#restartAttempts.get(key) || 0;

    if (attempts >= PeerManager.#maxRestartAttempts) {
      // eslint-disable-next-line no-console
      console.warn(
        `[resenha] max restart attempts (${PeerManager.#maxRestartAttempts}) reached for user ${remoteUserId}`
      );
      return;
    }

    const baseDelay = options.immediate ? 200 : 1500;
    const delay = Math.min(baseDelay * Math.pow(2, attempts), 5000);

    // eslint-disable-next-line no-console
    console.log(
      `[resenha] scheduling peer restart for user ${remoteUserId} (attempt ${attempts + 1}/${PeerManager.#maxRestartAttempts}, delay ${delay}ms)`
    );

    const timer = setTimeout(() => {
      this.#peerReconnectTimers.delete(key);
      this.#restartAttempts.set(key, attempts + 1);
      this.restart(roomId, remoteUserId).catch((error) => {
        // eslint-disable-next-line no-console
        console.warn("[resenha] failed to restart peer connection", error);
      });
    }, delay);

    this.#peerReconnectTimers.set(key, timer);
  }

  #clearPeerRestart(roomId, remoteUserId) {
    this.#clearPeerRestartTimer(roomId, remoteUserId);
    this.#restartAttempts.delete(PeerManager.peerKey(roomId, remoteUserId));
  }

  #clearPeerRestartTimer(roomId, remoteUserId) {
    const key = PeerManager.peerKey(roomId, remoteUserId);
    const timer = this.#peerReconnectTimers.get(key);

    if (timer) {
      clearTimeout(timer);
      this.#peerReconnectTimers.delete(key);
    }
  }

  #clearPendingCandidates(roomId, remoteUserId) {
    const key = PeerManager.peerKey(roomId, remoteUserId);
    this.#pendingCandidates.delete(key);
  }
}
