# Resenha Code Review

Date: 2026-03-12

Scope: static review of the plugin in `plugins/resenha`, focused on correctness, security, behavioral edge cases, and high-value follow-up work.

## Findings

### 1. Directory broadcasts leak private-room data and lose user-specific permissions

- `app/services/resenha/directory_broadcaster.rb` publishes the full `RoomSerializer` payload to `/resenha/rooms/index` without any `user_ids` or `group_ids`.
- `assets/javascripts/discourse/app/services/resenha-rooms.js` subscribes every logged-in client to that channel when the plugin is enabled.
- Impact:
  - private room names, descriptions, and participant snapshots can be pushed to users who should not see them;
  - `can_manage` and `membership` are serialized with `Guardian.new(nil)`, so other legitimate viewers receive incorrect permission state after live updates.

### 2. Public-room live events bypass `resenha_allowed_groups`

- `app/models/resenha/room.rb` uses `trust_level_0` for public-room `message_bus_targets`.
- `app/services/resenha/room_broadcaster.rb` publishes participant updates to those targets.
- Impact:
  - if `resenha_allowed_groups` is narrower than “everyone”, users outside the allowed groups can still receive live participant traffic by subscribing to the room channel.

### 3. Failed joins can leave ghost participants, sessions, and user status behind

- `assets/javascripts/discourse/app/services/resenha-webrtc.js` calls `/resenha/rooms/:id/join` before it knows microphone acquisition will succeed.
- If `getUserMedia` fails afterwards, the client tears down local state but does not compensate with `/leave`.
- `app/controllers/resenha/rooms_controller.rb` has already created presence, session metadata, and possibly user status by that point.
- Impact:
  - other users can see a participant who never actually connected;
  - analytics get orphaned sessions;
  - auto status can remain set until expiry.

### 4. Orphaned sessions are closed with the wrong timestamp

- `app/jobs/scheduled/resenha/close_orphaned_sessions.rb` closes open sessions at `session.updated_at || session.joined_at`.
- For untouched orphaned sessions, that is effectively the join time.
- Impact:
  - duration analytics are undercounted, often to zero;
  - duration-based badges can fail to grant.

### 5. Removing a membership does not reconcile live room state

- `app/controllers/resenha/room_memberships_controller.rb` updates live metadata for membership create/update, but not for destroy.
- Impact:
  - a connected stage speaker can keep stale `role` metadata after their membership is removed;
  - users removed from a private room are not actively disconnected and instead fall out on later heartbeat/TTL cleanup.

### 6. `GET /resenha/rooms/:id` is currently broken

- `app/controllers/resenha/rooms_controller.rb` calls `guardian.ensure_can_see_resenha_room!`.
- `lib/resenha/guardian_extension.rb` defines `can_see_resenha_room?`, but no matching `ensure_can_see_resenha_room!`.
- Impact:
  - the `show` action will raise `NoMethodError` if exercised.

## Enhancement Opportunities

### Admin room type path is incomplete

- `assets/javascripts/discourse/components/resenha-room-form.gjs` exposes a room-type control.
- `admin/assets/javascripts/admin/models/resenha-room.js` and `app/controllers/resenha/admin_rooms_controller.rb` do not persist `room_type`.
- Result: the admin UI suggests Stage/Open editing support that is not actually wired through.

### `max_participants` is validated but not enforced on join

- `app/models/resenha/room.rb` validates the value.
- `app/controllers/resenha/rooms_controller.rb` does not prevent joins once the room is full.
- Result: the setting behaves more like metadata than an actual room cap.

### User-status strings should be localized

- `lib/resenha/user_status_manager.rb` hard-codes English status text.
- Result: these strings bypass the plugin locale files and do not follow normal Discourse i18n expectations.

## Test Gaps

- No request coverage for `GET /resenha/rooms/:id`.
- No specs around MessageBus authorization for directory or participant broadcasts.
- No coverage for orphan-session closure timing.
- No client-side test for microphone-denied join cleanup.
