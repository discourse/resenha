# Badges

## Overview

Grant Discourse badges for voice chat milestones. Some badges are instant
(granted the moment a condition is met during a session), others are
time-based (computed from `resenha_sessions` analytics data via scheduled
jobs).

All badges live in a custom "Voice" badge grouping and use Discourse's native
`BadgeGranter` — no custom badge UI needed.

## Badge catalog

### Instant badges (granted in real-time)

| Badge | Type | Condition | Trigger |
|-------|------|-----------|---------|
| **First Chat** | Bronze | Complete your first voice session (stay in a room with at least one other person for 30+ seconds) | On leave/disconnect |
| **Room Creator** | Bronze | Create your first voice room | On room create |
| **Icebreaker** | Bronze | Join a room where you haven't talked with any of the current participants before (no co-presence history) | On join, after participants are known |
| **Full House** | Silver | Be in a room that reaches max capacity | On join (when room hits max) |
| **Night Owl** | Bronze | Participate in a voice session between midnight and 5 AM (server time) | On leave, check session timestamps |

### Time-based badges (granted by scheduled job)

| Badge | Type | Condition |
|-------|------|-----------|
| **Regular** | Bronze | 1 hour total voice time |
| **Talkative** | Silver | 10 hours total voice time |
| **Voice Veteran** | Gold | 100 hours total voice time |
| **Social Butterfly** | Silver | Co-presence with 10+ distinct users (min 5 min each) |
| **Inner Circle** | Gold | Co-presence with one user for 10+ hours total |
| **Barfly** | Silver | Join the same room on 30 distinct days |
| **Explorer** | Bronze | Join 5 different rooms |

### Progression

Time-based badges form natural progressions:

```
Voice time:    First Chat → Regular → Talkative → Voice Veteran
Connections:   Icebreaker → Social Butterfly → Inner Circle
Room usage:    Room Creator → Explorer → Barfly
```

## Implementation plan

### 1. Create badge grouping and seed badges

**File:** `lib/resenha/badge_seeder.rb`

```ruby
module Resenha
  class BadgeSeeder
    BADGES = [
      {
        name: "First Chat",
        description: "Completed your first voice chat session.",
        long_description: "Awarded after spending at least 30 seconds in a voice room with another person.",
        badge_type_id: BadgeType::Bronze,
        icon: "microphone",
        multiple_grant: false,
      },
      {
        name: "Room Creator",
        description: "Created your first voice room.",
        badge_type_id: BadgeType::Bronze,
        icon: "plus-circle",
        multiple_grant: false,
      },
      # ... all badges defined here
    ].freeze

    def self.seed!
      grouping = BadgeGrouping.find_or_create_by!(name: "Voice") do |g|
        g.position = BadgeGrouping.maximum(:position).to_i + 1
      end

      BADGES.each do |attrs|
        badge = Badge.find_by("name ILIKE ?", attrs[:name])
        if badge
          badge.update!(attrs.merge(badge_grouping_id: grouping.id))
        else
          Badge.create!(
            attrs.merge(
              badge_grouping_id: grouping.id,
              enabled: true,
              allow_title: attrs[:badge_type_id] == BadgeType::Gold,
              listable: true,
              system: false,
            )
          )
        end
      end
    end
  end
end
```

Call `Resenha::BadgeSeeder.seed!` from `plugin.rb` inside `after_initialize`,
guarded by `SiteSetting.resenha_badges_enabled`.

Seeding is idempotent — uses case-insensitive find, updates existing badges if
the definition changes.

### 2. Instant badge grants

All instant grants share the same pattern: check condition, call
`BadgeGranter.grant`. The granter already short-circuits if the user has the
badge, so no duplicate check is needed.

**File:** `lib/resenha/badge_granter_hooks.rb`

