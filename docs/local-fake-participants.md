# Local fake participants for Resenha

This developer-only harness opens several Playwright browser contexts, logs each one in as a bot user, injects fake camera/audio/screen-share media, and joins a Resenha room. It is meant for local interactive WebRTC testing, not CI.

## Quick start

From the plugin checkout:

```bash
pnpm install
DISCOURSE_URL=http://localhost:4200 ROOM=watercooler BOT_COUNT=3 \
  pnpm resenha:bots -- --headed --screenshots
```

By default the harness uses Discourse's development/test-only `/session/:username/become.json` login route. That means the named users must already exist and the target site must allow that route.

## Bot config

If `.local/resenha-bots.json` exists, it is used instead of generated `resenha_bot_N` usernames.

Create it from the example:

```bash
mkdir -p .local
cp docs/examples/resenha-bots.example.json .local/resenha-bots.json
```

Example:

```json
[
  {
    "username": "resenha_bot_1",
    "label": "Alice fake camera",
    "color": "#2563eb",
    "accent": "#f97316"
  },
  {
    "username": "resenha_bot_2",
    "label": "Bob fake camera",
    "color": "#16a34a",
    "accent": "#7c3aed"
  }
]
```

You can also pass JSON directly:

```bash
RESENHA_BOTS_JSON='[{"username":"alice"},{"username":"bob"}]' \
  DISCOURSE_URL=http://localhost:4200 ROOM=watercooler pnpm resenha:bots -- --headed
```

## Useful options

```bash
pnpm resenha:bots -- --help
```

Common flags:

- `--headed`: show browser windows.
- `--screenshots`: write screenshots to `tmp/resenha-bots/`.
- `--trace`: write Playwright trace zips to `tmp/resenha-bots/`.
- `--record-video`: write Playwright videos to `tmp/resenha-bots/`.
- `--screen-share-bot 1`: make the first bot start fake screen share.
- `--hold-ms 30000`: auto-close after 30 seconds; otherwise runs until Ctrl-C.
- `--no-camera`: join without immediately starting camera.

## Password login mode

For non-development sites, use password login with credentials in the ignored local file:

```json
[
  { "username": "resenha_bot_1", "password": "local-only-password" },
  { "username": "resenha_bot_2", "password": "local-only-password" }
]
```

Then run:

```bash
LOGIN_MODE=password DISCOURSE_URL=https://example.test ROOM=watercooler \
  pnpm resenha:bots -- --headed
```

Do not commit real credentials.

## Notes

- Each bot uses a distinct canvas-backed camera stream with a visible label and animated frame marker.
- Audio is a very-low-gain oscillator so the browser sees a real audio track without audible noise.
- `getDisplayMedia` returns a separate fake screen-share canvas derived from the bot feed.
- Browser logs are echoed with the bot username prefix.
