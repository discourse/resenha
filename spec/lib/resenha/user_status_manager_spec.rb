# frozen_string_literal: true

require "rails_helper"

RSpec.describe Resenha::UserStatusManager do
  fab!(:user)
  fab!(:room) { Fabricate(:resenha_room, public: true) }
  fab!(:private_room) { Fabricate(:resenha_room, public: false) }
  fab!(:ephemeral_room) { Fabricate(:resenha_ephemeral_room, public: true) }

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

    it "hides the name of a private room behind a generic description" do
      described_class.set_voice_status(user, private_room)

      user.reload
      expect(user.user_status.description).to eq("In a voice room")
      expect(user.user_status.description).not_to include(private_room.name)
      expect(user.user_status.emoji).to eq("studio_microphone")
    end

    it "hides the name of an ephemeral room even when it is public" do
      described_class.set_voice_status(user, ephemeral_room)

      user.reload
      expect(user.user_status.description).to eq("In a voice room")
      expect(user.user_status.description).not_to include(ephemeral_room.name)
    end

    it "localizes the description to the user's own locale" do
      SiteSetting.allow_user_locale = true
      user.update!(locale: "fr")
      I18n.backend.store_translations(
        :fr,
        { resenha: { user_status: { in_voice_room: "Dans un salon vocal" } } },
      )

      described_class.set_voice_status(user, private_room)

      expect(user.reload.user_status.description).to eq("Dans un salon vocal")
    ensure
      I18n.backend.reload!
    end

    it "truncates a description that would exceed the column limit" do
      described_class.set_voice_status(
        user,
        Fabricate.build(:resenha_room, public: true, name: "Room #{"name " * 40}"),
      )

      expect(user.reload.user_status.description.length).to eq(UserStatus::MAX_DESCRIPTION_LENGTH)
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

    it "hides the name of a private room behind a generic description" do
      described_class.set_voice_status(user, private_room)
      described_class.set_afk_status(user, private_room)

      user.reload
      expect(user.user_status.description).to eq("AFK in a voice room")
      expect(user.user_status.description).not_to include(private_room.name)
      expect(user.user_status.emoji).to eq("zzz")
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

    it "clears a generic status set for a private room" do
      described_class.set_voice_status(user, private_room)
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

  describe ".room_nameable_in_status?" do
    it "is true only for a public, persistent room" do
      expect(described_class.room_nameable_in_status?(room)).to eq(true)
      expect(described_class.room_nameable_in_status?(private_room)).to eq(false)
      expect(described_class.room_nameable_in_status?(ephemeral_room)).to eq(false)
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
