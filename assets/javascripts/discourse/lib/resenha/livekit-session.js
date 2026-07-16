// LiveKit room session.
//
// One instance per active room on the "livekit" transport, owned by the
// resenha-webrtc service. Bridges the vendored livekit-client SDK to the
// same callbacks PeerManager uses, so the remote-media registry and every
// UI component work unchanged on both transports. Callback-injected in the
// same style as PeerManager; a fake SDK module can be injected via `loadSdk`
// (or the module-level test override), which is what makes it unit-testable.

import getURL from "discourse/lib/get-url";

// The SDK bundle sits in the plugin's public dir, which static asset CDNs
// never receive. Anchor to the page URL because this compiled chunk may
// itself be served from a CDN origin, and a dynamic import() of a bare path
// would resolve against the chunk's origin, not the site's. The loaded
// module stays resident so rejoins are instant; never evaluated for mesh
// rooms.
let sdkPromise = null;
let sdkLoaderOverride = null;

// Reconnect ladder: wait entry N, then mint a fresh token and connect.
let reconnectDelaysMs = [0, 1000, 2000];

async function defaultLoadSdk() {
  sdkPromise ||= import(
    /* @vite-ignore */
    new URL(
      getURL("/plugins/resenha/javascripts/livekit/livekit-client.mjs"),
      window.location
    ).href
  );

  try {
    return await sdkPromise;
  } catch (error) {
    // Allow a retry after a transient failure (e.g. offline asset fetch).
    sdkPromise = null;
    throw error;
  }
}

export function setLivekitSdkLoaderForTesting(loader) {
  sdkLoaderOverride = loader;
  sdkPromise = null;
}

