# Resenha Voice Rooms

Resenha is a Discourse plugin that adds Discord-style voice rooms powered by WebRTC. Rooms appear in the sidebar; users join or leave with a single click and talk peer-to-peer — no media goes through the Discourse server.

> **Status:** early alpha — test with small groups before opening to a full community.

## Features

- **Sidebar-first UX** — click a room to join/leave, see live participant avatars with speaking indicators, all without a route change.
- **Mute, deafen, and per-user volume** — right-click any participant (or use the kebab menu) for audio controls. Room managers can kick participants.
- **User room creation** — users in the allowed group see a "+" button to create rooms directly from the sidebar; room creators and managers can edit rooms in-app.
- **Audio cues** — synthesized tones for connect/disconnect, user join/leave, and mute/deafen toggles.
- **Noise suppression** — optional DTLN-based background noise filtering via WebAssembly. See [Noise Suppression](#noise-suppression).
- **Pure browser WebRTC** — signaling through Discourse + MessageBus; media stays peer-to-peer, no SFU/MCU required.

## Installation

1. Clone into your `plugins` directory: `git clone https://github.com/xfalcox/resenha.git plugins/resenha`
2. Rebuild or restart Discourse.
3. Enable via **Admin > Settings > Plugins > resenha enabled**.

The plugin seeds a default "Watercooler" room on first enable.

## Configuration

| Setting | Description |
| --- | --- |
| `resenha_enabled` | Master switch. |
| `resenha_allowed_groups` | Groups that can access voice rooms (default: everyone). |
| `resenha_create_room_allowed_groups` | Groups that can create new rooms (default: admins, moderators, TL2). |
| `resenha_max_rooms_per_user` | Max rooms per creator (default 5). |
| `resenha_participant_ttl_seconds` | Redis presence TTL in seconds (default 30). Client heartbeat refreshes every 10s. |
| `resenha_noise_suppression` | Allow users to opt into DTLN noise suppression. |
| `resenha_stun_servers` | STUN server addresses (pipe-separated). |
| `resenha_turn_servers` | TURN server addresses for NAT traversal. |

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

- `app/controllers/resenha/rooms_controller.rb` — room CRUD + signaling relay
- `lib/resenha/guardian_extension.rb` — authorization (group-based access and room creation permissions)
- `assets/javascripts/discourse/app/services/resenha-webrtc.js` — WebRTC orchestration, audio controls, sound effects
- `assets/javascripts/discourse/initializers/resenha-sidebar.js` — sidebar section, click/context-menu handlers

## Known Limitations

- Pure peer-to-peer topology; large rooms may hit browser limits. SFU support is on the roadmap.
- No call recording or moderation tools beyond kick.
