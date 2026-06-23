# frozen_string_literal: true
require "rails_helper"
require_relative "../../../db/migrate/20241107000000_create_resenha_rooms"
require_relative "../../../db/migrate/20260612135211_add_video_enabled_to_resenha_rooms"

RSpec.describe Resenha::RoomsController do
  before do
    ActiveRecord::Migration.suppress_messages do
      unless ActiveRecord::Base.connection.table_exists?(:resenha_rooms)
        CreateResenhaRooms.new.change
      end
      unless ActiveRecord::Base.connection.column_exists?(:resenha_rooms, :video_enabled)
        AddVideoEnabledToResenhaRooms.new.change
        Resenha::Room.reset_column_information
      end
    end
  end

  fab!(:staff, :admin)
  fab!(:user) { Fabricate(:user, trust_level: TrustLevel[2]) }
  fab!(:other_participant) { Fabricate(:user, trust_level: TrustLevel[2]) }
  fab!(:room) { Fabricate(:resenha_room, creator: staff, public: true) }

  before do
    SiteSetting.resenha_enabled = true
    SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:everyone]
    SiteSetting.resenha_create_room_allowed_groups = "#{Group::AUTO_GROUPS[:trust_level_2]}"
  end

  describe "#index" do
    it "returns rooms visible to the user" do
      sign_in(user)

      get "/resenha/rooms.json"

      expect(response.status).to eq(200)
      expect(response.parsed_body["rooms"]).to be_present
    end

    context "when anonymous" do
      fab!(:private_room) { Fabricate(:resenha_room, creator: staff, public: false) }

      it "returns only public rooms when access is open to everyone" do
        get "/resenha/rooms.json"

        expect(response.status).to eq(200)
        room_ids = response.parsed_body["rooms"].map { |r| r["id"] }
        expect(room_ids).to include(room.id)
        expect(room_ids).not_to include(private_room.id)
        expect(response.parsed_body["can_create_room"]).to eq(false)
      end

      it "returns no rooms when access is restricted to a group" do
        SiteSetting.resenha_allowed_groups = "#{Group::AUTO_GROUPS[:trust_level_2]}"

        get "/resenha/rooms.json"

        expect(response.status).to eq(200)
        expect(response.parsed_body["rooms"]).to be_empty
      end
    end
  end

  describe "#create" do
    it "allows trusted user to create a room" do
      sign_in(user)

      post "/resenha/rooms.json", params: { room: { name: "Game Night", public: true } }

      expect(response.status).to eq(200)
      expect(response.parsed_body["room"]["name"]).to eq("Game Night")
    end
  end

  describe "#join" do
    it "tracks users when they join a room" do
      sign_in(user)

      post "/resenha/rooms/#{room.id}/join.json"

      expect(response.status).to eq(200)
      json = response.parsed_body
      expect(json["room"]["active_participants"].map { |p| p["id"] }).to include(user.id)
    end

    it "targets participant broadcasts to all active room participants" do
      sign_in(user)
      Resenha::ParticipantTracker.add(room.id, other_participant.id)

      published = []
      allow(MessageBus).to receive(:publish) do |channel, data, opts|
        published << [channel, data, opts]
      end

      post "/resenha/rooms/#{room.id}/join.json"

      expect(response.status).to eq(200)

      participants_message =
        published.find do |channel, data, _opts|
          channel == Resenha.room_channel(room.id) && data[:type] == "participants"
        end

      expect(participants_message).to be_present
      expect(participants_message[2][:user_ids]).to contain_exactly(user.id, other_participant.id)
    end

    context "with user status integration" do
      before do
        SiteSetting.enable_user_status = true
        SiteSetting.resenha_auto_status_enabled = true
      end

      it "sets user status on join" do
        sign_in(user)

        post "/resenha/rooms/#{room.id}/join.json"

        user.reload
        expect(user.user_status.emoji).to eq("studio_microphone")
        expect(user.user_status.description).to eq("In #{room.name}")
      end

      it "skips status when user already has one" do
        sign_in(user)
        user.set_status!("Busy", "no_entry")

        post "/resenha/rooms/#{room.id}/join.json"

        user.reload
        expect(user.user_status.emoji).to eq("no_entry")
      end

      it "skips status when skip_status param is sent" do
        sign_in(user)

        post "/resenha/rooms/#{room.id}/join.json", params: { skip_status: true }

        user.reload
        expect(user.user_status).to be_nil
      end
    end
  end

  describe "#leave" do
    before do
      SiteSetting.enable_user_status = true
      SiteSetting.resenha_auto_status_enabled = true
    end

    it "clears Resenha status on leave" do
      sign_in(user)
      Resenha::ParticipantTracker.add(room.id, user.id)
      user.set_status!("In #{room.name}", "studio_microphone", 2.minutes.from_now)

      delete "/resenha/rooms/#{room.id}/leave.json"

      expect(response.status).to eq(204)
      user.reload
      expect(user.user_status).to be_nil
    end

    it "preserves non-Resenha status on leave" do
      sign_in(user)
      Resenha::ParticipantTracker.add(room.id, user.id)
      user.set_status!("On vacation", "palm_tree")

      delete "/resenha/rooms/#{room.id}/leave.json"

      expect(response.status).to eq(204)
      user.reload
      expect(user.user_status.emoji).to eq("palm_tree")
    end
  end

  describe "#heartbeat" do
    it "refreshes participant presence without rejoining" do
      sign_in(user)
      Resenha::ParticipantTracker.remove(room.id, user.id)

      post "/resenha/rooms/#{room.id}/heartbeat.json"

      expect(response.status).to eq(204)
      expect(Resenha::ParticipantTracker.user_ids(room.id)).to include(user.id)
    end

    it "broadcasts the participant list when a stale participant has dropped out" do
      sign_in(user)
      Resenha::ParticipantTracker.add(room.id, user.id)
      Resenha::ParticipantTracker.add(room.id, other_participant.id)

      # other_participant left abruptly (refresh/close) and their heartbeat lapsed.
      key = "#{Resenha::ParticipantTracker::KEY_NAMESPACE}:#{room.id}:participants"
      Discourse.redis.zadd(key, 1.hour.ago.to_f, other_participant.id)

      published = []
      allow(MessageBus).to receive(:publish) { |channel, data, _opts| published << data }

      post "/resenha/rooms/#{room.id}/heartbeat.json"

      expect(response.status).to eq(204)
      participants_message = published.find { |data| data[:type] == "participants" }
      expect(participants_message).to be_present
      expect(participants_message[:participants].map { |p| p[:id] }).to contain_exactly(user.id)
    end

    it "does not broadcast when membership and state are unchanged" do
      sign_in(user)
      Resenha::ParticipantTracker.add(room.id, user.id)
      # Prime the stored fingerprint so the next heartbeat sees no change.
      Resenha::RoomBroadcaster.publish_participants_if_changed(room)

      published = []
      allow(MessageBus).to receive(:publish) { |channel, data, _opts| published << data }

      post "/resenha/rooms/#{room.id}/heartbeat.json"

      expect(response.status).to eq(204)
      expect(published.find { |data| data[:type] == "participants" }).to be_nil
    end

    context "with user status integration" do
      before do
        SiteSetting.enable_user_status = true
        SiteSetting.resenha_auto_status_enabled = true
        sign_in(user)
        Resenha::ParticipantTracker.add(room.id, user.id)
        Resenha::ParticipantTracker.update_metadata(room.id, user.id, { role: "participant" })
        Resenha::UserStatusManager.set_voice_status(user, room)
      end

      it "refreshes status expiry on heartbeat" do
        freeze_time do
          post "/resenha/rooms/#{room.id}/heartbeat.json"

          user.reload
          expect(user.user_status.ends_at).to be_within(1.second).of(2.minutes.from_now)
        end
      end

      it "transitions to AFK status" do
        post "/resenha/rooms/#{room.id}/heartbeat.json", params: { idle_state: "afk" }

        user.reload
        expect(user.user_status.emoji).to eq("zzz")
        expect(user.user_status.description).to eq("AFK in #{room.name}")
      end

      it "transitions back from AFK to active status" do
        Resenha::UserStatusManager.set_afk_status(user, room)

        post "/resenha/rooms/#{room.id}/heartbeat.json", params: { idle_state: "active" }

        user.reload
        expect(user.user_status.emoji).to eq("studio_microphone")
        expect(user.user_status.description).to eq("In #{room.name}")
      end

      it "skips status refresh when skip_status metadata is set" do
        Resenha::ParticipantTracker.update_metadata(
          room.id,
          user.id,
          { role: "participant", skip_status: true },
        )
        user.clear_status!

        post "/resenha/rooms/#{room.id}/heartbeat.json"

        user.reload
        expect(user.user_status).to be_nil
      end
    end
  end

  describe "#kick" do
    before { Resenha::ParticipantTracker.add(room.id, other_participant.id) }

    it "allows room manager to kick participants" do
      sign_in(staff)

      published = []
      allow(MessageBus).to receive(:publish) { |channel, data, opts|
        published << [channel, data, opts]
      }

      delete "/resenha/rooms/#{room.id}/kick.json", params: { user_id: other_participant.id }

      expect(response.status).to eq(204)
      expect(Resenha::ParticipantTracker.user_ids(room.id)).not_to include(other_participant.id)

      kick_message = published.find { |(_, data)| data[:type] == "kicked" }
      expect(kick_message).to be_present
      expect(kick_message[2][:user_ids]).to eq([other_participant.id])
    end

    it "prevents non-managers from kicking" do
      low_trust_user = Fabricate(:user, trust_level: TrustLevel[0])
      sign_in(low_trust_user)

      delete "/resenha/rooms/#{room.id}/kick.json", params: { user_id: other_participant.id }

      expect(response.status).to eq(403)
    end

    it "prevents kicking oneself" do
      sign_in(staff)

      delete "/resenha/rooms/#{room.id}/kick.json", params: { user_id: staff.id }

      expect(response.status).to eq(400)
    end

    it "clears kicked user's Resenha status" do
      SiteSetting.enable_user_status = true
      SiteSetting.resenha_auto_status_enabled = true
      sign_in(staff)
      other_participant.set_status!("In #{room.name}", "studio_microphone", 2.minutes.from_now)

      delete "/resenha/rooms/#{room.id}/kick.json", params: { user_id: other_participant.id }

      expect(response.status).to eq(204)
      other_participant.reload
      expect(other_participant.user_status).to be_nil
    end

    it "prevents kicking the room creator" do
      sign_in(staff)
      other_room = Fabricate(:resenha_room, creator: user, public: true)
      Resenha::ParticipantTracker.add(other_room.id, user.id)

      delete "/resenha/rooms/#{other_room.id}/kick.json", params: { user_id: user.id }

      expect(response.status).to eq(400)
    end
  end

  describe "#toggle_mute" do
    before { Resenha::ParticipantTracker.add(room.id, user.id) }

    it "sets muted metadata and broadcasts participants" do
      sign_in(user)

      published = []
      allow(MessageBus).to receive(:publish) { |channel, data, opts|
        published << [channel, data, opts]
      }

      post "/resenha/rooms/#{room.id}/toggle_mute.json", params: { muted: true }

      expect(response.status).to eq(204)

      metadata = Resenha::ParticipantTracker.get_metadata(room.id, user.id)
      expect(metadata[:is_muted]).to eq(true)

      participants_message = published.find { |(_, data)| data[:type] == "participants" }
      expect(participants_message).to be_present
      muted_participant = participants_message[1][:participants].find { |p| p[:id] == user.id }
      expect(muted_participant[:is_muted]).to eq(true)
    end

    it "unmutes when muted is false" do
      sign_in(user)
      Resenha::ParticipantTracker.update_metadata(room.id, user.id, { is_muted: true })

      post "/resenha/rooms/#{room.id}/toggle_mute.json", params: { muted: false }

      expect(response.status).to eq(204)

      metadata = Resenha::ParticipantTracker.get_metadata(room.id, user.id)
      expect(metadata[:is_muted]).to eq(false)
    end

    it "sets deafened metadata" do
      sign_in(user)

      post "/resenha/rooms/#{room.id}/toggle_mute.json", params: { muted: true, deafened: true }

      expect(response.status).to eq(204)

      metadata = Resenha::ParticipantTracker.get_metadata(room.id, user.id)
      expect(metadata[:is_muted]).to eq(true)
      expect(metadata[:is_deafened]).to eq(true)
    end

    it "requires authentication" do
      post "/resenha/rooms/#{room.id}/toggle_mute.json", params: { muted: true }

      expect(response.status).to eq(403)
    end
  end

  describe "#state" do
    before do
      SiteSetting.resenha_video_enabled = true
      Resenha::ParticipantTracker.add(room.id, user.id)
      sign_in(user)
    end

    it "sets video metadata and broadcasts participants" do
      published = []
      allow(MessageBus).to receive(:publish) { |channel, data, opts|
        published << [channel, data, opts]
      }

      post "/resenha/rooms/#{room.id}/state.json", params: { video: true }

      expect(response.status).to eq(204)

      metadata = Resenha::ParticipantTracker.get_metadata(room.id, user.id)
      expect(metadata[:is_video_on]).to eq(true)

      participants_message = published.find { |(_, data)| data[:type] == "participants" }
      expect(participants_message).to be_present
      participant = participants_message[1][:participants].find { |entry| entry[:id] == user.id }
      expect(participant[:is_video_on]).to eq(true)
    end

    it "sets screen sharing and watching metadata" do
      post "/resenha/rooms/#{room.id}/state.json", params: { screen: true, watching: true }

      expect(response.status).to eq(204)

      metadata = Resenha::ParticipantTracker.get_metadata(room.id, user.id)
      expect(metadata[:is_screen_sharing]).to eq(true)
      expect(metadata[:watching_video]).to eq(true)
    end

    it "rejects video when the site setting is disabled" do
      SiteSetting.resenha_video_enabled = false

      post "/resenha/rooms/#{room.id}/state.json", params: { video: true }

      expect(response.status).to eq(403)
    end

    it "rejects video when the room has video disabled" do
      room.update!(video_enabled: false)

      post "/resenha/rooms/#{room.id}/state.json", params: { video: true }

      expect(response.status).to eq(403)
    end

    it "rejects video in stage rooms" do
      room.update!(room_type: Resenha::Room::ROOM_TYPE_STAGE)

      post "/resenha/rooms/#{room.id}/state.json", params: { video: true }

      expect(response.status).to eq(403)
    end

    it "rejects video when the publisher limit is reached" do
      SiteSetting.resenha_video_max_publishers = 2

      publishers = Fabricate.times(2, :user)
      publishers.each do |publisher|
        Resenha::ParticipantTracker.add(room.id, publisher.id)
        Resenha::ParticipantTracker.update_metadata(room.id, publisher.id, { is_video_on: true })
      end

      post "/resenha/rooms/#{room.id}/state.json", params: { video: true }

      expect(response.status).to eq(400)
    end

    it "allows an existing publisher to keep publishing at the limit" do
      SiteSetting.resenha_video_max_publishers = 2

      publisher = Fabricate(:user)
      Resenha::ParticipantTracker.add(room.id, publisher.id)
      Resenha::ParticipantTracker.update_metadata(room.id, publisher.id, { is_video_on: true })
      Resenha::ParticipantTracker.update_metadata(room.id, user.id, { is_video_on: true })

      post "/resenha/rooms/#{room.id}/state.json", params: { video: true }

      expect(response.status).to eq(204)
    end

    it "allows turning video off even when video is disallowed" do
      Resenha::ParticipantTracker.update_metadata(room.id, user.id, { is_video_on: true })
      room.update!(video_enabled: false)

      post "/resenha/rooms/#{room.id}/state.json", params: { video: false }

      expect(response.status).to eq(204)
      metadata = Resenha::ParticipantTracker.get_metadata(room.id, user.id)
      expect(metadata[:is_video_on]).to eq(false)
    end

    it "still updates mute state through the toggle_mute alias" do
      post "/resenha/rooms/#{room.id}/toggle_mute.json", params: { muted: true }

      expect(response.status).to eq(204)
      metadata = Resenha::ParticipantTracker.get_metadata(room.id, user.id)
      expect(metadata[:is_muted]).to eq(true)
    end
  end

  describe "#update" do
    it "lets a room manager toggle video_enabled" do
      sign_in(staff)

      put "/resenha/rooms/#{room.id}.json", params: { room: { video_enabled: false } }

      expect(response.status).to eq(200)
      expect(room.reload.video_enabled).to eq(false)
      expect(response.parsed_body["room"]["video_enabled"]).to eq(false)
    end
  end

  describe "#join with metadata" do
    it "includes is_muted and is_deafened in active_participants when metadata exists" do
      sign_in(user)
      Resenha::ParticipantTracker.add(room.id, other_participant.id)
      Resenha::ParticipantTracker.update_metadata(
        room.id,
        other_participant.id,
        { is_muted: true, is_deafened: true },
      )

      post "/resenha/rooms/#{room.id}/join.json"

      expect(response.status).to eq(200)
      participants = response.parsed_body["room"]["active_participants"]
      participant = participants.find { |p| p["id"] == other_participant.id }
      expect(participant["is_muted"]).to eq(true)
      expect(participant["is_deafened"]).to eq(true)
    end
  end

  describe "#signal" do
    it "rejects missing payloads" do
      sign_in(user)

      post "/resenha/rooms/#{room.id}/signal.json", params: { payload: {} }

      expect(response.status).to eq(400)
    end

    it "relays ICE candidate payloads" do
      sign_in(user)

      candidate_payload = {
        candidate: "candidate:347230118 1 udp 41819902 203.0.113.1 54400 typ host",
        sdpMid: "0",
        sdpMLineIndex: 0,
        usernameFragment: "abc123",
      }

      published = []
      allow(MessageBus).to receive(:publish) do |channel, data, opts|
        published << [channel, data, opts]
      end

      post "/resenha/rooms/#{room.id}/signal.json",
           params: {
             payload: {
               type: "candidate",
               candidate: candidate_payload,
               recipient_id: staff.id,
             },
           }

      expect(response.status).to eq(204)

      # Verify MessageBus received correct parameters
      expect(MessageBus).to have_received(:publish) do |channel, data, opts|
        expect(channel).to eq(Resenha.room_channel(room.id))
        expect(data[:type]).to eq("signal")
        expect(data[:room_id]).to eq(room.id)
        expect(data[:sender_id]).to eq(user.id)
        expect(data[:data][:type]).to eq("candidate")
        expect(data[:data][:candidate][:candidate]).to eq(candidate_payload[:candidate])
        expect(opts[:user_ids]).to eq([staff.id])
      end
    end

    it "accepts batched events payloads" do
      sign_in(user)

      published = []
      allow(MessageBus).to receive(:publish) do |channel, data, opts|
        published << [channel, data, opts]
      end

      post "/resenha/rooms/#{room.id}/signal.json",
           params: {
             payload: {
               recipient_id: staff.id,
               events: [
                 { type: "offer", sdp: "v=0" },
                 {
                   type: "candidate",
                   candidate: {
                     candidate: "candidate:1 1 udp 2122260223 10.0.0.1 8998 typ host",
                   },
                 },
               ],
             },
           }

      expect(response.status).to eq(204)
      expect(MessageBus).to have_received(:publish).twice

      expect(published.map(&:first)).to all(eq(Resenha.room_channel(room.id)))
      expect(published.map { |(_, data)| data[:sender_id] }).to all(eq(user.id))
      expect(published.map { |(_, _, opts)| opts[:user_ids] }).to all(eq([staff.id]))

      types = published.map { |(_, data)| data[:data][:type] }
      expect(types).to contain_exactly("offer", "candidate")
      expect(published.find { |(_, data)| data[:data][:type] == "offer" }[1][:data][:sdp]).to eq(
        "v=0",
      )
      expect(
        published.find { |(_, data)| data[:data][:type] == "candidate" }[1][:data][:candidate][
          :candidate
        ],
      ).to eq("candidate:1 1 udp 2122260223 10.0.0.1 8998 typ host")
    end

    it "relays multi-recipient batched messages" do
      sign_in(user)

      published = []
      allow(MessageBus).to receive(:publish) do |channel, data, opts|
        published << [channel, data, opts]
      end

      post "/resenha/rooms/#{room.id}/signal.json",
           params: {
             payload: {
               messages: [
                 { recipient_id: staff.id, events: [{ type: "offer", sdp: "v=0" }] },
                 {
                   recipient_id: other_participant.id,
                   events: [
                     {
                       type: "candidate",
                       candidate: {
                         candidate: "candidate:1 1 udp 2122260223 10.0.0.1 8998 typ host",
                       },
                     },
                   ],
                 },
               ],
             },
           }

      expect(response.status).to eq(204)
      expect(published.size).to eq(2)
      expect(published.map(&:first)).to all(eq(Resenha.room_channel(room.id)))
      expect(published.map { |(_, data)| data[:sender_id] }).to all(eq(user.id))

      offer_payload = published.find { |(_, data)| data[:data][:type] == "offer" }
      candidate_payload = published.find { |(_, data)| data[:data][:type] == "candidate" }

      expect(offer_payload[1][:data][:sdp]).to eq("v=0")
      expect(offer_payload[2][:user_ids]).to eq([staff.id])
      expect(candidate_payload[1][:data][:candidate][:candidate]).to eq(
        "candidate:1 1 udp 2122260223 10.0.0.1 8998 typ host",
      )
      expect(candidate_payload[2][:user_ids]).to eq([other_participant.id])
    end
  end
end
