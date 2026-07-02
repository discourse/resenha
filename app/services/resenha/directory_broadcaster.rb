# frozen_string_literal: true

module Resenha
  class DirectoryBroadcaster
    def self.broadcast(action:, room:)
      new(room, action).broadcast
    end

    def initialize(room, action)
      @room = room
      @action = action
    end

    def broadcast
      MessageBus.publish(
        Resenha.room_index_channel,
        {
          type: action,
          room: Resenha::RoomSerializer.new(room, scope: Guardian.new(nil), root: false).as_json,
        },
        **targets,
      )
    end

    private

    attr_reader :room, :action

    def targets
      if room.public?
        Resenha.public_room_message_bus_targets
      else
        { user_ids: room.member_ids }
      end
    end
  end
end
