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
      return if room_ids.empty?

      ::Resenha::Room
        .where(id: room_ids)
        .find_each { |room| ::Resenha::RoomBroadcaster.publish_participants(room) }
    end
  end
end
