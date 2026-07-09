# frozen_string_literal: true

module Jobs
  # One-shot connectivity probe enqueued whenever a LiveKit setting changes,
  # so a bad URL or key pair surfaces on the admin status panel (and in the
  # logs) within seconds of saving — not at the first user's failed join.
  class ResenhaLivekitProbe < ::Jobs::Base
    sidekiq_options retry: false

    def execute(args)
      unless ::Resenha::Livekit.configured?
        # Deconfiguring is also a settings change: drop the stale result
        # instead of reporting the health of a server we no longer use.
        ::Resenha::Livekit::HealthCheck.clear_probe!
        return
      end

      result = ::Resenha::Livekit::HealthCheck.connectivity_check
      ::Resenha::Livekit::HealthCheck.store_probe!(result)

      if !result[:ok]
        errors = [result.dig(:token, :error), result.dig(:server, :error)].compact.join("; ")
        Rails.logger.warn("[resenha-livekit] connectivity probe failed: #{errors}")
      end
    end
  end
end
