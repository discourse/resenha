# User Status Integration

## Overview

Automatically set a user's Discourse status when they join a voice room and
clear it when they leave. This makes voice presence visible everywhere
Discourse shows status — user cards, post headers, mentions, chat, member
lists, and the sidebar.

Example status while in a room:

> 🎙️ In Watercooler

## User-facing behavior

- **On join:** Status is set to `🎙️ In <room name>`.
- **On leave / kick / disconnect:** Status is restored to whatever it was
  before joining (or cleared if there was no prior status).
- **While connected:** If the user manually changes their status via Discourse
  UI, respect their choice — stop overwriting it until the next join.
- **AFK integration:** When the user transitions to idle/AFK (from
  `afk-idle-detection.md`), status updates to `💤 AFK in <room name>`.
  Returning to active reverts to `🎙️ In <room name>`.

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

### Preserving the user's original status

The user may already have a status set ("🏖️ On vacation", "🔨 Heads down").
Resenha must preserve this and restore it on leave. If we just overwrite and
then clear, we destroy their status.

Strategy:
- Before setting voice status, snapshot the current status to Redis.
- On leave, restore from the snapshot.
- If the snapshot is empty, clear status.

## Implementation plan

### 1. Backend: status management service

**File:** `lib/resenha/user_status_manager.rb`

```ruby
module Resenha
  class UserStatusManager
    EMOJI = "studio_microphone"
    AFK_EMOJI = "zzz"
    REDIS_KEY_PREFIX = "resenha:user_status_snapshot"

    def self.set_voice_status(user, room)
      return unless SiteSetting.enable_user_status
      return unless SiteSetting.resenha_auto_status_enabled

      snapshot_current_status(user)

      user.set_status!(
        "In #{room.name}",
        EMOJI,
        nil # no expiry — cleared on leave
      )
    end

    def self.set_afk_status(user, room)
      return unless SiteSetting.enable_user_status

      # Only update if current status is a Resenha status
      return unless resenha_status_active?(user)

      user.set_status!(
        "AFK in #{room.name}",
        AFK_EMOJI,
        nil
      )
    end

    def self.restore_status(user)
      return unless SiteSetting.enable_user_status

      snapshot = retrieve_snapshot(user)

      if snapshot
        user.set_status!(
          snapshot["description"],
          snapshot["emoji"],
          snapshot["ends_at"]
        )
      else
        user.clear_status!
      end

      delete_snapshot(user)
    end

    private

    def self.snapshot_current_status(user)
      key = "#{REDIS_KEY_PREFIX}:#{user.id}"

      # Don't overwrite an existing snapshot (user may have reconnected
      # to a different room without leaving cleanly)
      return if Discourse.redis.exists?(key)

      status = user.user_status
      if status && !status.expired?
        # Don't snapshot if current status is already a Resenha status
        # (reconnection scenario)
        return if resenha_emoji?(status.emoji)

        Discourse.redis.setex(
          key,
          24.hours.to_i,
          { description: status.description,
            emoji: status.emoji,
            ends_at: status.ends_at&.iso8601 }.to_json
        )
      else
        # Store empty marker so restore knows to clear
        Discourse.redis.setex(key, 24.hours.to_i, "null")
      end
    end

    def self.retrieve_snapshot(user)
      raw = Discourse.redis.get("#{REDIS_KEY_PREFIX}:#{user.id}")
      return nil if raw.nil? || raw == "null"
      JSON.parse(raw)
    end

    def self.delete_snapshot(user)
      Discourse.redis.del("#{REDIS_KEY_PREFIX}:#{user.id}")
    end

    def self.resenha_status_active?(user)
      status = user.user_status
      status && !status.expired? && resenha_emoji?(status.emoji)
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
Resenha::UserStatusManager.restore_status(current_user)
```

**On AFK transition** (called from heartbeat when idle state changes):

```ruby
if idle_state == "afk"
  Resenha::UserStatusManager.set_afk_status(current_user, room)
elsif idle_state == "active"
  Resenha::UserStatusManager.set_voice_status(current_user, room)
end
```

### 3. Handle orphaned status on TTL expiry

When a user crashes or loses connection, the Redis participant TTL expires but
the status remains set. The orphan cleanup job (from `analytics.md`) already
detects stale participants. Extend it to restore status:

**File:** `app/jobs/scheduled/resenha_close_orphaned_sessions.rb`

