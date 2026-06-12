# frozen_string_literal: true

module Resenha
  class RoomSerializer < ApplicationSerializer
    attributes :id,
               :name,
               :slug,
               :description,
               :cooked_description,
               :public,
               :room_type,
               :max_participants,
               :created_at,
               :updated_at,
               :member_count,
               :active_participants,
               :creator_id,
               :can_manage,
               :description_excerpt,
               :visit_count,
               :video_enabled,
               :video_allowed

    has_one :membership, serializer: Resenha::RoomMembershipSerializer, embed: :objects

    def membership
      object.room_memberships.find { |membership| membership.user_id == scope.user&.id }
    end

    def member_count
      object.room_memberships.size
    end

    def active_participants
      all_metadata = Resenha::ParticipantTracker.get_all_metadata(object.id)
      Resenha::ParticipantTracker
        .list(object.id)
        .map do |user|
          BasicUserSerializer
            .new(user, scope: scope, root: false)
            .as_json
            .merge(all_metadata[user.id] || {})
        end
    end

    def room_type
      object.room_type_name
    end

    def can_manage
      scope.can_manage_resenha_room?(object)
    end

    def description_excerpt
      object.description&.lines&.first&.truncate(150)
    end

    def visit_count
      Resenha::Session.where(user_id: scope.user.id, room_id: object.id).count
    end

    def include_visit_count?
      scope.user.present? && @options[:include_visit_count]
    end

    def video_allowed
      object.video_allowed?
    end
  end
end
