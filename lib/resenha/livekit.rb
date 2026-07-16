# frozen_string_literal: true

module Resenha
  module Livekit
    # Raised when an access token cannot be minted (typically a half-deleted
    # configuration on a room whose live call is already pinned to LiveKit).
    class MintError < StandardError
    end

    TOKEN_TTL = 10.minutes

    def self.configured?
      SiteSetting.resenha_livekit_url.present? && SiteSetting.resenha_livekit_api_key.present? &&
        SiteSetting.resenha_livekit_api_secret.present?
    end

    def self.available_for?(room)
      return false unless configured?

      case SiteSetting.resenha_livekit_room_policy
      when "all_rooms"
        true
      when "per_room"
        # The per-room column ships separately; `try` keeps the resolver inert
        # until it exists.
        !!room.try(:livekit_enabled)
      else
        false
      end
    end

    # Room id, not slug — slugs are mutable. The database prefix keeps rooms
    # from different sites on a shared cluster apart as defense in depth.
    def self.room_name(room)
      prefix =
        SiteSetting.resenha_livekit_room_prefix.presence ||
          RailsMultisite::ConnectionManagement.current_db
      "#{prefix}-r#{room.id}"
    end

    # The track sources a publisher may send, matching the room's
    # capabilities. Lowercase is the access-token grant spelling; RoomService
    # permission updates use the same names uppercased (the proto enum).
    def self.publish_sources(room, can_publish)
      return [] unless can_publish

      sources = ["microphone"]
      sources.concat(%w[camera screen_share screen_share_audio]) if room.video_allowed?
      sources
    end

    # Least-privilege HS256 JWT: a leaked token can only join this one room,
    # as this one user, for TOKEN_TTL. Guardian remains the sole authority —
    # callers only mint for users who passed `ensure_can_join_resenha_room!`.
    def self.mint_token(user:, room:, guardian:)
      raise MintError, "LiveKit is not fully configured" unless configured?

      can_publish = guardian.can_speak_in_resenha_room?(room)
      sources = publish_sources(room, can_publish)

      payload = {
        iss: SiteSetting.resenha_livekit_api_key,
        sub: user.id.to_s,
        name: user.username,
        exp: TOKEN_TTL.from_now.to_i,
        video: {
          room: room_name(room),
          roomJoin: true,
          canSubscribe: true,
          canPublish: can_publish,
          canPublishSources: sources,
          canPublishData: false,
          canUpdateOwnMetadata: false,
          roomCreate: false,
          roomList: false,
          roomAdmin: false,
          roomRecord: false,
          recorder: false,
          hidden: false,
        },
      }

      JWT.encode(payload, SiteSetting.resenha_livekit_api_secret, "HS256")
    end
  end
end
