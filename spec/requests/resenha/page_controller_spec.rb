# frozen_string_literal: true

require "rails_helper"
require_relative "../../../db/migrate/20241107000000_create_resenha_rooms"
require_relative "../../../db/migrate/20260612135211_add_video_enabled_to_resenha_rooms"

RSpec.describe Resenha::PageController do
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
  fab!(:user)
  fab!(:room) { Fabricate(:resenha_room, creator: staff, public: true) }

  before do
    SiteSetting.resenha_enabled = true
    SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:everyone]
  end

  describe "#show" do
    it "renders the app shell for a visible room" do
      sign_in(user)

      get "/resenha/r/#{room.slug}"

      expect(response.status).to eq(200)
      expect(response.body).to include("discourse")
    end

    it "returns 404 for an unknown slug" do
      sign_in(user)

      get "/resenha/r/not-a-room"

      expect(response.status).to eq(404)
    end

    it "rejects users who cannot see the room" do
      private_room = Fabricate(:resenha_room, creator: staff, public: false)
      sign_in(user)

      get "/resenha/r/#{private_room.slug}"

      expect(response.status).to eq(403)
    end

    it "renders for anonymous visitors when access is open to everyone" do
      get "/resenha/r/#{room.slug}"

      expect(response.status).to eq(200)
    end

    it "rejects anonymous visitors when access is restricted to a group" do
      SiteSetting.resenha_allowed_groups = "#{Group::AUTO_GROUPS[:trust_level_2]}"

      get "/resenha/r/#{room.slug}"

      expect(response.status).to eq(403)
    end
  end
end
