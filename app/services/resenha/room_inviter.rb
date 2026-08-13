# frozen_string_literal: true

module Resenha
  # Delivers room invites: records them (so redeemed ones can award badges),
  # grants private-room invitees a membership, and notifies each invitee in
  # Discourse and via web push.
  class RoomInviter
    # An unredeemed invite can be re-sent once it is this old; anything more
    # frequent silently no-ops so repeat invites can't be used to spam
    # notifications at someone.
    RENOTIFY_AFTER = 1.day

    def self.invite!(room:, inviter:, users:)
      users.filter_map { |user| new(room: room, inviter: inviter, user: user).invite! }
    end

    def initialize(room:, inviter:, user:)
      @room = room
      @inviter = inviter
      @user = user
    end

    def invite!
      return if @user.id == @inviter.id || @user.bot?
      return unless @user.guardian.can_access_resenha?

      ensure_membership! unless @room.public?
      return unless @user.guardian.can_join_resenha_room?(@room)

      invite =
        Resenha::Invite.create_or_find_by(
          room_id: @room.id,
          user_id: @user.id,
          invited_by_id: @inviter.id,
        ) { |new_invite| new_invite.source = Resenha::Invite::SOURCES[:notification] }

      # Reported as invited either way: an inviter must not be able to tell
      # they are muted, or probe how recently someone else already invited.
      notify!(invite) if should_notify?(invite)
      @user
    end

    private

    def should_notify?(invite)
      return false if notifications_blocked?
      return true if invite.previously_new_record?

      invite.redeemed_at.nil? && invite.updated_at < RENOTIFY_AFTER.ago
    end

    # Muting silences notifications; ignoring implies muting.
    def notifications_blocked?
      MutedUser.exists?(user_id: @user.id, muted_user_id: @inviter.id) ||
        IgnoredUser.exists?(user_id: @user.id, ignored_user_id: @inviter.id)
    end

    # The room page prompts for the invite to be redeemed on an actual join,
    # so notification clicks and shared links land on the same URL.
    def invite_path
      "/resenha/r/#{@room.slug}/invited-by/#{@inviter.username_lower}"
    end

    def ensure_membership!
      @room
        .room_memberships
        .find_or_create_by!(user: @user) do |membership|
          membership.role = Resenha::RoomMembership::ROLE_PARTICIPANT
        end
    end

    def notify!(invite)
      RateLimiter.new(
        @inviter,
        "resenha-invites-daily",
        SiteSetting.resenha_max_invites_per_day,
        1.day,
      ).performed!

      # Marks the re-notify window without disturbing redemption state.
      invite.touch unless invite.previously_new_record?

      @user.notifications.create!(
        notification_type: Notification.types[:resenha_invitation],
        high_priority: true,
        data: {
          room_id: @room.id,
          room_slug: @room.slug,
          room_name: @room.name,
          display_username: @inviter.username,
        }.to_json,
      )

      payload = nil
      I18n.with_locale(@user.effective_locale) do
        payload = {
          notification_type: Notification.types[:resenha_invitation],
          username: @inviter.username,
          translated_title:
            I18n.t(
              "resenha.invite_notification.title",
              username: @inviter.username,
              room_name: @room.name,
            ),
          excerpt: I18n.t("resenha.invite_notification.excerpt", room_name: @room.name),
          post_url: invite_path,
          tag: "#{Discourse.current_hostname}-resenha-invite-#{@room.id}",
        }
      end

      MessageBus.publish("/notification-alert/#{@user.id}", payload, user_ids: [@user.id])
      PostAlerter.push_notification(@user, payload)
    end
  end
end
