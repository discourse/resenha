# frozen_string_literal: true

module Resenha
  class AdminRoomsController < ::Admin::AdminController
    requires_plugin "resenha"

    def index
      rooms = Resenha::Room.includes(:creator, :room_memberships).order(:name).all

      render_serialized rooms, AdminRoomSerializer, root: :rooms
    end

    def show
      room = Resenha::Room.includes(:creator, :room_memberships).find(params[:id])
      render_serialized room, AdminRoomSerializer, root: :room
    end

    def create
      room = Resenha::Room.new(room_params)
      room.creator = current_user

      if room.save
        render_serialized room, AdminRoomSerializer, root: :room, status: :created
      else
        render_json_error room
      end
    end

    def update
      room = Resenha::Room.find(params[:id])

      if room.update(room_params)
        render_serialized room, AdminRoomSerializer, root: :room
      else
        render_json_error room
      end
    end

    def destroy
      room = Resenha::Room.find(params[:id])
      room.destroy!
      Resenha::Livekit::RoomServiceClient.delete_room(room)
      Resenha::ParticipantTracker.clear_transport_pin(room.id)
      head :no_content
    end

    # Emergency lever that force-ends a room's live call: evicts the media
    # session from the SFU, unpins the transport so the next join re-resolves
    # against current settings, and sends every participant the same per-user
    # `kicked` message a room-level kick uses — the client handler already
    # forces a clean leave, so no new client message types are needed.
    def end_call
      room = Resenha::Room.find(params[:id])
      participant_ids = Resenha::ParticipantTracker.user_ids(room.id)

      Resenha::Livekit::RoomServiceClient.delete_room(room)
      Resenha::ParticipantTracker.clear_transport_pin(room.id)
      participant_ids.each { |user_id| Resenha::RoomBroadcaster.publish_kick(room, user_id) }

      head :no_content
    end

    private

    def room_params
      params.require(:room).permit(
        :name,
        :description,
        :public,
        :max_participants,
        :video_enabled,
        :chat_channel_id,
        :chat_idle_minutes,
        :chat_thread_title_template,
      )
    end
  end
end
