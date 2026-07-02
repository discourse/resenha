# Resenha Voice Rooms

Resenha is a Discourse plugin that adds Discord-style voice rooms powered by WebRTC. Rooms appear in the sidebar; users join or leave with a single click and talk peer-to-peer — no media goes through the Discourse server.

> **Status:** early alpha — test with small groups before opening to a full community.

## Features

- **Sidebar-first UX** — click a room to join/leave, see live participant avatars with speaking indicators, all without a route change.
- **Mute, deafen, and per-user volume** — right-click any participant (or use the kebab menu) for audio controls. Room managers can kick participants.
- **Voice settings with mic test** — input/output device pickers, a live input level meter, and an input sensitivity gate that stops transmitting below a chosen level. Preferences persist per device via `localStorage`.
- **User room creation** — users in the allowed group see a "+" button to create rooms directly from the sidebar; room creators and managers can edit rooms in-app.
- **Audio cues** — synthesized tones for connect/disconnect, user join/leave, and mute/deafen toggles.
- **Noise suppression** — optional DTLN-based background noise filtering via WebAssembly. See [Noise Suppression](#noise-suppression).
- **Video and screen sharing** — optional, off by default. Each room gets a full page at `/resenha/r/<slug>` with a tile grid; camera and screen share toggle without renegotiation, and senders only encode toward peers who are actually watching the page. Rooms can opt out individually. See [Video](#video).
- **Pure browser WebRTC** — signaling through Discourse + MessageBus; media stays peer-to-peer, no SFU/MCU required.

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
| `resenha_noise_suppression`          | Allow users to opt into DTLN noise suppression.                                      |
| `resenha_video_enabled`              | Allow camera video and screen sharing (default off). Rooms can opt out individually. |
| `resenha_video_max_publishers`       | Max simultaneous video/screen publishers per room (default 8).                       |
| `resenha_stun_servers`               | STUN server addresses (pipe-separated).                                              |
| `resenha_turn_servers`               | TURN server addresses for NAT traversal.                                             |

## Video

When `resenha_video_enabled` is on (and the room's own video toggle is too), the room view at `/resenha/r/<slug>` shows a video grid alongside the usual controls. Audio joins stay sidebar-first and unchanged; video lives on the page.

- Still pure mesh: a video m-line is pre-negotiated on every peer connection, so toggling the camera or a screen share is a `replaceTrack` with no renegotiation.
- Senders attach video only toward participants currently on the room page (`watching_video` presence flag) — every skipped peer saves a full encoder session.
- Encoding quality scales down with watcher count (720p ≤3 watchers, 480p ≤6, 360p beyond) and is capped by `resenha_video_max_publishers`.
- Camera and screen share are mutually exclusive per user. Stage rooms do not support video yet.

See `docs/roadmap/video-screenshare.md` for the full design.

### Screen sharing troubleshooting

Screen sharing has more environmental dependencies than the camera, and failures surface as a generic `NotAllowedError` in the browser console:

- **Linux on Wayland**: capture goes through `xdg-desktop-portal` + PipeWire. If the picker never appears and the error is instant, check `systemctl --user is-active graphical-session.target xdg-desktop-portal` — a compositor session that isn't wired into systemd (common on minimal window manager setups) leaves the portal unable to start. The camera is unaffected, which makes this easy to misread as an application bug.
- **macOS Firefox**: needs Screen Recording permission in System Settings, and only picks it up after a full browser restart.
- **Insecure dev origins**: `getDisplayMedia` hard-requires a secure context. Firefox's `about:config` overrides that unlock `getUserMedia` on plain-http dev hosts do **not** extend to screen capture — use `https://` or a `localhost` origin.

## Noise Suppression

Optional DTLN-based noise suppression powered by [dtln-rs](https://github.com/DataDog/dtln-rs), compiled to WebAssembly. When enabled by an admin, users can toggle it from their participant context menu. The preference persists per device via `localStorage`.

```
Microphone → AudioContext → AudioWorkletNode (dtln) → MediaStreamDestination → WebRTC peers
```

A pre-built worklet bundle is committed at `public/javascripts/dtln-worklet.js`. To rebuild (requires Rust + Emscripten + pnpm):

```bash
rustup target add wasm32-unknown-emscripten
cd plugins/resenha && bash scripts/build-dtln-worklet.sh
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

- Pure peer-to-peer topology; large rooms may hit browser limits. SFU support is on the roadmap.
- No call recording or moderation tools beyond kick.
