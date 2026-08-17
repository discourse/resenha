# frozen_string_literal: true

RSpec.describe Resenha::CallsController do
  fab!(:caller) { Fabricate(:user, trust_level: TrustLevel[2]) }
  fab!(:callee) { Fabricate(:user, trust_level: TrustLevel[2]) }

  before do
    SiteSetting.resenha_enabled = true
    SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:everyone]
    SiteSetting.resenha_direct_calls_allowed_groups = Group::AUTO_GROUPS[:trust_level_2]
  end

  describe "#create" do
    it "creates an ephemeral room with both parties as moderators and rings the callee" do
      sign_in(caller)

      messages =
        MessageBus.track_publish do
          post "/resenha/calls.json", params: { username: callee.username }
        end
      alert_messages = messages.select { |m| m.channel == "/notification-alert/#{callee.id}" }
      ring_messages = messages.select { |m| m.channel == "/resenha/call-ring/#{callee.id}" }

      expect(response.status).to eq(200)

      room = Resenha::Room.find(response.parsed_body["room"]["id"])
      expect(room.ephemeral).to eq(true)
      expect(room.public).to eq(false)
      expect(room.name).to eq(
        I18n.t("resenha.call.room_name", caller: caller.username, callee: callee.username),
      )
      expect(room.moderator_ids).to contain_exactly(caller.id, callee.id)

      ringing = response.parsed_body["room"]["ringing"]
      expect(ringing.map { |entry| entry["user"]["id"] }).to contain_exactly(callee.id)
      expect(ringing.first["notified_at"]).to be_within(5).of(Time.current.to_i)

      invite = Resenha::Invite.find_by(room_id: room.id, user_id: callee.id)
      expect(invite.invited_by_id).to eq(caller.id)

      notification = callee.notifications.order(:id).last
      expect(notification.notification_type).to eq(Notification.types[:resenha_invitation])
      data = JSON.parse(notification.data)
      expect(data["call"]).to eq(true)
      expect(data["room_slug"]).to eq(room.slug)
      expect(data["display_username"]).to eq(caller.username)

      expect(alert_messages.size).to eq(1)
      expect(alert_messages.first.data[:translated_title]).to eq(
        I18n.t("resenha.call_notification.title", username: caller.username),
      )

      expect(ring_messages.size).to eq(1)
      ring = ring_messages.first
      expect(ring.user_ids).to contain_exactly(callee.id)
      expect(ring.data[:room_id]).to eq(room.id)
      expect(ring.data[:room_slug]).to eq(room.slug)
      expect(ring.data[:caller_username]).to eq(caller.username)
      expect(ring.data[:ring_seconds]).to eq(Resenha::RoomInviter::RING_SECONDS)
      expect(ring.data[:sent_at]).to be_within(5).of(Time.current.to_i)

      ringing_event =
        messages.find do |message|
          message.channel == "/resenha/rooms/#{room.id}" && message.data[:type] == "ringing"
        end
      expect(ringing_event).to be_present
      expect(ringing_event.data[:user][:id]).to eq(callee.id)
      expect(ringing_event.data[:notified_at]).to eq(ring.data[:sent_at])
    end

    it "gives the callee a peer's powers: joining and pulling others into the call" do
      sign_in(caller)

      post "/resenha/calls.json", params: { username: callee.username }

      room = Resenha::Room.find(response.parsed_body["room"]["id"])
      expect(callee.guardian.can_join_resenha_room?(room)).to eq(true)
      expect(callee.guardian.can_invite_to_resenha_room?(room)).to eq(true)
    end

    it "returns 404 for an unknown username" do
      sign_in(caller)

      post "/resenha/calls.json", params: { username: "no-such-user" }

      expect(response.status).to eq(404)
      expect(Resenha::Room.ephemeral.count).to eq(0)
    end

    it "rejects calling yourself" do
      sign_in(caller)

      post "/resenha/calls.json", params: { username: caller.username }

      expect(response.status).to eq(400)
      expect(Resenha::Room.ephemeral.count).to eq(0)
    end

    it "rejects a callee outside the allowed groups" do
      SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:trust_level_2]
      outsider = Fabricate(:user, trust_level: TrustLevel[0])
      sign_in(caller)

      post "/resenha/calls.json", params: { username: outsider.username }

      expect(response.status).to eq(400)
      expect(Resenha::Room.ephemeral.count).to eq(0)
    end

    it "returns 403 when the caller is outside the direct-call groups (the default)" do
      SiteSetting.resenha_direct_calls_allowed_groups = ""
      sign_in(caller)

      post "/resenha/calls.json", params: { username: callee.username }

      expect(response.status).to eq(403)
      expect(Resenha::Room.ephemeral.count).to eq(0)
    end

    it "returns 403 when the caller lacks voice-room access" do
      SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:trust_level_2]
      outsider = Fabricate(:user, trust_level: TrustLevel[0])
      sign_in(outsider)

      post "/resenha/calls.json", params: { username: callee.username }

      expect(response.status).to eq(403)
      expect(Resenha::Room.ephemeral.count).to eq(0)
    end

    it "requires a logged-in user" do
      post "/resenha/calls.json", params: { username: callee.username }

      expect(response.status).to eq(403)
    end
  end
end
