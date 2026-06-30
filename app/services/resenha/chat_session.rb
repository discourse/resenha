# frozen_string_literal: true

module Resenha
  # Bridges a Resenha voice room to the Discourse chat plugin.
  #
  # A room is linked to a chat channel; each "chat session" is a thread in that
  # channel. The first message (or an explicit start) opens a thread with a
  # templated starter message + title; subsequent messages append to it.
  #
  # The active thread id and a "last touched" timestamp live in Redis, keyed by
  # room. The timestamp is bumped on every message AND on the room heartbeat
  # while participants are present, so a session only rolls over to a fresh
  # thread once it has been idle AND empty of participants for longer than the
  # room's configured timeout.
  class ChatSession
    KEY_NAMESPACE = "resenha:room"
    SAFETY_TTL = 1.day.to_i

    class << self
      def chat_available?
        defined?(::Chat) && SiteSetting.resenha_chat_enabled && SiteSetting.chat_enabled
      end

      # Whether the current user can use chat in this room (chat installed +
      # enabled, a channel is linked, and the user may post in that channel).
      def available_for?(room, guardian)
        return false unless chat_available?
        channel = room.chat_channel
        return false unless channel
        guardian.can_chat? && guardian.can_join_chat_channel?(channel)
      end

      # The id of the room's live thread, or nil when there is no active
      # (non-stale, still-existing) session. Never creates a thread.
      def active_thread_id(room)
        thread_id = redis.get(thread_key(room.id)).to_i
        return nil if thread_id <= 0
        return nil if stale?(room)
        return nil unless ::Chat::Thread.exists?(id: thread_id, channel_id: room.chat_channel_id)
        thread_id
      end

      # Keeps the current session alive (called on each message and on the room
      # heartbeat while a participant is present) so it doesn't roll over.
      def touch!(room)
        return if redis.get(thread_key(room.id)).blank?
        redis.set(touched_key(room.id), Time.now.to_f, ex: SAFETY_TTL)
      end

      # Returns the room's active thread, opening a new one (with a templated
      # starter message + title) when there is no live session.
      def ensure_thread!(room, user)
        channel = room.chat_channel
        raise Discourse::InvalidAccess.new(I18n.t("resenha.errors.chat_unavailable")) unless channel

        existing = active_thread_id(room)
        return ::Chat::Thread.find(existing) if existing

        open_thread!(room, channel, user)
      end

      # Ensures a live thread and posts the message into it as +user+.
      def post_message!(room, user, message)
        thread = ensure_thread!(room, user)

        instance =
          create_message!(
            guardian: user.guardian,
            channel_id: room.chat_channel_id,
            message: message,
            thread_id: thread.id,
          )

        store_active(room, thread.id)
        instance
      end

      def clear(room_id)
        redis.del(thread_key(room_id))
        redis.del(touched_key(room_id))
      end

      private

      def open_thread!(room, channel, user)
        enable_threading!(channel)

        text = title_for(room)
        starter = create_message!(guardian: user.guardian, channel_id: channel.id, message: text)

        result =
          ::Chat::CreateThread.call(
            guardian: user.guardian,
            params: {
              channel_id: channel.id,
              original_message_id: starter.id,
              title: text.truncate(::Chat::Thread::MAX_TITLE_LENGTH),
            },
          )
        raise_unless_chat_success(result)

        store_active(room, result.thread.id)
        result.thread
      end

      def create_message!(guardian:, channel_id:, message:, thread_id: nil)
        result =
          ::Chat::CreateMessage.call(
            guardian: guardian,
            params: { chat_channel_id: channel_id, thread_id: thread_id, message: message }.compact,
            options: {
              enforce_membership: true,
            },
          )
        raise_unless_chat_success(result)
        result.message_instance
      end

      def raise_unless_chat_success(result)
        return if result.success?
        Rails.logger.warn(
          "[resenha] chat message failed: #{Service::StepsInspector.new(result).inspect}",
        )
        raise Discourse::InvalidAccess.new(I18n.t("resenha.errors.chat_unavailable"))
      end

      def enable_threading!(channel)
        channel.update!(threading_enabled: true) unless channel.threading_enabled?
      end

      def store_active(room, thread_id)
        redis.set(thread_key(room.id), thread_id, ex: SAFETY_TTL)
        redis.set(touched_key(room.id), Time.now.to_f, ex: SAFETY_TTL)
      end

      def stale?(room)
        touched = redis.get(touched_key(room.id))
        return true if touched.blank?
        (Time.now.to_f - touched.to_f) > room.chat_idle_seconds
      end

      def title_for(room)
        template =
          room.chat_thread_title_template.presence || I18n.t("resenha.chat.default_thread_title")
        now = Time.zone.now
        template
          .gsub("{time}", now.strftime("%H:%M"))
          .gsub("{date}", now.strftime("%Y-%m-%d"))
          .strip
      end

      def redis
        Discourse.redis
      end

      def thread_key(room_id)
        "#{KEY_NAMESPACE}:#{room_id}:chat_thread"
      end

      def touched_key(room_id)
        "#{KEY_NAMESPACE}:#{room_id}:chat_touched_at"
      end
    end
  end
end
