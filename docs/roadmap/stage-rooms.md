# Stage Rooms

## Overview

Add a "Stage" room type where only designated speakers can unmute. Everyone
else joins as a listener — they can hear but not transmit. Moderators and the
room creator control who gets to speak by promoting/demoting participants in
real time.

This is useful for AMAs, announcements, panels, podcasts, and any scenario
where a few people talk and many listen.

## Room types

Introduce a `room_type` field on `resenha_rooms`:

| Type | Value | Behavior |
|------|-------|----------|
| **Open** | `0` | Current default. Everyone can speak. (Existing rooms become this.) |
| **Stage** | `1` | Join muted. Only speakers can unmute. |

Room type is set at creation time and can be changed later by the creator or a
moderator.

## Roles in a Stage room

Reuse the existing `resenha_room_memberships.role` column but add a new value:

| Role | Value | Open room | Stage room |
|------|-------|-----------|------------|
| **Listener** | `0` | Can speak (same as today) | Can hear only. Mic track not requested. |
| **Moderator** | `1` | Can speak + manage | Can speak + manage + promote/demote |
| **Speaker** | `2` | _(unused, same as listener)_ | Can hear and speak. Cannot manage. |

In Open rooms, role `0` and `2` behave identically — everyone speaks. The
distinction only matters in Stage rooms.

The creator is auto-promoted to moderator (existing behavior, unchanged).

### Why not request mic from listeners?

If a listener has no mic track, promoting them to speaker requires them to
grant microphone permission at that moment. Two options:

**Option A — No mic until promoted (lazy acquisition):**
- Listeners join with no `getUserMedia` call at all.
- On promotion to speaker, the frontend requests mic access.
- Pro: No unnecessary permission prompts for listeners.
- Con: ~1-2 second delay when promoted while the browser shows the permission
  dialog.

**Option B — Mic acquired but muted on join (eager acquisition):**
- All users do `getUserMedia` on join, but listeners' tracks are disabled.
- On promotion, just enable the track.
- Pro: Instant unmute on promotion.
- Con: Every listener gets a mic permission prompt even if they'll never speak.

**Recommendation: Option A (lazy).** Most listeners will never be promoted, so
prompting everyone for mic access is wasteful and confusing. The 1-2 second
delay on promotion is acceptable — the user expects something to happen when
they're told "you can now speak."

## User-facing behavior

### Joining a Stage room

1. User clicks the room in the sidebar.
2. No microphone permission requested.
3. User receives all speaker audio streams (WebRTC connections to speakers).
4. Sidebar shows the user under a "Listeners" section (no mic icon).
5. The user cannot unmute — the mute button is absent or disabled with a
   tooltip: "Only speakers can unmute in this room."

### Being promoted to speaker

1. A moderator promotes the listener via the participant context menu →
   "Make speaker."
2. The listener receives a MessageBus event with their new role.
3. Frontend requests microphone permission (`getUserMedia`).
4. Once granted, the frontend establishes peer connections to other speakers
   and the user can unmute.
5. The user moves from "Listeners" to "Speakers" section in the sidebar.
6. A toast notification: "You've been made a speaker."

### Being demoted back to listener

1. A moderator demotes via context menu → "Move to listeners."
2. The speaker's mic track is stopped and all peer connections are closed.
3. The user moves back to the "Listeners" section.
4. Toast: "You've been moved to listeners."
5. The user continues hearing speakers via receive-only connections.

### Sidebar layout for Stage rooms

```
🎙 AMA with CEO          [3 speakers, 42 listeners]
  ├─ Speakers
  │   ├─ 👤 Alice (creator)  🔊
  │   ├─ 👤 Bob              🔇
  │   └─ 👤 Charlie          🔊
  └─ Listeners
      ├─ 👤 Dave
      ├─ 👤 Eve
      └─ +39 more
```

- Speakers section: show all, with speaking/mute indicators (same as today).
- Listeners section: show first few avatars + a count for the rest.
  Listeners don't need per-user indicators since they can't speak.

## Implementation plan

### 1. Add `room_type` column

**Migration:**

```ruby
add_column :resenha_rooms, :room_type, :integer, default: 0, null: false
```

**Model:** `app/models/resenha/room.rb`

```ruby
enum :room_type, { open: 0, stage: 1 }

validates :room_type, inclusion: { in: room_types.keys }
```

### 2. Add `speaker` role

**Model:** `app/models/resenha/room_membership.rb`

Update the role enum:

```ruby
enum :role, { participant: 0, moderator: 1, speaker: 2 }
```

No migration needed — the column is already an integer.

### 3. Update room creation

**File:** `app/controllers/resenha/rooms_controller.rb`

