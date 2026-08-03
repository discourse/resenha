# frozen_string_literal: true

module Jobs
  module Resenha
    class CleanupEphemeralRooms < ::Jobs::Scheduled
      every 5.minutes

      def execute(_args)
        return unless SiteSetting.resenha_enabled

        ::Resenha::EphemeralRoomManager.cleanup!
      end
    end
  end
end
