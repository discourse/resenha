# frozen_string_literal: true

module Resenha
  module GuardianExtension
    def can_access_resenha?
      SiteSetting.resenha_enabled? && authenticated? &&
        user.in_any_groups?(SiteSetting.resenha_allowed_groups_map)
    end

    def can_manage_resenha_rooms?
      return false unless can_access_resenha?
      user.in_any_groups?(SiteSetting.resenha_create_room_allowed_groups_map)
    end

    def can_manage_resenha_room?(room)
      return false unless can_access_resenha?
      return false unless room

      can_manage_resenha_rooms? || room.creator_id == user&.id ||
        room.moderator_ids.include?(user&.id)
    end

    def ensure_can_manage_resenha_room!(room)
      unless can_manage_resenha_room?(room)
        raise Discourse::InvalidAccess.new(I18n.t("resenha.errors.not_authorized"))
      end
    end

    def ensure_can_create_resenha_room!
      unless can_manage_resenha_rooms?
        raise Discourse::InvalidAccess.new(I18n.t("resenha.errors.not_authorized"))
      end
    end

    def can_join_resenha_room?(room)
      return false unless can_access_resenha?
      return false unless room

      room.public? || room.member_ids.include?(user.id) || can_manage_resenha_room?(room)
    end

    def ensure_can_join_resenha_room!(room)
      unless can_join_resenha_room?(room)
        raise Discourse::InvalidAccess.new(I18n.t("resenha.errors.not_authorized"))
      end
    end

    def can_see_resenha_room?(room)
      can_join_resenha_room?(room)
    end

    def ensure_can_see_resenha_room!(room)
      unless can_see_resenha_room?(room)
        raise Discourse::InvalidAccess.new(I18n.t("resenha.errors.not_authorized"))
      end
    end

    def can_speak_in_resenha_room?(room)
      return true if room.open?
      return true if user&.admin?
      membership = room.room_memberships.find { |m| m.user_id == user&.id }
      membership&.can_speak? || false
    end
  end
end
