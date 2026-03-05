# Admin Dashboard

## Overview

Admin panel for viewing voice room analytics — usage stats, room and user
leaderboards, peak hours. Uses session and co-presence data from the analytics
system (see `analytics.md`).

## Prerequisites

- Session tracking (analytics Phase 1) — `resenha_sessions` table.
- Co-presence tracking (analytics Phase 2) — `resenha_co_presences` table.

## Admin stats page

Add a tab to the Resenha admin panel showing:

- **Overview:** Total sessions today/week/month, unique active users, average
  session duration.
- **Room leaderboard:** Most active rooms by time and unique users.
- **User leaderboard:** Most active users by time (anonymizable by admin
  toggle).
- **Peak hours:** Heatmap of activity by hour/day of week.

Implementation: A `Resenha::AdminStatsController` with endpoints that run
aggregation queries, consumed by an Ember admin component.

## Example queries

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

## Implementation plan

1. `AdminStatsController` with aggregation endpoints.
2. Ember admin components for stats display.

Note: Site settings (`resenha_analytics_enabled`,
`resenha_session_retention_days`) and the data retention job
(`PurgeOldSessions`) are implemented in analytics Phase 1 — see
`analytics.md`.
