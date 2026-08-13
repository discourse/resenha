# frozen_string_literal: true

module Resenha
  class UserStatusManager
    EMOJI = "studio_microphone"
    AFK_EMOJI = "zzz"
    STATUS_EXPIRY = 2.minutes

    def self.set_voice_status(user, room)
      return unless SiteSetting.enable_user_status
      return unless SiteSetting.resenha_auto_status_enabled
      return if user_has_non_resenha_status?(user)

      user.set_status!(status_description(room), EMOJI, STATUS_EXPIRY.from_now)
    end

    def self.set_afk_status(user, room)
      return unless SiteSetting.enable_user_status
      return unless resenha_status_active?(user)

      user.set_status!(status_description(room, afk: true), AFK_EMOJI, STATUS_EXPIRY.from_now)
    end

    def self.clear_voice_status(user)
      return unless SiteSetting.enable_user_status
      return unless resenha_status_active?(user)

      user.clear_status!
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

    private_class_method def self.user_has_non_resenha_status?(user)
      status = user.user_status
      status && !status.expired? && !resenha_emoji?(status.emoji)
    end

    private_class_method def self.resenha_emoji?(emoji)
      [EMOJI, AFK_EMOJI].include?(emoji)
    end
  end
end
