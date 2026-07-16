# frozen_string_literal: true

module Resenha
  module Livekit
    # Minimal Twirp-JSON client for the three RoomService calls that keep the
    # SFU in sync with Discourse-side moderation and lifecycle events. Every
    # call is best-effort and no-ops for rooms not pinned to LiveKit: the SFU
    # being slow or down must never fail the Discourse request that triggered
    # the call, and mesh rooms must make zero HTTP requests.
    class RoomServiceClient
      TIMEOUT_SECONDS = 2
      TOKEN_TTL = 1.minute

      class << self
        def remove_participant(room, user_id)
          call(room, "RemoveParticipant", body: { identity: user_id.to_s })
        end

        # UpdateParticipant replaces the participant's whole permission
        # object, so this sends the full set mirroring the access-token
        # grants — sending only `canPublish` would silently revoke
        # `canSubscribe` and deafen the participant.
        def update_participant(room, user)
          can_publish = user.guardian.can_speak_in_resenha_room?(room)
          call(
            room,
            "UpdateParticipant",
            body: {
              identity: user.id.to_s,
              permission: {
                canSubscribe: true,
                canPublish: can_publish,
                canPublishData: false,
                canPublishSources: Livekit.publish_sources(room, can_publish).map(&:upcase),
                hidden: false,
                recorder: false,
              },
            },
          )
        end

        def delete_room(room)
          # LiveKit guards DeleteRoom behind the roomCreate grant; a
          # room-scoped roomAdmin token gets "permissions denied".
          call(room, "DeleteRoom", grants: { roomCreate: true })
        end

        private

        def sync?(room)
          Livekit.configured? && Resenha::ParticipantTracker.pinned_transport(room.id) == "livekit"
        end

        def call(room, method, body: {}, grants: { roomAdmin: true })
          return unless sync?(room)

          livekit_room = Livekit.room_name(room)
          response =
            Excon.post(
              "#{api_base_url}/twirp/livekit.RoomService/#{method}",
              body: body.merge(room: livekit_room).to_json,
              headers: {
                "Content-Type" => "application/json",
                "Authorization" => "Bearer #{admin_token(livekit_room, grants)}",
              },
              connect_timeout: TIMEOUT_SECONDS,
              read_timeout: TIMEOUT_SECONDS,
              write_timeout: TIMEOUT_SECONDS,
            )

          if response.status == 200
            true
          else
            Rails.logger.warn(
              "[resenha-livekit] #{method} failed for room #{room.id}: " \
                "HTTP #{response.status} #{response.body.to_s.truncate(200)}",
            )
            false
          end
        rescue StandardError => e
          Rails.logger.warn(
            "[resenha-livekit] #{method} failed for room #{room.id}: #{e.class} #{e.message}",
          )
          false
        end

        # RoomService listens over HTTP(S) on the same host that serves the
        # SFU's WebSocket signaling.
        def api_base_url
          SiteSetting.resenha_livekit_url.sub(/\Awss:/, "https:").sub(/\Aws:/, "http:")
        end

        def admin_token(livekit_room, grants)
          payload = {
            iss: SiteSetting.resenha_livekit_api_key,
            exp: TOKEN_TTL.from_now.to_i,
            video: grants.merge(room: livekit_room),
          }
          JWT.encode(payload, SiteSetting.resenha_livekit_api_secret, "HS256")
        end
      end
    end
  end
end
