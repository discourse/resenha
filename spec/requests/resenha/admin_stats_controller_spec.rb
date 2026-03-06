# frozen_string_literal: true

RSpec.describe Resenha::AdminStatsController do
  fab!(:admin)
  fab!(:user)
  fab!(:room) { Fabricate(:resenha_room, creator: admin, name: "Watercooler") }
  fab!(:room_2, :resenha_room) { Fabricate(:resenha_room, creator: admin, name: "Lounge") }

  before { SiteSetting.resenha_enabled = true }

  describe "#overview" do
    it "rejects non-admin users" do
      sign_in(user)
      get "/admin/plugins/resenha/stats/overview.json"
      expect(response.status).to eq(404)
    end

    it "returns zeroes when there are no sessions" do
      sign_in(admin)
      get "/admin/plugins/resenha/stats/overview.json", params: { period: "weekly" }

      expect(response.status).to eq(200)
      body = response.parsed_body
      expect(body["total_sessions"]).to eq(0)
      expect(body["unique_users"]).to eq(0)
      expect(body["avg_duration"]).to eq(0)
    end

    it "returns aggregated stats for sessions in the period" do
      Fabricate(
        :resenha_session,
        user: admin,
        room: room,
        joined_at: 2.hours.ago,
        left_at: 1.hour.ago,
      )
      Fabricate(
        :resenha_session,
        user: user,
        room: room,
        joined_at: 3.hours.ago,
        left_at: 1.hour.ago,
      )

      sign_in(admin)
      get "/admin/plugins/resenha/stats/overview.json", params: { period: "weekly" }

      expect(response.status).to eq(200)
      body = response.parsed_body
      expect(body["total_sessions"]).to eq(2)
      expect(body["unique_users"]).to eq(2)
      expect(body["avg_duration"]).to be > 0
    end

    it "excludes sessions outside the period" do
      Fabricate(
        :resenha_session,
        user: admin,
        room: room,
        joined_at: 10.days.ago,
        left_at: 10.days.ago + 1.hour,
      )

      sign_in(admin)
      get "/admin/plugins/resenha/stats/overview.json", params: { period: "weekly" }

      expect(response.parsed_body["total_sessions"]).to eq(0)
    end

    it "defaults to 7 days for invalid period" do
      Fabricate(
        :resenha_session,
        user: admin,
        room: room,
        joined_at: 2.days.ago,
        left_at: 2.days.ago + 30.minutes,
      )

      sign_in(admin)
      get "/admin/plugins/resenha/stats/overview.json", params: { period: "bogus" }

      expect(response.status).to eq(200)
      expect(response.parsed_body["total_sessions"]).to eq(1)
    end

    it "supports custom date ranges" do
      Fabricate(
        :resenha_session,
        user: admin,
        room: room,
        joined_at: 20.days.ago,
        left_at: 20.days.ago + 1.hour,
      )
      Fabricate(
        :resenha_session,
        user: user,
        room: room,
        joined_at: 2.days.ago,
        left_at: 2.days.ago + 30.minutes,
      )

      sign_in(admin)
      get "/admin/plugins/resenha/stats/overview.json",
          params: {
            period: "custom",
            start_date: 25.days.ago.to_date.to_s,
            end_date: 15.days.ago.to_date.to_s,
          }

      expect(response.status).to eq(200)
      expect(response.parsed_body["total_sessions"]).to eq(1)
      expect(response.parsed_body["unique_users"]).to eq(1)
    end
  end

  describe "#rooms" do
    it "rejects non-admin users" do
      sign_in(user)
      get "/admin/plugins/resenha/stats/rooms.json"
      expect(response.status).to eq(404)
    end

    it "returns rooms ranked by total time" do
      Fabricate(
        :resenha_session,
        user: admin,
        room: room,
        joined_at: 3.hours.ago,
        left_at: 1.hour.ago,
      )
      Fabricate(
        :resenha_session,
        user: user,
        room: room_2,
        joined_at: 2.hours.ago,
        left_at: 1.5.hours.ago,
      )

      sign_in(admin)
      get "/admin/plugins/resenha/stats/rooms.json", params: { period: "weekly" }

      expect(response.status).to eq(200)
      rooms = response.parsed_body["rooms"]
      expect(rooms.length).to eq(2)
      expect(rooms.first["room_name"]).to eq("Watercooler")
      expect(rooms.first["unique_users"]).to eq(1)
      expect(rooms.first["total_seconds"]).to be > 0
    end
  end

  describe "#users" do
    it "rejects non-admin users" do
      sign_in(user)
      get "/admin/plugins/resenha/stats/users.json"
      expect(response.status).to eq(404)
    end

    it "returns users ranked by total time" do
      Fabricate(
        :resenha_session,
        user: admin,
        room: room,
        joined_at: 4.hours.ago,
        left_at: 1.hour.ago,
      )
      Fabricate(
        :resenha_session,
        user: user,
        room: room,
        joined_at: 2.hours.ago,
        left_at: 1.5.hours.ago,
      )

      sign_in(admin)
      get "/admin/plugins/resenha/stats/users.json", params: { period: "weekly" }

      expect(response.status).to eq(200)
      users = response.parsed_body["users"]
      expect(users.length).to eq(2)
      expect(users.first["username"]).to eq(admin.username)
      expect(users.first["session_count"]).to eq(1)
      expect(users.first["total_seconds"]).to be > 0
      expect(users.first["avatar_template"]).to be_present
    end
  end
end
