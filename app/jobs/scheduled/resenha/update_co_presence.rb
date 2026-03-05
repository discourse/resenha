# frozen_string_literal: true

module Jobs
  module Resenha
    class UpdateCoPresence < ::Jobs::Scheduled
      every 5.minutes

      JOB_INTERVAL_SECONDS = 300
      GAP_THRESHOLD = 10.minutes

      def execute(_args)
        return unless SiteSetting.resenha_enabled && SiteSetting.resenha_analytics_enabled

        each_active_room do |room_id|
          user_ids = ::Resenha::ParticipantTracker.user_ids(room_id)
          next if user_ids.size < 2

          pairs = user_ids.sort.combination(2).to_a
          today = Date.today

          pairs.each { |user_a, user_b| upsert_co_presence(user_a, user_b, today) }
        end
      end

      private

      def each_active_room(&block)
        pattern = "#{::Resenha::ParticipantTracker::KEY_NAMESPACE}:*:participants"
        Discourse
          .redis
          .scan_each(match: pattern) do |key|
            yield Regexp.last_match(1).to_i if key =~ /resenha:room:(\d+):participants/
          end
      end

      def upsert_co_presence(user_a, user_b, date)
        record =
          ::Resenha::CoPresence.find_or_initialize_by(
            user_id_1: user_a,
            user_id_2: user_b,
            date: date,
          )

        gap = record.new_record? || record.updated_at < GAP_THRESHOLD.ago

        record.total_seconds += JOB_INTERVAL_SECONDS
        record.session_count += 1 if gap
        record.save!
      end
    end
  end
end
