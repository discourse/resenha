# frozen_string_literal: true

require "rails_helper"
require_relative "../../../db/migrate/20241107000000_create_resenha_rooms"
require_relative "../../../db/migrate/20260612135211_add_video_enabled_to_resenha_rooms"
require_relative "../../../db/migrate/20260630183841_add_chat_settings_to_resenha_rooms"

RSpec.describe Resenha::ChatSession do
  before do
    ActiveRecord::Migration.suppress_messages do
      unless ActiveRecord::Base.connection.table_exists?(:resenha_rooms)
        CreateResenhaRooms.new.change
      end
      unless ActiveRecord::Base.connection.column_exists?(:resenha_rooms, :video_enabled)
        AddVideoEnabledToResenhaRooms.new.change
      end
      unless ActiveRecord::Base.connection.column_exists?(:resenha_rooms, :chat_channel_id)
        AddChatSettingsToResenhaRooms.new.change
      end
    end
    Resenha::Room.reset_column_information
  end

  fab!(:user) { Fabricate(:user, trust_level: TrustLevel[2]) }
  fab!(:other) { Fabricate(:user, trust_level: TrustLevel[2]) }
  fab!(:channel) { Fabricate(:chat_channel, threading_enabled: true) }
  fab!(:room) { Fabricate(:resenha_room, public: true) }

  before do
    SiteSetting.resenha_enabled = true
    SiteSetting.resenha_chat_enabled = true
    SiteSetting.chat_enabled = true
    SiteSetting.chat_allowed_groups = Group::AUTO_GROUPS[:everyone]
    room.update!(chat_channel_id: channel.id, chat_idle_minutes: 15)
    described_class.clear(room.id)
  end

  after { described_class.clear(room.id) }

  describe ".available_for?" do
    it "is false without a linked channel" do
      room.update!(chat_channel_id: nil)
      expect(described_class.available_for?(room, user.guardian)).to eq(false)
    end

    it "is false when chat is disabled" do
      SiteSetting.chat_enabled = false
      expect(described_class.available_for?(room, user.guardian)).to eq(false)
    end

    it "is true with a linked channel and a chat-allowed user" do
      expect(described_class.available_for?(room, user.guardian)).to eq(true)
    end
  end

  describe ".post_message!" do
    it "opens a thread with a templated starter + title and posts into it" do
      room.update!(chat_thread_title_template: "Team Meeting at {time}")

      message = described_class.post_message!(room, user, "hello everyone")
      thread = message.thread

      expect(thread).to be_present
      expect(thread.channel_id).to eq(channel.id)
      expect(thread.title).to start_with("Team Meeting at ")
      expect(thread.original_message.message).to start_with("Team Meeting at ")
      expect(message.message).to eq("hello everyone")
      expect(described_class.active_thread_id(room)).to eq(thread.id)
    end

    it "reuses the active thread for subsequent messages" do
      first = described_class.post_message!(room, user, "one")
      second = described_class.post_message!(room, user, "two")
      expect(second.thread_id).to eq(first.thread_id)
    end

    it "opens a new thread once the session has gone idle" do
      first = described_class.post_message!(room, user, "one")

      # Simulate the session going idle past the room's timeout. (Posted by a
      # different user so the same-minute starter text isn't rejected as a
      # duplicate — a real rollover is >= 15 min later, well clear of that.)
      Discourse.redis.set("resenha:room:#{room.id}:chat_touched_at", (Time.now - 30.minutes).to_f)

      second = described_class.post_message!(room, other, "two")
      expect(second.thread_id).not_to eq(first.thread_id)
    end

    it "auto-follows the poster to the channel" do
      described_class.post_message!(room, user, "hi")
      expect(channel.membership_for(user)).to be_present
    end
  end
end
