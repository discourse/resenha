# frozen_string_literal: true

module Resenha
  class ParticipantTracker
    KEY_NAMESPACE = "resenha:room".freeze

    class << self
      def add(room_id, user_id)
        redis.sadd(key(room_id), user_id)
        redis.expire(key(room_id), SiteSetting.resenha_participant_ttl_seconds)
      end

      def remove(room_id, user_id)
        redis.srem(key(room_id), user_id)
        redis.hdel(metadata_key(room_id), user_id)
      end

      def list(room_id)
        User.where(id: redis.smembers(key(room_id)))
      end

      def user_ids(room_id)
        redis.smembers(key(room_id)).map(&:to_i)
      end

      def clear(room_id)
        redis.del(key(room_id))
        redis.del(metadata_key(room_id))
      end

      def update_metadata(room_id, user_id, metadata)
        redis.hset(metadata_key(room_id), user_id, metadata.to_json)
        redis.expire(metadata_key(room_id), SiteSetting.resenha_participant_ttl_seconds)
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
