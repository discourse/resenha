# frozen_string_literal: true

require "rails_helper"
require_relative "../../../db/migrate/20241107000000_create_resenha_rooms"
require_relative "../../../db/migrate/20260305162426_add_room_type_to_resenha_rooms"
require_relative "../../../db/migrate/20260612135211_add_video_enabled_to_resenha_rooms"
require_relative "../../../db/migrate/20260630183841_add_chat_settings_to_resenha_rooms"
require_relative "../../../db/migrate/20260728201053_add_max_quality_profile_to_resenha_rooms"

RSpec.describe Resenha::Room do
  before do
    ActiveRecord::Migration.suppress_messages do
      unless ActiveRecord::Base.connection.table_exists?(:resenha_rooms)
        CreateResenhaRooms.new.change
      end
      unless ActiveRecord::Base.connection.column_exists?(:resenha_rooms, :room_type)
        AddRoomTypeToResenhaRooms.new.change
      end
      unless ActiveRecord::Base.connection.column_exists?(:resenha_rooms, :video_enabled)
        AddVideoEnabledToResenhaRooms.new.change
      end
      unless ActiveRecord::Base.connection.column_exists?(:resenha_rooms, :chat_channel_id)
        AddChatSettingsToResenhaRooms.new.change
      end
      unless ActiveRecord::Base.connection.column_exists?(:resenha_rooms, :max_quality_profile)
        AddMaxQualityProfileToResenhaRooms.new.change
      end
    end
    Resenha::Room.reset_column_information
  end

  fab!(:room) { Fabricate(:resenha_room) }

  describe "#video_allowed?" do
    before { SiteSetting.resenha_video_enabled = true }

    it "is true for a stage room with video enabled" do
      room.update!(room_type: Resenha::Room::ROOM_TYPE_STAGE, video_enabled: true)

      expect(room.video_allowed?).to eq(true)
    end

    it "is true for an open room with video enabled" do
      room.update!(room_type: Resenha::Room::ROOM_TYPE_OPEN, video_enabled: true)

      expect(room.video_allowed?).to eq(true)
    end

    it "is false when the site setting is disabled" do
      SiteSetting.resenha_video_enabled = false
      room.update!(video_enabled: true)

      expect(room.video_allowed?).to eq(false)
    end

    it "is false when the room has video disabled" do
      room.update!(video_enabled: false)

      expect(room.video_allowed?).to eq(false)
    end
  end

  describe "chat_idle_minutes validation" do
    it "rejects a value below the 2 minute floor" do
      room.chat_idle_minutes = 1
      expect(room).not_to be_valid
      expect(room.errors[:chat_idle_minutes]).to be_present
    end

    it "accepts the 2 minute floor" do
      room.chat_idle_minutes = 2
      expect(room).to be_valid
    end

    it "rejects a value above the 1440 minute (24h) ceiling" do
      room.chat_idle_minutes = 1441
      expect(room).not_to be_valid
    end

    it "defaults to 15 minutes" do
      expect(described_class.new.chat_idle_minutes).to eq(15)
    end
  end

  describe "max_quality_profile validation" do
    it "accepts nil, meaning no room-level cap" do
      room.max_quality_profile = nil
      expect(room).to be_valid
    end

    it "accepts every known profile" do
      Resenha::Room::QUALITY_PROFILES.each_value do |profile|
        room.max_quality_profile = profile
        expect(room).to be_valid
      end
    end

    it "rejects unknown values" do
      room.max_quality_profile = 42
      expect(room).not_to be_valid
      expect(room.errors[:max_quality_profile]).to be_present
    end
  end

  describe "#max_quality_profile_name" do
    it "maps the stored integer back to its name and nil to nil" do
      expect(described_class.new(max_quality_profile: 1).max_quality_profile_name).to eq("high")
      expect(described_class.new.max_quality_profile_name).to be_nil
    end
  end

  describe "#chat_idle_seconds" do
    it "floors to 2 minutes even if a lower value slipped through" do
      room.update_column(:chat_idle_minutes, 0)
      expect(room.reload.chat_idle_seconds).to eq(2 * 60)
    end

    it "converts minutes to seconds" do
      room.update!(chat_idle_minutes: 5)
      expect(room.chat_idle_seconds).to eq(5 * 60)
    end
  end

  describe "chat_channel_id validation" do
    fab!(:threaded_channel) { Fabricate(:chat_channel, threading_enabled: true) }
    fab!(:unthreaded_channel) { Fabricate(:chat_channel, threading_enabled: false) }

    it "allows linking a channel that already has threading enabled" do
      room.chat_channel_id = threaded_channel.id
      expect(room).to be_valid
    end

    it "rejects linking a channel without threading enabled" do
      room.chat_channel_id = unthreaded_channel.id
      expect(room).not_to be_valid
      expect(room.errors[:chat_channel_id]).to be_present
    end

    it "rejects linking a channel id that doesn't exist" do
      room.chat_channel_id = unthreaded_channel.id + 100_000
      expect(room).not_to be_valid
      expect(room.errors[:chat_channel_id]).to be_present
    end

    it "allows clearing the channel back to none" do
      room.update!(chat_channel_id: threaded_channel.id)
      room.chat_channel_id = nil
      expect(room).to be_valid
    end

    it "does not re-validate on an unrelated save once linked, even if the channel's threading is later disabled" do
      room.update!(chat_channel_id: threaded_channel.id)
      threaded_channel.update!(threading_enabled: false)

      room.name = "Renamed"
      expect(room).to be_valid
    end
  end
end
