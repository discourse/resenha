# frozen_string_literal: true

module Resenha
  # Bridges a Resenha voice room to the Discourse chat plugin.
  #
  # A room is linked to a chat channel; each "chat session" lives in a thread on
  # that channel. There are two flavours, chosen by whether the room has a
  # thread-title template configured:
  #
  # * Templated (e.g. a "Team" room): the system opens the session by posting a
  #   templated starter message ("Meeting at 12:00 on 2026-10-10"). That starter
  #   becomes the thread's title and original message, and every participant
  #   message is a reply in the thread.
  #
  # * Plain (e.g. a "Chill" room): the first message is posted as a regular
  #   channel message. Only when a second message arrives is a thread opened —
  #   using that first message as its original message — and from then on
  #   messages are replies.
  #
  # The live thread id (or, before a plain-mode thread exists, the pending root
  # message id) live in Redis, keyed by room.
  #
  # Liveness is derived from two sources: the timestamp of the session's most
  # recent chat message (messages already carry their own +created_at+, so
  # there's nothing extra to store) and a Redis "last seen" timestamp bumped on
  # the room heartbeat while a participant is present. A session only rolls over
  # to a fresh thread once both have been quiet longer than the room's configured
  # timeout — i.e. it has been idle (no messages) AND empty (no one present).
  class ChatSession
    # Raised when an underlying chat operation is rejected for a reason worth
    # showing the poster (a duplicate or too-long message, threading disabled,
    # etc.) rather than masking it behind a generic "not permitted" error. The
    # controller renders it as a 422 carrying the real message.
    class Error < StandardError
    end

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

      # A snapshot of the room's live chat session for the client: the linked
      # channel, the active thread (if any), and — while a plain-mode session has
      # a first message but no thread yet — that lone root message, serialized,
      # so the panel can render it before the thread exists.
      def state(room)
        channel_id = room.chat_channel_id
        if channel_id.blank? || stale?(room)
          return { channel_id: channel_id, thread_id: nil, root_message_id: nil }
        end

        thread_id = live_thread_id(room)
        root_id = thread_id ? nil : live_root_id(room)

        payload = { channel_id: channel_id, thread_id: thread_id, root_message_id: root_id }
        if root_id
          message = ::Chat::Message.find_by(id: root_id)
          payload[:root_message] = serialize_message(message) if message
        end
        payload
      end

      # The id of the room's live thread, or nil when there is no active
      # (non-stale, still-existing) thread. Never creates a thread.
      def active_thread_id(room)
        return nil if stale?(room)
        live_thread_id(room)
      end

      # Records that a participant is present (called on the room heartbeat) so a
      # session with people in it but no recent messages doesn't roll over.
      # Message recency is read straight from the messages themselves.
      def touch!(room)
        thread = redis.get(thread_key(room.id))
        root = redis.get(root_key(room.id))
        return if thread.blank? && root.blank?

        # Never revive a session that already went idle AND empty — let the next
        # message roll it over to a fresh thread instead.
        return if stale?(room)

        # Keep the identity keys alive alongside presence, so a long, present but
        # quiet session doesn't lose its thread/root pointer to TTL expiry.
        redis.expire(thread_key(room.id), SAFETY_TTL) if thread.present?
        redis.expire(root_key(room.id), SAFETY_TTL) if root.present?
        redis.set(seen_key(room.id), Time.now.to_f, ex: SAFETY_TTL)
      end

      # Starts a session without a participant message. Only templated rooms can
      # start empty (the system posts the starter and opens the thread); a plain
      # room has nothing to root a thread on yet, so this is a no-op for it.
      def start!(room, user)
        channel = ensure_channel!(room)
        with_session_lock(room) do
          roll_over_if_stale!(room)
          # Only templated rooms can start a session without a participant
          # message (the system posts the starter); a plain room has nothing to
          # root a thread on yet. Broadcast only when a thread is actually
          # opened — otherwise a blank request would be a free way to trigger a
          # fan-out refetch on every open panel without changing anything.
          if templated?(room)
            had_thread = live_thread_id(room).present?
            ensure_template_thread!(room, channel)
            publish_state(room) unless had_thread
          end
        end
        nil
      end

      # Posts +message+ as +user+, opening or rolling over the session as needed.
      # Returns the created participant Chat::Message.
      def post_message!(room, user, message)
        channel = ensure_channel!(room)
        with_session_lock(room) do
          roll_over_if_stale!(room)

          instance =
            if templated?(room)
              post_templated!(room, channel, user, message)
            else
              post_plain!(room, channel, user, message)
            end

          publish_state(room)
          instance
        end
      end

      def clear(room_id)
        redis.del(thread_key(room_id))
        redis.del(root_key(room_id))
        redis.del(seen_key(room_id))
      end

      private

      def templated?(room)
        room.chat_thread_title_template.present?
      end

      def ensure_channel!(room)
        room.chat_channel ||
          raise(
            Discourse::InvalidAccess.new(
              :resenha_chat_unavailable,
              nil,
              custom_message: "resenha.errors.chat_unavailable",
            ),
          )
      end

      def roll_over_if_stale!(room)
        clear(room.id) if stale?(room)
      end

      # Serializes the read-modify-write of a room's session so two near
      # simultaneous messages can't, say, each open a thread from the same lone
      # root message.
      def with_session_lock(room, &blk)
        DistributedMutex.synchronize("#{KEY_NAMESPACE}:#{room.id}:chat_lock", &blk)
      end

      # --- templated rooms -----------------------------------------------------

      def post_templated!(room, channel, user, message)
        thread = ensure_template_thread!(room, channel)
        instance =
          create_message!(
            guardian: user.guardian,
            channel_id: channel.id,
            message: message,
            thread_id: thread.id,
          )
        store_thread(room, thread.id)
        instance
      end

      # Opens (or reuses) the templated session: the system posts the interpolated
      # template as a starter message and a thread is created from it, titled with
      # the same text.
      def ensure_template_thread!(room, channel)
        existing = live_thread_id(room)
        return ::Chat::Thread.find(existing) if existing

        # Bail before posting the starter: if the channel can't hold a thread,
        # thread creation would be rejected and leave the starter orphaned as a
        # loose channel message (re-posted on every retry).
        ensure_threading_enabled!(channel)

        text = title_for(room)
        starter =
          create_message!(
            guardian: Discourse.system_user.guardian,
            channel_id: channel.id,
            message: text,
          )
        thread = open_thread!(channel, starter, title: text)
        store_thread(room, thread.id)
        thread
      end

      # --- plain rooms ---------------------------------------------------------

      def post_plain!(room, channel, user, message)
        thread_id = live_thread_id(room)
        if thread_id
          instance =
            create_message!(
              guardian: user.guardian,
              channel_id: channel.id,
              message: message,
              thread_id: thread_id,
            )
          store_thread(room, thread_id)
          return instance
        end

        root = pending_root_message(room, channel)
        if root
          # Second message: promote the lone first message to the start of a
          # thread, then post this message as the first reply. Record the thread
          # *before* posting the reply so that if the reply is rejected (e.g. a
          # duplicate) the session already points at the real thread — the next
          # message continues it instead of re-promoting the same root.
          ensure_threading_enabled!(channel)
          thread = open_thread!(channel, root, user: user)
          store_thread(room, thread.id)
          instance =
            create_message!(
              guardian: user.guardian,
              channel_id: channel.id,
              message: message,
              thread_id: thread.id,
            )
          return instance
        end

        # First message: a regular channel message, remembered as the pending
        # root in case someone replies.
        instance =
          create_message!(guardian: user.guardian, channel_id: channel.id, message: message)
        store_root(room, instance.id)
        instance
      end

      # --- chat plumbing -------------------------------------------------------

      def open_thread!(channel, original_message, title: nil, user: nil)
        guardian = (user || Discourse.system_user).guardian
        params = { channel_id: channel.id, original_message_id: original_message.id }
        params[:title] = title.truncate(::Chat::Thread::MAX_TITLE_LENGTH) if title.present?

        result = ::Chat::CreateThread.call(guardian: guardian, params: params)
        raise_unless_chat_success(result)
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

      def ensure_threading_enabled!(channel)
        return if channel.threading_enabled?
        raise Error, I18n.t("resenha.errors.chat_threading_disabled")
      end

      def raise_unless_chat_success(result)
        return if result.success?
        Rails.logger.warn(
          "[resenha] chat operation failed: #{Service::StepsInspector.new(result).inspect}",
        )
        raise Error, chat_failure_message(result)
      end

      # Best-effort, user-facing reason a chat service failed — the validation
      # error on the rejected message/thread (e.g. "You posted an identical
      # message too recently."), else the failing policy's reason, else a
      # generic fallback. Used verbatim in the 422 the controller returns.
      def chat_failure_message(result)
        record = result.message_instance || result.thread
        if record.respond_to?(:errors) && record.errors.present?
          return record.errors.full_messages.to_sentence
        end
        Service::StepsInspector.new(result).error.presence ||
          I18n.t("resenha.errors.chat_unavailable")
      end

      # Publishes a content-free "something changed" signal, not the state
      # itself: `room.message_bus_targets` is the room's audience, which can be
      # broader than who is actually authorized to see the linked chat channel
      # (e.g. a public room linked to a restricted channel). Clients react by
      # re-fetching through the chat_session endpoint, which re-checks
      # `available_for?` for the requesting user on every call.
      def publish_state(room)
        MessageBus.publish(
          Resenha.room_chat_channel(room.id),
          { type: "updated" },
          **message_bus_targets(room),
        )
      end

      # Same audience the room broadcaster uses: the room's configured targets
      # plus anyone currently present, so a participant who isn't a channel/room
      # member still sees the panel follow along.
      def message_bus_targets(room)
        targets = room.message_bus_targets
        participant_ids = Resenha::ParticipantTracker.user_ids(room.id)
        return targets if participant_ids.empty?
        targets.merge(user_ids: Array(targets[:user_ids] || []) | participant_ids)
      end

      # The subset of a chat message the panel needs to render it, matching the
      # shape of chat's own thread-message serializer.
      def serialize_message(message)
        author = message.user
        {
          id: message.id,
          cooked: message.cooked,
          created_at: message.created_at,
          user: {
            id: author&.id,
            username: author&.username,
            name: author&.name,
            avatar_template: author&.avatar_template,
          },
        }
      end

      # --- redis state ---------------------------------------------------------

      def live_thread_id(room)
        id = redis.get(thread_key(room.id)).to_i
        return nil if id <= 0
        thread = ::Chat::Thread.find_by(id: id, channel_id: room.chat_channel_id)
        return nil unless thread
        # If the thread's original message has been deleted the thread can no
        # longer be loaded by participants, so treat the session as gone and let
        # the next message start a fresh one. (Chat::Message is soft-deleted, so
        # this existence check excludes trashed rows.)
        unless ::Chat::Message.exists?(
                 id: thread.original_message_id,
                 chat_channel_id: room.chat_channel_id,
               )
          return nil
        end
        id
      end

      def live_root_id(room)
        id = redis.get(root_key(room.id)).to_i
        return nil if id <= 0
        return nil unless ::Chat::Message.exists?(id: id, chat_channel_id: room.chat_channel_id)
        id
      end

      # The pending lone first message of a plain-mode session, or nil if it was
      # never set or has since been deleted (in which case the caller treats the
      # incoming message as a fresh first message).
      def pending_root_message(room, channel)
        id = redis.get(root_key(room.id)).to_i
        return nil if id <= 0
        ::Chat::Message.find_by(id: id, chat_channel_id: channel.id)
      end

      def store_thread(room, thread_id)
        redis.set(thread_key(room.id), thread_id, ex: SAFETY_TTL)
        redis.del(root_key(room.id))
      end

      def store_root(room, message_id)
        redis.del(thread_key(room.id))
        redis.set(root_key(room.id), message_id, ex: SAFETY_TTL)
      end

      # A session is stale once it has been both idle (no messages) and empty (no
      # one present, so no heartbeats) for longer than the room's timeout.
      def stale?(room)
        last = liveness_at(room)
        return true if last.nil?
        (Time.now.to_f - last) > room.chat_idle_seconds
      end

      # The most recent sign of life: the newest message in the session, or the
      # last heartbeat while someone was present — whichever is later.
      def liveness_at(room)
        candidates = []
        message_at = last_message_at(room)
        candidates << message_at.to_f if message_at
        seen_at = redis.get(seen_key(room.id))
        candidates << seen_at.to_f if seen_at.present?
        candidates.max
      end

      # Timestamp of the session's most recent (non-deleted) chat message, read
      # straight from the messages — the active thread's latest reply, or the
      # pending plain-mode root before a thread exists.
      def last_message_at(room)
        thread_id = redis.get(thread_key(room.id)).to_i
        if thread_id > 0
          latest = ::Chat::Message.where(thread_id: thread_id).maximum(:created_at)
          return latest if latest
        end

        root_id = redis.get(root_key(room.id)).to_i
        if root_id > 0
          return(
            ::Chat::Message.where(id: root_id, chat_channel_id: room.chat_channel_id).maximum(
              :created_at,
            )
          )
        end

        nil
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

      def root_key(room_id)
        "#{KEY_NAMESPACE}:#{room_id}:chat_root"
      end

      def seen_key(room_id)
        "#{KEY_NAMESPACE}:#{room_id}:chat_seen_at"
      end
    end
  end
end
