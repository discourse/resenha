# frozen_string_literal: true

require "rails_helper"

RSpec.describe Resenha::UserStatusManager do
  fab!(:user)
  fab!(:room, :resenha_room)

  before do
    SiteSetting.resenha_enabled = true
    SiteSetting.enable_user_status = true
    SiteSetting.resenha_auto_status_enabled = true
  end

  describe ".set_voice_status" do
    it "sets the user's status with room name and expiry" do
      freeze_time do
        described_class.set_voice_status(user, room)

        user.reload
        expect(user.user_status.description).to eq("In #{room.name}")
        expect(user.user_status.emoji).to eq("studio_microphone")
        expect(user.user_status.ends_at).to be_within(1.second).of(2.minutes.from_now)
      end
    end

    it "skips when user already has a non-Resenha status" do
      user.set_status!("On vacation", "palm_tree")

      described_class.set_voice_status(user, room)

      user.reload
      expect(user.user_status.emoji).to eq("palm_tree")
    end

    it "overwrites an existing Resenha status" do
      user.set_status!("In Old Room", "studio_microphone")

      described_class.set_voice_status(user, room)

      user.reload
      expect(user.user_status.description).to eq("In #{room.name}")
    end

    it "skips when enable_user_status is false" do
      SiteSetting.enable_user_status = false

      described_class.set_voice_status(user, room)

      expect(user.user_status).to be_nil
    end

    it "skips when resenha_auto_status_enabled is false" do
      SiteSetting.resenha_auto_status_enabled = false

      described_class.set_voice_status(user, room)

      expect(user.user_status).to be_nil
    end
  end

  describe ".set_afk_status" do
    it "transitions to AFK status when Resenha owns the current status" do
      freeze_time do
        described_class.set_voice_status(user, room)
        described_class.set_afk_status(user, room)

        user.reload
        expect(user.user_status.description).to eq("AFK in #{room.name}")
        expect(user.user_status.emoji).to eq("zzz")
        expect(user.user_status.ends_at).to be_within(1.second).of(2.minutes.from_now)
      end
    end

    it "skips when the user has a non-Resenha status" do
      user.set_status!("On vacation", "palm_tree")

      described_class.set_afk_status(user, room)

      user.reload
      expect(user.user_status.emoji).to eq("palm_tree")
    end

    it "skips when user has no status" do
      described_class.set_afk_status(user, room)

      expect(user.user_status).to be_nil
    end
  end

  describe ".clear_voice_status" do
    it "clears status when Resenha owns it" do
      described_class.set_voice_status(user, room)
      described_class.clear_voice_status(user)

      user.reload
      expect(user.user_status).to be_nil
    end

    it "clears AFK status" do
      described_class.set_voice_status(user, room)
      described_class.set_afk_status(user, room)
      described_class.clear_voice_status(user)

      user.reload
      expect(user.user_status).to be_nil
    end

    it "does not clear a non-Resenha status" do
      user.set_status!("On vacation", "palm_tree")

      described_class.clear_voice_status(user)

      user.reload
      expect(user.user_status.emoji).to eq("palm_tree")
    end

    it "does nothing when user has no status" do
      expect { described_class.clear_voice_status(user) }.not_to raise_error
    end
  end

  describe ".resenha_status_active?" do
    it "returns true for studio_microphone emoji" do
      user.set_status!("In Room", "studio_microphone", 2.minutes.from_now)
      expect(described_class.resenha_status_active?(user)).to eq(true)
    end

    it "returns true for zzz emoji" do
      user.set_status!("AFK in Room", "zzz", 2.minutes.from_now)
      expect(described_class.resenha_status_active?(user)).to eq(true)
    end

    it "returns false for other emojis" do
      user.set_status!("On vacation", "palm_tree")
      expect(described_class.resenha_status_active?(user)).to eq(false)
    end

    it "returns false when user has no status" do
      expect(described_class.resenha_status_active?(user)).to be_falsey
    end

    it "returns false when status is expired" do
      user.set_status!("In Room", "studio_microphone", 1.minute.from_now)
      freeze_time(2.minutes.from_now)
      expect(described_class.resenha_status_active?(user)).to eq(false)
    end
  end
end
