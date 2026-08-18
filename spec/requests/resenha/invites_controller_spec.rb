# frozen_string_literal: true
require "rails_helper"
require_relative "../../../db/migrate/20241107000000_create_resenha_rooms"
require_relative "../../../db/migrate/20260305165400_create_resenha_sessions"
require_relative "../../../db/migrate/20260813160047_create_resenha_invites"

RSpec.describe Resenha::InvitesController do
  before do
    ActiveRecord::Migration.suppress_messages do
      unless ActiveRecord::Base.connection.table_exists?(:resenha_rooms)
        CreateResenhaRooms.new.change
      end
      unless ActiveRecord::Base.connection.table_exists?(:resenha_sessions)
        CreateResenhaSessions.new.change
      end
      unless ActiveRecord::Base.connection.table_exists?(:resenha_invites)
        CreateResenhaInvites.new.change
      end
    end
    Resenha::Room.reset_column_information
  end

  fab!(:user) { Fabricate(:user, trust_level: TrustLevel[2]) }
  fab!(:invitee) { Fabricate(:user, trust_level: TrustLevel[2]) }
  fab!(:room_owner) { Fabricate(:user, trust_level: TrustLevel[2]) }
  fab!(:room) { Fabricate(:resenha_room, creator: room_owner, public: true) }
  fab!(:private_room) { Fabricate(:resenha_room, creator: room_owner, public: false) }

  before do
    SiteSetting.resenha_enabled = true
    SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:everyone]
    SiteSetting.resenha_analytics_enabled = true
  end

  describe "#create" do
    it "records the invite and notifies the invitee, including a live alert with the invite URL" do
      sign_in(user)

      messages =
        MessageBus.track_publish("/notification-alert/#{invitee.id}") do
          post "/resenha/rooms/#{room.id}/invites.json", params: { usernames: [invitee.username] }
        end

      expect(response.status).to eq(200)
      expect(response.parsed_body["invited_usernames"]).to eq([invitee.username])

      invite = Resenha::Invite.find_by(room_id: room.id, user_id: invitee.id)
      expect(invite.invited_by_id).to eq(user.id)
      expect(invite.source).to eq(Resenha::Invite::SOURCES[:notification])
      expect(invite.redeemed_at).to be_nil

      notification = invitee.notifications.order(:id).last
      expect(notification.notification_type).to eq(Notification.types[:resenha_invitation])
      expect(notification.high_priority).to eq(true)
      data = JSON.parse(notification.data)
      expect(data["room_slug"]).to eq(room.slug)
      expect(data["room_name"]).to eq(room.name)
      expect(data["display_username"]).to eq(user.username)

      expect(messages.size).to eq(1)
      expect(messages.first.data[:post_url]).to eq(
        "/resenha/r/#{room.slug}/invited-by/#{user.username_lower}",
      )
    end

    it "does not duplicate the invite or re-notify when the same user is invited again" do
      sign_in(user)

      2.times do
        post "/resenha/rooms/#{room.id}/invites.json", params: { usernames: [invitee.username] }
      end

      expect(Resenha::Invite.where(room_id: room.id, user_id: invitee.id).count).to eq(1)
      expect(
        invitee
          .notifications
          .where(notification_type: Notification.types[:resenha_invitation])
          .count,
      ).to eq(1)
    end

    it "notifies again once an unredeemed invite is more than a day old" do
      invite =
        Resenha::Invite.create!(room_id: room.id, user_id: invitee.id, invited_by_id: user.id)
      invite.update_columns(updated_at: 2.days.ago)
      sign_in(user)

      post "/resenha/rooms/#{room.id}/invites.json", params: { usernames: [invitee.username] }

      expect(
        invitee
          .notifications
          .where(notification_type: Notification.types[:resenha_invitation])
          .count,
      ).to eq(1)
      expect(invite.reload.updated_at).to be_within(1.minute).of(Time.current)
    end

    it "does not notify a redeemed invite again" do
      Resenha::Invite.create!(
        room_id: room.id,
        user_id: invitee.id,
        invited_by_id: user.id,
        redeemed_at: 2.days.ago,
        updated_at: 2.days.ago,
      )
      sign_in(user)

      post "/resenha/rooms/#{room.id}/invites.json", params: { usernames: [invitee.username] }

      expect(invitee.notifications.count).to eq(0)
    end

    it "silently drops the notification when the invitee has muted the inviter" do
      MutedUser.create!(user_id: invitee.id, muted_user_id: user.id)
      sign_in(user)

      post "/resenha/rooms/#{room.id}/invites.json", params: { usernames: [invitee.username] }

      # Reported as invited so mute status can't be probed.
      expect(response.parsed_body["invited_usernames"]).to eq([invitee.username])
      expect(invitee.notifications.count).to eq(0)
    end

    it "silently drops the notification when the invitee does not accept personal messages" do
      invitee.user_option.update!(allow_private_messages: false)
      sign_in(user)

      post "/resenha/rooms/#{room.id}/invites.json", params: { usernames: [invitee.username] }

      expect(response.parsed_body["invited_usernames"]).to eq([invitee.username])
      expect(invitee.notifications.count).to eq(0)
    end

    it "rate limits invite notifications per day" do
      RateLimiter.enable
      SiteSetting.resenha_max_invites_per_day = 1
      other_invitee = Fabricate(:user, trust_level: TrustLevel[2])
      sign_in(user)

      post "/resenha/rooms/#{room.id}/invites.json",
           params: {
             usernames: [invitee.username, other_invitee.username],
           }

      expect(response.status).to eq(429)
      expect(
        Notification.where(notification_type: Notification.types[:resenha_invitation]).count,
      ).to eq(1)
    end

    it "skips the inviter themselves and users outside the allowed groups" do
      SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:trust_level_2]
      outsider = Fabricate(:user, trust_level: TrustLevel[0])
      sign_in(user)

      post "/resenha/rooms/#{room.id}/invites.json",
           params: {
             usernames: [user.username, outsider.username],
           }

      expect(response.status).to eq(200)
      expect(response.parsed_body["invited_usernames"]).to be_empty
      expect(response.parsed_body["skipped_usernames"]).to contain_exactly(
        user.username,
        outsider.username,
      )
      expect(Resenha::Invite.count).to eq(0)
      expect(outsider.notifications.count).to eq(0)
    end

    it "returns 403 when a non-manager invites to a private room" do
      private_room.room_memberships.create!(
        user: user,
        role: Resenha::RoomMembership::ROLE_PARTICIPANT,
      )
      sign_in(user)

      post "/resenha/rooms/#{private_room.id}/invites.json",
           params: {
             usernames: [invitee.username],
           }

      expect(response.status).to eq(403)
      expect(Resenha::Invite.count).to eq(0)
    end

    it "grants a private-room invitee a participant membership" do
      sign_in(room_owner)

      post "/resenha/rooms/#{private_room.id}/invites.json",
           params: {
             usernames: [invitee.username],
           }

      expect(response.status).to eq(200)
      membership = private_room.room_memberships.find_by(user_id: invitee.id)
      expect(membership.role).to eq(Resenha::RoomMembership::ROLE_PARTICIPANT)
    end

    it "requires a logged-in user" do
      post "/resenha/rooms/#{room.id}/invites.json", params: { usernames: [invitee.username] }

      expect(response.status).to eq(403)
    end

    context "when the room is ephemeral" do
      fab!(:call_room) do
        Fabricate(:resenha_room, creator: room_owner, public: false, ephemeral: true)
      end

      it "sends a call-flavored notification and publishes a ring event to the invitee" do
        sign_in(room_owner)

        ring_messages =
          MessageBus.track_publish("/resenha/call-ring/#{invitee.id}") do
            post "/resenha/rooms/#{call_room.id}/invites.json",
                 params: {
                   usernames: [invitee.username],
                 }
          end

        expect(response.status).to eq(200)

        notification = invitee.notifications.order(:id).last
        data = JSON.parse(notification.data)
        expect(data["call"]).to eq(true)

        expect(ring_messages.size).to eq(1)
        expect(ring_messages.first.data[:room_id]).to eq(call_room.id)
        expect(ring_messages.first.data[:caller_username]).to eq(room_owner.username)
      end

      it "rings again once the previous ring has run out, but not while it is still sounding" do
        sign_in(room_owner)

        2.times do
          post "/resenha/rooms/#{call_room.id}/invites.json",
               params: {
                 usernames: [invitee.username],
               }
        end
        expect(invitee.notifications.count).to eq(1)

        Resenha::Invite.find_by(room_id: call_room.id, user_id: invitee.id).update_columns(
          updated_at: 2.minutes.ago,
        )
        post "/resenha/rooms/#{call_room.id}/invites.json",
             params: {
               usernames: [invitee.username],
             }

        expect(invitee.notifications.count).to eq(2)
      end
    end
  end

  describe "#suggestions" do
    fab!(:closest_companion) { Fabricate(:user, trust_level: TrustLevel[2]) }
    fab!(:brief_companion) { Fabricate(:user, trust_level: TrustLevel[2]) }

    let(:base_time) { Time.zone.now.change(usec: 0) }

    before do
      Fabricate(
        :resenha_session,
        user: user,
        room: room,
        joined_at: base_time - 2.hours,
        left_at: base_time - 1.hour,
      )
      Fabricate(
        :resenha_session,
        user: closest_companion,
        room: room,
        joined_at: base_time - 2.hours,
        left_at: base_time - 90.minutes,
      )
      Fabricate(
        :resenha_session,
        user: brief_companion,
        room: room,
        joined_at: base_time - 70.minutes,
        left_at: base_time - 1.hour,
      )
    end

    it "returns companions from this room ordered by time spent together" do
      # Time shared elsewhere must not leak into this room's suggestions.
      other_room = Fabricate(:resenha_room, creator: room_owner, public: true)
      stranger = Fabricate(:user, trust_level: TrustLevel[2])
      Fabricate(
        :resenha_session,
        user: user,
        room: other_room,
        joined_at: 2.hours.ago,
        left_at: 1.hour.ago,
      )
      Fabricate(
        :resenha_session,
        user: stranger,
        room: other_room,
        joined_at: 2.hours.ago,
        left_at: 1.hour.ago,
      )

      sign_in(user)

      get "/resenha/rooms/#{room.id}/invites/suggestions.json"

      expect(response.status).to eq(200)
      suggestions = response.parsed_body["suggestions"]
      expect(suggestions.map { |suggestion| suggestion["username"] }).to eq(
        [closest_companion.username, brief_companion.username],
      )
      expect(suggestions.first["total_seconds"]).to eq(30.minutes.to_i)
    end

    it "caps time from sessions the orphan sweep closed late and skips sub-five-minute brushes" do
      stale_companion = Fabricate(:user, trust_level: TrustLevel[2])
      brush_companion = Fabricate(:user, trust_level: TrustLevel[2])
      # A dev-instance style pair: both "open" for weeks before being closed.
      Fabricate(
        :resenha_session,
        user: user,
        room: room,
        joined_at: base_time - 28.days,
        left_at: base_time - 1.day,
      )
      Fabricate(
        :resenha_session,
        user: stale_companion,
        room: room,
        joined_at: base_time - 28.days,
        left_at: base_time - 1.day,
      )
      Fabricate(
        :resenha_session,
        user: brush_companion,
        room: room,
        joined_at: base_time - 62.minutes,
        left_at: base_time - 1.hour,
      )

      sign_in(user)

      get "/resenha/rooms/#{room.id}/invites/suggestions.json"

      suggestions = response.parsed_body["suggestions"]
      stale = suggestions.find { |suggestion| suggestion["username"] == stale_companion.username }
      expect(stale["total_seconds"]).to eq(12.hours.to_i)
      expect(suggestions.map { |suggestion| suggestion["username"] }).not_to include(
        brush_companion.username,
      )
    end

    it "excludes companions who no longer have access to voice rooms" do
      SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:trust_level_2]
      closest_companion.change_trust_level!(TrustLevel[0])
      sign_in(user)

      get "/resenha/rooms/#{room.id}/invites/suggestions.json"

      expect(response.parsed_body["suggestions"].map { |s| s["username"] }).to eq(
        [brief_companion.username],
      )
    end

    it "excludes companions who are already in the call" do
      Resenha::ParticipantTracker.add(room.id, closest_companion.id)
      sign_in(user)

      get "/resenha/rooms/#{room.id}/invites/suggestions.json"

      expect(response.parsed_body["suggestions"].map { |s| s["username"] }).to eq(
        [brief_companion.username],
      )
    ensure
      Resenha::ParticipantTracker.remove(room.id, closest_companion.id)
    end

    it "returns an empty list when analytics are disabled" do
      SiteSetting.resenha_analytics_enabled = false
      sign_in(user)

      get "/resenha/rooms/#{room.id}/invites/suggestions.json"

      expect(response.status).to eq(200)
      expect(response.parsed_body["suggestions"]).to eq([])
    end
  end
end
