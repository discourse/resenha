# frozen_string_literal: true

module Resenha
  class SignalRelay
    def initialize(room)
      @room = room
    end

    # Relays only to recipients holding a live participant session, so a
    # queued signal to someone who already left is discarded rather than
    # delivered. The serialized sender rides along so the recipient can render
    # a provisional participant before the roster broadcast catches up.
    def publish!(from:, recipient_id:, data:)
      if data.blank? || recipient_id.blank?
        raise Discourse::InvalidParameters.new(I18n.t("resenha.errors.missing_payload"))
      end

      return false unless Resenha::ParticipantTracker.participant_session?(room.id, recipient_id)

      MessageBus.publish(
        Resenha.room_channel(room.id),
        {
          type: "signal",
          room_id: room.id,
          sender_id: from.id,
          sender: sender_json(from),
          data: data,
        },
        user_ids: Array(recipient_id),
      )
      true
    end

    private

    attr_reader :room

    def sender_json(from)
      @sender_json ||= BasicUserSerializer.new(from, scope: Guardian.new(nil), root: false).as_json
    end
  end
end
