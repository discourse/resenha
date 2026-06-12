# frozen_string_literal: true

module Resenha
  class RoomsController < ApplicationController
    # Anonymous visitors may browse the directory; the guardian still limits the
    # listing to public rooms, and only when access is open to everyone.
    skip_before_action :ensure_logged_in, only: :index

    before_action :load_room,
                  only: %i[
                    show
                    update
                    destroy
                    join
                    leave
                    participants
                    signal
                    kick
                    heartbeat
                    toggle_mute
                    state
                  ]

    def index
      Resenha::DefaultRoomSeeder.ensure!

      rooms =
        Resenha::Room
          .includes(:room_memberships)
          .order(:created_at)
          .select { |room| guardian.can_see_resenha_room?(room) }

      render json: {
               rooms: serialize_data(rooms, Resenha::RoomSerializer),
               can_create_room: guardian.can_manage_resenha_rooms?,
             }
    end

    def show
      guardian.ensure_can_see_resenha_room!(@room)
      render_serialized @room, Resenha::RoomSerializer, root: :room, include_visit_count: true
    end

    def create
      guardian.ensure_can_create_resenha_room!

      if current_user.resenha_rooms.count >= SiteSetting.resenha_max_rooms_per_user
        raise Discourse::InvalidParameters.new(I18n.t("resenha.errors.room_limit"))
      end

      room = Resenha::Room.new(room_params)
      room.creator = current_user

      if room.save
        Resenha::DirectoryBroadcaster.broadcast(action: :created, room: room)
        Resenha::BadgeGranterHooks.on_room_create(current_user)
        render_serialized room, Resenha::RoomSerializer, root: :room
      else
        render_json_error room
      end
    end

    def update
      guardian.ensure_can_manage_resenha_room!(@room)

      name_changed = room_params[:name].present? && room_params[:name] != @room.name

      if @room.update(room_params)
        Resenha::DirectoryBroadcaster.broadcast(action: :updated, room: @room)
        refresh_participant_statuses(@room) if name_changed
        render_serialized @room, Resenha::RoomSerializer, root: :room
      else
        render_json_error @room
      end
    end

    def destroy
      guardian.ensure_can_manage_resenha_room!(@room)
      @room.destroy!
      Resenha::DirectoryBroadcaster.broadcast(action: :destroyed, room: @room)
      render json: success_json
    end

    def join
      guardian.ensure_can_join_resenha_room!(@room)
      Resenha::ParticipantTracker.add(@room.id, current_user.id)

      membership = @room.room_memberships.find_by(user_id: current_user.id)
      role = membership&.role_name || "participant"
      metadata = { role: role, last_heartbeat_at: Time.now.to_f }

      if SiteSetting.resenha_analytics_enabled
        session = Resenha::Session.create!(user: current_user, room: @room, joined_at: Time.current)
        metadata[:session_id] = session.id
      end

      metadata[:skip_status] = true if params[:skip_status].present?
      Resenha::ParticipantTracker.update_metadata(@room.id, current_user.id, metadata)
      Resenha::RoomBroadcaster.publish_participants(@room)

      participants = Resenha::ParticipantTracker.list(@room.id)
      Resenha::BadgeGranterHooks.on_join(current_user, @room, participants)

      if params[:skip_status].blank?
        Resenha::UserStatusManager.set_voice_status(current_user, @room)
      end

      render json: {
               room:
                 Resenha::RoomSerializer.new(
                   @room,
                   scope: guardian,
                   root: false,
                   include_visit_count: true,
                 ).as_json,
             }
    end

    def leave
      guardian.ensure_can_join_resenha_room!(@room)
      session = close_session_for(@room.id, current_user.id)
      Resenha::ParticipantTracker.remove(@room.id, current_user.id)
      Resenha::UserStatusManager.clear_voice_status(current_user)
      Resenha::RoomBroadcaster.publish_participants(@room)
      Resenha::BadgeGranterHooks.on_leave(current_user, session, room: @room)
      head :no_content
    end

    def heartbeat
      guardian.ensure_can_join_resenha_room!(@room)
      Resenha::ParticipantTracker.add(@room.id, current_user.id)

      metadata = Resenha::ParticipantTracker.get_metadata(@room.id, current_user.id)
      metadata[:last_heartbeat_at] = Time.now.to_f

      if params.key?(:idle_state)
        idle_state = params[:idle_state].to_s
        if %w[active idle afk].include?(idle_state)
          metadata[:idle_state] = idle_state
          Resenha::RoomBroadcaster.publish_participants(@room)
        end
      end

      Resenha::ParticipantTracker.update_metadata(@room.id, current_user.id, metadata)

      if !metadata[:skip_status] && Resenha::UserStatusManager.resenha_status_active?(current_user)
        if metadata[:idle_state] == "afk"
          Resenha::UserStatusManager.set_afk_status(current_user, @room)
        else
          Resenha::UserStatusManager.set_voice_status(current_user, @room)
        end
      end

      head :no_content
    end

    def participants
      guardian.ensure_can_join_resenha_room!(@room)
      all_metadata = Resenha::ParticipantTracker.get_all_metadata(@room.id)
      render json: {
               participants:
                 Resenha::ParticipantTracker
                   .list(@room.id)
                   .map do |user|
                     BasicUserSerializer
                       .new(user, scope: guardian, root: false)
                       .as_json
                       .merge(all_metadata[user.id] || {})
                   end,
             }
    end

    def state
      guardian.ensure_can_join_resenha_room!(@room)

      bool = ActiveModel::Type::Boolean.new
      wants_unmute = params.key?(:muted) && !bool.cast(params[:muted])

      if wants_unmute && @room.stage? && !guardian.can_speak_in_resenha_room?(@room)
        raise Discourse::InvalidAccess.new(I18n.t("resenha.errors.listeners_cannot_unmute"))
      end

      wants_camera = params.key?(:video) && bool.cast(params[:video])
      wants_screen = params.key?(:screen) && bool.cast(params[:screen])

      if wants_camera || wants_screen
        unless @room.video_allowed?
          raise Discourse::InvalidAccess.new(I18n.t("resenha.errors.video_not_allowed"))
        end

        if video_publisher_count(@room, exclude_user_id: current_user.id) >=
             SiteSetting.resenha_video_max_publishers
          raise Discourse::InvalidParameters.new(I18n.t("resenha.errors.video_publisher_limit"))
        end
      end

      metadata = Resenha::ParticipantTracker.get_metadata(@room.id, current_user.id)
      metadata[:is_muted] = bool.cast(params[:muted]) if params.key?(:muted)
      metadata[:is_deafened] = bool.cast(params[:deafened]) if params.key?(:deafened)
      metadata[:is_video_on] = bool.cast(params[:video]) if params.key?(:video)
      metadata[:is_screen_sharing] = bool.cast(params[:screen]) if params.key?(:screen)
      metadata[:watching_video] = bool.cast(params[:watching]) if params.key?(:watching)
      Resenha::ParticipantTracker.update_metadata(@room.id, current_user.id, metadata)

      Resenha::RoomBroadcaster.publish_participants(@room)

      head :no_content
    end

    alias toggle_mute state

    def kick
      guardian.ensure_can_manage_resenha_room!(@room)

      user_id = params.require(:user_id).to_i

      if user_id == current_user.id
        raise Discourse::InvalidParameters.new(I18n.t("resenha.errors.cannot_kick_self"))
      end

      if user_id == @room.creator_id
        raise Discourse::InvalidParameters.new(I18n.t("resenha.errors.cannot_kick_creator"))
      end

      session = close_session_for(@room.id, user_id)
      Resenha::ParticipantTracker.remove(@room.id, user_id)

      kicked_user = User.find_by(id: user_id)
      Resenha::UserStatusManager.clear_voice_status(kicked_user) if kicked_user

      Resenha::BadgeGranterHooks.on_leave(kicked_user, session, room: @room) if kicked_user
      Resenha::RoomBroadcaster.publish_kick(@room, user_id)
      Resenha::RoomBroadcaster.publish_participants(@room)

      head :no_content
    end

    def signal
      guardian.ensure_can_join_resenha_room!(@room)
      payload =
        params
          .require(:payload)
          .permit(
            :type,
            :sdp,
            :recipient_id,
            candidate: {
            },
            metadata: {
            },
            events: [:type, :sdp, { candidate: {}, metadata: {} }],
            messages: [
              :recipient_id,
              :type,
              :sdp,
              {
                candidate: {
                },
                metadata: {
                },
                events: [:type, :sdp, { candidate: {}, metadata: {} }],
              },
            ],
          )
          .to_h
          .deep_symbolize_keys

      if payload.blank?
        raise Discourse::InvalidParameters.new(I18n.t("resenha.errors.missing_payload"))
      end

      relay = Resenha::SignalRelay.new(@room)
      messages = extract_batched_messages(payload)
      recipient_id = payload[:recipient_id].to_i

      if recipient_id.positive?
        events = extract_signal_events(payload)
        messages << { recipient_id: recipient_id, events: events } if events.present?
      end

      if messages.blank?
        raise Discourse::InvalidParameters.new(I18n.t("resenha.errors.missing_payload"))
      end

      messages.each do |message|
        message[:events].each do |event|
          relay.publish!(from: current_user, recipient_id: message[:recipient_id], data: event)
        end
      end

      head :no_content
    end

    private

    def refresh_participant_statuses(room)
      Resenha::ParticipantTracker
        .user_ids(room.id)
        .each do |uid|
          user = User.find_by(id: uid)
          next unless user
          next unless Resenha::UserStatusManager.resenha_status_active?(user)
          Resenha::UserStatusManager.set_voice_status(user, room)
        end
    end

    def close_session_for(room_id, user_id)
      metadata = Resenha::ParticipantTracker.get_metadata(room_id, user_id)
      return unless metadata[:session_id]

      session = Resenha::Session.find_by(id: metadata[:session_id])
      session&.close!
      session
    end

    def video_publisher_count(room, exclude_user_id: nil)
      active_ids = Resenha::ParticipantTracker.user_ids(room.id)
      all_metadata = Resenha::ParticipantTracker.get_all_metadata(room.id)

      active_ids.count do |user_id|
        next false if user_id == exclude_user_id
        metadata = all_metadata[user_id] || {}
        metadata[:is_video_on] || metadata[:is_screen_sharing]
      end
    end

    def room_params
      permitted =
        params.require(:room).permit(
          :name,
          :description,
          :public,
          :max_participants,
          :room_type,
          :video_enabled,
        )
      if permitted.key?(:room_type)
        permitted[:room_type] = Resenha::Room::ROOM_TYPES[permitted[:room_type].to_s] ||
          Resenha::Room::ROOM_TYPE_OPEN
      end
      permitted
    end

    def extract_batched_messages(payload)
      normalize_collection(payload[:messages]).filter_map do |raw_message|
        message = normalize_signal_payload(raw_message)
        next if message.blank?

        recipient_id = message[:recipient_id].to_i
        next unless recipient_id.positive?

        events = extract_signal_events(message)
        next if events.blank?

        { recipient_id: recipient_id, events: events }
      end
    end

    def extract_signal_events(container)
      events =
        normalize_collection(container[:events]).filter_map do |event|
          normalized = normalize_signal_payload(event)
          normalized.presence
        end

      return events if events.present?

      fallback = container.except(:recipient_id, :events, :messages).presence
      fallback ? [fallback] : []
    end

    def normalize_signal_payload(value)
      return {} if value.blank?

      if value.respond_to?(:to_h)
        value.to_h.deep_symbolize_keys
      else
        value
      end
    rescue NoMethodError, TypeError
      {}
    end

    def normalize_collection(raw)
      return [] if raw.blank?

      array =
        if raw.is_a?(Array)
          raw
        elsif raw.respond_to?(:to_unsafe_h)
          raw.to_unsafe_h
        elsif raw.respond_to?(:to_h)
          raw.to_h
        else
          Array.wrap(raw)
        end

      return array if array.is_a?(Array)

      array.sort_by { |key, _| key.to_s }.map { |_, value| value }
    end

    def load_room
      @room =
        Resenha::Room.find_by(id: params[:id]) ||
          Resenha::Room.find_by!(slug: params[:id] || params[:slug])
    end
  end
end
