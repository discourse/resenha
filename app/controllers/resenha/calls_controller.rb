# frozen_string_literal: true

module Resenha
  # Starts a direct call: an ephemeral room holding the caller and callee as
  # peers, surfaced to the callee by the ring the inviter publishes. The room
  # reaps itself through the ephemeral TTL if the call never connects.
  class CallsController < ApplicationController
    def create
      unless guardian.can_start_resenha_call?
        raise Discourse::InvalidAccess.new(I18n.t("resenha.errors.not_authorized"))
      end

      username = params.require(:username).to_s
      callee = User.real.not_staged.find_by(username_lower: username.downcase)
      raise Discourse::NotFound if callee.nil?

      if callee.id == current_user.id || callee.bot? || !callee.guardian.can_access_resenha?
        raise Discourse::InvalidParameters.new(:username)
      end

      # One message for every preference-based refusal (mute, ignore, personal
      # messages disabled or allowlisted), matching what personal messages and
      # chat DMs reveal without saying which preference applied.
      unless guardian.can_call_resenha_user?(callee)
        raise Discourse::InvalidAccess.new(
                "cannot call user",
                nil,
                custom_message: "resenha.errors.cannot_call_user",
              )
      end

      RateLimiter.new(current_user, "resenha-calls", 10, 1.minute).performed!

      room =
        Resenha::EphemeralRoomManager.create!(
          creator: current_user,
          # Named for both parties so neither side reads it as someone else's
          # room. Truncated because two maximum-length usernames can exceed
          # the room name limit.
          name:
            I18n.t(
              "resenha.call.room_name",
              caller: current_user.username,
              callee: callee.username,
            ).truncate(80),
          # A call has no host: either side may pull someone else in.
          moderators: [callee],
        )

      Resenha::RoomInviter.invite!(room: room, inviter: current_user, users: [callee])

      render_serialized room, Resenha::RoomSerializer, root: :room
    end
  end
end
