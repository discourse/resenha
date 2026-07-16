# frozen_string_literal: true

require "rails_helper"
require_relative "../../../db/migrate/20241107000000_create_resenha_rooms"
require_relative "../../../db/migrate/20260305162426_add_room_type_to_resenha_rooms"
require_relative "../../../db/migrate/20260612135211_add_video_enabled_to_resenha_rooms"
require_relative "../../../db/migrate/20260630183841_add_chat_settings_to_resenha_rooms"

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
      unless ActiveRecord::Base.connection.column_exists?(:resenha_rooms, :chat_channel_id)
        AddChatSettingsToResenhaRooms.new.change
      end
    end
    Resenha::Room.reset_column_information
  end

  fab!(:user)
  fab!(:other_user, :user)
  fab!(:room) { Fabricate(:resenha_room, public: true) }

  before do
    SiteSetting.resenha_enabled = true
    SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:everyone]
  end

  after { Resenha::ParticipantTracker.clear(room.id) }

  def configure_livekit!
    SiteSetting.resenha_livekit_url = "wss://livekit.example.com"
    SiteSetting.resenha_livekit_api_key = "lk_api_key"
    SiteSetting.resenha_livekit_api_secret = "lk_api_secret"
    SiteSetting.resenha_livekit_room_policy = "all_rooms"
  end

  describe "#join" do
    before { sign_in(user) }

    it "resolves to mesh with no livekit payload when unconfigured" do
      post "/resenha/rooms/#{room.id}/join.json"

      expect(response.status).to eq(200)
      expect(response.parsed_body.keys).to contain_exactly("transport", "room")
      expect(response.parsed_body["transport"]).to eq("mesh")
    end

    it "resolves to livekit with a url and a decodable token when configured" do
      configure_livekit!

      post "/resenha/rooms/#{room.id}/join.json"

      expect(response.status).to eq(200)
      expect(response.parsed_body["transport"]).to eq("livekit")
      expect(response.parsed_body["livekit"]["url"]).to eq("wss://livekit.example.com")

      payload =
        JWT.decode(
          response.parsed_body["livekit"]["token"],
          SiteSetting.resenha_livekit_api_secret,
          true,
          algorithm: "HS256",
        ).first
      expect(payload["sub"]).to eq(user.id.to_s)
      expect(payload["video"]["room"]).to eq(Resenha::Livekit.room_name(room))
    end

    it "never leaks the api secret in the response" do
      configure_livekit!

      post "/resenha/rooms/#{room.id}/join.json"

      expect(response.body).not_to include(SiteSetting.resenha_livekit_api_secret)
    end

    it "holds the pinned transport across a config change" do
      configure_livekit!
      post "/resenha/rooms/#{room.id}/join.json"
      expect(response.parsed_body["transport"]).to eq("livekit")

      SiteSetting.resenha_livekit_room_policy = "disabled"

      sign_in(other_user)
      post "/resenha/rooms/#{room.id}/join.json"

      expect(response.parsed_body["transport"]).to eq("livekit")
      expect(response.parsed_body["livekit"]["token"]).to be_present
    end

    it "re-resolves the transport once the room has emptied" do
      configure_livekit!
      post "/resenha/rooms/#{room.id}/join.json"
      expect(response.parsed_body["transport"]).to eq("livekit")

      SiteSetting.resenha_livekit_room_policy = "disabled"
      delete "/resenha/rooms/#{room.id}/leave.json"
      expect(Resenha::ParticipantTracker.pinned_transport(room.id)).to be_nil

      post "/resenha/rooms/#{room.id}/join.json"

      expect(response.parsed_body["transport"]).to eq("mesh")
    end

    it "fails the join with a 503 when the token cannot be minted" do
      configure_livekit!
      Resenha::Livekit.stubs(:mint_token).raises(Resenha::Livekit::MintError.new("boom"))

      post "/resenha/rooms/#{room.id}/join.json"

      expect(response.status).to eq(503)
      expect(response.parsed_body["errors"]).to include(
        I18n.t("resenha.errors.livekit_unavailable"),
      )
      expect(Resenha::ParticipantTracker.user_ids(room.id)).to be_empty
    end

    it "falls back to mesh on mint failure only when opted in and the room is empty" do
      configure_livekit!
      SiteSetting.resenha_livekit_mesh_fallback = true
      Resenha::Livekit.stubs(:mint_token).raises(Resenha::Livekit::MintError.new("boom"))

      post "/resenha/rooms/#{room.id}/join.json"

      expect(response.status).to eq(200)
      expect(response.parsed_body["transport"]).to eq("mesh")
      expect(Resenha::ParticipantTracker.pinned_transport(room.id)).to eq("mesh")
    end

    it "never falls back on mint failure while the room is occupied on livekit" do
      configure_livekit!
      SiteSetting.resenha_livekit_mesh_fallback = true
      Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")
      Resenha::ParticipantTracker.add(room.id, other_user.id)
      Resenha::Livekit.stubs(:mint_token).raises(Resenha::Livekit::MintError.new("boom"))

      post "/resenha/rooms/#{room.id}/join.json"

      expect(response.status).to eq(503)
      expect(Resenha::ParticipantTracker.pinned_transport(room.id)).to eq("livekit")
    end

    it "fails a livekit-pinned join when the config was half-deleted" do
      configure_livekit!
      Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")
      Resenha::ParticipantTracker.add(room.id, other_user.id)
      SiteSetting.resenha_livekit_api_secret = ""

      post "/resenha/rooms/#{room.id}/join.json"

      expect(response.status).to eq(503)
    end
  end

  describe "#livekit_token" do
    before { configure_livekit! }

    it "requires login" do
      Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")

      post "/resenha/rooms/#{room.id}/livekit_token.json"

      expect(response.status).to eq(403)
    end

    it "reissues a token and re-adds lapsed presence" do
      sign_in(user)
      Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")

      post "/resenha/rooms/#{room.id}/livekit_token.json"

      expect(response.status).to eq(200)
      expect(response.parsed_body["url"]).to eq("wss://livekit.example.com")
      expect(response.parsed_body["token"]).to be_present
      expect(Resenha::ParticipantTracker.user_ids(room.id)).to include(user.id)
    end

    it "returns 410 when the room instance ended or runs on mesh" do
      sign_in(user)

      post "/resenha/rooms/#{room.id}/livekit_token.json"
      expect(response.status).to eq(410)

      Resenha::ParticipantTracker.pin_transport!(room.id, "mesh")
      post "/resenha/rooms/#{room.id}/livekit_token.json"
      expect(response.status).to eq(410)
    end

    it "returns 503 when the pinned room's token cannot be minted" do
      sign_in(user)
      Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")
      SiteSetting.resenha_livekit_api_secret = ""

      post "/resenha/rooms/#{room.id}/livekit_token.json"

      expect(response.status).to eq(503)
    end

    it "rate limits repeated mints" do
      RateLimiter.enable
      sign_in(user)
      Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")

      10.times do
        post "/resenha/rooms/#{room.id}/livekit_token.json"
        expect(response.status).to eq(200)
      end

      post "/resenha/rooms/#{room.id}/livekit_token.json"
      expect(response.status).to eq(429)
    end
  end

  describe "#heartbeat" do
    before { sign_in(user) }

    it "refreshes the transport pin ttl" do
      configure_livekit!
      post "/resenha/rooms/#{room.id}/join.json"

      key = "#{Resenha::ParticipantTracker::KEY_NAMESPACE}:#{room.id}:transport"
      Discourse.redis.expire(key, 1)

      post "/resenha/rooms/#{room.id}/heartbeat.json"

      expect(Discourse.redis.ttl(key)).to be > 1
    end
  end

  describe "#signal" do
    before { sign_in(user) }

    it "rejects signaling in a livekit-pinned room" do
      configure_livekit!
      post "/resenha/rooms/#{room.id}/join.json"

      post "/resenha/rooms/#{room.id}/signal.json",
           params: {
             payload: {
               recipient_id: other_user.id,
               type: "offer",
               sdp: "sdp",
             },
           }

      expect(response.status).to eq(422)
      expect(response.parsed_body["errors"]).to include(
        I18n.t("resenha.errors.livekit_no_signaling"),
      )
    end

    it "still relays signals in a mesh room" do
      post "/resenha/rooms/#{room.id}/join.json"

      post "/resenha/rooms/#{room.id}/signal.json",
           params: {
             payload: {
               recipient_id: other_user.id,
               type: "offer",
               sdp: "sdp",
             },
           }

      expect(response.status).to eq(204)
    end
  end
end
