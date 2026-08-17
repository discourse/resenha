# frozen_string_literal: true

module Resenha
  module GuardianExtension
    def can_access_resenha?
      SiteSetting.resenha_enabled? && authenticated? &&
        user.in_any_groups?(SiteSetting.resenha_allowed_groups_map)
    end

    # Whether Resenha is open to everyone, including anonymous visitors. This is
    # the case when `resenha_allowed_groups` includes the "everyone" (or, under
    # the granular permissions model, "anonymous_users") pseudogroup, and it lets
    # logged-out users browse (but not join) public rooms. Never true on
    # login-required sites, where there are no anonymous visitors to serve.
    #
    # We read the stored setting rather than `resenha_allowed_groups_map`
    # because, with `granular_anonymous_and_logged_in_groups_permissions` enabled
    # by default in core, the `_map` accessor rewrites the "everyone" pseudogroup
    # (id 0) to "logged_in_users" (id 5), which would erase an admin's intent to
    # admit anonymous visitors, and is indistinguishable from an admin who
    # deliberately limited access to logged-in users only.
    def resenha_public_access?
      return false unless SiteSetting.resenha_enabled?
      return false if SiteSetting.login_required

      stored_group_ids = SiteSetting.resenha_allowed_groups.to_s.split("|").map(&:to_i)
      stored_group_ids.intersect?(
        [Group::AUTO_GROUPS[:everyone], Group::AUTO_GROUPS[:anonymous_users]],
      )
    end

    def can_create_resenha_room?
      return false unless can_access_resenha?
      user.in_any_groups?(SiteSetting.resenha_create_room_allowed_groups_map)
    end

    # Starting a direct call is gated separately from receiving one: anyone
    # with voice-room access can be called, but only these groups get the
    # call button and the calls endpoint.
    def can_start_resenha_call?
      return false unless can_access_resenha?
      user.in_any_groups?(SiteSetting.resenha_direct_calls_allowed_groups_map)
    end

    # Being allowed to create rooms grants nothing over other people's rooms:
    # a room is managed by site staff, its creator, and its moderators only.
    def can_manage_resenha_room?(room)
      return false unless can_access_resenha?
      return false unless room

      is_staff? || room.creator_id == user.id || room.moderator_ids.include?(user.id)
    end

    def ensure_can_manage_resenha_room!(room)
      unless can_manage_resenha_room?(room)
        raise Discourse::InvalidAccess.new(I18n.t("resenha.errors.not_authorized"))
      end
    end

    def ensure_can_create_resenha_room!
      unless can_create_resenha_room?
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

    # Inviting is sharing access you already have: anyone who can join a
    # public room may invite others to it, while a private room's roster is a
    # management concern — inviting there grants a membership.
    def can_invite_to_resenha_room?(room)
      return false unless can_join_resenha_room?(room)

      room.public? || can_manage_resenha_room?(room)
    end

    def ensure_can_invite_to_resenha_room!(room)
      unless can_invite_to_resenha_room?(room)
        raise Discourse::InvalidAccess.new(I18n.t("resenha.errors.not_authorized"))
      end
    end

    def can_see_resenha_room?(room)
      return false unless room
      return true if can_join_resenha_room?(room)

      # Anonymous and not-yet-authorized visitors may browse public rooms when
      # access is open to everyone. Joining still requires authentication.
      resenha_public_access? && room.public?
    end

    def ensure_can_see_resenha_room!(room)
      unless can_see_resenha_room?(room)
        raise Discourse::InvalidAccess.new(I18n.t("resenha.errors.not_authorized"))
      end
    end

    def can_flag_resenha_user?(room, target_user)
      return false unless can_join_resenha_room?(room)
      return false if target_user.blank? || target_user.bot?

      target_user.id != user.id
    end

    def ensure_can_flag_resenha_user!(room, target_user)
      unless can_flag_resenha_user?(room, target_user)
        raise Discourse::InvalidAccess.new(I18n.t("resenha.errors.not_authorized"))
      end
    end

    def can_speak_in_resenha_room?(room)
      return true if room.open?
      return true if user&.admin?
      membership = room.room_memberships.find { |m| m.user_id == user&.id }
      membership&.can_speak? || false
    end

    # Only stage-room listeners have anything to request — anyone who can
    # already speak (including admins and everyone in open rooms) cannot.
    def can_request_to_speak_in_resenha_room?(room)
      return false unless can_join_resenha_room?(room)
      room.stage? && !can_speak_in_resenha_room?(room)
    end

    def ensure_can_request_to_speak_in_resenha_room!(room)
      unless can_request_to_speak_in_resenha_room?(room)
        raise Discourse::InvalidAccess.new(I18n.t("resenha.errors.not_authorized"))
      end
    end
  end
end
