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
    end
  end
end
