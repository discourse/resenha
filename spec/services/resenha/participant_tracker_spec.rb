# frozen_string_literal: true

RSpec.describe Resenha::ParticipantTracker do
  fab!(:room, :resenha_room)
  fab!(:user1, :user)
  fab!(:user2, :user)

  before { SiteSetting.resenha_enabled = true }

  after { described_class.clear(room.id) }

  describe ".add" do
    it "stores the user in the room's participant set" do
      described_class.add(room.id, user1.id)
      expect(described_class.user_ids(room.id)).to contain_exactly(user1.id)
    end

    it "ignores invalid user ids" do
      described_class.add(room.id, 0)
      described_class.add(room.id, -1)
      expect(described_class.user_ids(room.id)).to be_empty
    end
  end

  describe ".remove" do
    it "removes the user from participants and metadata" do
      described_class.add(room.id, user1.id)
      described_class.update_metadata(room.id, user1.id, { role: "participant" })

      described_class.remove(room.id, user1.id)

      expect(described_class.user_ids(room.id)).to be_empty
      expect(described_class.get_metadata(room.id, user1.id)).to eq({})
    end
  end

  describe ".user_ids" do
    it "returns only users with fresh heartbeats" do
      described_class.add(room.id, user1.id)
      described_class.add(room.id, user2.id)

      key = "#{described_class::KEY_NAMESPACE}:#{room.id}:participants"
      Discourse.redis.zadd(key, 1.hour.ago.to_f, user2.id)

      expect(described_class.user_ids(room.id)).to contain_exactly(user1.id)
    end

    it "returns empty when all heartbeats are stale" do
      described_class.add(room.id, user1.id)

      key = "#{described_class::KEY_NAMESPACE}:#{room.id}:participants"
      Discourse.redis.zadd(key, 1.hour.ago.to_f, user1.id)

      expect(described_class.user_ids(room.id)).to be_empty
    end
  end

  describe ".list" do
    it "returns User records for fresh participants only" do
      described_class.add(room.id, user1.id)
      described_class.add(room.id, user2.id)

      key = "#{described_class::KEY_NAMESPACE}:#{room.id}:participants"
      Discourse.redis.zadd(key, 1.hour.ago.to_f, user2.id)

      expect(described_class.list(room.id)).to contain_exactly(user1)
    end
  end

  describe ".last_heartbeat_at" do
    it "returns the time from metadata" do
      freeze_time do
        described_class.add(room.id, user1.id)
        described_class.update_metadata(room.id, user1.id, { last_heartbeat_at: Time.now.to_f })

        expect(described_class.last_heartbeat_at(room.id, user1.id)).to be_within(1.second).of(
          Time.now,
        )
      end
    end

    it "returns nil when no metadata exists" do
      expect(described_class.last_heartbeat_at(room.id, user1.id)).to be_nil
    end
  end

  describe ".clear" do
    it "removes all participants and metadata" do
      described_class.add(room.id, user1.id)
      described_class.update_metadata(room.id, user1.id, { role: "participant" })

      described_class.clear(room.id)

      expect(described_class.user_ids(room.id)).to be_empty
      expect(described_class.get_metadata(room.id, user1.id)).to eq({})
    end
  end
end
