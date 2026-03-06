# Admin Dashboard

## Overview

Admin panel for viewing voice room analytics — usage stats, room and user
leaderboards, peak hours. Uses session and co-presence data from the analytics
system.

## Prerequisites

- Session tracking — `resenha_sessions` table (joined_at, left_at).
- Co-presence tracking — `resenha_co_presences` table.
- Site settings: `resenha_analytics_enabled`, `resenha_session_retention_days`.

## Dashboard sections

A new **Dashboard** tab alongside the existing **Rooms** tab in the Resenha
admin panel. All sections share a **period selector** (today / 7 days / 30 days
/ 90 days).

### Overview

- Total sessions in period
- Unique active users in period
- Average session duration

### Room leaderboard

- Most active rooms ranked by total time and unique users
- Columns: room name, unique users, total hours

### User leaderboard

- Most active users ranked by total time
- Columns: username/avatar, total hours, session count
- Admin toggle (site setting `resenha_dashboard_anonymize_users`) to anonymize
  usernames

### Peak hours heatmap (deferred — v2)

- Heatmap of activity by hour/day of week
- Deferred to v2 to keep the first implementation focused

## Duration computation

Sessions store `joined_at` and `left_at`. Duration is computed inline:

```sql
EXTRACT(EPOCH FROM (COALESCE(left_at, NOW()) - joined_at))
```

Active sessions (left_at IS NULL) are included via COALESCE.

## API design

Separate endpoints per section, scoped under the admin plugin namespace. Each
accepts a `period` param (number of days: 1, 7, 30, 90).

- `GET /admin/plugins/resenha/stats/overview.json?period=7`
- `GET /admin/plugins/resenha/stats/rooms.json?period=7`
- `GET /admin/plugins/resenha/stats/users.json?period=7`

## Ember routing

Add `resenha-dashboard` as a sibling route to `resenha-rooms` in the admin
route map. The dashboard is the index/default tab.

## Implementation plan

1. Backend: `Resenha::AdminStatsController` with three action methods
   (overview, rooms, users), each running aggregation queries.
2. Frontend: Ember route + component for the dashboard with period selector and
   stat cards/tables.
3. Tests: request specs for the controller endpoints.