export function setLivekitReconnectDelaysForTesting(delays) {
  reconnectDelaysMs = delays ?? [0, 1000, 2000];
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default class LivekitRoomSession {
  // Cheap pre-load check so obviously unsupported browsers fail with a
  // translated toast instead of a dynamic-import error; the SDK's own
  // isBrowserSupported() runs again after the bundle loads.
  static isBrowserSupported() {
    return (
      typeof RTCPeerConnection !== "undefined" &&
      typeof WebSocket !== "undefined"
    );
  }

  #roomId;
  #currentUserId;
  #loadSdk;
  #getLocalStream;
  #onTrack;
  #onParticipantGone;
  #onDisconnected;
  #onConnectionChange;
  #mintToken;

  #sdk = null;
  #room = null;
  #micPublication = null;
  #closed = false;
  #reconnecting = false;

  constructor({
    roomId,
    currentUserId,
    loadSdk,
    getLocalStream,
    onTrack,
    onParticipantGone,
    onDisconnected,
    onConnectionChange,
    mintToken,
  }) {
    this.#roomId = roomId;
    this.#currentUserId = currentUserId;
    this.#loadSdk = loadSdk ?? sdkLoaderOverride ?? defaultLoadSdk;
    this.#getLocalStream = getLocalStream;
    this.#onTrack = onTrack;
    this.#onParticipantGone = onParticipantGone;
    this.#onDisconnected = onDisconnected;
    this.#onConnectionChange = onConnectionChange;
    this.#mintToken = mintToken;
  }

  async connect(wsUrl, token) {
    this.#sdk ||= await this.#loadSdk();

    if (
      typeof this.#sdk.isBrowserSupported === "function" &&
      !this.#sdk.isBrowserSupported()
    ) {
      const error = new Error("LiveKit is not supported in this browser");
      error.unsupportedBrowser = true;
      throw error;
    }

    // adaptiveStream keys quality off attached-element visibility, which is
    // incompatible with service-owned elements (it would pause "invisible"
    // video); subscriber-side quality is managed explicitly instead.
    const room = new this.#sdk.Room({
      adaptiveStream: false,
      dynacast: true,
    });

    this.#wireRoomEvents(room);

    try {
      await room.connect(wsUrl, token);
    } catch (error) {
      room.removeAllListeners?.();
      throw error;
    }

    // The session may have been torn down while the connect was in flight
    // (superseded join, leave); adopting the room now would leave a ghost
    // connection to the SFU that nothing owns.
    if (this.#closed) {
      room.removeAllListeners?.();
      try {
        await room.disconnect();
      } catch {
        // Nothing to clean up.
      }
      return;
    }

    this.#room = room;
    this.#micPublication = null;
    await this.#publishMicrophone();
  }

  async disconnect() {
    this.#closed = true;
    const room = this.#room;
    this.#room = null;
    this.#micPublication = null;

    try {
      await room?.disconnect();
    } catch {
      // The room may already be closed; nothing to clean up.
    }
  }

  // NS toggle, mic device switch, and gate crossings produce a brand-new
  // outgoing track; move the live publication onto it.
  async replaceAudioTrack(track) {
    if (!this.#room || !track) {
      return;
    }

    if (this.#micPublication?.track) {
      await this.#micPublication.track.replaceTrack(track);
    } else {
      await this.#publishMicrophone();
    }
  }

  // The SFU doesn't consult the plugin's roster, so a participant expelled
  // from it can still hold live subscriptions; drop them explicitly.
  dropParticipant(userId) {
    const participant = this.#room?.remoteParticipants?.get(String(userId));

    participant?.trackPublications?.forEach((publication) => {
      try {
        publication.setSubscribed(false);
      } catch {
        // Already unsubscribed or tearing down.
      }
    });
  }

  // Terminal-disconnect recovery: up to three attempts, each awaiting a
  // freshly minted token (the old one is likely past its 10-minute TTL).
  // Resolves "reconnected", "gone" (server says the room instance ended),
  // "aborted" (session torn down mid-ladder), or "failed" (exhausted).
  async reconnectWithToken() {
    if (this.#reconnecting) {
      return "failed";
    }
    this.#reconnecting = true;

    try {
      for (const delayMs of reconnectDelaysMs) {
        if (delayMs > 0) {
          await wait(delayMs);
        }
        if (this.#closed) {
          return "aborted";
        }

        let minted;
        try {
          minted = await this.#mintToken();
        } catch (error) {
          if ((error?.jqXHR?.status ?? error?.status) === 410) {
            return "gone";
          }
          continue;
        }

        if (this.#closed) {
          return "aborted";
        }

        try {
          await this.connect(minted.url, minted.token);
          return this.#closed ? "aborted" : "reconnected";
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn(
            `[resenha-livekit] reconnect attempt failed for room ${this.#roomId}`,
            error
          );
        }
      }

      return this.#closed ? "aborted" : "failed";
    } finally {
      this.#reconnecting = false;
    }
  }

  #userIdFrom(participant) {
    // LiveKit identity is String(user.id); registry keys must be numeric so
    // remoteStreamFor(roomId, userId) matches roster participant ids.
    const userId = Number(participant?.identity);
    if (!Number.isFinite(userId) || userId <= 0) {
      return null;
    }
    return userId === this.#currentUserId ? null : userId;
  }

  #wireRoomEvents(room) {
    const { RoomEvent, Track, DisconnectReason } = this.#sdk;

    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      const userId = this.#userIdFrom(participant);
      if (!userId) {
        return;
      }

      // A bare audio track (empty streams argument) is how screen audio is
      // told apart from mic audio in #registerRemoteTrack; every other kind
      // must arrive with a stream attached.
      const isScreenAudio =
        publication?.source === Track.Source.ScreenShareAudio;
      const streams = isScreenAudio
        ? []
        : [track.mediaStream ?? new MediaStream()];

      this.#onTrack(this.#roomId, userId, track.mediaStreamTrack, streams);
    });

    room.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
      const userId = this.#userIdFrom(participant);
      if (!userId) {
        return;
      }

      // Losing the microphone (server-side unpublish, e.g. a permission
      // revocation) drops the participant's media entry; it is rebuilt from
      // scratch if the mic is ever re-subscribed. Video and screen-audio
      // subscriptions come and go with watching state, so they must not
      // tear the entry down.
      if (publication?.source === Track.Source.Microphone) {
        this.#onParticipantGone(this.#roomId, userId);
      }
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      const userId = this.#userIdFrom(participant);
      if (userId) {
        this.#onParticipantGone(this.#roomId, userId);
      }
    });

    room.on(RoomEvent.Disconnected, (reason) => {
      if (room !== this.#room || this.#closed) {
        return;
      }

      this.#room = null;
      this.#micPublication = null;

      if (reason === DisconnectReason.CLIENT_INITIATED) {
        return;
      }

      const kind =
        reason === DisconnectReason.DUPLICATE_IDENTITY
          ? "duplicate_identity"
          : "terminal";
      this.#onDisconnected(kind, DisconnectReason[reason] ?? String(reason));
    });

    room.on(RoomEvent.Reconnecting, () => {
      // eslint-disable-next-line no-console
      console.log(
        `[resenha-livekit] connection interrupted for room ${this.#roomId}; SDK is resuming`
      );
      this.#onConnectionChange("reconnecting");
    });

    room.on(RoomEvent.Reconnected, () => {
      // eslint-disable-next-line no-console
      console.log(
        `[resenha-livekit] connection resumed for room ${this.#roomId}`
      );
      this.#onConnectionChange("connected");
    });
  }

  async #publishMicrophone() {
    const track = this.#getLocalStream?.()?.getAudioTracks?.()?.[0];
    if (!track || !this.#room) {
      return;
    }

    try {
      // The pipeline's processed tracks publish as-is; mute/PTT keep
      // flipping track.enabled, so the SFU carries DTX-suppressed silence
      // instead of a mute/unmute renegotiation.
      this.#micPublication = await this.#room.localParticipant.publishTrack(
        track,
        {
          source: this.#sdk.Track.Source.Microphone,
          dtx: true,
          red: true,
        }
      );
    } catch (error) {
      // A rejected publish (e.g. a stale token after a role change) must
      // not fail the join — the user can still listen.
      // eslint-disable-next-line no-console
      console.warn(
        `[resenha-livekit] failed to publish microphone for room ${this.#roomId}`,
        error
      );
    }
  }
}
