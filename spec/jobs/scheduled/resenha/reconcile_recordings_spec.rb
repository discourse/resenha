# frozen_string_literal: true

require "rails_helper"
require_relative "../../../../db/migrate/20241107000000_create_resenha_rooms"
require_relative "../../../../db/migrate/20260305162426_add_room_type_to_resenha_rooms"
require_relative "../../../../db/migrate/20260612135211_add_video_enabled_to_resenha_rooms"
require_relative "../../../../db/migrate/20260717172530_create_resenha_recordings"

RSpec.describe Jobs::Resenha::ReconcileRecordings do
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

  fab!(:user)
  fab!(:room) { Fabricate(:resenha_room, public: true) }

  before do
    SiteSetting.resenha_enabled = true
    SiteSetting.resenha_livekit_url = "wss://livekit.example.com"
    SiteSetting.resenha_livekit_api_key = "lk_api_key"
    SiteSetting.resenha_livekit_api_secret = "lk_api_secret"
    SiteSetting.resenha_livekit_recording_enabled = true
  end

  def create_stuck_recording
    Resenha::Recording.create!(
      room: room,
      started_by: user,
      egress_id: "EG_1",
      filepath: "resenha/test-abc123",
      started_at: 10.minutes.ago,
    )
  end

  let!(:list_stub) do
    stub_request(:post, "https://livekit.example.com/twirp/livekit.Egress/ListEgress").to_return(
      body: {
        items: [
          {
            "egressId" => "EG_1",
            "status" => "EGRESS_COMPLETE",
            "fileResults" => [{ "filename" => "test.mp4" }],
          },
        ],
      }.to_json,
    )
  end

  it "resolves stuck recordings without webhooks" do
    recording = create_stuck_recording

    described_class.new.execute({})

    expect(recording.reload.status).to eq("completed")
    expect(list_stub).to have_been_requested
  end

  it "makes zero HTTP calls when there is nothing to resolve" do
    described_class.new.execute({})

    expect(list_stub).not_to have_been_requested
  end

  it "makes zero HTTP calls when recordings are disabled" do
    create_stuck_recording
    SiteSetting.resenha_livekit_recording_enabled = false

    described_class.new.execute({})

    expect(list_stub).not_to have_been_requested
  end

  it "makes zero HTTP calls when LiveKit is not configured" do
    create_stuck_recording
    SiteSetting.resenha_livekit_api_secret = ""

    described_class.new.execute({})

    expect(list_stub).not_to have_been_requested
  end
end
