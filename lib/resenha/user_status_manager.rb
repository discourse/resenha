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

      user.set_status!(description_for(user, room, afk: false), EMOJI, STATUS_EXPIRY.from_now)
    end

    def self.set_afk_status(user, room)
      return unless SiteSetting.enable_user_status
      return unless resenha_status_active?(user)

      user.set_status!(description_for(user, room, afk: true), AFK_EMOJI, STATUS_EXPIRY.from_now)
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

    # A user status carries no audience: core stores one string and renders it to
    # everyone who can see the user, so it may only name a room whose name is
    # already discoverable. A non-public room's name reaches its members alone,
    # and an ephemeral room is kept out of every discovery surface and named by
    # whichever feature created it (a direct call, an event) from strings this
    # plugin does not control — both get a generic description instead.
    def self.room_nameable_in_status?(room)
      room.public? && !room.ephemeral?
    end

    private_class_method def self.description_for(user, room, afk:)
      key =
        if room_nameable_in_status?(room)
          afk ? "afk_in_room" : "in_room"
        else
          afk ? "afk_in_voice_room" : "in_voice_room"
        end

      # The owner's locale, since the string is stored once and their status is
      # read as their own words.
      description =
        I18n.with_locale(user.effective_locale) do
          I18n.t("resenha.user_status.#{key}", room: room.name)
        end

      # A verbose locale plus an 80-character room name can outgrow the column,
      # and set_status! validates rather than truncates — which would turn a
      # cosmetic status into a failed join.
      description.truncate(UserStatus::MAX_DESCRIPTION_LENGTH)
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
