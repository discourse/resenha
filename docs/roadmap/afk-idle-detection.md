# AFK / Idle Detection

## Overview

Automatically detect when a voice room participant is idle and apply graduated
responses — visual indicator, auto-mute, and eventually disconnect. This keeps
rooms tidy, frees up participant slots, and prevents hot-mic situations from
users who walked away.

## User-facing behavior

### Idle stages

| Stage | Trigger | Effect |
|-------|---------|--------|
| **Active** | Any user activity | Normal state. |
| **Idle** | No activity for 5 min | Idle badge on sidebar avatar (moon/clock icon). |
| **AFK** | No activity for 15 min | Auto-muted. Subtle notification shown on return ("You were auto-muted after being idle"). |
| **Disconnected** | No activity for 30 min | Removed from room. Toast notification: "You were disconnected from [room] due to inactivity". |

All thresholds are **admin-configurable** site settings. Any threshold can be
set to 0 to disable that stage (e.g., set disconnect to 0 to never auto-kick).

### What counts as activity

- Mouse movement, click, scroll, touch
- Keyboard input
- WebRTC voice activity (speaking detection via existing `AudioContext` analyser)
- Explicit interaction with Resenha controls (mute/unmute, volume change, PTT)

Voice activity is the most important signal — a user who is listening and
occasionally speaking is clearly not AFK, even if they haven't touched the
mouse.

### User opt-out

- No full opt-out (this is a room hygiene feature), but users can:
  - Reset their idle timer by interacting with the page.
  - Quickly rejoin after auto-disconnect (room stays in sidebar).
- Admins can disable the feature entirely by setting all thresholds to 0.

## Interaction with existing features

| Feature | Interaction |
|---------|-------------|
| Mute (manual) | Already-muted users still progress through idle → AFK → disconnect. Auto-mute stage is effectively a no-op for them, but the idle badge still shows. |
| Deafen | Same as mute — deafened users still go idle if no activity. |
| PTT mode | PTT key presses count as activity. A PTT user who stops pressing is idle. |
| Heartbeat | Heartbeat is automatic (10s interval) and does NOT count as activity — it just keeps the Redis TTL alive. Idle detection is separate from presence. |
| Noise suppression | No interaction. |
| Kick | If a moderator kicks an idle user, that takes priority — no "you were disconnected due to inactivity" message. |

## Implementation plan

### 1. Add idle tracking to `resenha-webrtc` service

**File:** `assets/javascripts/discourse/app/services/resenha-webrtc.js`

- Add tracked properties:
  - `idleState` — `"active"`, `"idle"`, or `"afk"` (per-room, but since a user
    can only be in one room, a single property is fine).
  - `_lastActivityAt` — timestamp of last detected activity.
  - `_idleTimerId` — interval ID for the idle check loop.

- Add methods:
  - `_resetActivity()` — set `_lastActivityAt = Date.now()`. Called by activity
    event handlers and voice detection.
  - `_startIdleTracking()` — called on room join. Registers DOM event listeners
    and starts the check interval.
  - `_stopIdleTracking()` — called on room leave. Cleans up listeners and
    interval.
  - `_checkIdleState()` — runs every 30 seconds. Compares `Date.now()` to
    `_lastActivityAt` and transitions between stages.

### 2. DOM activity listeners

**File:** `assets/javascripts/discourse/app/services/resenha-webrtc.js`

Register on `document` when idle tracking starts:
- `mousemove` (throttled — once per 30s is enough, no need to track every pixel)
- `mousedown`
- `keydown`
- `scroll`
- `touchstart`

All handlers call `_resetActivity()`. Use a single throttled handler to avoid
performance overhead — set a `_activityThrottled` flag that clears after 10
seconds.

### 3. Voice activity as idle reset

**File:** `assets/javascripts/discourse/app/services/resenha-webrtc.js`

The service already has access to the local `MediaStream` for speaking
detection. Reuse the existing `AudioContext` analyser:

- If the user's audio level exceeds the speaking threshold (already computed for
  the speaking indicator), call `_resetActivity()`.
- Throttle to once per 10 seconds to avoid constant resets from background noise
  that passes the threshold.

This ensures that a user who is actively speaking but hasn't touched their mouse
stays in the `active` state.

### 4. Stage transition logic

**In `_checkIdleState()` (runs every 30s):**

