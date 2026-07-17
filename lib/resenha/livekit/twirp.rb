# frozen_string_literal: true

module Resenha
  module Livekit
    # Shared HTTP layer for LiveKit's Twirp-JSON services (RoomService,
    # Egress). Callers own error handling and timeouts; this only builds the
    # request and signs the short-lived admin token that carries the grants.
    module Twirp
      TOKEN_TTL = 1.minute

      def self.post(service:, method:, body:, grants:, timeout:)
        Excon.post(
          "#{api_base_url}/twirp/livekit.#{service}/#{method}",
          body: body.to_json,
          headers: {
            "Content-Type" => "application/json",
            "Authorization" => "Bearer #{admin_token(grants)}",
          },
          connect_timeout: timeout,
          read_timeout: timeout,
          write_timeout: timeout,
        )
      end

      # The Twirp services listen over HTTP(S) on the same host that serves
      # the SFU's WebSocket signaling.
      def self.api_base_url
        SiteSetting.resenha_livekit_url.sub(/\Awss:/, "https:").sub(/\Aws:/, "http:")
      end

      def self.admin_token(grants)
        payload = {
          iss: SiteSetting.resenha_livekit_api_key,
          exp: TOKEN_TTL.from_now.to_i,
          video: grants,
        }
        JWT.encode(payload, SiteSetting.resenha_livekit_api_secret, "HS256")
      end
    end
  end
end
