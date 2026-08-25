# frozen_string_literal: true

module Jobs
  class PublishRoomParticipants < ::Jobs::Scheduled
    every 1.minute
    sidekiq_options retry: false
    cluster_concurrency 1

    # Backstop that re-asserts full participant state so clients converge even
    # after missing a broadcast (page-load races, sleep/resume, message-bus
    # backlog gaps). It iterates rooms with recent membership activity rather
    # than scanning for participants keys in Redis: an emptied room's key is
    # gone, but its (empty) state still needs re-broadcasting for a while,
    # otherwise a single missed leave message shows ghosts until reload.
    def execute(args)
      return unless ::Resenha.enabled?

      room_ids = ::Resenha::ParticipantTracker.recently_active_room_ids

      # Auto voice statuses have no ends_at, so a lapsed heartbeat must drop
      # the status the same way it drops the roster entry. Live-anywhere is
      # the keep criterion: a user mid-move between rooms is still live.
      live_user_ids =
        room_ids.flat_map { |room_id| ::Resenha::ParticipantTracker.user_ids(room_id) }.uniq
      ::Resenha::UserStatusManager.clear_stale_statuses(live_user_ids)

      return if room_ids.empty?

      ::Resenha::Room
        .where(id: room_ids)
        .find_each do |room|
          # Backstop for the pin-clear on last leave: a room that emptied
          # without one (crashed clients, missed leave) must not hold its
          # transport for the next call.
          if ::Resenha::ParticipantTracker.user_ids(room.id).empty?
            # No-op once the pin is gone, so an emptied room is deleted from
            # the SFU at most once, on the sweep that clears its pin.
            ::Resenha::Livekit::RoomServiceClient.delete_room(room)
            ::Resenha::ParticipantTracker.clear_transport_pin(room.id)
          end
          ::Resenha::RoomBroadcaster.publish_participants(room)
        end
    end
  end
end
