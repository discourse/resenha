# frozen_string_literal: true

module Resenha
  # Status payloads report presence booleans, latencies and error strings —
  # never setting values. A request spec pins that the API secret cannot
  # appear here (or in any serializer) whatever state the probes are in.
  class AdminLivekitController < ::Admin::AdminController
    requires_plugin "resenha"

    def status
      configured = Livekit.configured?

      payload = {
        configured:,
        settings: Livekit::HealthCheck.settings_status,
        last_webhook_at: Livekit.last_webhook_at&.iso8601,
        last_probe: Livekit::HealthCheck.last_probe,
        rooms: [],
      }

      if configured
        payload[:token_check] = Livekit::HealthCheck.token_check
        payload[:server_check] = Livekit::HealthCheck.server_check

        # When the server is already known unreachable, per-room participant
        # probes would only stack timeouts onto the response.
        rooms =
          Livekit::HealthCheck.pinned_rooms_status(probe_participants: payload[:server_check][:ok])
        payload[:rooms] = rooms
        payload[:usernames] = usernames_for(rooms)
      end

      render json: payload
    end

    private

    # Id → username for every id in the roster diffs, so the panel can show
    # who is ghosting instead of bare ids.
    def usernames_for(rooms)
      user_ids =
        rooms
          .flat_map { |room| [room[:presence_user_ids], room[:livekit_user_ids]] }
          .flatten
          .compact
          .uniq
      return {} if user_ids.empty?

      User.where(id: user_ids).pluck(:id, :username).to_h
    end
  end
end
