# User Status Integration

## Overview

Automatically set a user's Discourse status when they join a voice room and
clear it when they leave. This makes voice presence visible everywhere
Discourse shows status — user cards, post headers, mentions, chat, member
lists, and the sidebar.

Example status while in a room:

> 🎙️ In Watercooler

## User-facing behavior

- **On join:** If the user has no existing status, set it to
  `🎙️ In <room name>`. If they already have a status, leave it alone.
- **On leave / kick / disconnect:** If the current status was set by Resenha,
  clear it. If the user changed their status manually while in the room, leave
  it alone.
- **AFK integration:** When the user transitions to idle/AFK (from
  `afk-idle-detection.md`), status updates to `💤 AFK in <room name>`.
  Returning to active reverts to `🎙️ In <room name>`. Only applies if
  Resenha owns the current status.

### Opt-out

Users can disable automatic status updates from the self-participant context
menu: "Auto-update status" toggle. Persisted in `localStorage`
(`resenha_auto_status_enabled`, default `true`).

When disabled, Resenha never touches the user's status.

## Design decisions

### Why use Discourse's native status

- Status already renders in user cards, post headers, chat, mentions, and
  member directories — zero frontend work for display.
- Real-time broadcast via `/user-status` MessageBus channel is built in.
- Other plugins and themes already respect and display status.

### Why not a separate "voice presence" indicator

A dedicated presence badge (green dot, headphone icon on avatar, etc.) would
require patching every place Discourse renders users. The native status system
gives us universal visibility for free. A dedicated indicator could be added
later as a complement, not a replacement.

### Skip users who already have a status

Instead of snapshotting the user's existing status to Redis, restoring it on
leave, and handling all the edge cases around expiring statuses and
reconnections — we simply skip users who already have a status set.

This eliminates:
- Redis snapshot keys and their TTL management
- Restore-on-leave logic and stale snapshot edge cases
- Race conditions around reconnections overwriting snapshots
- The entire "user had an expiring status" edge case

The trade-off is that users with an existing status won't get voice presence
shown. This is acceptable because:
- The user explicitly chose their current status; overwriting it is rude.
- Most users don't have a status set most of the time.
- Users who want voice presence can clear their status before joining.

### Detecting Resenha-owned status

On leave/disconnect, we only clear the status if Resenha set it. We detect
this by checking if the emoji is `studio_microphone` or `zzz` (our two
emojis). This is simple and reliable.

### Self-expiring status via heartbeat

Status is set with a 2-minute expiry (`ends_at: 2.minutes.from_now`). Each
heartbeat refreshes the expiry. If the user closes their browser or loses
connection, the status automatically expires within 2 minutes — no cleanup
job needed.

This is self-healing and has no dependency on analytics being enabled or any
scheduled job running. Discourse natively handles expired statuses (they
simply stop rendering).

## Implementation plan

### 1. Backend: status management service

**File:** `lib/resenha/user_status_manager.rb`

```ruby
module Resenha
  class UserStatusManager
    EMOJI = "studio_microphone"
    AFK_EMOJI = "zzz"

    STATUS_EXPIRY = 2.minutes

    def self.set_voice_status(user, room)
      return unless SiteSetting.enable_user_status
      return unless SiteSetting.resenha_auto_status_enabled
      return if user_has_non_resenha_status?(user)

      user.set_status!(
        "In #{room.name}",
        EMOJI,
        STATUS_EXPIRY.from_now
      )
    end

    def self.set_afk_status(user, room)
      return unless SiteSetting.enable_user_status
      return unless resenha_status_active?(user)

      user.set_status!(
        "AFK in #{room.name}",
        AFK_EMOJI,
        STATUS_EXPIRY.from_now
      )
    end

    def self.clear_voice_status(user)
      return unless SiteSetting.enable_user_status
      return unless resenha_status_active?(user)

      user.clear_status!
    end

    def self.resenha_status_active?(user)
      status = user.user_status
      status && !status.expired? && resenha_emoji?(status.emoji)
    end

    private

    def self.user_has_non_resenha_status?(user)
      status = user.user_status
      status && !status.expired? && !resenha_emoji?(status.emoji)
    end

    def self.resenha_emoji?(emoji)
      [EMOJI, AFK_EMOJI].include?(emoji)
    end
  end
end
```

### 2. Hook into join/leave lifecycle

**File:** `app/controllers/resenha/rooms_controller.rb`

**On join (after adding to Redis participants):**

```ruby
Resenha::UserStatusManager.set_voice_status(current_user, room)
```

**On leave / kick:**

```ruby
Resenha::UserStatusManager.clear_voice_status(current_user)
```

**On heartbeat (refresh expiry + handle AFK transitions):**

```ruby
# Always refresh the status expiry if Resenha owns it
if Resenha::UserStatusManager.resenha_status_active?(current_user)
  if idle_state == "afk"
    Resenha::UserStatusManager.set_afk_status(current_user, room)
  else
    Resenha::UserStatusManager.set_voice_status(current_user, room)
  end
end
```

