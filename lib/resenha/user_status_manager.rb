# frozen_string_literal: true

module Resenha
  class UserStatusManager
    EMOJI = "studio_microphone"
    AFK_EMOJI = "zzz"

    # Statuses carry no ends_at: they mirror room presence, not a timer, so
    # the tooltip shows no "until" line. Leave/kick clear them directly;
    # crashed or lapsed clients are reaped by clear_stale_statuses.
    def self.set_voice_status(user, room)
      return unless SiteSetting.enable_user_status
      return unless SiteSetting.resenha_auto_status_enabled
      return if user_has_non_resenha_status?(user)

      set_status(user, status_description(room), EMOJI)
    end

    def self.set_afk_status(user, room)
      return unless SiteSetting.enable_user_status
      return unless resenha_status_active?(user)

      set_status(user, status_description(room, afk: true), AFK_EMOJI)
    end

    def self.clear_voice_status(user)
      return unless SiteSetting.enable_user_status
      return unless resenha_status_active?(user)

      user.clear_status!
    end

    # Reaps the statuses of users whose room presence lapsed without a
    # leave/kick (crashed client, dead network, sleeping laptop). Callers pass
    # the lapsed participants — never a site-wide set, so a manually set
    # status that happens to use our emojis is only ever cleared for someone
    # who was actually in a room.
    def self.clear_stale_statuses(user_ids)
      return unless SiteSetting.enable_user_status
      return if user_ids.empty?

      UserStatus
        .where(user_id: user_ids, emoji: [EMOJI, AFK_EMOJI])
        .find_each { |status| User.find_by(id: status.user_id)&.clear_status! }
    end

    def self.resenha_status_active?(user)
      status = user.user_status
      status && !status.expired? && resenha_emoji?(status.emoji)
    end

    # Statuses are visible site-wide, so a non-public room's name must not
    # appear in them — even room members get the generic description.
    private_class_method def self.status_description(room, afk: false)
      prefix = afk ? "afk_" : ""
      if room.public?
        I18n.t("resenha.user_status.#{prefix}in_room", room_name: room.name)
      else
        I18n.t("resenha.user_status.#{prefix}in_private_room")
      end
    end

    # Without an expiry to roll, an unchanged status needs no upsert — this
    # keeps the every-beat heartbeat call from republishing over message bus.
    private_class_method def self.set_status(user, description, emoji)
      status = user.user_status
      return if status && status.description == description && status.emoji == emoji

      user.set_status!(description, emoji)
    end

    private_class_method def self.user_has_non_resenha_status?(user)
      status = user.user_status
      status && !status.expired? && !resenha_emoji?(status.emoji)
    end

    private_class_method def self.resenha_emoji?(emoji)
      [EMOJI, AFK_EMOJI].include?(emoji)
    end
  end
end
