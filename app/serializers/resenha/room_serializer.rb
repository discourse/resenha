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
               :message_bus_last_id,
               :active_participants,
               :creator_id,
               :can_manage,
               :description_excerpt,
               :visit_count,
               :video_enabled,
               :video_allowed,
               :chat_channel_id,
               :chat_idle_minutes,
               :chat_thread_title_template,
               :chat_available

    has_one :membership, serializer: Resenha::RoomMembershipSerializer, embed: :objects

    def membership
      object.room_memberships.find { |membership| membership.user_id == scope.user&.id }
    end

    def member_count
      object.room_memberships.size
    end

    # Read before active_participants (attributes serialize in declaration
    # order) so clients subscribing from this position replay, at worst,
    # broadcasts already reflected in the snapshot — never a gap.
    def message_bus_last_id
      MessageBus.last_id(Resenha.room_channel(object.id))
    end

    def active_participants
      tracked_participants.map do |user|
        BasicUserSerializer
          .new(user, scope: scope, root: false)
          .as_json
          .merge(participant_metadata[user.id] || {})
      end
    end

    def room_type
      object.room_type_name
    end

    def can_manage
      return @can_manage if defined?(@can_manage)
      @can_manage = scope.can_manage_resenha_room?(object)
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

    def chat_available
      return @chat_available if defined?(@chat_available)
      @chat_available = Resenha::ChatSession.available_for?(object, scope)
    end

    # The room's chat wiring isn't for general consumption: whether chat is
    # usable only matters to someone actually in the room (or managing it),
    # and the channel link plus session settings are only edited by managers.
    # Everyone else — including the anonymously-scoped directory broadcasts —
    # gets a room without chat fields; the client preserves the ones it
    # already knows across those broadcasts.
    def include_chat_available?
      can_manage || participating?
    end

    def include_chat_channel_id?
      can_manage
    end

    def include_chat_idle_minutes?
      can_manage
    end

    def include_chat_thread_title_template?
      can_manage
    end

    private

    def tracked_participants
      @tracked_participants ||= Resenha::ParticipantTracker.list(object.id)
    end

    def participant_metadata
      @participant_metadata ||= Resenha::ParticipantTracker.get_all_metadata(object.id)
    end

    def participating?
      scope.user.present? && tracked_participants.any? { |user| user.id == scope.user.id }
    end
  end
end