This serves double duty: it handles AFK transitions and keeps the 2-minute
expiry refreshed. If the user disappears (browser crash, network loss), the
heartbeat stops and the status self-expires within 2 minutes.

Note: `set_voice_status` during AFK→active transition is safe because if the
user manually changed their status while in the room,
`user_has_non_resenha_status?` will return true and we'll skip the update.

### 4. Handle manual status changes while in a room

If the user opens the Discourse status picker and sets a custom status while
in a voice room, Resenha detects this automatically:

- `set_voice_status` checks `user_has_non_resenha_status?` → skips
- `set_afk_status` checks `resenha_status_active?` → skips
- `clear_voice_status` checks `resenha_status_active?` → skips

No special handling needed. The user's manual status is always respected.

### 5. Frontend: opt-out toggle

**File:** `assets/javascripts/discourse/components/resenha-participant-sidebar-context-menu.gjs`

Add to the self-user section of the context menu:

```
☑ Auto-update status
```

Toggle reads/writes `localStorage` key `resenha_auto_status_enabled`.

When disabled, the frontend sends `skip_status: true` on the join request.
The backend checks this param and skips `set_voice_status`.

If toggled off mid-session, the frontend immediately calls the existing
Discourse status clear endpoint to remove the Resenha status. The heartbeat
then sees `resenha_status_active?` as false and stops refreshing. The toggle
takes effect instantly without waiting for expiry.

### 6. Handle `skip_status` in the controller

In the `join` action, check the param before setting status:

```ruby
unless params[:skip_status]
  Resenha::UserStatusManager.set_voice_status(current_user, room)
end
```

Store `skip_status` in participant metadata so the heartbeat also respects it:

```ruby
# In heartbeat, skip refresh if user opted out
metadata = ParticipantTracker.get_metadata(room.id, current_user.id)
skip_status = metadata&.dig("skip_status")
```

### 7. Site settings

**File:** `config/settings.yml`

```yaml
resenha_auto_status_enabled:
  default: true
  description: "Automatically set user status when in a voice room"
  client: true
```

This is the global admin toggle. The per-user localStorage preference is a
client-side opt-out within this global setting.

### 8. Room name changes

If a room moderator renames a room while users are connected, the status text
becomes stale ("In Old Name" instead of "In New Name").

On room update (in `RoomsController#update`), if the name changed:

```ruby
participant_ids = ParticipantTracker.user_ids(room.id)
participant_ids.each do |uid|
  user = User.find_by(id: uid)
  next unless user
  next unless Resenha::UserStatusManager.resenha_status_active?(user)
  Resenha::UserStatusManager.set_voice_status(user, room)
end
```

This is a rare operation so iterating participants is fine.

## How it looks across Discourse

| Location | What users see |
|----------|---------------|
| **User card** (click avatar) | 🎙️ In Watercooler |
| **Post header** (next to username) | 🎙️ In Watercooler |
| **Chat** (user list, message header) | 🎙️ In Watercooler |
| **Member directory** (`/u`) | 🎙️ In Watercooler |
| **Mentions** (`@user` hover) | 🎙️ In Watercooler |
| **Who's online** (sidebar, if enabled) | 🎙️ In Watercooler |

When AFK: 💤 AFK in Watercooler everywhere.

All of this is automatic — Discourse's existing UI components already render
`UserStatus` wherever they display users. No frontend patches needed.

## Edge cases

- **User joins two rooms rapidly (race condition):** Not possible — the WebRTC
  service enforces one room at a time. Joining a new room leaves the current
  one first.
- **User already has a status:** Resenha skips setting voice status entirely.
  The user keeps their existing status. On leave, `clear_voice_status` checks
  emoji and won't clear a non-Resenha status.
- **Browser crash / abrupt disconnect:** The heartbeat stops, and the status
  self-expires within 2 minutes. No cleanup job needed.
- **Plugin disabled while users are in rooms:** On `plugin.rb`
  `on(:site_setting_changed)` for `resenha_enabled`, iterate all active
  participants across all rooms and clear their Resenha statuses.
- **`enable_user_status` is false:** All methods guard on this setting. Status
  is never touched. The feature degrades gracefully — voice chat works, just
  no status integration.
- **User is silenced:** Discourse only shows silenced users' status to
  themselves and staff. Resenha sets the status normally — visibility is
  handled by Discourse's Guardian.
- **User clears Resenha status while in room:** The heartbeat and room rename
  code both guard with `resenha_status_active?`, so they won't re-set it. The
  status stays cleared until the user leaves and rejoins.

## Dependencies

- **AFK/Idle detection** (`afk-idle-detection.md`) — for the idle → AFK status
  transition. Without it, only the join/leave status works (which is still
  valuable on its own).
- **Discourse `enable_user_status` site setting** — must be enabled by the
  admin. Resenha should surface a warning in the admin panel if
  `resenha_auto_status_enabled` is true but `enable_user_status` is false.
