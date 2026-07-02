# frozen_string_literal: true

require "rails_helper"
require_relative "../../../db/migrate/20241107000000_create_resenha_rooms"
require_relative "../../../db/migrate/20260630183841_add_chat_settings_to_resenha_rooms"

RSpec.describe Resenha::Room do
  before do
    ActiveRecord::Migration.suppress_messages do
      unless ActiveRecord::Base.connection.table_exists?(:resenha_rooms)
        CreateResenhaRooms.new.change
      end
      unless ActiveRecord::Base.connection.column_exists?(:resenha_rooms, :chat_channel_id)
        AddChatSettingsToResenhaRooms.new.change
      end
    end
    Resenha::Room.reset_column_information
  end

  fab!(:room) { Fabricate(:resenha_room) }

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