```
elapsed = Date.now() - _lastActivityAt

if elapsed < idleThreshold:
    transition to "active"

else if elapsed < afkThreshold:
    transition to "idle"

else if elapsed < disconnectThreshold:
    transition to "afk"
    if not already auto-muted:
        mute local track
        broadcast mute state
        show notification "You were auto-muted after being idle"

else:
    leave room
    show notification "Disconnected from [room] due to inactivity"
```

On any transition from non-active to active:
- Clear idle/AFK badges.
- Do NOT auto-unmute — the user should consciously unmute when they return.
  This prevents hot-mic surprises.

### 5. Broadcast idle state to other participants

**Backend:** Add `idle_state` to participant metadata.

**File:** `app/services/resenha/participant_tracker.rb`

- `update_metadata` already supports arbitrary JSON fields. The frontend will
  include `idle_state` in metadata updates alongside `is_muted`/`is_deafened`.

**File:** `app/controllers/resenha/rooms_controller.rb`

- The `heartbeat` action already refreshes the TTL. Extend it to accept an
  optional `idle_state` param and update metadata. This avoids a separate HTTP
  call — piggyback on the existing 10s heartbeat.

**File:** `app/serializers/resenha/room_serializer.rb`

- Include `idle_state` in participant metadata serialization (already dynamic
  via the metadata hash, so this may need no changes).

### 6. Visual indicators

**File:** `assets/stylesheets/common/resenha.scss`

- **Idle badge:** Small moon icon (or `zzz`) overlaid on the participant's
  sidebar avatar. Apply `opacity: 0.6` to the avatar to visually de-emphasize.
- **AFK badge:** Same icon but with `opacity: 0.4` and a muted color treatment
  on the avatar (grayscale filter).
- **Transition animation:** Smooth opacity transition over 0.3s so it doesn't
  feel jarring.

**File:** Sidebar initializer / participant link rendering

- Read `idle_state` from the participant metadata and apply the appropriate CSS
  class: `.resenha-idle`, `.resenha-afk`.

### 7. Admin settings

**File:** `config/settings.yml`

```yaml
resenha_idle_threshold_minutes:
  default: 5
  min: 0
  max: 60
  client: true

resenha_afk_auto_mute_threshold_minutes:
  default: 15
  min: 0
  max: 120
  client: true

resenha_afk_disconnect_threshold_minutes:
  default: 30
  min: 0
  max: 240
  client: true
```

Setting any value to 0 disables that stage. Validation: idle < auto-mute <
disconnect (when all are non-zero). Client-scoped so the frontend can read them
directly.

### 8. Notification on return

**File:** `assets/javascripts/discourse/app/services/resenha-webrtc.js`

- When auto-mute triggers, store a flag `_wasAutoMuted = true`.
- On next activity detection (transition back to active), if `_wasAutoMuted`,
  show a Discourse native toast: "You were auto-muted after being idle. Click
  to unmute." with an action button.
- For auto-disconnect, show the toast immediately since the user will see it
  when they return to the tab.

## Edge cases

- **Tab hidden (visibilitychange):** `document.hidden` becoming true does NOT
  immediately trigger idle. The timer continues running. But DOM events won't
  fire while hidden, so the user will naturally go idle if they're away. Voice
  activity still works since the `AudioContext` runs in background.
- **Multiple tabs:** Each tab has its own WebRTC session. Idle detection is
  per-tab, which is correct — a user active in another tab is not active in the
  voice session.
- **User returns during AFK but before disconnect:** Transition back to active.
  Mic stays muted (user must manually unmute). Clear AFK badge.
- **User is auto-muted and then manually unmutes:** Clear the `_wasAutoMuted`
  flag. Reset idle timer. If they go idle again, the full cycle repeats.
- **Room at max capacity + idle users:** Consider a future enhancement where
  idle users are prioritized for disconnection when the room is full and
  someone tries to join. Out of scope for now.
- **Admin changes thresholds while users are connected:** New thresholds take
  effect on the next `_checkIdleState()` tick (within 30s). No reconnection
  needed since settings are client-scoped.

## Future enhancements (out of scope)

- **AFK channel:** Auto-move idle users to a designated AFK room instead of
  disconnecting, similar to Discord's AFK channel feature.
- **Per-room overrides:** Let room creators set custom idle thresholds for their
  room (e.g., a "lounge" room with longer timeouts).
- **Idle immunity for moderators:** Option to exempt moderators from
  auto-disconnect (they may be monitoring silently).
- **Screen Idle Detection API:** `IdleDetector` API (Chromium only, requires
  permission) can detect OS-level idle (locked screen, screensaver). Could
  fast-track to AFK state when the OS reports idle.