```ruby
# After closing the orphaned session:
user = User.find_by(id: orphaned_user_id)
Resenha::UserStatusManager.restore_status(user) if user
```

As a safety net, the snapshot Redis key has a 24h TTL — if cleanup never runs,
the snapshot auto-expires and the user can set a new status manually.

### 4. Handle manual status changes while in a room

If the user opens the Discourse status picker and sets a custom status while
in a voice room, Resenha should not overwrite it on the next heartbeat.

Detection: In `set_voice_status` and `set_afk_status`, before writing, check
if the current status was set by Resenha (emoji is `studio_microphone` or
`zzz`). If the emoji is something else, the user has manually overridden —
skip the update and delete the snapshot (so restore on leave becomes a no-op).

This is already handled by the `resenha_status_active?` guard in
`set_afk_status`. Add the same guard to the heartbeat-driven refresh:

```ruby
# In heartbeat, only refresh status if Resenha owns it
if Resenha::UserStatusManager.resenha_status_active?(current_user)
  # Safe to update (e.g., room name changed, AFK transition)
end
```

### 5. Frontend: opt-out toggle

**File:** `assets/javascripts/discourse/components/resenha-participant-sidebar-context-menu.gjs`

Add to the self-user section of the context menu:

```
☑ Auto-update status
```

Toggle reads/writes `localStorage` key `resenha_auto_status_enabled`.

When disabled, the frontend sends an extra param on the join request:
`skip_status: true`. The backend checks this param and skips
`set_voice_status`.

Alternatively, send the preference on every heartbeat as metadata so the
backend can stop updating mid-session if the user toggles it off.

### 6. Site settings

**File:** `config/settings.yml`

```yaml
resenha_auto_status_enabled:
  default: true
  description: "Automatically set user status when in a voice room"
  client: true
```

This is the global admin toggle. The per-user localStorage preference is a
client-side opt-out within this global setting.

### 7. Room name changes

If a room moderator renames a room while users are connected, the status text
becomes stale ("In Old Name" instead of "In New Name").

On room update (in `RoomsController#update`), if the name changed:

```ruby
# Refresh status for all active participants
participant_ids = ParticipantTracker.list(room.id).map(&:id)
participant_ids.each do |uid|
  user = User.find_by(id: uid)
  next unless user
  next unless Resenha::UserStatusManager.resenha_status_active?(user)
  user.set_status!("In #{room.name}", Resenha::UserStatusManager::EMOJI, nil)
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

When AFK: `💤 AFK in Watercooler` everywhere.

All of this is automatic — Discourse's existing UI components already render
`UserStatus` wherever they display users. No frontend patches needed.

## Edge cases

- **User joins two rooms rapidly (race condition):** Not possible — the WebRTC
  service enforces one room at a time. Joining a new room leaves the current
  one first.
- **User had an expiring status ("🏖️ On vacation" until Friday):** The
  snapshot preserves `ends_at`. On restore, if `ends_at` is in the past, clear
  status instead of restoring an expired one. Check in `restore_status`:
  ```ruby
  if snapshot["ends_at"] && Time.parse(snapshot["ends_at"]) < Time.now
    user.clear_status!
  else
    user.set_status!(...)
  end
  ```
- **Plugin disabled while users are in rooms:** On `plugin.rb`
  `on(:site_setting_changed)` for `resenha_enabled`, iterate all active
  participants across all rooms and restore their statuses.
- **`enable_user_status` is false:** All methods guard on this setting. Status
  is never touched. The feature degrades gracefully — voice chat works, just
  no status integration.
- **User is silenced:** Discourse only shows silenced users' status to
  themselves and staff. Resenha sets the status normally — visibility is
  handled by Discourse's Guardian.
- **Snapshot Redis key expires (24h) before user returns:** The user's status
  will be cleared on leave instead of restored. This is acceptable — 24h
  without a clean leave means something went very wrong, and the original
  status was likely stale anyway.

## Dependencies

- **AFK/Idle detection** (`afk-idle-detection.md`) — for the idle → AFK status
  transition. Without it, only the join/leave status works (which is still
  valuable on its own).
- **Discourse `enable_user_status` site setting** — must be enabled by the
  admin. Resenha should surface a warning in the admin panel if
  `resenha_auto_status_enabled` is true but `enable_user_status` is false.
