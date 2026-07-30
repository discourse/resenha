# frozen_string_literal: true

require "rails_helper"
require_relative "../../../db/migrate/20241107000000_create_resenha_rooms"
require_relative "../../../db/migrate/20260305162426_add_room_type_to_resenha_rooms"
require_relative "../../../db/migrate/20260612135211_add_video_enabled_to_resenha_rooms"
require_relative "../../../db/migrate/20260630183841_add_chat_settings_to_resenha_rooms"
require_relative "../../../db/migrate/20260709165411_add_livekit_enabled_to_resenha_rooms"
require_relative "../../../db/migrate/20260717172530_create_resenha_recordings"

RSpec.describe Resenha::LivekitWebhooksController do
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
    SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:everyone]
    SiteSetting.resenha_livekit_url = "wss://livekit.example.com"
    SiteSetting.resenha_livekit_api_key = "lk_api_key"
    SiteSetting.resenha_livekit_api_secret = "lk_api_secret"
    SiteSetting.resenha_livekit_room_policy = "all_rooms"
  end

  after do
    Resenha::ParticipantTracker.clear(room.id)
    Discourse.redis.del(Resenha::Livekit::LAST_WEBHOOK_KEY)
  end

  def signed_headers(body, secret: "lk_api_secret", key: "lk_api_key", sha256: nil, exp: nil)
    token =
      JWT.encode(
        {
          iss: key,
          exp: (exp || 1.minute.from_now).to_i,
          sha256: sha256 || Digest::SHA256.base64digest(body),
        },
        secret,
        "HS256",
      )
    { "Authorization" => token, "CONTENT_TYPE" => "application/webhook+json" }
  end

  # `created_at` defaults to the future so presence added a moment earlier in
  # the test always counts as seen before the event.
  def event_for(
    event: "participant_left",
    room_name: Resenha::Livekit.room_name(room),
    identity: user.id.to_s,
    sid: "PA_test",
    created_at: 1.minute.from_now
  )
    {
      "event" => event,
      "id" => "EV_test",
      "createdAt" => created_at.to_i.to_s,
      "room" => {
        "sid" => "RM_test",
        "name" => room_name,
      },
      "participant" => {
        "sid" => sid,
        "identity" => identity,
      },
    }
  end

  def post_webhook(event = event_for, headers: nil)
    body = event.to_json
    post "/resenha/livekit/webhook", params: body, headers: headers || signed_headers(body)
  end

  describe "#create" do
    context "with an invalid delivery" do
      it "rejects a request with no Authorization token and records no delivery" do
        body = event_for.to_json

        post "/resenha/livekit/webhook",
             params: body,
             headers: {
               "CONTENT_TYPE" => "application/webhook+json",
             }

        expect(response.status).to eq(403)
        expect(Resenha::Livekit.last_webhook_at).to be_nil
      end

      it "rejects a token signed with the wrong secret" do
        body = event_for.to_json

        post "/resenha/livekit/webhook",
             params: body,
             headers: signed_headers(body, secret: "not-the-secret")

        expect(response.status).to eq(403)
      end

      it "rejects an expired token" do
        body = event_for.to_json

        post "/resenha/livekit/webhook",
             params: body,
             headers: signed_headers(body, exp: 1.minute.ago)

        expect(response.status).to eq(403)
      end

      it "rejects a token issued for a different API key" do
        body = event_for.to_json

        post "/resenha/livekit/webhook", params: body, headers: signed_headers(body, key: "other")

        expect(response.status).to eq(403)
      end

      it "rejects a body that does not match the signed hash" do
        signed_body = event_for.to_json
        tampered_body = event_for(identity: "999").to_json

        post "/resenha/livekit/webhook", params: tampered_body, headers: signed_headers(signed_body)

        expect(response.status).to eq(403)
        expect(Resenha::ParticipantTracker.pinned_transport(room.id)).to be_nil
      end

      it "rejects everything when LiveKit is unconfigured" do
        body = event_for.to_json
        headers = signed_headers(body)
        SiteSetting.resenha_livekit_api_secret = ""

        post "/resenha/livekit/webhook", params: body, headers: headers

        expect(response.status).to eq(403)
      end
    end

    it "records the delivery time of every verified webhook, including unhandled events" do
      post_webhook(event_for(event: "room_started"))

      expect(response.status).to eq(200)
      expect(Resenha::Livekit.last_webhook_at).to be_within(5.seconds).of(Time.now)
    end

    %w[participant_left participant_connection_aborted].each do |event_name|
      context "with a #{event_name} event" do
        it "expires the participant's presence, keeps their metadata, and broadcasts the change" do
          Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")
          Resenha::ParticipantTracker.add(room.id, user.id)
          Resenha::ParticipantTracker.update_metadata(room.id, user.id, { role: "participant" })

          messages =
            MessageBus.track_publish(Resenha.room_channel(room.id)) do
              post_webhook(event_for(event: event_name))
            end

          expect(response.status).to eq(200)
          expect(Resenha::ParticipantTracker.user_ids(room.id)).not_to include(user.id)
          expect(Resenha::ParticipantTracker.get_metadata(room.id, user.id)[:role]).to eq(
            "participant",
          )
          expect(messages.map { |message| message.data[:type] }).to include("participants")
        end
      end
    end

    context "with a participant_left event" do
      it "leaves presence alone when it was refreshed after the event fired" do
        Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")
        Resenha::ParticipantTracker.add(room.id, user.id)

        post_webhook(event_for(created_at: 2.minutes.ago))

        expect(response.status).to eq(200)
        expect(Resenha::ParticipantTracker.user_ids(room.id)).to include(user.id)
      end

      it "never creates presence for a participant who is not in the room" do
        Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")

        post_webhook

        expect(response.status).to eq(200)
        expect(Resenha::ParticipantTracker.user_ids(room.id)).to be_empty
      end

      it "ignores rooms pinned to mesh" do
        Resenha::ParticipantTracker.pin_transport!(room.id, "mesh")
        Resenha::ParticipantTracker.add(room.id, user.id)

        post_webhook

        expect(response.status).to eq(200)
        expect(Resenha::ParticipantTracker.user_ids(room.id)).to include(user.id)
      end

      it "ignores rooms with no pinned transport" do
        Resenha::ParticipantTracker.add(room.id, user.id)

        post_webhook

        expect(response.status).to eq(200)
        expect(Resenha::ParticipantTracker.user_ids(room.id)).to include(user.id)
      end

      it "ignores events for rooms outside this site's namespace" do
        Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")
        Resenha::ParticipantTracker.add(room.id, user.id)

        post_webhook(event_for(room_name: "othersite-r#{room.id}"))

        expect(response.status).to eq(200)
        expect(Resenha::ParticipantTracker.user_ids(room.id)).to include(user.id)
      end

      it "ignores a non-numeric participant identity" do
        Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")
        Resenha::ParticipantTracker.add(room.id, user.id)

        post_webhook(event_for(identity: "recorder-bot"))

        expect(response.status).to eq(200)
        expect(Resenha::ParticipantTracker.user_ids(room.id)).to include(user.id)
      end

      it "leaves the session row open for CloseOrphanedSessions to close" do
        sign_in(user)
        post "/resenha/rooms/#{room.id}/join.json"
        expect(response.status).to eq(200)
        session = Resenha::Session.find_by(user_id: user.id, room_id: room.id)

        post_webhook

        expect(response.status).to eq(200)
        expect(Resenha::ParticipantTracker.user_ids(room.id)).not_to include(user.id)
        expect(session.reload.left_at).to be_nil

        Jobs::Resenha::CloseOrphanedSessions.new.execute({})

        expect(session.reload.left_at).to be_present
      end
    end

    context "with a rejoined participant" do
      before do
        Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")
        Resenha::ParticipantTracker.add(room.id, user.id)
      end

      it "ignores the superseded session's late departure" do
        post_webhook(event_for(event: "participant_joined", sid: "PA_new"))
        post_webhook(event_for(sid: "PA_old"))

        expect(response.status).to eq(200)
        expect(Resenha::ParticipantTracker.user_ids(room.id)).to include(user.id)
      end

      it "expires presence when the departing session is the recorded one" do
        post_webhook(event_for(event: "participant_joined", sid: "PA_new"))
        post_webhook(event_for(sid: "PA_new"))

        expect(response.status).to eq(200)
        expect(Resenha::ParticipantTracker.user_ids(room.id)).not_to include(user.id)
      end

      it "expires presence when no session was recorded for the user" do
        post_webhook(event_for(sid: "PA_old"))

        expect(response.status).to eq(200)
        expect(Resenha::ParticipantTracker.user_ids(room.id)).not_to include(user.id)
      end
    end

    context "with a room_finished event" do
      it "clears the transport pin of a livekit room without touching presence" do
        Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")
        Resenha::ParticipantTracker.add(room.id, user.id)

        post_webhook(event_for(event: "room_finished"))

        expect(response.status).to eq(200)
        expect(Resenha::ParticipantTracker.pinned_transport(room.id)).to be_nil
        expect(Resenha::ParticipantTracker.user_ids(room.id)).to include(user.id)
      end

      it "keeps a mesh room's pin" do
        Resenha::ParticipantTracker.pin_transport!(room.id, "mesh")

        post_webhook(event_for(event: "room_finished"))

        expect(response.status).to eq(200)
        expect(Resenha::ParticipantTracker.pinned_transport(room.id)).to eq("mesh")
      end
    end

    context "with an egress_ended event" do
      def egress_event(
        egress_id: "EG_1",
        room_name: Resenha::Livekit.room_name(room),
        snake_case: false
      )
        egress_info =
          if snake_case
            { "egress_id" => egress_id, "room_name" => room_name, "status" => "EGRESS_COMPLETE" }
          else
            { "egressId" => egress_id, "roomName" => room_name, "status" => "EGRESS_COMPLETE" }
          end

        event = {
          "event" => "egress_ended",
          "id" => "EV_egress",
          "createdAt" => 1.minute.from_now.to_i.to_s,
        }
        event[snake_case ? "egress_info" : "egressInfo"] = egress_info
        event
      end

      before do
        Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")
        Resenha::ParticipantTracker.set_recording(
          room.id,
          egress_id: "EG_1",
          user_id: user.id,
          username: user.username,
          started_at: Time.now.to_f,
        )
      end

      it "clears the recording state and broadcasts the end" do
        messages =
          MessageBus.track_publish(Resenha.room_channel(room.id)) { post_webhook(egress_event) }

        expect(response.status).to eq(200)
        expect(Resenha::RecordingManager.status(room.id)).to be_nil
        recording_messages = messages.select { |message| message.data[:type] == "recording" }
        expect(recording_messages.size).to eq(1)
        expect(recording_messages.first.data[:recording]).to be_nil
      end

      it "handles a snake_case egress webhook" do
        post_webhook(egress_event(snake_case: true))

        expect(response.status).to eq(200)
        expect(Resenha::RecordingManager.status(room.id)).to be_nil
      end

      it "ignores an egress that is not the active recording" do
        post_webhook(egress_event(egress_id: "EG_other"))

        expect(response.status).to eq(200)
        expect(Resenha::RecordingManager.status(room.id)).to be_present
      end

      it "ignores events for rooms outside this site's namespace" do
        post_webhook(egress_event(room_name: "othersite-r#{room.id}"))

        expect(response.status).to eq(200)
        expect(Resenha::RecordingManager.status(room.id)).to be_present
      end

      it "finalizes the recording row and PMs the requester the file location" do
        recording =
          Resenha::Recording.create!(
            room: room,
            started_by: user,
            egress_id: "EG_1",
            filepath: "resenha/test-abc123",
            started_at: 10.minutes.ago,
          )

        event = egress_event
        event["egressInfo"]["fileResults"] = [
          {
            "filename" => "resenha/test-abc123.mp4",
            "location" => "https://cdn.example.com/resenha/test-abc123.mp4",
            "duration" => (300 * 1_000_000_000).to_s,
            "size" => "1000",
          },
        ]
        post_webhook(event)

        expect(response.status).to eq(200)
        expect(recording.reload.status).to eq("completed")
        expect(recording.location).to eq("https://cdn.example.com/resenha/test-abc123.mp4")

        pm_topic =
          Topic.private_messages_for_user(user).find_by(
            title: I18n.t("resenha.recording_ready_pm.title", room_name: room.name),
          )
        expect(pm_topic.first_post.raw).to include(recording.location)
      end
    end

    it "returns 404 when the plugin is disabled" do
      SiteSetting.resenha_enabled = false

      post_webhook

      expect(response.status).to eq(404)
    end
  end
end