```ruby
module Resenha
  class BadgeGranterHooks
    def self.on_leave(user, room, session)
      return unless badges_enabled?

      grant("First Chat", user) if first_chat?(session)
      grant("Night Owl", user) if night_owl?(session)
    end

    def self.on_join(user, room, participants)
      return unless badges_enabled?

      grant("Full House", user) if room_full?(room, participants)
      grant("Icebreaker", user) if icebreaker?(user, participants)
    end

    def self.on_room_create(user, room)
      return unless badges_enabled?
      grant("Room Creator", user)
    end

    private

    def self.grant(badge_name, user)
      badge = Badge.find_by(name: badge_name)
      BadgeGranter.grant(badge, user) if badge&.enabled?
    end

    def self.first_chat?(session)
      session.duration_seconds >= 30 &&
        session.had_other_participants?
    end

    def self.night_owl?(session)
      hour = session.joined_at.hour
      hour >= 0 && hour < 5
    end

    def self.room_full?(room, participants)
      room.max_participants.present? &&
        participants.count >= room.max_participants
    end

    def self.icebreaker?(user, participants)
      other_ids = participants.map(&:id) - [user.id]
      return false if other_ids.empty?

      Resenha::CoPresence
        .where("(user_id_1 = :uid OR user_id_2 = :uid)", uid: user.id)
        .where(
          "(user_id_1 IN (:others) OR user_id_2 IN (:others))",
          others: other_ids
        )
        .none?
    end

    def self.badges_enabled?
      SiteSetting.enable_badges && SiteSetting.resenha_badges_enabled
    end
  end
end
```

**Integration points in controllers:**

- `RoomsController#leave` / kick / TTL cleanup → call `on_leave`
- `RoomsController#join` → call `on_join` (after adding to participants)
- `RoomsController#create` → call `on_room_create`

### 3. "First Chat" — detecting other participants

The `first_chat?` check needs to know if other people were in the room during
the session. Two approaches:

**Option A (simple):** At leave time, check if the room currently has other
participants in Redis. This misses the case where the other person left first,
but it's simple and good enough — the user will get the badge next time.

**Option B (reliable):** When recording the session in Phase 1 of analytics,
also store a `peak_participants` count on the session row (updated on each
heartbeat or join event). Then `first_chat?` checks
`session.peak_participants >= 2`. This requires adding a column to
`resenha_sessions`.

Recommend **Option B** — it's a single integer column and makes the badge
reliable.

### 4. Scheduled job for time-based badges

**File:** `app/jobs/scheduled/resenha_grant_badges.rb`

```ruby
module Jobs
  class ResenhaGrantBadges < Jobs::Scheduled
    every 1.hour

    def execute(args)
      return unless SiteSetting.enable_badges &&
                    SiteSetting.resenha_badges_enabled

      grant_voice_time_badges
      grant_social_badges
      grant_room_badges
    end

    private

    def grant_voice_time_badges
      thresholds = {
        "Regular"       => 1.hour.to_i,
        "Talkative"     => 10.hours.to_i,
        "Voice Veteran" => 100.hours.to_i,
      }

      thresholds.each do |badge_name, min_seconds|
        badge = Badge.find_by(name: badge_name)
        next unless badge&.enabled?

        user_ids = Resenha::Session
          .group(:user_id)
          .having("SUM(duration_seconds) >= ?", min_seconds)
          .pluck(:user_id)

        already_granted = UserBadge
          .where(badge_id: badge.id, user_id: user_ids)
          .pluck(:user_id)
          .to_set

        (user_ids - already_granted.to_a).each do |uid|
          user = User.find_by(id: uid)
          BadgeGranter.grant(badge, user) if user
        end
      end
    end

    def grant_social_badges
      grant_social_butterfly
      grant_inner_circle
    end

    def grant_social_butterfly
      badge = Badge.find_by(name: "Social Butterfly")
      return unless badge&.enabled?

      # Users with 10+ distinct co-presence partners (min 300s each)
      sql = <<~SQL
        SELECT uid FROM (
          SELECT user_id_1 AS uid, COUNT(*) AS cnt
          FROM resenha_co_presences
          WHERE total_seconds >= 300
          GROUP BY user_id_1
          UNION ALL
          SELECT user_id_2 AS uid, COUNT(*) AS cnt
          FROM resenha_co_presences
          WHERE total_seconds >= 300
          GROUP BY user_id_2
        ) sub
        GROUP BY uid
        HAVING SUM(cnt) >= 10
      SQL

      user_ids = DB.query_single(sql)
      user_ids.each do |uid|
        user = User.find_by(id: uid)
        BadgeGranter.grant(badge, user) if user
      end
    end

    def grant_inner_circle
      badge = Badge.find_by(name: "Inner Circle")
      return unless badge&.enabled?

      min_seconds = 10.hours.to_i
      pairs = Resenha::CoPresence
        .where("total_seconds >= ?", min_seconds)
        .pluck(:user_id_1, :user_id_2)

      user_ids = pairs.flatten.uniq
      user_ids.each do |uid|
        user = User.find_by(id: uid)
        BadgeGranter.grant(badge, user) if user
      end
    end

    def grant_room_badges
      grant_explorer
      grant_barfly
    end

    def grant_explorer
      badge = Badge.find_by(name: "Explorer")
      return unless badge&.enabled?

      user_ids = Resenha::Session
        .group(:user_id)
        .having("COUNT(DISTINCT room_id) >= 5")
        .pluck(:user_id)

      user_ids.each do |uid|
        user = User.find_by(id: uid)
        BadgeGranter.grant(badge, user) if user
      end
    end

    def grant_barfly
      badge = Badge.find_by(name: "Barfly")
      return unless badge&.enabled?

      user_ids = Resenha::Session
        .select(:user_id)
        .group(:user_id, :room_id)
        .having("COUNT(DISTINCT DATE(joined_at)) >= 30")
        .pluck(:user_id)
        .uniq

      user_ids.each do |uid|
        user = User.find_by(id: uid)
        BadgeGranter.grant(badge, user) if user
      end
    end
  end
end
```

