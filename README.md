# Resenha Voice Rooms

Resenha is an experimental Discourse plugin that adds Discord-style voice rooms powered entirely by WebRTC. Once enabled, staff can curate voice rooms that appear in the Discourse sidebar; users join or leave a room with a single click and establish peer-to-peer audio sessions without any media going through the Discourse server.

> **Status:** early alpha. Expect rough edges and plan to test with small groups before opening to a full community.

## Feature Highlights

- **Sidebar-first UX** – rooms show up under a “Voice rooms” section; clicking a room toggles join/leave without a route change.
- **Watercooler out of the box** – enabling the plugin seeds a default room so communities can try voice immediately.
- **Live presence** – avatars of active participants render directly under each room name, update in real time, and show a green outline whenever a participant is speaking.
- **Audio cues** – subtle synthesized tones let you know when you connect/disconnect and when others join or leave your room.
- **Room + membership management** – REST endpoints allow trusted users to create/update/delete rooms, adjust membership roles, and control visibility.
- **Pure browser WebRTC** – all signaling happens through Discourse + MessageBus; media stays peer-to-peer so no SFU/MCU infrastructure is required.

## Installation

1. Add the plugin to your app’s `plugins` directory (e.g. via `git clone https://github.com/discourse/resenha.git plugins/resenha`).
2. Rebuild or restart Discourse so the plugin is compiled.
3. Enable the feature via **Admin > Settings > Plugins > resenha enabled**.

Once the site setting flips on, the plugin seeds a default “Watercooler” room and exposes the REST API at `/resenha`.

## Configuration

