# frozen_string_literal: true

require "rails_helper"
require_relative "../../../db/migrate/20241107000000_create_resenha_rooms"
require_relative "../../../db/migrate/20260305162426_add_room_type_to_resenha_rooms"
require_relative "../../../db/migrate/20260612135211_add_video_enabled_to_resenha_rooms"
require_relative "../../../db/migrate/20260717172530_create_resenha_recordings"

RSpec.describe Resenha::RoomsController do
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

  fab!(:creator, :user)
  fab!(:participant, :user)
  fab!(:room) { Fabricate(:resenha_room, public: true, creator: creator) }

  before do
    SiteSetting.resenha_enabled = true
    SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:everyone]
    SiteSetting.resenha_livekit_url = "wss://livekit.example.com"
    SiteSetting.resenha_livekit_api_key = "lk_api_key"
    SiteSetting.resenha_livekit_api_secret = "lk_api_secret"
    SiteSetting.resenha_livekit_room_policy = "all_rooms"
    SiteSetting.resenha_livekit_recording_enabled = true
    Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")
  end

  after { Resenha::ParticipantTracker.clear(room.id) }

  def stub_start(egress_id: "EG_1")
    stub_request(
      :post,
      "https://livekit.example.com/twirp/livekit.Egress/StartRoomCompositeEgress",
    ).to_return(body: { egressId: egress_id }.to_json)
  end

  def stub_stop
    stub_request(:post, "https://livekit.example.com/twirp/livekit.Egress/StopEgress").to_return(
      body: "{}",
    )
  end

  describe "#start_recording" do
    it "starts a recording and returns its room-wide status to a room manager" do
      sign_in(creator)
      stub_start

      post "/resenha/rooms/#{room.id}/recording.json"

      expect(response.status).to eq(200)
      expect(response.parsed_body["recording"]["started_by"]["id"]).to eq(creator.id)
      expect(Resenha::RecordingManager.status(room.id)).to be_present
    end

    it "rejects a participant who cannot manage the room" do
      sign_in(participant)
      stub = stub_start

      post "/resenha/rooms/#{room.id}/recording.json"

      expect(response.status).to eq(403)
      expect(stub).not_to have_been_requested
    end

    it "rejects the request when recordings are disabled" do
      sign_in(creator)
      SiteSetting.resenha_livekit_recording_enabled = false

      post "/resenha/rooms/#{room.id}/recording.json"

      expect(response.status).to eq(422)
      expect(response.parsed_body["errors"]).to include(
        I18n.t("resenha.errors.recording_unavailable"),
      )
    end

    it "rejects the request for a mesh call" do
      sign_in(creator)
      Resenha::ParticipantTracker.clear_transport_pin(room.id)
      Resenha::ParticipantTracker.pin_transport!(room.id, "mesh")

      post "/resenha/rooms/#{room.id}/recording.json"

      expect(response.status).to eq(422)
    end

    it "returns 422 when the egress fails to start" do
      sign_in(creator)
      stub_request(
        :post,
        "https://livekit.example.com/twirp/livekit.Egress/StartRoomCompositeEgress",
      ).to_return(status: 500, body: "boom")

      post "/resenha/rooms/#{room.id}/recording.json"

      expect(response.status).to eq(422)
      expect(Resenha::RecordingManager.status(room.id)).to be_nil
    end
  end

  describe "#stop_recording" do
    before do
      sign_in(creator)
      stub_start
      post "/resenha/rooms/#{room.id}/recording.json"
    end

    it "stops the recording for a room manager" do
      stub_stop

      delete "/resenha/rooms/#{room.id}/recording.json"

      expect(response.status).to eq(204)
      expect(Resenha::RecordingManager.status(room.id)).to be_nil
    end

    it "rejects a participant who cannot manage the room" do
      sign_in(participant)
      stub = stub_stop

      delete "/resenha/rooms/#{room.id}/recording.json"

      expect(response.status).to eq(403)
      expect(stub).not_to have_been_requested
      expect(Resenha::RecordingManager.status(room.id)).to be_present
    end

    it "returns 422 when nothing is being recorded" do
      stub_stop
      delete "/resenha/rooms/#{room.id}/recording.json"

      delete "/resenha/rooms/#{room.id}/recording.json"

      expect(response.status).to eq(422)
      expect(response.parsed_body["errors"]).to include(
        I18n.t("resenha.errors.recording_not_active"),
      )
    end
  end

  describe "#show" do
    it "serializes an active recording for any viewer" do
      sign_in(creator)
      stub_start
      post "/resenha/rooms/#{room.id}/recording.json"

      sign_in(participant)
      get "/resenha/rooms/#{room.id}.json"

      expect(response.status).to eq(200)
      expect(response.parsed_body["room"]["recording"]["started_by"]["username"]).to eq(
        creator.username,
      )
    end

    it "omits the recording field when nothing is being recorded" do
      sign_in(participant)

      get "/resenha/rooms/#{room.id}.json"

      expect(response.status).to eq(200)
      expect(response.parsed_body["room"]).not_to have_key("recording")
    end
  end
end