The job runs hourly. `BadgeGranter.grant` is a no-op for users who already have
the badge, so re-scanning is safe.

### 5. Site settings

**File:** `config/settings.yml`

```yaml
resenha_badges_enabled:
  default: true
  description: "Enable voice chat badges"
```

No per-badge admin toggle needed — admins can disable individual badges from
the standard Discourse badge admin UI (`/admin/badges`).

### 6. Add `peak_participants` to sessions

**Migration:**

```ruby
add_column :resenha_sessions, :peak_participants, :integer, default: 1
```

**Update logic:** On each `heartbeat` or `join` event, if the current
participant count for the room exceeds the stored `peak_participants` for any
active session in that room, update it. This can be done efficiently:

```ruby
# In RoomsController#join, after adding participant
current_count = ParticipantTracker.list(room.id).count
Resenha::Session
  .where(room_id: room.id, left_at: nil)
  .where("peak_participants < ?", current_count)
  .update_all(peak_participants: current_count)
```

## Dependency on analytics

This feature depends on **Phase 1** (session tracking) and **Phase 2**
(co-presence) from `analytics.md`:

| Badge | Requires |
|-------|----------|
| First Chat | `resenha_sessions` + `peak_participants` column |
| Room Creator | Nothing (instant, no analytics) |
| Icebreaker | `resenha_co_presences` |
| Full House | Nothing (instant, checks Redis) |
| Night Owl | `resenha_sessions` (for `joined_at` timestamp) |
| Regular / Talkative / Voice Veteran | `resenha_sessions` (SUM of `duration_seconds`) |
| Social Butterfly | `resenha_co_presences` |
| Inner Circle | `resenha_co_presences` |
| Explorer | `resenha_sessions` (COUNT DISTINCT `room_id`) |
| Barfly | `resenha_sessions` (COUNT DISTINCT dates) |

Badges can ship alongside analytics phases — instant badges in Phase 1,
social badges in Phase 2.

## Edge cases

- **Badge seeding on plugin update:** `BadgeSeeder.seed!` is idempotent. If a
  badge name or description changes in a new version, the existing badge is
  updated in place. User grants are preserved.
- **Admin disables a badge:** Discourse handles this natively — disabled badges
  stop granting but existing grants remain visible.
- **Admin disables all badges globally:** The `SiteSetting.enable_badges` guard
  in the scheduled job and instant hooks prevents any granting.
- **User leaves before 30s (First Chat):** No badge granted. The 30s minimum
  prevents accidental joins from triggering the badge.
- **Orphaned sessions (crash):** The orphan cleanup job from analytics.md
  closes these sessions. The next scheduled badge job run will process them.
- **Clock skew for Night Owl:** Uses server time, not client time. This is
  intentional — consistent across users regardless of timezone. Could be
  revisited to use the user's Discourse timezone preference if desired.

## Future ideas (out of scope)

- **Streak badges:** "Join a voice room 7 days in a row."
- **Moderator badges:** "Moderate 10 voice sessions" (for room moderators).
- **Event badges:** "Attend a scheduled voice event" (ties into events plan).
- **Custom badge images:** Upload Resenha-themed badge icons instead of FA
  icons. Requires `image_upload_id` on the badge.
- **Leaderboard:** Show top badge holders on a community page (uses Discourse's
  existing badge directory).
