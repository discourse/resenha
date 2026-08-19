# Resenha Voice Rooms

Resenha is a Discourse plugin that adds Discord-style voice rooms powered by WebRTC. Rooms appear in the sidebar; users join or leave with a single click and talk peer-to-peer — no media goes through the Discourse server. Sites that need bigger calls can optionally route rooms through a self-hosted [LiveKit](https://livekit.io) media server.

> **Status:** early alpha — test with small groups before opening to a full community.

## Features

- **Sidebar-first UX** — click a room to join/leave, see live participant avatars with speaking indicators, all without a route change.
- **Mute, deafen, and per-user volume** — right-click any participant (or use the kebab menu) for audio controls. Room managers can kick participants.
- **Voice settings with mic test** — input/output device pickers, a live input level meter, and an input sensitivity gate that stops transmitting below a chosen level. Preferences persist per device via `localStorage`.
- **User room creation** — users in the allowed group see a "+" button to create rooms directly from the sidebar; room creators and managers can edit rooms in-app.
- **Direct calls** — allowed users can call someone from their user card or profile.
- **Themed audio cues** — synthesized tones for calls, connect/disconnect, user join/leave, and mute/deafen toggles follow each listener's existing **Chat notifications** sound choice. **None**, missing, or legacy choices use **Classic and clean**.
- **Noise suppression** — optional DTLN-based background noise filtering via WebAssembly. See [Noise Suppression](#noise-suppression).
- **Live subtitles** — optional viewer-side captions powered by NVIDIA Parakeet speech recognition running locally via WebGPU. See [Live Subtitles](#live-subtitles).
- **Video and screen sharing** — optional, off by default. Each room gets a full page at `/resenha/r/<slug>` with a tile grid; camera and screen share toggle without renegotiation, and senders only encode toward peers who are actually watching the page. Rooms can opt out individually. See [Video](#video).
- **Video settings with background blur** — a per-room video settings modal with a live preview, camera device picker, and MediaPipe-powered background blur with an adjustable strength slider. See [Background Blur](#background-blur).
- **Pure browser WebRTC** — signaling through Discourse + MessageBus; media stays peer-to-peer, no SFU/MCU required.
- **Optional LiveKit SFU** — point the plugin at a self-hosted LiveKit server and route all rooms (or individually opted-in rooms) through it for enterprise-scale calls; everything else keeps working identically. See [LiveKit](#livekit-media-server-sfu).

## Installation

1. Clone into your `plugins` directory: `git clone https://github.com/xfalcox/resenha.git plugins/resenha`
2. Rebuild or restart Discourse.
3. Enable via **Admin > Settings > Plugins > resenha enabled**.

The plugin seeds a default "Watercooler" room on first enable.

## Configuration

| Setting                              | Description                                                                          |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| `resenha_enabled`                    | Master switch.                                                                       |
| `resenha_allowed_groups`             | Groups that can access voice rooms (default: everyone).                              |
| `resenha_create_room_allowed_groups` | Groups that can create new rooms (default: admins, moderators, TL2).                 |
| `resenha_max_rooms_per_user`         | Max rooms per creator (default 5).                                                   |
| `resenha_participant_ttl_seconds`    | Redis presence TTL in seconds (default 30). Client heartbeat refreshes every 10s.    |
| `resenha_video_enabled`              | Allow camera video and screen sharing (default off). Rooms can opt out individually. |
| `resenha_video_max_publishers`       | Max simultaneous video/screen publishers per room (default 8).                       |
| `resenha_video_background_blur_enabled` | Allow users to blur their camera background (default on; requires video).        |
| `resenha_stun_servers`               | STUN server addresses (pipe-separated).                                              |
| `resenha_turn_servers`               | TURN server addresses for NAT traversal.                                             |
| `resenha_livekit_url`                | WebSocket URL of a self-hosted LiveKit server (empty = mesh only).                   |
| `resenha_livekit_api_key` / `_api_secret` | LiveKit API credentials used to sign short-lived room tokens.                   |
| `resenha_livekit_room_policy`        | Which rooms use LiveKit: `disabled` (default), `per_room`, or `all_rooms`.           |

## Video

When `resenha_video_enabled` is on (and the room's own video toggle is too), the room view at `/resenha/r/<slug>` shows a video grid alongside the usual controls. Audio joins stay sidebar-first and unchanged; video lives on the page.

- Still pure mesh: a video m-line is pre-negotiated on every peer connection, so toggling the camera or a screen share is a `replaceTrack` with no renegotiation.
- Senders attach video only toward participants currently on the room page (`watching_video` presence flag) — every skipped peer saves a full encoder session.
- Encoding quality scales down with watcher count (720p ≤3 watchers, 480p ≤6, 360p beyond) and is capped by `resenha_video_max_publishers`.
- Camera and screen share are mutually exclusive per user. Stage rooms do not support video yet.
- On LiveKit-routed rooms the mesh details above are handled by the SFU instead: each track is published once with simulcast, and per-watcher gating happens on the subscriber side. The UI, the `watching_video` flag, and the publisher cap behave identically.

See `docs/roadmap/video-screenshare.md` for the full design.

### Screen sharing troubleshooting

Screen sharing has more environmental dependencies than the camera, and failures surface as a generic `NotAllowedError` in the browser console:

- **Linux on Wayland**: capture goes through `xdg-desktop-portal` + PipeWire. If the picker never appears and the error is instant, check `systemctl --user is-active graphical-session.target xdg-desktop-portal` — a compositor session that isn't wired into systemd (common on minimal window manager setups) leaves the portal unable to start. The camera is unaffected, which makes this easy to misread as an application bug.
- **macOS Firefox**: needs Screen Recording permission in System Settings, and only picks it up after a full browser restart.
- **Insecure dev origins**: `getDisplayMedia` hard-requires a secure context. Firefox's `about:config` overrides that unlock `getUserMedia` on plain-http dev hosts do **not** extend to screen capture — use `https://` or a `localhost` origin.

## Background Blur

Camera publishers can blur their background from the video settings modal (cog menu on the room page). Person segmentation runs entirely on the publisher's device using [MediaPipe](https://github.com/google-ai-edge/mediapipe) selfie segmentation (Apache-2.0), compiled to WebAssembly — no media leaves the browser unprocessed, and viewers pay no extra cost.

```
Camera → hidden <video> → MediaPipe ImageSegmenter (person mask)
       → canvas composite (blurred frame + sharp person cutout)
       → canvas.captureStream() → WebRTC peers
```

The blur strength slider adjusts the composite live; the toggle swaps tracks on all peers via `replaceTrack` without renegotiation. Preferences persist per device via `localStorage`.

The MediaPipe runtime, wasm binaries, and the `selfie_segmenter.tflite` model (all Apache-2.0, © Google) are vendored under `public/javascripts/mediapipe/`. To re-fetch or bump versions:

```bash
cd plugins/resenha && bash scripts/fetch-mediapipe-assets.sh
```

The script pins the `@mediapipe/tasks-vision` npm version and the model version, and verifies the model's SHA-256 checksum.

## LiveKit media server (SFU)

By default media is pure peer-to-peer, which is ideal for small rooms but scales upstream bandwidth with room size. Deploy your own [LiveKit](https://livekit.io) server and set `resenha_livekit_url`, `resenha_livekit_api_key`, `resenha_livekit_api_secret`, and `resenha_livekit_room_policy` to route rooms through it — each participant then publishes every track exactly once, whatever the room size.

- The server picks each call's transport when its first participant joins and pins it for the whole call; a room is never split across transports, and setting changes only affect the next call.
- Presence, sessions, stats, mute/deafen/PTT, noise suppression, and background blur are transport-independent — they behave identically on both paths.
- The pinned `livekit-client` SDK is vendored under `public/javascripts/livekit/` (rebuild with `scripts/build-livekit-bundle.sh`) and is only ever loaded in the browser for LiveKit-routed rooms — mesh installs ship zero LiveKit bytes.

See [docs/livekit.md](docs/livekit.md) for the full deployment runbook (provisioning, firewall/CSP notes, verification, emergency levers) and the manual browser checklist.

## Noise Suppression

Selectable AI noise-suppression engines running as WebAssembly AudioWorklets. Users pick a mode (None / Standard / an AI engine) from the voice settings modal or the mic button's dropdown; a badge on the mic button shows while an AI engine is confirmed active. The preference persists per device via `localStorage`. In AI modes the browser's native `noiseSuppression` constraint is turned off so filters never stack.

| Engine | Source | Assets | Profile |
|---|---|---|---|
| RNNoise | [xiph/rnnoise](https://github.com/xiph/rnnoise) @ v0.1.1 (classic model) | ~130KB wasm | lightweight, lowest CPU |
| DTLN | [dtln-rs](https://github.com/DataDog/dtln-rs) | ~6MB wasm | balanced |
| DeepFilterNet3 | [DeepFilterNet](https://github.com/Rikorose/DeepFilterNet) via tract | ~9.5MB wasm + 8MB model | best quality, highest CPU |

```
Microphone → AudioContext → AudioWorkletNode (engine) → MediaStreamDestination → WebRTC peers
```

All engines share one worklet runtime (`src/ns-worklet/runtime.js`) and protocol: the main thread fetches the engine's assets and posts the bytes to the worklet, which instantiates them and answers a `ready` handshake once a warm-up denoise succeeds — only then is the suppressed track published, so an enabled mode always means the filter is really running.

Pre-built, content-hashed assets are committed under `public/javascripts/<engine>/`, with their URLs in the generated manifests under `assets/javascripts/discourse/lib/resenha/ns-assets/`. Each build script clones its upstream at a pinned commit (applying patches from `src/<engine>-worklet/patches/` where needed):

```bash
cd plugins/resenha
bash scripts/build-rnnoise-worklet.sh  # emcc (standalone wasm)
bash scripts/build-dtln-worklet.sh     # Rust + Emscripten
bash scripts/build-dfn3-worklet.sh     # Rust + wasm-pack

# Verify a built engine end-to-end in headless Chromium:
node scripts/smoke-ns-worklet.mjs <rnnoise|dtln|dfn3>
```

## Live Subtitles

Opt-in, viewer-side captions: the user who enables subtitles transcribes the remote audio they already receive with [parakeet.js](https://github.com/ysdede/parakeet.js) (NVIDIA Parakeet TDT 0.6b v3, multilingual) — no audio leaves the browser and nothing is required from the other participants, on either transport.

```
remote stream → Silero VAD (per participant) → utterance PCM → Worker (Parakeet, WebGPU) → caption overlay
```

Each remote mic stream gets a [Silero VAD](https://github.com/ricky0123/vad) finding utterance boundaries; while a speaker keeps talking, the utterance-so-far is re-transcribed every ~1.5s as a provisional line that updates in place, and the speech-end pass finalizes it. Utterances are transcribed by one shared model in a Web Worker (fp32 encoder on WebGPU, int8 decoder on single-threaded WASM — fp16 encoders silently produce empty transcriptions on some GPU stacks, and multithreaded WASM would require COOP/COEP headers). Requires WebGPU; gated by the `resenha_subtitles_enabled` site setting.

The runtime bundles (worker, VAD, onnxruntime, ~41 MB) are pinned and committed under `public/javascripts/stt/` by `scripts/build-stt-assets.sh`. The ~2.5 GB model weights are **not** committed: they download on first use from Discourse's HuggingFace repository (kept in a durable Cache API store), or from a self-hosted mirror configured via `resenha_stt_model_base_url` — see [docs/subtitles-model-mirror.md](docs/subtitles-model-mirror.md) for what to mirror and how.

```bash
bash scripts/build-stt-assets.sh

# End-to-end check (real model, WebGPU, persistent profile caches the download):
flite -t "the quick brown fox jumps over the lazy dog" /tmp/fix.wav
node scripts/smoke-stt-worker.mjs /tmp/fix.wav
```

## Development

```bash
bin/rspec plugins/resenha/spec          # Ruby specs
bin/lint plugins/resenha                # JS/SCSS/Ruby lint
```

Key entry points:

- `app/controllers/resenha/rooms_controller.rb` — room CRUD, signaling relay, participant state (mute/deafen/video/watching)
- `app/controllers/resenha/page_controller.rb` — serves the full-page room view at `/resenha/r/:slug`
- `lib/resenha/guardian_extension.rb` — authorization (group-based access and room creation permissions)
- `assets/javascripts/discourse/app/services/resenha-webrtc.js` — WebRTC orchestration, audio controls, video/screen-share publishing, sound effects
- `assets/javascripts/discourse/initializers/resenha-sidebar.js` — sidebar section, click/context-menu handlers
- `assets/javascripts/discourse/components/resenha/room-page.gjs` — room page: tile grid, call controls, watching lifecycle

## Known Limitations

- The default peer-to-peer topology means large rooms may hit browser limits; rooms that outgrow it need a [LiveKit server](docs/livekit.md).
- No call recording or moderation tools beyond kick and the admin "End call" action.
