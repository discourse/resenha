# frozen_string_literal: true

module Resenha
  class ParticipantTracker
    KEY_NAMESPACE = "resenha:room".freeze
    SAFETY_TTL = 30.minutes.to_i

    class << self
      def add(room_id, user_id, migrated: false)
        return if user_id.to_i <= 0

        redis.zadd(key(room_id), Time.now.to_f, user_id)
        redis.expire(key(room_id), SAFETY_TTL)
        redis.expire(metadata_key(room_id), SAFETY_TTL)
      rescue Redis::CommandError => e
        raise if e.message.exclude?("WRONGTYPE") || migrated
        redis.del(key(room_id))
        add(room_id, user_id, migrated: true)
      end

      def remove(room_id, user_id)
        redis.zrem(key(room_id), user_id)
        redis.hdel(metadata_key(room_id), user_id)
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
    end
  end
end
