# frozen_string_literal: true

module Resenha
  class RoomMembershipsController < ApplicationController
    before_action :load_room

    def index
      guardian.ensure_can_manage_resenha_room!(@room)
      render_serialized @room.room_memberships,
                        Resenha::RoomMembershipSerializer,
                        root: :memberships
    end

    def create
      guardian.ensure_can_manage_resenha_room!(@room)
      user = fetch_user
      role = Resenha::RoomMembership.role_value(params[:role])
      membership = @room.room_memberships.find_or_initialize_by(user: user)
      membership.role = role
      membership.save!

      if Resenha::ParticipantTracker.user_ids(@room.id).include?(user.id)
        metadata = Resenha::ParticipantTracker.get_metadata(@room.id, user.id)
        metadata[:role] = membership.role_name
        Resenha::ParticipantTracker.update_metadata(@room.id, user.id, metadata)
        Resenha::RoomBroadcaster.publish_role_change(@room, user.id, membership.role_name)
        Resenha::RoomBroadcaster.publish_participants(@room)
      end

      render_serialized membership, Resenha::RoomMembershipSerializer, root: :membership
    end

    def update
      guardian.ensure_can_manage_resenha_room!(@room)
      membership = @room.room_memberships.find(params[:id])
      new_role = params.require(:role)
      membership.update!(role: Resenha::RoomMembership.role_value(new_role))

      if Resenha::ParticipantTracker.user_ids(@room.id).include?(membership.user_id)
        metadata = Resenha::ParticipantTracker.get_metadata(@room.id, membership.user_id)
        metadata[:role] = membership.role_name
        Resenha::ParticipantTracker.update_metadata(@room.id, membership.user_id, metadata)
        Resenha::RoomBroadcaster.publish_role_change(
          @room,
          membership.user_id,
          membership.role_name,
        )
        Resenha::RoomBroadcaster.publish_participants(@room)
      end

      render_serialized membership, Resenha::RoomMembershipSerializer, root: :membership
    end

    def destroy
      guardian.ensure_can_manage_resenha_room!(@room)
      membership = @room.room_memberships.find(params[:id])
      user_id = membership.user_id
      membership.destroy!

      if Resenha::ParticipantTracker.user_ids(@room.id).include?(user_id)
        metadata = Resenha::ParticipantTracker.get_metadata(@room.id, user_id)
        metadata[:role] = "participant"
        Resenha::ParticipantTracker.update_metadata(@room.id, user_id, metadata)
        Resenha::RoomBroadcaster.publish_role_change(@room, user_id, "participant")
        Resenha::RoomBroadcaster.publish_participants(@room)
      end

      head :no_content
    end

    private

    def fetch_user
      if params[:user_id]
        User.find(params[:user_id])
      elsif params[:username]
        User.find_by_username_or_email(params[:username])
      else
        raise Discourse::InvalidParameters
      end
    end

    def load_room
      @room = Resenha::Room.find(params[:room_id])
    end
  end
end
