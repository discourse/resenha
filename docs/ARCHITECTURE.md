# Resenha Plugin Architecture

Resenha adds lightweight WebRTC voice rooms to Discourse without proxying audio/video through the server. Media runs over one of two transports — the default peer-to-peer mesh, or an optional self-hosted [LiveKit](https://livekit.io) SFU (see [livekit.md](./livekit.md)) — while everything else (presence, sessions, roster, moderation) is transport-independent. It consists of the following layers:

## Backend

- **Models**
  - `Resenha::Room`: describes each voice space and keeps ownership, slug, visibility, and capacity metadata. Creator is automatically promoted to room moderator.
  - `Resenha::RoomMembership`: links users to rooms while storing participant/moderator roles.
- **Services**
  - `Resenha::ParticipantTracker`: stores the list of actively connected users per room in Redis with a short TTL. Join/leave actions refresh MessageBus subscribers. Also pins each live call's transport (`mesh` or `livekit`) so every participant of a call is on the same one; the pin clears when the room empties.
  - `Resenha::RoomBroadcaster`: emits participant snapshots to `/resenha/rooms/:id` MessageBus channels so Ember clients can update sidebars in real time.
  - `Resenha::DirectoryBroadcaster`: keeps the sidebar list in sync across clients by broadcasting CRUD events to `/resenha/rooms/index`.
  - `Resenha::SignalRelay`: relays raw WebRTC SDP/ICE payloads between peers via MessageBus without touching media data (mesh rooms only).
  - `Resenha::Livekit`: mints short-lived, least-privilege LiveKit access tokens (HS256 JWT) and resolves whether a room is eligible for the SFU per `resenha_livekit_room_policy`. `Resenha::Livekit::RoomServiceClient` mirrors kicks, role changes, and room deletion to the LiveKit server best-effort via Twirp-JSON.
- **Controllers**
  - `RoomsController` exposes CRUD, join/leave, participant, and signaling endpoints.
  - `RoomMembershipsController` lets moderators manage explicit memberships.
- **Authorization**
  - Guardian extensions gate room visibility, membership, and management. Site settings define who can create/manage rooms and cap per-user ownership tallies.

## Frontend

- **Services**
  - `resenha-rooms`: fetches initial room data, subscribes to MessageBus channels, updates tracked sidebar state, and forwards participant events to the UI.
  - `resenha-webrtc`: manages `navigator.mediaDevices` capture, maintains one `RTCPeerConnection` per peer (mesh) or one `LivekitRoomSession` per room (LiveKit), exchanges offers/answers/candidates through the `signal` endpoint on mesh rooms, and keeps remote audio elements synced. Both transports feed the same remote-media registry, so every component downstream is transport-agnostic; the vendored `livekit-client` bundle is dynamically imported only when a LiveKit room is joined.
- **Sidebar Integration**
  - `resenha-sidebar` initializer registers a sidebar section with custom links for each room. Each link swaps its label with inline avatar thumbnails (plus a counter) so active participants are visible without modifying core sidebar components.
- **Room UI**
  - `resenha-room` route/controller fetch full room metadata, render participant lists, and command the WebRTC service to join/leave rooms. `Resenha::VoiceCanvas` mounts `<audio>` sinks for local and remote streams during active calls.

## Message Flow

1. User joins a room → `POST /resenha/rooms/:id/join` resolves the call's transport (pinned in Redis for the call's lifetime), adds them to Redis, and broadcasts the participants list. For LiveKit calls the response also carries the server URL and a short-lived access token.
2. Clients refresh presence with `POST /resenha/rooms/:id/heartbeat` every 10 seconds (TTL is 30 seconds) without re-broadcasting participants.
3. On mesh calls, each participant receiving the broadcast spins up `RTCPeerConnection` objects (only lower user IDs send offers to avoid glare) and relays SDP/ICE payloads via `POST /resenha/rooms/:id/signal`. On LiveKit calls the client instead opens a single connection to the SFU and publishes/subscribes there; the `signal` endpoint rejects payloads for those rooms.
4. Audio flows directly peer-to-peer (or through the site's own LiveKit server); Discourse only transports JSON signaling events.
5. Sidebar avatars and the room screen update automatically as MessageBus notifications arrive — the roster is driven by Redis presence on both transports, never by media state.
