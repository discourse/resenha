# frozen_string_literal: true

module Jobs
  module Resenha
    class CloseOrphanedSessions < ::Jobs::Scheduled
      every 5.minutes

      def execute(_args)
        return unless SiteSetting.resenha_enabled && SiteSetting.resenha_analytics_enabled

        participant_cache = {}

        ::Resenha::Session.orphaned.find_each do |session|
          participant_ids =
            participant_cache[session.room_id] ||= ::Resenha::ParticipantTracker.user_ids(
              session.room_id,
            )
          next if participant_ids.include?(session.user_id)

          left_at =
            ::Resenha::ParticipantTracker.last_heartbeat_at(session.room_id, session.user_id) ||
              Time.current

          session.close!(at: left_at)
          ::Resenha::ParticipantTracker.remove(session.room_id, session.user_id)

          user = User.find_by(id: session.user_id)
          room = ::Resenha::Room.find_by(id: session.room_id)
          ::Resenha::BadgeGranterHooks.on_leave(user, session, room: room) if user && room
        end
      end
    end
  end
end
