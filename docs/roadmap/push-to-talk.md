# Push-to-Talk (In-Focus)

## Overview

Add a push-to-talk (PTT) mode as an alternative to the current open-mic default.
When PTT is active, the user's microphone is muted unless they hold down a
configurable key. This only works while the Discourse tab has focus — background
PTT requires a browser extension and is out of scope for this phase.

## User-facing behavior

- PTT is **off by default** (open-mic remains the default experience).
- Users enable PTT from the self-participant context menu (same menu that has
  mute, deafen, and noise suppression).
- When PTT is enabled:
  - Mic is muted at rest.
  - Holding the configured key unmutes the mic.
  - Releasing the key re-mutes.
  - A visual indicator appears on the user's sidebar avatar while transmitting
    (reuse the existing speaking animation).
- The PTT keybind defaults to `Space` but is user-configurable via the context
  menu (button that opens a "press a key" capture dialog).
- PTT preference and keybind are persisted in `localStorage`
  (`resenha_ptt_enabled`, `resenha_ptt_key`).
- A small tooltip/badge in the sidebar reminds the user which key is bound
  (e.g., "PTT: Space") while PTT mode is active.

## Interaction with existing features

| Feature            | Interaction                                                        |
| ------------------ | ------------------------------------------------------------------ |
| Mute toggle        | Disabled while PTT is active (PTT controls the mute state).       |
| Deafen             | Works independently — user can deafen while in PTT mode.          |
| Noise suppression  | Works independently — applied to the outgoing track as usual.     |
| Speaking indicator  | Driven by the same track-enabled state, so it works automatically. |
| Mute state broadcast | `toggle_mute` endpoint still fires on each PTT press/release so remote participants see the mute state change. |

### Throttling mute broadcasts

Open-mic users toggle mute infrequently, but PTT users press/release constantly.
Broadcasting every keydown/keyup to the server would be wasteful.

Strategy:
- On PTT **press**: immediately broadcast unmute (low latency matters for the
  start of speech).
- On PTT **release**: broadcast mute after a short debounce (~200ms) to avoid
  flickering if the user briefly releases and re-presses.
- Skip redundant broadcasts (don't send "muted" if already muted).
- Consider a dedicated lightweight MessageBus publish instead of the HTTP
  `toggle_mute` endpoint — this avoids an HTTP round-trip per press. If this is
  not feasible with Discourse's MessageBus client-publish model, keep the HTTP
  endpoint but batch rapid toggles.

## Implementation plan

### 1. Add PTT state to `resenha-webrtc` service

**File:** `assets/javascripts/discourse/app/services/resenha-webrtc.js`

- Add tracked properties:
  - `pttEnabled` (boolean, loaded from localStorage on init)
  - `pttKey` (string, default `"Space"`, loaded from localStorage)
  - `pttActive` (boolean, true while key is held — drives track enabled state)
- Add methods:
  - `enablePtt()` / `disablePtt()` — toggle PTT mode, persist to localStorage,
    mute track immediately when enabling.
  - `setPttKey(keyCode)` — update and persist the keybind.
  - `_onPttKeyDown(event)` — if `event.code === this.pttKey` and not
    `event.repeat`, enable the local audio track and broadcast unmute.
  - `_onPttKeyUp(event)` — if `event.code === this.pttKey`, disable the local
    audio track and broadcast mute (debounced).

### 2. Register global keyboard listeners

**File:** `assets/javascripts/discourse/app/services/resenha-webrtc.js`

- When PTT is enabled **and** the user is connected to a room, attach
  `keydown`/`keyup` listeners to `document`.
- Remove listeners when PTT is disabled or user leaves the room.
- Guard against firing when focus is inside an input, textarea, or
  contenteditable element — PTT should not activate while the user is typing in
  the Discourse composer, search bar, or chat input. Check
  `document.activeElement.tagName` and `isContentEditable`.

### 3. Add PTT toggle to the self-participant context menu

**File:** `assets/javascripts/discourse/components/resenha-participant-sidebar-context-menu.gjs`

- Add a "Push to Talk" toggle item (similar to existing "Noise suppression"
  toggle).
- Add a "PTT Key: [Space]" item that opens a key capture popover/modal.
  - The popover listens for a single `keydown`, displays the key name, and
    confirms on a second press or click.
  - Escape cancels without changing the key.

### 4. Key capture component

**New file:** `assets/javascripts/discourse/components/resenha-ptt-key-capture.gjs`

A small inline component (popover or modal):
- Text: "Press a key..."
- On `keydown`: display `event.code` as a human-readable label (e.g., "Space",
  "KeyV", "ControlLeft").
- Confirm button to save, or auto-confirm after 1 second.
- Blocked keys: `Escape`, `Tab`, `Enter` (reserved by the browser/Discourse).

### 5. Visual indicator

**File:** `assets/stylesheets/common/resenha.scss`

- When PTT is active and the key is held, the user's own sidebar avatar gets
  the existing `.speaking` animation class.
- When PTT is active but the key is not held, show a small `microphone-slash`
  badge with reduced opacity (subtle "ready to talk" state).
- Remote participants already see speaking/mute indicators via the existing
  metadata broadcast — no changes needed on their end.

### 6. Disable mute button during PTT

**File:** `assets/javascripts/discourse/components/resenha-participant-sidebar-context-menu.gjs`

- When PTT is enabled, grey out the "Mute microphone" option and add a
  subtitle: "Controlled by Push to Talk".

## Edge cases

- **User switches tabs while holding PTT key:** The `keyup` event will not fire.
  Listen for `visibilitychange` — if the document becomes hidden while
  `pttActive` is true, treat it as a key release (mute + broadcast).
- **User holds PTT and opens context menu / modal:** Same approach — if focus
  leaves the document or a modal opens, release PTT.
- **Multiple keys pressed:** Only track the configured PTT key. Ignore other
  keys. If the PTT key is released while other keys are held, still release PTT.
- **Room switch while PTT held:** Leaving a room already cleans up state. Ensure
  `pttActive` resets to false on `leave()`.
- **Modifier keys as PTT (Ctrl, Alt, Shift):** Should work but warn the user
  that modifier keys may conflict with browser shortcuts. Don't block them —
  let the user decide.
- **Key repeat:** `keydown` fires repeatedly when held. Always check
  `event.repeat === true` and ignore repeats.

## Future phases (out of scope)

- **Background PTT via browser extension** — global hotkey capture using
  `chrome.commands` API, communicated to the page via `postMessage`.
- **Media Session integration** — map headset buttons to PTT via
  `navigator.mediaSession.setActionHandler`.
- **Toggle mode** — press once to unmute, press again to mute (as opposed to
  hold-to-talk). Could be a user preference alongside hold mode.
- **PTT activation sound** — short "click" tone on press/release to give
  auditory feedback (like a walkie-talkie). Should be optional.