| Setting | Description |
| --- | --- |
| `resenha_enabled` | Master switch. When true we mount the engine, seed the default room, expose the API, and load the Ember sidebar section. |
| `resenha_allow_trust_level` | Minimum trust level required to create/manage rooms. Defaults to TL2. |
| `resenha_max_rooms_per_user` | Hard cap on how many rooms a single creator can own (default 5). |
| `resenha_participant_ttl_seconds` | Number of seconds participant presence is kept in Redis before expiring (default 30). A client-side heartbeat refreshes presence every 10 seconds. |
| `resenha_noise_suppression` | When true, users can opt into DTLN-based noise suppression via their participant menu. See [Noise Suppression](#noise-suppression). |

All settings live under **Admin > Settings > Plugins**.

## Using Voice Rooms

1. Visit any Discourse page with the sidebar visible. A **Voice rooms** section appears as soon as at least one room exists.
2. Click a room name to join. A spinner appears in the sidebar while the microphone is acquired and WebRTC peers are set up. Clicking a room while it is connecting is ignored (no double-join).
3. Once connected, the spinner disappears, the room link becomes active, and an ascending chime confirms the connection. Clicking again leaves the room with a descending chime.
4. Speaking detection is performed per stream in the browser; avatars get a green outline (and bold username) when RMS levels exceed the threshold.
5. When another participant joins or leaves, you hear a brief tone (high for join, low for leave) so you stay aware of room changes without looking at the screen.

Rooms are currently “button-only” UI – there is no `/resenha/rooms` page exposed to end users. Moderation and CRUD flows are provided through the REST API or future staff UI.

## REST API Overview

All endpoints are namespaced under `/resenha` and respect the regular CSRF/session requirements.

| Endpoint | Purpose |
| --- | --- |
| `GET /resenha/rooms.json` | List rooms visible to the current user (guards via `Guardian#can_see_resenha_room?`). |
| `POST /resenha/rooms` | Create a room (enforces TL via `resenha_allow_trust_level` and per-user quotas). |
| `PUT /resenha/rooms/:id` | Update name/description/visibility. |
| `DELETE /resenha/rooms/:id` | Delete a room. |
| `POST /resenha/rooms/:id/join` / `DELETE .../leave` | Mark presence and trigger participant broadcasts. |
| `POST /resenha/rooms/:id/heartbeat` | Refresh presence TTL without re-broadcasting participants. |
| `POST /resenha/rooms/:id/signal` | WebRTC signaling relay. Payload must include `recipient_id` plus SDP/candidate data. |
| `GET/POST/PUT/DELETE /resenha/rooms/:room_id/memberships` | Manage room memberships/roles. |

Serializers live under `app/serializers/resenha`, and authorization is handled via `Resenha::GuardianExtension`.

## Architecture Notes

- **Backend:** `Resenha::RoomsController` and `Resenha::RoomMembershipsController` expose CRUD endpoints; `Resenha::ParticipantTracker` keeps Redis-backed presence and broadcasts via `Resenha::RoomBroadcaster` / `Resenha::DirectoryBroadcaster`.
- **Frontend:** Ember services `resenha-rooms` (presence + MessageBus) and `resenha-webrtc` (media, signaling, speaking detection) drive the sidebar component declared in `initializers/resenha-sidebar.js`.
- **Sidebar UI:** `resenha/participant-avatars` component renders real-time participant lists. Speaking state is derived from local audio monitors and MessageBus payloads, giving instant feedback while remaining consistent when authoritative data arrives.

## Noise Suppression

Resenha ships optional DTLN-based noise suppression powered by [dtln-rs](https://github.com/DataDog/dtln-rs), a Rust implementation of the Dual-Signal Transformation LSTM Network compiled to WebAssembly. When active, background noise (fans, typing, pets, etc.) is filtered from the user's microphone audio before it reaches other participants.

### How it works

The noise suppression pipeline is inserted between `getUserMedia` and the WebRTC peer connections:

```
Microphone → AudioContext → AudioWorkletNode (dtln) → MediaStreamDestination → WebRTC peers
```

The AudioWorklet processor resamples audio from the browser's native sample rate down to 16 kHz (the rate the DTLN model expects), processes 512-sample frames through the WASM denoiser, and resamples the cleaned audio back up — all in real time on a dedicated audio thread.

### Configuration

1. **Admin setting** — Enable `resenha_noise_suppression` under **Admin > Settings > Plugins**. This controls whether the feature is available at all; it does not force it on for users.
2. **User opt-in** — Once the admin setting is enabled, connected users see a noise suppression toggle in their own participant kebab menu (right-click or hover menu on their avatar in the sidebar). The preference is stored in `localStorage` (`resenha:noise-suppression`) so it persists per device across sessions.
3. **Runtime toggle** — Users can enable or disable noise suppression mid-call without leaving the room. The audio track is swapped on all peer connections via `replaceTrack()`.

If the worklet fails to load or the admin setting is off, the plugin silently falls back to the raw microphone stream.

### Building the worklet

A pre-built bundle is committed at `public/javascripts/dtln-worklet.js`. You only need to rebuild it when updating the dtln-rs dependency.

**Prerequisites:** Rust toolchain, `wasm32-unknown-emscripten` target, Emscripten SDK, Node.js, and pnpm.

```bash
# Install the Rust target (one-time)
rustup target add wasm32-unknown-emscripten

# Build the worklet bundle
cd plugins/resenha
bash scripts/build-dtln-worklet.sh
```

The script clones dtln-rs into `vendor/dtln-rs`, compiles it to WASM via Emscripten, and bundles the result with the AudioWorklet processor using webpack. The output is a single self-contained JS file (~8.5 MB, ~5 MB gzipped) with the WASM binary embedded as base64.

### Key files

| File | Purpose |
| --- | --- |
| `public/javascripts/dtln-worklet.js` | Pre-built AudioWorklet bundle served at `/plugins/resenha/javascripts/dtln-worklet.js` |
| `src/dtln-worklet/noise-suppression-processor.js` | Worklet processor source (resampling + DTLN frame processing) |
| `src/dtln-worklet/webpack.config.js` | Webpack config for bundling the worklet |
| `scripts/build-dtln-worklet.sh` | End-to-end build script (clone, compile, bundle) |
| `vendor/dtln-rs/` | Cloned dtln-rs repo (gitignored) |

## Development

```bash
# Run Ruby specs for the plugin
bin/rspec plugins/resenha/spec

# Run JavaScript/SCSS lint for plugin files
bin/lint plugins/resenha
```

Helpful entry points:

- `app/controllers/resenha/rooms_controller.rb` – room CRUD + WebRTC signaling relay.
- `app/services/resenha` – participant tracker, message bus broadcasters, default room seeder.
- `assets/javascripts/discourse/app/services/resenha-rooms.js` – client-side presence store.
- `assets/javascripts/discourse/app/services/resenha-webrtc.js` – WebRTC/session orchestration.

Please run the linters before opening a PR and remember the plugin relies on modern browsers that ship WebRTC + Web Audio APIs.

## Known Limitations / Future Work

- No UI yet for staff to manage rooms/memberships—interact with the REST API or add custom admin screens.
- Pure peer-to-peer topology; large rooms may hit browser/network limits. Introducing TURN/SFU support is on the roadmap.
- No call recording, moderation tools, or spam controls beyond existing trust-level gating.

Contributions are welcome! Open an issue or PR with your proposed change so we can keep iterating on the Resenha voice experience.
