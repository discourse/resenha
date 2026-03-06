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

          fallback_time = session.updated_at || session.joined_at
          session.close!(at: fallback_time)

          user = User.find_by(id: session.user_id)
          room = ::Resenha::Room.find_by(id: session.room_id)
          ::Resenha::BadgeGranterHooks.on_leave(user, session, room: room) if user && room
        end
      end
    end
  end
end
