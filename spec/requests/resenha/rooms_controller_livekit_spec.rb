# frozen_string_literal: true

require "rails_helper"
require_relative "../../../db/migrate/20241107000000_create_resenha_rooms"
require_relative "../../../db/migrate/20260305162426_add_room_type_to_resenha_rooms"
require_relative "../../../db/migrate/20260612135211_add_video_enabled_to_resenha_rooms"
require_relative "../../../db/migrate/20260630183841_add_chat_settings_to_resenha_rooms"
require_relative "../../../db/migrate/20260709165411_add_livekit_enabled_to_resenha_rooms"

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
      unless ActiveRecord::Base.connection.column_exists?(:resenha_rooms, :livekit_enabled)
        AddLivekitEnabledToResenhaRooms.new.change
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
      expect(response.parsed_body.keys).to contain_exactly("transport", "ice", "room")
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
      # The last leave also deletes the now-empty room from the SFU.
      stub_request(:post, "https://livekit.example.com/twirp/livekit.RoomService/DeleteRoom")
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

  describe "#kick" do
    fab!(:admin)

    before { sign_in(admin) }

    it "evicts the kicked user's media session from a livekit-pinned room" do
      configure_livekit!
      Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")
      Resenha::ParticipantTracker.add(room.id, other_user.id)
      stub =
        stub_request(
          :post,
          "https://livekit.example.com/twirp/livekit.RoomService/RemoveParticipant",
        ).with(
          body: { identity: other_user.id.to_s, room: Resenha::Livekit.room_name(room) }.to_json,
        )

      delete "/resenha/rooms/#{room.id}/kick.json", params: { user_id: other_user.id }

      expect(response.status).to eq(204)
      expect(stub).to have_been_requested
    end

    it "still succeeds when LiveKit is down" do
      configure_livekit!
      Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")
      Resenha::ParticipantTracker.add(room.id, other_user.id)
      stub_request(
        :post,
        "https://livekit.example.com/twirp/livekit.RoomService/RemoveParticipant",
      ).to_timeout

      delete "/resenha/rooms/#{room.id}/kick.json", params: { user_id: other_user.id }

      expect(response.status).to eq(204)
    end

    it "makes zero HTTP calls for a mesh room" do
      configure_livekit!
      Resenha::ParticipantTracker.pin_transport!(room.id, "mesh")
      Resenha::ParticipantTracker.add(room.id, other_user.id)
      stub = stub_request(:post, %r{\Ahttps://livekit\.example\.com/twirp/})

      delete "/resenha/rooms/#{room.id}/kick.json", params: { user_id: other_user.id }

      expect(response.status).to eq(204)
      expect(stub).not_to have_been_requested
    end
  end

  describe "#destroy" do
    fab!(:admin)

    before { sign_in(admin) }

    it "deletes a livekit-pinned room from the SFU and clears the pin" do
      configure_livekit!
      Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")
      stub =
        stub_request(
          :post,
          "https://livekit.example.com/twirp/livekit.RoomService/DeleteRoom",
        ).with(body: { room: Resenha::Livekit.room_name(room) }.to_json)

      delete "/resenha/rooms/#{room.id}.json"

      expect(response.status).to eq(200)
      expect(stub).to have_been_requested
      expect(Resenha::ParticipantTracker.pinned_transport(room.id)).to be_nil
    end

    it "makes zero HTTP calls for a mesh room" do
      configure_livekit!
      Resenha::ParticipantTracker.pin_transport!(room.id, "mesh")
      stub = stub_request(:post, %r{\Ahttps://livekit\.example\.com/twirp/})

      delete "/resenha/rooms/#{room.id}.json"

      expect(response.status).to eq(200)
      expect(stub).not_to have_been_requested
    end
  end

  describe "#leave" do
    before do
      configure_livekit!
      sign_in(user)
    end

    it "deletes the SFU room when the last participant leaves" do
      post "/resenha/rooms/#{room.id}/join.json"
      expect(response.parsed_body["transport"]).to eq("livekit")
      stub =
        stub_request(
          :post,
          "https://livekit.example.com/twirp/livekit.RoomService/DeleteRoom",
        ).with(body: { room: Resenha::Livekit.room_name(room) }.to_json)

      delete "/resenha/rooms/#{room.id}/leave.json"

      expect(response.status).to eq(204)
      expect(stub).to have_been_requested
      expect(Resenha::ParticipantTracker.pinned_transport(room.id)).to be_nil
    end

    it "keeps the SFU room while other participants remain" do
      Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")
      Resenha::ParticipantTracker.add(room.id, other_user.id)
      post "/resenha/rooms/#{room.id}/join.json"
      stub = stub_request(:post, %r{\Ahttps://livekit\.example\.com/twirp/})

      delete "/resenha/rooms/#{room.id}/leave.json"

      expect(response.status).to eq(204)
      expect(stub).not_to have_been_requested
      expect(Resenha::ParticipantTracker.pinned_transport(room.id)).to eq("livekit")
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

  describe "per-room policy" do
    fab!(:managed_room) { Fabricate(:resenha_room, creator: user, public: true) }

    before do
      configure_livekit!
      SiteSetting.resenha_livekit_room_policy = "per_room"
    end

    after { Resenha::ParticipantTracker.clear(managed_room.id) }

    describe "#join" do
      before { sign_in(user) }

      it "resolves the transport from the room's flag" do
        post "/resenha/rooms/#{room.id}/join.json"
        expect(response.parsed_body["transport"]).to eq("mesh")

        managed_room.update!(livekit_enabled: true)
        post "/resenha/rooms/#{managed_room.id}/join.json"
        expect(response.parsed_body["transport"]).to eq("livekit")
      end

      it "keeps a live livekit call on livekit when the flag is disabled mid-call" do
        managed_room.update!(livekit_enabled: true)
        post "/resenha/rooms/#{managed_room.id}/join.json"
        expect(response.parsed_body["transport"]).to eq("livekit")

        managed_room.update!(livekit_enabled: false)

        sign_in(other_user)
        post "/resenha/rooms/#{managed_room.id}/join.json"
        expect(response.parsed_body["transport"]).to eq("livekit")
      end

      it "keeps a live mesh call on mesh when the flag is enabled mid-call" do
        post "/resenha/rooms/#{managed_room.id}/join.json"
        expect(response.parsed_body["transport"]).to eq("mesh")

        managed_room.update!(livekit_enabled: true)

        sign_in(other_user)
        post "/resenha/rooms/#{managed_room.id}/join.json"
        expect(response.parsed_body["transport"]).to eq("mesh")
        expect(response.parsed_body["livekit"]).to be_nil
      end
    end

    describe "#create" do
      it "accepts livekit_enabled" do
        SiteSetting.resenha_create_room_allowed_groups = "#{Group::AUTO_GROUPS[:trust_level_2]}"
        sign_in(Fabricate(:user, trust_level: TrustLevel[2]))

        post "/resenha/rooms.json",
             params: {
               room: {
                 name: "Town hall",
                 public: true,
                 livekit_enabled: true,
               },
             }

        expect(response.status).to eq(200)
        expect(Resenha::Room.find_by(name: "Town hall").livekit_enabled).to eq(true)
      end
    end

    describe "#update" do
      it "lets a room manager toggle the flag" do
        sign_in(user)

        put "/resenha/rooms/#{managed_room.id}.json", params: { room: { livekit_enabled: true } }

        expect(response.status).to eq(200)
        expect(managed_room.reload.livekit_enabled).to eq(true)
        expect(response.parsed_body["room"]["livekit_enabled"]).to eq(true)
      end

      it "accepts a stale form's flag but the resolver ignores it once the policy changed" do
        SiteSetting.resenha_livekit_room_policy = "disabled"
        sign_in(user)

        put "/resenha/rooms/#{managed_room.id}.json", params: { room: { livekit_enabled: true } }

        expect(response.status).to eq(200)
        expect(managed_room.reload.livekit_enabled).to eq(true)

        post "/resenha/rooms/#{managed_room.id}/join.json"
        expect(response.parsed_body["transport"]).to eq("mesh")
      end
    end

    describe "#show" do
      it "serializes the flag to managers only" do
        sign_in(user)
        get "/resenha/rooms/#{managed_room.id}.json"
        expect(response.parsed_body["room"]).to have_key("livekit_enabled")

        sign_in(other_user)
        get "/resenha/rooms/#{managed_room.id}.json"
        expect(response.parsed_body["room"]).not_to have_key("livekit_enabled")
      end
    end
  end
end
