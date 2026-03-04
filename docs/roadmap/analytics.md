# Analytics & Smart Notifications

## Overview

Track voice room usage — time spent, co-presence (who was in the room together)
— and use that data to surface smart notifications like "Alice just joined
Watercooler" when Alice is someone you frequently talk with.

This breaks into three layers:

1. **Data collection** — record sessions and co-presence events.
2. **Aggregation** — compute per-user stats and relationship scores.
3. **Smart notifications** — alert users when frequent contacts join rooms.

## Data model

### `resenha_sessions`

One row per user per room visit (join → leave).

```
id              bigint PK
user_id         bigint FK → users, NOT NULL
room_id         bigint FK → resenha_rooms, NOT NULL
joined_at       timestamp NOT NULL
left_at         timestamp NULL (NULL = still connected)
duration_seconds integer NULL (computed on leave, or by periodic cleanup)
created_at      timestamp
```

Indexes:
- `(user_id, room_id, joined_at)` — query a user's history in a room.
- `(room_id, joined_at)` — query all sessions in a room for a time range.
- `(user_id, joined_at)` — query all activity for a user.
- `(left_at)` partial where `left_at IS NULL` — find orphaned sessions.

### `resenha_co_presences`

Aggregated relationship strength between two users. One row per unique user
pair (lower user_id is always `user_id_1`).

```
id                  bigint PK
user_id_1           bigint FK → users, NOT NULL
user_id_2           bigint FK → users, NOT NULL
total_seconds       integer NOT NULL DEFAULT 0
session_count       integer NOT NULL DEFAULT 0
last_co_present_at  timestamp NULL
created_at          timestamp
updated_at          timestamp
```

Indexes:
- `UNIQUE (user_id_1, user_id_2)` with constraint `user_id_1 < user_id_2`.
- `(user_id_1, total_seconds DESC)` — top contacts for user 1.
- `(user_id_2, total_seconds DESC)` — top contacts for user 2.

Querying top contacts for a given user requires a UNION on both columns, or a
single query with `WHERE user_id_1 = ? OR user_id_2 = ?` — the two indexes
cover both directions.

### Why two tables

Sessions are the raw event log — append-only, useful for detailed analytics,
admin dashboards, and debugging. Co-presence is the derived aggregate — fast to
query for the notification system without scanning all sessions.

## Data collection

### Recording sessions

**On join** (`RoomsController#join`):

- Create a `resenha_sessions` row with `joined_at = Time.now`, `left_at = NULL`.
- Store the session ID in Redis alongside the participant entry:
  `resenha:room:{id}:session:{user_id}` → session record ID.

**On leave** (`RoomsController#leave`, kick, or TTL expiry):

- Update the session row: `left_at = Time.now`,
  `duration_seconds = left_at - joined_at`.
- Delete the Redis session key.

**On heartbeat** (`RoomsController#heartbeat`):

- No session changes needed — the session row already exists.

### Orphan cleanup

Users can disappear without a clean leave (browser crash, network loss). The
heartbeat TTL (30s) already handles presence cleanup. Add a periodic job to
close orphaned sessions:

**Job:** `Resenha::CloseOrphanedSessions` (runs every 5 minutes)

- Find sessions where `left_at IS NULL` and the user is NOT in the Redis
  participant set for that room.
- Set `left_at` to the last heartbeat time (or `joined_at + duration` based on
  Redis TTL expiry estimate). A reasonable fallback is `updated_at` of the
  session or `Time.now - participant_ttl`.
- Compute `duration_seconds`.

### Recording co-presence

Computing co-presence in real-time on every join/leave would be complex and
error-prone (overlapping intervals, multiple rooms, crashes). Instead, use a
**periodic batch job**.

**Job:** `Resenha::UpdateCoPresence` (runs every 5 minutes)

For each room with active participants (from Redis):

1. Get the list of current participant user IDs.
2. For every pair `(user_a, user_b)` where `user_a < user_b`:
   - Upsert into `resenha_co_presences`:
     - Increment `total_seconds` by 300 (the job interval).
     - Increment `session_count` by 1 if this is the first time this pair is
       seen in the current batch (use a Redis set
       `resenha:copresence:seen:{date}:{user_a}:{user_b}` with 24h TTL to
       deduplicate session counting — or simpler: only increment
       `session_count` when the pair first appears after a gap).
     - Update `last_co_present_at = Time.now`.

This approach:
- Is simple and tolerant of crashes (worst case: lose 5 min of co-presence data).
- Doesn't require tracking overlapping session intervals.
- Scales linearly with active participants, not total sessions.

**Session count logic:** Increment `session_count` when a co-presence is
detected and `last_co_present_at` is older than 10 minutes (meaning there was
a gap). This counts distinct "conversations" rather than batch ticks.

## Aggregation & queries

### User's room usage

```sql
-- Total time user spent in a room
SELECT room_id, SUM(duration_seconds) as total_seconds, COUNT(*) as visit_count
FROM resenha_sessions
WHERE user_id = ?
GROUP BY room_id
ORDER BY total_seconds DESC;
```

### User's top contacts

```sql
-- Top 10 people this user spends time with
SELECT
  CASE WHEN user_id_1 = :uid THEN user_id_2 ELSE user_id_1 END AS contact_id,
  total_seconds,
  session_count,
  last_co_present_at
FROM resenha_co_presences
WHERE user_id_1 = :uid OR user_id_2 = :uid
ORDER BY total_seconds DESC
LIMIT 10;
```

