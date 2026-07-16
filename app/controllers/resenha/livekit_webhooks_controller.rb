# frozen_string_literal: true

module Resenha
  # Receives LiveKit server webhooks. Strictly a reconcile-only backstop:
  # events may early-expire presence LiveKit knows is gone, or clear the
  # transport pin of a finished room — but they never create presence and
  # never touch Session rows. Heartbeats and CloseOrphanedSessions remain the
  # source of truth on both transports, so undelivered webhooks cost nothing
  # but reaction time.
  class LivekitWebhooksController < ApplicationController
    skip_before_action :ensure_logged_in,
                       :verify_authenticity_token,
                       :redirect_to_login_if_required,
                       :redirect_to_profile_if_required,
                       :check_xhr,
                       :preload_json

    def create
      body = request.body.read

      begin
        Livekit::WebhookVerifier.verify!(
          authorization: request.headers["Authorization"],
          body: body,
        )
      rescue Livekit::WebhookVerifier::VerificationError => e
        Rails.logger.warn("[resenha-livekit] rejected webhook: #{e.message}")
        return head :forbidden
      end

      Livekit.touch_last_webhook!

      event = parse_event(body)
      return head :bad_request if event.nil?

      case event["event"]
      when "participant_left", "participant_connection_aborted"
        expire_participant(event)
      when "room_finished"
        finish_room(event)
      end

      head :ok
    end

    private

    def parse_event(body)
      parsed = JSON.parse(body)
      parsed.is_a?(Hash) ? parsed : nil
    rescue JSON::ParserError
      nil
    end

    def expire_participant(event)
      room = event_room(event)
      return if room.nil?

      user_id = event.dig("participant", "identity").to_i
      return if user_id <= 0

      expired =
        Resenha::ParticipantTracker.expire_presence(
          room.id,
          user_id,
          gone_at: event_created_at(event),
        )
      Resenha::RoomBroadcaster.publish_participants_if_changed(room) if expired
    end

    def finish_room(event)
      room = event_room(event)
      return if room.nil?

      Resenha::ParticipantTracker.clear_transport_pin(room.id)
    end

    # Resolves the event's LiveKit room name back to a room, ignoring events
    # for other sites on a shared server (foreign prefix) and for rooms not
    # currently pinned to livekit — a mesh call's presence is none of
    # LiveKit's business, however stale the SFU's view of the room is.
    def event_room(event)
      room_id = Livekit.room_id_from_name(event.dig("room", "name"))
      return if room_id.nil?
      return if Resenha::ParticipantTracker.pinned_transport(room_id) != "livekit"

      Resenha::Room.find_by(id: room_id)
    end

    # Proto3 JSON renders int64 as a string; tolerate a plain number too.
    def event_created_at(event)
      ts = event["createdAt"].to_i
      ts.positive? ? Time.at(ts) : nil
    end
  end
end