- Accept `room_type` param on create and update.
- Whitelist: `%w[open stage]`.

**File:** `assets/javascripts/discourse/components/resenha-room-form.gjs`

- Add a room type selector to the create/edit form:
  - "Open — everyone can speak" (default)
  - "Stage — only speakers and moderators can unmute"

**File:** `app/serializers/resenha/room_serializer.rb`

- Include `room_type` in the serialized output.

### 4. Backend: enforce speaker permissions

**File:** `app/controllers/resenha/rooms_controller.rb`

**`toggle_mute` action:**

Add a guard: in a stage room, only moderators and speakers can set
`is_muted: false` (unmute). Listeners attempting to unmute get a 403.

```ruby
if room.stage? && !can_speak_in_room?(current_user, room)
  raise Discourse::InvalidAccess if params[:is_muted] == false
end
```

**New helper** in Guardian extension:

```ruby
def can_speak_in_resenha_room?(room)
  return true if room.open?
  membership = room.room_memberships.find_by(user_id: user.id)
  membership&.moderator? || membership&.speaker? || user.admin?
end
```

**`signal` action:**

Listeners in a stage room should not send WebRTC offers/answers to other
listeners (they only need receive-only connections to speakers). The backend
doesn't need to enforce this strictly — the frontend simply won't create
outbound connections for listeners. But as a safeguard, the signal endpoint
can validate that at least one party in the exchange is a speaker/moderator.

### 5. Backend: promote/demote actions

**File:** `app/controllers/resenha/room_memberships_controller.rb`

The existing `update` action already allows changing roles. Extend it to
handle speaker promotion and broadcast the change:

```ruby
def update
  membership = find_membership
  guardian.ensure_can_manage_resenha_room!(membership.room)

  new_role = params[:role]
  membership.update!(role: new_role)

  # Broadcast role change to the affected user
  Resenha::RoomBroadcaster.publish_role_change(
    membership.room,
    membership.user_id,
    new_role
  )

  render json: serialize(membership)
end
```

**File:** `app/services/resenha/room_broadcaster.rb`

New method:

```ruby
def self.publish_role_change(room, user_id, new_role)
  MessageBus.publish(
    "/resenha/rooms/#{room.id}/role",
    { user_id: user_id, role: new_role },
    user_ids: ParticipantTracker.list(room.id).map(&:id)
  )
end
```

### 6. Frontend: WebRTC connection topology for Stage rooms

**File:** `assets/javascripts/discourse/app/services/resenha-webrtc.js`

In an Open room (current behavior):
- Full mesh — every participant connects to every other participant.

In a Stage room:
- **Speakers/moderators** connect to all other speakers/moderators (full mesh
  among speakers).
- **Listeners** establish receive-only connections to each speaker. They do
  NOT connect to other listeners.

**Receive-only connection:** Create an `RTCPeerConnection` where the listener
does not add any local tracks. The speaker's side adds their audio track. The
listener receives the remote stream and attaches it to an audio element.

The offer/answer flow:
1. Speaker creates offer with their audio track.
2. Listener receives offer, creates answer with no tracks (recvonly SDP).
3. Connection established — audio flows speaker → listener.

This means the signaling direction flips for listeners: **speakers initiate
offers to listeners** (not the lower-ID rule used in open rooms). When a new
listener joins a stage room:
1. Backend broadcasts updated participant list.
2. Each speaker sees the new listener and creates an offer.
3. Listener answers each offer (receive-only).

When a listener is promoted to speaker:
1. Listener acquires mic (`getUserMedia`).
2. Existing receive-only connections to other speakers are renegotiated —
   add the local track and renegotiate SDP (or tear down and recreate).
3. New peer connections are created to other listeners (speaker now sends
   to them).

**Renegotiation vs. reconnection:** Renegotiation (`addTrack` +
`createOffer` on existing connection) is cleaner but more complex.
Reconnection (close + reopen) is simpler and more reliable. Recommend
**reconnection** — close all connections and re-establish them with the new
role. The brief audio interruption (~1s) is acceptable for a promotion event.

### 7. Frontend: role change handling

**File:** `assets/javascripts/discourse/app/services/resenha-webrtc.js`

Subscribe to `/resenha/rooms/{id}/role` MessageBus channel on join.

On receiving a role change for the current user:

```javascript
async _handleRoleChange(roomId, newRole) {
  if (newRole === "speaker" || newRole === "moderator") {
    // Acquire mic
    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Reconnect with speaker topology
    this._reconnectAllPeers(roomId);
    // Show toast
    this.toasts.show("You've been made a speaker.");
  } else if (newRole === "participant") {
    // Stop mic
    this.localStream?.getTracks().forEach(t => t.stop());
    this.localStream = null;
    // Reconnect with listener topology
    this._reconnectAllPeers(roomId);
    this.toasts.show("You've been moved to listeners.");
  }
}
```