### Room popularity

```sql
-- Most active rooms in the last 7 days
SELECT room_id, COUNT(DISTINCT user_id) as unique_users,
       SUM(duration_seconds) as total_seconds
FROM resenha_sessions
WHERE joined_at > NOW() - INTERVAL '7 days'
GROUP BY room_id
ORDER BY total_seconds DESC;
```

### User's frequent rooms

```sql
-- Rooms this user joins most often
SELECT room_id, COUNT(*) as visit_count, SUM(duration_seconds) as total_seconds
FROM resenha_sessions
WHERE user_id = ?
  AND joined_at > NOW() - INTERVAL '30 days'
GROUP BY room_id
ORDER BY visit_count DESC;
```

## Smart notifications

### "Your frequent contact joined a room"

**Trigger:** A user joins a room.

**Logic (in `RoomsController#join`, after recording the session):**

1. Query the joining user's top contacts from `resenha_co_presences`
   (cached — see below).
2. For each top contact who is currently online (Discourse presence) but NOT
   in any voice room:
   - Check if the room the user just joined is one the contact frequents
     (from `resenha_sessions` aggregation, also cached).
   - If both conditions met (strong relationship + familiar room), send a
     notification.

**Notification content:**
> "Alice joined Watercooler — you two have chatted 12 times this month"

**Delivery:** Discourse MessageBus push to the contact's browser → rendered as
a toast notification with a "Join" action button.

### Caching strategy

Computing top contacts and frequent rooms on every join would be expensive.

- **Top contacts per user:** Cache in Redis as a sorted set
  `resenha:contacts:{user_id}` with score = `total_seconds`. Refresh every
  hour via a scheduled job, or invalidate when `UpdateCoPresence` runs.
- **Frequent rooms per user:** Cache as `resenha:frequent_rooms:{user_id}`.
  Refresh daily or on session close.
- **Notification cooldown:** Don't notify the same user about the same contact
  more than once per hour. Track in Redis:
  `resenha:notified:{user_id}:{contact_id}` with 1h TTL.

### Thresholds

Not every co-presence should trigger notifications. Minimum thresholds:

- **Minimum co-presence time:** 30 minutes total (avoids noise from one-time
  encounters).
- **Minimum sessions:** 3 (avoids a single long session skewing results).
- **Recency:** `last_co_present_at` within the last 30 days (stale
  relationships don't trigger).
- **Room familiarity:** Contact has visited the room at least twice in the
  last 30 days (don't notify about unfamiliar rooms).

All thresholds configurable via site settings.

### User preferences

Users can control notification behavior from their Discourse notification
preferences (or a Resenha-specific section):

- **Enable/disable** smart room notifications (default: enabled).
- **Quiet hours** — respect Discourse's existing Do Not Disturb setting.

No per-contact granularity in the first version — either on or off globally.

## Admin dashboard

### Site settings

```yaml
resenha_analytics_enabled:
  default: true

resenha_session_retention_days:
  default: 90
  min: 7
  max: 365

resenha_co_presence_min_seconds:
  default: 1800
  description: "Minimum co-presence time (seconds) before a relationship is considered for notifications"

resenha_co_presence_min_sessions:
  default: 3

resenha_smart_notifications_enabled:
  default: true

resenha_smart_notification_cooldown_minutes:
  default: 60
  min: 10
  max: 1440
```

### Admin stats page

Add a tab to the Resenha admin panel showing:

- **Overview:** Total sessions today/week/month, unique active users, average
  session duration.
- **Room leaderboard:** Most active rooms by time and unique users.
- **User leaderboard:** Most active users by time (anonymizable by admin
  toggle).
- **Peak hours:** Heatmap of activity by hour/day of week.

Implementation: A `Resenha::AdminStatsController` with endpoints that run the
aggregation queries above, consumed by an Ember admin component.

### Data retention

**Job:** `Resenha::PurgeOldSessions` (runs daily)

- Delete `resenha_sessions` rows older than `resenha_session_retention_days`.
- Co-presence rows are kept indefinitely (they're small) but
  `last_co_present_at` allows natural filtering of stale relationships.

## Implementation plan

### Phase 1: Session tracking

1. Create `resenha_sessions` migration.
2. Record join/leave in `RoomsController`.
3. Add orphan cleanup job.
4. Add session data to the room serializer (user's own session count for the
   room, as a lightweight "you've visited this room X times" indicator).

### Phase 2: Co-presence

1. Create `resenha_co_presences` migration.
2. Implement `UpdateCoPresence` job.
3. Add API endpoint for a user to fetch their own top contacts
   (`GET /resenha/contacts`).

### Phase 3: Smart notifications

1. Implement notification logic in room join flow.
2. Add Redis caching for contacts and frequent rooms.
3. Add notification cooldown.
4. Add user preference toggle.
5. Frontend toast with "Join" action button.

### Phase 4: Admin dashboard

1. `AdminStatsController` with aggregation endpoints.
2. Ember admin components for stats display.
3. Data retention job.

## Privacy considerations

- Session data is only visible to the user themselves and site admins.
- Co-presence data is symmetric — if Alice can see Bob as a top contact, Bob
  can see Alice. There is no way to silently track someone.
- Smart notifications respect Discourse's existing block/ignore system — if
  user A has blocked user B, no notifications are sent in either direction.
- Admins can disable analytics entirely via `resenha_analytics_enabled`.
- Session data is purged after the retention period.
- No audio is recorded — only presence metadata (who was in which room, when).
