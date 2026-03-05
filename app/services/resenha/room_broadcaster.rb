# frozen_string_literal: true

module Resenha
  class RoomBroadcaster
    def self.publish_participants(room)
      new(room).publish_participants
    end

    def self.publish_kick(room, user_id)
      new(room).publish_kick(user_id)
    end

    def self.publish_role_change(room, user_id, new_role)
      new(room).publish_role_change(user_id, new_role)
    end

    def initialize(room)
      @room = room
    end

    def publish_participants
      guardian = Guardian.new(nil)
      all_metadata = Resenha::ParticipantTracker.get_all_metadata(room.id)
      payload = {
        type: "participants",
        room_id: room.id,
        participants:
          Resenha::ParticipantTracker
            .list(room.id)
            .map do |user|
              BasicUserSerializer
                .new(user, scope: guardian, root: false)
                .as_json
                .merge(all_metadata[user.id] || {})
            end,
      }

      MessageBus.publish(Resenha.room_channel(room.id), payload, **room.message_bus_targets)
    end

    def publish_room(payload)
      MessageBus.publish(
        Resenha.room_channel(room.id),
        payload.merge(room_id: room.id),
        **room.message_bus_targets,
      )
    end

    def publish_kick(user_id)
      MessageBus.publish(
        Resenha.room_channel(room.id),
        { type: "kicked", room_id: room.id },
        user_ids: [user_id],
      )
    end

    def publish_role_change(user_id, new_role)
      participant_ids = Resenha::ParticipantTracker.user_ids(room.id)
      return if participant_ids.empty?

      MessageBus.publish(
        Resenha.room_channel(room.id),
        { type: "role_change", room_id: room.id, user_id: user_id, role: new_role },
        user_ids: participant_ids,
      )
    end

    private

    attr_reader :room
  end
end
