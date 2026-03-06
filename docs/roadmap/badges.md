# Badges

## Overview

Grant Discourse badges for voice chat milestones. Some badges are instant
(granted the moment a condition is met during a session), others are
time-based (computed from `resenha_sessions` analytics data via scheduled
jobs).

All badges live in a custom "Resenha" badge grouping and use Discourse's native
`BadgeGranter` -- no custom badge UI needed.

## Badge catalog

### Welcome

| Badge | Type | Condition | Trigger |
|-------|------|-----------|---------|
| **Mic Check** | Bronze | Spend 30+ seconds in a room with at least one other person | Instant (on leave) |

### Airtime

| Badge | Type | Condition | Trigger |
|-------|------|-----------|---------|
| **Rookie** | Bronze | 1 hour total voice time | Scheduled |
| **Chatterbox** | Silver | 10 hours total voice time | Scheduled |
| **Silver Tongue** | Gold | 100 hours total voice time | Scheduled |

### Networker

| Badge | Type | Condition | Trigger |
|-------|------|-----------|---------|
| **Icebreaker** | Bronze | Join a room where you have no prior co-presence history with anyone | Instant (on join) |
| **Social Butterfly** | Silver | Co-presence with 10+ distinct users (min 5 min each) | Scheduled |
| **Life of the Party** | Gold | Co-presence with 50+ distinct users (min 5 min each) | Scheduled |

### Bonding

| Badge | Type | Condition | Trigger |
|-------|------|-----------|---------|
| **Familiar Face** | Bronze | Co-presence with one user for 2+ hours total | Scheduled |
| **Inner Circle** | Silver | Co-presence with one user for 10+ hours total | Scheduled |
| **Partners in Crime** | Gold | Co-presence with one user for 50+ hours total | Scheduled |

### Exploration

| Badge | Type | Condition | Trigger |
|-------|------|-----------|---------|
| **Explorer** | Bronze | Join 5 different voice rooms | Scheduled |
| **Nomad** | Silver | Join 20 different voice rooms | Scheduled |
| **Omnipresent** | Gold | Join 50 different voice rooms | Scheduled |

### Loyalty

| Badge | Type | Condition | Trigger |
|-------|------|-----------|---------|
| **Patron** | Bronze | Join the same room on 10 distinct days | Scheduled |
| **Barfly** | Silver | Join the same room on 30 distinct days | Scheduled |
| **The Mayor** | Gold | Join the same room on 100 distinct days | Scheduled |

### Hosting

| Badge | Type | Condition | Trigger |
|-------|------|-----------|---------|
| **Host** | Bronze | Create your first voice room | Instant (on create) |
| **Crowd Puller** | Silver | A room you created reaches 50 total joins | Scheduled |
| **Master of Ceremonies** | Gold | A room you created reaches 500 total joins | Scheduled |

### Standalone

| Badge | Type | Condition | Trigger |
|-------|------|-----------|---------|
| **Night Owl** | Bronze | Participate in a session between midnight and 5 AM (user timezone) | Instant (on leave) |
| **Early Bird** | Bronze | Participate in a session between 5 AM and 9 AM (user timezone) | Instant (on leave) |
| **Packed House** | Silver | Be in a room at the exact moment it reaches max capacity | Instant (on join) |
| **Weekend Warrior** | Silver | Accumulate 5+ hours of voice chat on weekends | Scheduled |
| **Marathoner** | Gold | Stay in a single continuous voice session for 4+ hours | Instant (on leave) |

### Progressions

```
Airtime:     Mic Check -> Rookie -> Chatterbox -> Silver Tongue
Networker:   Icebreaker -> Social Butterfly -> Life of the Party
Bonding:     Familiar Face -> Inner Circle -> Partners in Crime
Exploration: Explorer -> Nomad -> Omnipresent
Loyalty:     Patron -> Barfly -> The Mayor
Hosting:     Host -> Crowd Puller -> Master of Ceremonies
```

## Implementation plan

### 1. No new database columns needed

**Voice time queries** use `COALESCE(left_at, CURRENT_TIMESTAMP)` to compute
duration on the fly, so no `duration_seconds` column is needed. Open sessions
naturally contribute their time-so-far, which means in-progress sessions count
toward badge progress -- a desirable property.

```sql
SUM(EXTRACT(EPOCH FROM (COALESCE(left_at, CURRENT_TIMESTAMP) - joined_at)))
```

**Mic Check** (other-participant detection) checks the Redis participant set at
leave time. If other users are still in the room, the badge is granted. If the
last other person left first, the badge is missed this time but granted on the
next qualifying session. No `peak_participants` column needed.

### 2. Create badge grouping and seed badges with SQL queries

**File:** `app/services/resenha/badge_seeder.rb`

Badges are defined in a `BADGES` constant. Scheduled badges include a `query`
field with SQL that returns `user_id` and `granted_at` columns -- Discourse's
native `BadgeGranter.backfill` (via the daily `Jobs::BadgeGrant`) runs these
queries automatically, granting badges to qualifying users. No custom scheduled
job needed.

Instant badges (Mic Check, Icebreaker, Packed House, Host, Night Owl, Early
Bird, Marathoner) have no `query` -- they are granted in real-time by
`BadgeGranterHooks`.

**Seeding strategy:**

- `BadgeSeeder.seed!` runs from `after_initialize` when `resenha_enabled` is
  true. Badges are seeded as `enabled: false` so they are visible in
  `/admin/badges` but inactive.
