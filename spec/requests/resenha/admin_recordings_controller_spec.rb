# frozen_string_literal: true

require "rails_helper"
require_relative "../../../db/migrate/20241107000000_create_resenha_rooms"
require_relative "../../../db/migrate/20260305162426_add_room_type_to_resenha_rooms"
require_relative "../../../db/migrate/20260612135211_add_video_enabled_to_resenha_rooms"
require_relative "../../../db/migrate/20260717172530_create_resenha_recordings"

RSpec.describe Resenha::AdminRecordingsController do
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
      unless ActiveRecord::Base.connection.table_exists?(:resenha_recordings)
        CreateResenhaRecordings.new.change
      end
    end
    Resenha::Room.reset_column_information
    Resenha::Recording.reset_column_information
  end

  fab!(:admin)
  fab!(:user)
  fab!(:room) { Fabricate(:resenha_room, public: true) }

  fab!(:recording) do
    Resenha::Recording.create!(
      room: room,
      started_by: user,
      egress_id: "EG_1",
      status: :completed,
      filepath: "resenha/test-abc123",
      location: "https://cdn.example.com/resenha/test-abc123.mp4",
      duration_ms: 65_000,
      started_at: 1.hour.ago,
      ended_at: 59.minutes.ago,
    )
  end

  before { SiteSetting.resenha_enabled = true }

  describe "#index" do
    it "lists recordings newest-first with room, requester, and file details for admins" do
      Resenha::Recording.create!(
        room: room,
        started_by: user,
        egress_id: "EG_2",
        filepath: "resenha/test-def456",
        started_at: 5.minutes.ago,
      )
      sign_in(admin)

      get "/admin/plugins/resenha/recordings.json"

      expect(response.status).to eq(200)
      payload = response.parsed_body
      expect(payload["has_more"]).to eq(false)
      expect(payload["recordings"].map { |row| row["egress_id"] }).to eq(%w[EG_2 EG_1])

      completed = payload["recordings"].last
      expect(completed["room_name"]).to eq(room.name)
      expect(completed["started_by"]["username"]).to eq(user.username)
      expect(completed["status"]).to eq("completed")
      expect(completed["location"]).to eq("https://cdn.example.com/resenha/test-abc123.mp4")
      expect(completed["duration_ms"]).to eq(65_000)
    end

    it "paginates past the page size" do
      stub_const(Resenha::AdminRecordingsController, "PAGE_SIZE", 1) do
        sign_in(admin)
        Resenha::Recording.create!(
          room: room,
          started_by: user,
          egress_id: "EG_2",
          filepath: "resenha/test-def456",
          started_at: 5.minutes.ago,
        )

        get "/admin/plugins/resenha/recordings.json"
        expect(response.parsed_body["has_more"]).to eq(true)
        expect(response.parsed_body["recordings"].size).to eq(1)

        get "/admin/plugins/resenha/recordings.json?offset=1"
        expect(response.parsed_body["has_more"]).to eq(false)
        expect(response.parsed_body["recordings"].map { |row| row["egress_id"] }).to eq(["EG_1"])
      end
    end

    it "is not available to regular users" do
      sign_in(user)

      get "/admin/plugins/resenha/recordings.json"

      expect(response.status).to eq(404)
    end
  end
end