On receiving a role change for another user: trigger a reconnection for that
peer to match the new topology.

### 8. Frontend: UI changes

**File:** `assets/javascripts/discourse/components/resenha-participant-sidebar-context-menu.gjs`

For moderators, when right-clicking a participant in a Stage room:

- Listener → show "Make speaker"
- Speaker → show "Move to listeners"
- Moderator → show "Move to listeners" (demote to listener) + existing
  "Remove moderator" (demote to speaker, then to listener — or just allow
  direct moderator → listener)

For listeners (self), the context menu:

- No "Mute microphone" option (no mic to mute).
- No "Noise suppression" option.
- "Deafen" still available (they can mute incoming audio).

**File:** Sidebar initializer

- In Stage rooms, split the participant list into two sections: "Speakers"
  and "Listeners."
- Listeners section collapses after showing 5 avatars, with a "+N more"
  indicator.
- Listeners don't show speaking/mute indicators (they can't speak).

**File:** `assets/javascripts/discourse/components/resenha-room-form.gjs`

- Add room type radio buttons to the create/edit form.
- When "Stage" is selected, show a hint: "Participants join as listeners.
  Moderators can promote listeners to speakers."

### 9. Participant metadata

**File:** `app/services/resenha/participant_tracker.rb`

Add `role` to participant metadata so the frontend knows each participant's
role without querying memberships:

```ruby
def self.add(room_id, user_id)
  # existing code...
  role = Resenha::RoomMembership.find_by(room_id: room_id, user_id: user_id)&.role || "participant"
  update_metadata(room_id, user_id, { role: role })
end
```

The frontend reads `role` from participant metadata to determine connection
topology and UI rendering.

### 10. Max participants considerations

In Stage rooms, the participant count may be much higher than Open rooms
since listeners are cheap (no outbound audio). Consider:

- Increase the max_participants upper bound for Stage rooms (e.g., 200
  instead of 50).
- Or add a separate `max_listeners` field.
- For now, just raise the validation ceiling when `room_type == "stage"`:

```ruby
validates :max_participants,
  numericality: {
    greater_than_or_equal_to: 2,
    less_than_or_equal_to: -> (r) { r.stage? ? 200 : 50 }
  },
  allow_nil: true
```

Listeners don't create a full mesh, so 200 listeners connecting to 5 speakers
is 200 × 5 = 1000 peer connections on the speaker side. This will stress
speakers' browsers. At scale, this is the strongest argument for eventually
adding SFU support — but for an initial release with reasonable limits
(~50 listeners), it works.

## Edge cases

- **Sole moderator leaves:** The room has no one who can promote listeners.
  Options: (a) auto-promote the longest-tenured speaker to moderator, or
  (b) leave the room in a "frozen" state where existing speakers continue
  but no new promotions happen. Recommend **(a)** — auto-promote to avoid
  dead rooms.
- **All speakers leave:** Listeners remain connected but hear nothing. This
  is fine — they can leave voluntarily, or the room goes idle and AFK
  detection eventually cleans up.
- **Room type changed from Stage to Open while participants are connected:**
  Broadcast a role change to all listeners promoting them to participants
  (functionally speakers). Each listener's frontend acquires mic and
  reconnects. Show a toast: "This room is now open — you can speak."
- **Room type changed from Open to Stage:** All current participants become
  listeners except moderators. Speakers lose their mic. This is disruptive,
  so show a confirmation dialog to the moderator performing the change.
- **Listener count exceeds sidebar space:** The collapsed "+N more" indicator
  handles this. Clicking it could expand the full list or show a popover.
- **Mic permission denied on promotion:** Show an error toast: "Microphone
  access denied. You need to allow mic access to speak." Revert the user to
  listener role on the frontend (backend role stays as speaker — the user can
  retry by clicking "unmute" which re-triggers `getUserMedia`).

## Future enhancements (out of scope)

- **Hand raise / request to speak:** Listeners can signal they want to talk.
  Moderators see a queue and can promote from it. Covered in a separate plan.
- **SFU for large audiences:** When listener count exceeds ~50, P2P becomes
  impractical. An SFU (mediasoup, LiveKit) would relay speaker audio to all
  listeners through a single server connection.
- **Recording:** Stage rooms are natural candidates for recording since the
  speaker set is controlled and consent is clearer.
- **Invite to stage:** Moderators can send an invitation that the listener
  accepts or declines, rather than instant promotion.
