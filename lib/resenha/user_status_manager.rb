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

      user.set_status!("In #{room.name}", EMOJI, STATUS_EXPIRY.from_now)
    end

    def self.set_afk_status(user, room)
      return unless SiteSetting.enable_user_status
      return unless resenha_status_active?(user)

      user.set_status!("AFK in #{room.name}", AFK_EMOJI, STATUS_EXPIRY.from_now)
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

    private_class_method def self.user_has_non_resenha_status?(user)
      status = user.user_status
      status && !status.expired? && !resenha_emoji?(status.emoji)
    end

    private_class_method def self.resenha_emoji?(emoji)
      [EMOJI, AFK_EMOJI].include?(emoji)
    end
  end
end
