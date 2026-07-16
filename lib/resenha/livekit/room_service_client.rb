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

        # Diagnostic probes for the admin status panel. Unlike the sync calls
        # above they run regardless of any room's transport pin, and return a
        # structured result — latency and an error string for the admin to
        # read — instead of a boolean plus a log line.

        def list_rooms
          probe("ListRooms", grants: { roomList: true })
        end

        def list_participants(livekit_room)
          probe(
            "ListParticipants",
            body: {
              room: livekit_room,
            },
            grants: {
              roomAdmin: true,
              room: livekit_room,
            },
          )
        end

        private

        def sync?(room)
          Livekit.configured? && Resenha::ParticipantTracker.pinned_transport(room.id) == "livekit"
        end

        def call(room, method, body: {}, grants: { roomAdmin: true })
          return unless sync?(room)

          livekit_room = Livekit.room_name(room)
          response = post(method, body.merge(room: livekit_room), grants.merge(room: livekit_room))

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

        def probe(method, body: {}, grants:)
          return { ok: false, error: "LiveKit is not configured" } unless Livekit.configured?

          started = Process.clock_gettime(Process::CLOCK_MONOTONIC)
          response = post(method, body, grants)
          latency_ms = elapsed_ms(started)

          if response.status == 200
            { ok: true, latency_ms:, data: JSON.parse(response.body) }
          else
            {
              ok: false,
              latency_ms:,
              error: "HTTP #{response.status} #{response.body.to_s.truncate(200)}",
            }
          end
        rescue StandardError => e
          { ok: false, latency_ms: elapsed_ms(started), error: "#{e.class}: #{e.message}" }
        end

        def elapsed_ms(started)
          ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - started) * 1000).round
        end

        def post(method, body, grants)
          Excon.post(
            "#{api_base_url}/twirp/livekit.RoomService/#{method}",
            body: body.to_json,
            headers: {
              "Content-Type" => "application/json",
              "Authorization" => "Bearer #{admin_token(grants)}",
            },
            connect_timeout: TIMEOUT_SECONDS,
            read_timeout: TIMEOUT_SECONDS,
            write_timeout: TIMEOUT_SECONDS,
          )
        end

        # RoomService listens over HTTP(S) on the same host that serves the
        # SFU's WebSocket signaling.
        def api_base_url
          SiteSetting.resenha_livekit_url.sub(/\Awss:/, "https:").sub(/\Aws:/, "http:")
        end

        def admin_token(grants)
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
end