- When `resenha_badges_enabled` is toggled ON, call `BadgeSeeder.enable_all!`
  to bulk-enable all Resenha badges.
- When toggled OFF, call `BadgeSeeder.disable_all!` to bulk-disable them.
- Admins can still individually disable specific badges from the standard
  Discourse badge admin UI.

Seeding is idempotent -- uses case-insensitive find, updates existing badges if
the definition changes. Existing user grants are preserved.

### 3. Instant badge grants

7 badges are granted in real-time via `BadgeGranterHooks`, called from
controller actions.

**File:** `app/services/resenha/badge_granter_hooks.rb`

- `on_leave(user, session, room:)` -- Mic Check, Night Owl, Early Bird, Marathoner
- `on_join(user, room, participants)` -- Packed House, Icebreaker
- `on_room_create(user)` -- Host

**Integration points in controllers:**

- `RoomsController#leave` / `kick` / orphan cleanup -> call `on_leave`
- `RoomsController#join` -> call `on_join` (after adding to participants)
- `RoomsController#create` -> call `on_room_create`

### 4. Scheduled badges via Discourse native backfill

17 badges have SQL queries set on the badge `query` column. Discourse's
built-in `Jobs::BadgeGrant` (runs daily) enqueues `BackfillBadge` for each
enabled badge, which calls `BadgeGranter.backfill` to execute the query and
grant badges automatically. No custom scheduled job needed.

### 5. Site settings

**File:** `config/settings.yml`

```yaml
resenha_badges_enabled:
  default: false
```

Defaults to `false`. When toggled on, `BadgeSeeder.enable_all!` activates all
seeded badges. No per-badge admin toggle needed -- admins can disable
individual badges from the standard Discourse badge admin UI (`/admin/badges`).

## Dependency on analytics

This feature depends on **Phase 1** (session tracking) and **Phase 2**
(co-presence) from `analytics.md`:

| Badge | Requires |
|-------|----------|
| Mic Check | `resenha_sessions` + Redis participant set |
| Host | Nothing (instant, no analytics) |
| Icebreaker | `resenha_co_presences` |
| Packed House | Nothing (instant, checks Redis) |
| Night Owl | `resenha_sessions` (for `joined_at`) + user timezone |
| Early Bird | `resenha_sessions` (for `joined_at`) + user timezone |
| Marathoner | `resenha_sessions` (`left_at - joined_at`) |
| Rookie / Chatterbox / Silver Tongue | `resenha_sessions` (`SUM(EXTRACT(EPOCH FROM ...))`) |
| Social Butterfly / Life of the Party | `resenha_co_presences` (`SUM(total_seconds)` across dates) |
| Familiar Face / Inner Circle / Partners in Crime | `resenha_co_presences` (`SUM(total_seconds)` across dates) |
| Explorer / Nomad / Omnipresent | `resenha_sessions` (`COUNT DISTINCT room_id`) |
| Patron / Barfly / The Mayor | `resenha_sessions` (`COUNT DISTINCT DATE(joined_at)`) |
| Crowd Puller / Master of Ceremonies | `resenha_sessions` + `resenha_rooms` (join count per creator) |
| Weekend Warrior | `resenha_sessions` (weekend filter + duration sum) |

Badges can ship alongside analytics phases -- instant badges in Phase 1,
social badges in Phase 2.

## Edge cases

- **Badge seeding on plugin update:** `BadgeSeeder.seed!` is idempotent. If a
  badge name or description changes in a new version, the existing badge is
  updated in place. User grants are preserved.
- **Admin disables a badge:** Discourse handles this natively -- disabled badges
  stop granting but existing grants remain visible.
- **Admin disables all badges globally:** The `SiteSetting.enable_badges` guard
  in the scheduled job and instant hooks prevents any granting.
- **User leaves before 30s (Mic Check):** No badge granted. The 30s minimum
  prevents accidental joins from triggering the badge.
- **Orphaned sessions (crash):** The orphan cleanup job from analytics.md
  closes these sessions. The next scheduled badge job run will process them.
- **Night Owl / Early Bird timezone:** Uses the user's Discourse timezone
  preference (`user.user_option.timezone`), falling back to UTC if not set.
- **Marathoner edge case:** Only granted on leave -- if a session is orphaned
  and closed by the cleanup job, the duration is still computed from
  `left_at - joined_at`, so the badge can be granted on the next scheduled run
  if we add a check there. For now, instant-only is simpler.
- **Weekend Warrior timezone:** Uses `joined_at` server time for DOW check.
  Could be refined to use user timezone if needed, but weekend detection
  across timezones is complex and server time is a reasonable approximation.
- **Promoter / Master of Ceremonies:** Counts all sessions in rooms you
  created, including your own joins. This incentivizes creating rooms that
  attract people.

## Open questions

- **Badge icons:** TBD -- currently using Font Awesome icons as placeholders.
  Could use custom uploaded images for a more distinctive look.

## Future ideas (out of scope)

- **Streak badges:** "Join a voice room 7 days in a row."
- **Moderator badges:** "Moderate 10 voice sessions" (for room moderators).
- **Event badges:** "Attend a scheduled voice event" (ties into events plan).
- **Custom badge images:** Upload Resenha-themed badge icons instead of FA
  icons. Requires `image_upload_id` on the badge.
- **Leaderboard:** Show top badge holders on a community page (uses Discourse's
  existing badge directory).
