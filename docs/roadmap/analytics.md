# Analytics

## Overview

Track voice room usage — time spent, co-presence (who was in the room
together) — and surface that data to users and admins.

This breaks into two layers:

1. **Data collection** — record sessions and co-presence events.
2. **Aggregation** — compute per-user stats and relationship scores.

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
updated_at      timestamp
```

Indexes:
- `(user_id, room_id, joined_at)` — query a user's history in a room.
- `(room_id, joined_at)` — query all sessions in a room for a time range.
- `(user_id, joined_at)` — query all activity for a user.
- `(left_at)` partial where `left_at IS NULL` — find orphaned sessions.

### `resenha_co_presences`

Daily co-presence between two users. One row per unique user pair **per day**
(lower user_id is always `user_id_1`). Storing per-day granularity lets any
feature filter by recency — relationships that fade over time naturally drop
out of recent queries without needing decay algorithms or lifetime aggregates.

```
id                  bigint PK
user_id_1           bigint FK → users, NOT NULL
user_id_2           bigint FK → users, NOT NULL
date                date NOT NULL
total_seconds       integer NOT NULL DEFAULT 0
session_count       integer NOT NULL DEFAULT 0
created_at          timestamp
updated_at          timestamp
```

Indexes:
- `UNIQUE (user_id_1, user_id_2, date)` with constraint `user_id_1 < user_id_2`.
- `(user_id_1, date)` — query a user's co-presences for a date range.
- `(user_id_2, date)` — same, covering the other direction.

Querying top contacts for a given user over a time window:

```sql
SELECT
  CASE WHEN user_id_1 = :uid THEN user_id_2 ELSE user_id_1 END AS contact_id,
  SUM(total_seconds) AS total_seconds,
  SUM(session_count) AS session_count,
  MAX(date) AS last_co_present_on
FROM resenha_co_presences
WHERE (user_id_1 = :uid OR user_id_2 = :uid)
  AND date >= :since
GROUP BY contact_id
ORDER BY total_seconds DESC
LIMIT 10;
```

**Row volume:** For N users co-present daily, there are at most N*(N-1)/2
pairs per day. A group of 10 daily regulars produces ~45 rows/day,
~16k rows/year — trivial for Postgres. Old rows are purged by the retention
job alongside sessions.

### Why two tables

Sessions are the raw event log — append-only, useful for detailed analytics,
admin dashboards, and debugging. Co-presence is the derived aggregate — fast
to query for features like top contacts without scanning all sessions.

## Data collection

### Recording sessions

**On join** (`RoomsController#join`):

- Create a `resenha_sessions` row with `joined_at = Time.now`, `left_at = NULL`.
- Store the session ID in the existing participant metadata hash:
  `resenha:room:{id}:metadata` field `{user_id}` — add `session_id` to the
  JSON payload alongside `role`, `idle_state`, etc.

**On leave** (`RoomsController#leave`, kick, or TTL expiry):

- Update the session row: `left_at = Time.now`,
  `duration_seconds = left_at - joined_at`.
- The session ID is cleared when the participant metadata is removed.

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
   - Upsert into `resenha_co_presences` for `date = Date.today`:
     - Increment `total_seconds` by 300 (the job interval).
     - Increment `session_count` using the gap-based logic below.

This approach:
- Is simple and tolerant of crashes (worst case: lose 5 min of co-presence data).
- Doesn't require tracking overlapping session intervals.
- Scales linearly with active participants, not total sessions.
- Naturally partitions data by day — no lifetime aggregates to maintain.

**Session count logic:** Increment `session_count` when a co-presence is
detected and the row's `updated_at` is older than 10 minutes (meaning there
was a gap since the last batch tick for this pair today). This counts distinct
"conversations" rather than batch ticks. For a new row (first co-presence of
the day), `session_count` starts at 1.

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

## Site settings

```yaml
resenha_analytics_enabled:
  default: true

resenha_session_retention_days:
  default: 400
  min: 7
  max: 3650
```

- `resenha_analytics_enabled` — master toggle. When disabled, no sessions or
  co-presence data is recorded. Existing data is preserved but not updated.
- `resenha_session_retention_days` — how long to keep session and co-presence
  rows before the purge job deletes them.

## Data retention

**Job:** `Resenha::PurgeOldSessions` (runs daily)

- Delete `resenha_sessions` rows older than `resenha_session_retention_days`.
- Delete `resenha_co_presences` rows older than
  `resenha_session_retention_days`. Since co-presence is date-partitioned,
  old rows can be purged alongside sessions — any feature queries already
  filter by date range, so removing old rows has no impact.

## Implementation plan

### Phase 1: Session tracking

1. Create `resenha_sessions` migration.
2. Add site settings (`resenha_analytics_enabled`,
   `resenha_session_retention_days`).
3. Record join/leave in `RoomsController`.
4. Add orphan cleanup job.
5. Add data retention job (`PurgeOldSessions`).
6. Add session data to the room serializer (user's own session count for the
   room, as a lightweight "you've visited this room X times" indicator).

### Phase 2: Co-presence

1. Create `resenha_co_presences` migration.
2. Implement `UpdateCoPresence` job.
3. Add API endpoint for a user to fetch their own top contacts
   (`GET /resenha/contacts`).

## Future work

- **Smart notifications** — see `smart-notifications.md`.
- **Admin dashboard** — see `admin-dashboard.md`.

## Privacy considerations

- Session data is only visible to the user themselves and site admins.
- Co-presence data is symmetric — if Alice can see Bob as a top contact, Bob
  can see Alice. There is no way to silently track someone.
- Admins can disable analytics entirely via `resenha_analytics_enabled`.
- Session and co-presence data is purged after `resenha_session_retention_days`.
- No audio is recorded — only presence metadata (who was in which room, when).
