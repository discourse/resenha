# frozen_string_literal: true

module Resenha
  class ParticipantTracker
    KEY_NAMESPACE = "resenha:room".freeze
    RECENTLY_ACTIVE_ROOMS_KEY = "resenha:recently_active_rooms".freeze
    SAFETY_TTL = 30.minutes.to_i

    class << self
      def add(room_id, user_id, migrated: false)
        return if user_id.to_i <= 0

        redis.zadd(key(room_id), Time.now.to_f, user_id)
        redis.expire(key(room_id), SAFETY_TTL)
        redis.expire(metadata_key(room_id), SAFETY_TTL)
        touch_recently_active(room_id)
      rescue Redis::CommandError => e
        raise if e.message.exclude?("WRONGTYPE") || migrated
        redis.del(key(room_id))
        add(room_id, user_id, migrated: true)
      end

      def remove(room_id, user_id)
        redis.zrem(key(room_id), user_id)
        redis.hdel(metadata_key(room_id), user_id)
        touch_recently_active(room_id)
      end

      # Reconcile-only early expiry (LiveKit webhooks): backdates the member's
      # presence so it drops out of the roster through the exact same TTL
      # filter a lapsed heartbeat uses. Metadata is kept — session bookkeeping
      # stays with CloseOrphanedSessions. Never creates presence (ZADD XX) and
      # skips members whose presence was refreshed after `gone_at` (a
      # reconnect racing the event). Returns whether anything was expired.
      def expire_presence(room_id, user_id, gone_at: nil)
        # ZSCORE is not on DiscourseRedis's namespaced-command list, so it
        # would silently read an un-namespaced key; ZRANGE is, and rooms are
        # small (bounded by max_participants).
        score = redis.zrange(key(room_id), 0, -1, withscores: true).to_h[user_id.to_s]
        return false if score.nil?
        return false if gone_at && score > gone_at.to_f

        expired_score = Time.now.to_f - SiteSetting.resenha_participant_ttl_seconds - 1
        redis.zadd(key(room_id), [score, expired_score].min, user_id, xx: true)
        touch_recently_active(room_id)
        true
      end

      def list(room_id)
        ids = user_ids(room_id)
        User.where(id: ids)
      end

      def user_ids(room_id, migrated: false)
        cutoff = Time.now.to_f - SiteSetting.resenha_participant_ttl_seconds
        redis.zrangebyscore(key(room_id), cutoff, "+inf").map(&:to_i).select(&:positive?)
      rescue Redis::CommandError => e
        raise if e.message.exclude?("WRONGTYPE") || migrated
        redis.del(key(room_id))
        user_ids(room_id, migrated: true)
      end

      def last_heartbeat_at(room_id, user_id)
        metadata = get_metadata(room_id, user_id)
        ts = metadata[:last_heartbeat_at]
        ts ? Time.at(ts) : nil
      end

      def clear(room_id)
        redis.del(key(room_id))
        redis.del(metadata_key(room_id))
        redis.del(fingerprint_key(room_id))
        redis.del(transport_key(room_id))
      end

      # Never resets an existing timestamp — queue position is first-come.
      # Returns false when already raised so callers can skip re-broadcasting.
      def raise_hand(room_id, user_id)
        metadata = get_metadata(room_id, user_id)
        return false if metadata[:hand_raised_at]

        metadata[:hand_raised_at] = Time.now.to_f
        update_metadata(room_id, user_id, metadata)
        true
      end

      def lower_hand(room_id, user_id)
        metadata = get_metadata(room_id, user_id)
        return false unless metadata.delete(:hand_raised_at)

        update_metadata(room_id, user_id, metadata)
        true
      end

      def update_metadata(room_id, user_id, metadata)
        redis.hset(metadata_key(room_id), user_id, metadata.to_json)
        redis.expire(metadata_key(room_id), SAFETY_TTL)
      end

      def get_metadata(room_id, user_id)
        raw = redis.hget(metadata_key(room_id), user_id)
        return {} if raw.nil?
        JSON.parse(raw, symbolize_names: true)
      end

      def get_all_metadata(room_id)
        raw = redis.hgetall(metadata_key(room_id))
        raw
          .transform_keys(&:to_i)
          .transform_values { |value| JSON.parse(value, symbolize_names: true) }
      end

      # A stable hash of the live (TTL-filtered) membership plus the metadata
      # that clients render. `last_heartbeat_at` is excluded so the fingerprint
      # only changes when something a client would actually display changes —
      # otherwise every 10s heartbeat would look like a change.
      def participants_fingerprint(room_id)
        metadata = get_all_metadata(room_id)
        payload =
          user_ids(room_id).sort.map do |id|
            [id, (metadata[id] || {}).except(:last_heartbeat_at).sort.to_h]
          end
        Digest::MD5.hexdigest(payload.to_json)
      end

      # Atomically store the new fingerprint and return the previous one, so a
      # single caller (whichever heartbeat observes the change first) can decide
      # to broadcast while concurrent heartbeats see their own value and skip it.
      def swap_fingerprint(room_id, fingerprint)
        previous = redis.getset(fingerprint_key(room_id), fingerprint)
        redis.expire(fingerprint_key(room_id), SAFETY_TTL)
        previous
      end

      def update_fingerprint(room_id, fingerprint = nil)
        fingerprint ||= participants_fingerprint(room_id)
        redis.set(fingerprint_key(room_id), fingerprint, ex: SAFETY_TTL)
      end

      # The transport pin ("mesh" | "livekit") holds a room instance to one
      # transport for its whole life: joiners after the first ignore current
      # settings, so a call is never split across transports. `SET NX` makes
      # the first join win under a race; the short TTL (refreshed by every
      # join/heartbeat) lets a crashed room self-heal instead of holding a
      # stale transport.
      def pin_transport!(room_id, transport)
        redis.set(transport_key(room_id), transport, nx: true, ex: transport_pin_ttl)
        refresh_transport_pin(room_id)
        pinned_transport(room_id) || transport
      end

      def pinned_transport(room_id)
        redis.get(transport_key(room_id))
      end

      def refresh_transport_pin(room_id)
        redis.expire(transport_key(room_id), transport_pin_ttl)
      end

      def clear_transport_pin(room_id)
        redis.del(transport_key(room_id))
      end

      def transport_pin_ttl
        SiteSetting.resenha_participant_ttl_seconds.to_i * 2
      end

      def touch_recently_active(room_id)
        redis.zadd(RECENTLY_ACTIVE_ROOMS_KEY, Time.now.to_f, room_id)
      end

      # Rooms whose membership changed within the safety window. This includes
      # rooms that have since emptied — whose participants key no longer exists
      # in Redis — so the republish backstop can keep re-asserting their empty
      # state to clients that missed the final leave broadcast.
      def recently_active_room_ids
        cutoff = Time.now.to_f - SAFETY_TTL
        redis.zremrangebyscore(RECENTLY_ACTIVE_ROOMS_KEY, "-inf", "(#{cutoff}")
        redis.zrangebyscore(RECENTLY_ACTIVE_ROOMS_KEY, cutoff, "+inf").map(&:to_i)
      end

      private

      def redis
        @redis ||= Discourse.redis
      end

      def key(room_id)
        "#{KEY_NAMESPACE}:#{room_id}:participants"
      end

      def metadata_key(room_id)
        "#{KEY_NAMESPACE}:#{room_id}:metadata"
      end

      def fingerprint_key(room_id)
        "#{KEY_NAMESPACE}:#{room_id}:fingerprint"
      end

      def transport_key(room_id)
        "#{KEY_NAMESPACE}:#{room_id}:transport"
      end
    end
  end
end
