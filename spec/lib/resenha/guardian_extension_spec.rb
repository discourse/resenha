# frozen_string_literal: true

require "rails_helper"
require_relative "../../../db/migrate/20241107000000_create_resenha_rooms"
require_relative "../../../db/migrate/20260612135211_add_video_enabled_to_resenha_rooms"

RSpec.describe Resenha::GuardianExtension do
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
  fab!(:public_room) { Fabricate(:resenha_room, creator: staff, public: true) }

  let(:anonymous_guardian) { Guardian.new(nil) }

  before do
    SiteSetting.resenha_enabled = true
    SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:everyone]
  end

  describe "#resenha_public_access?" do
    it "is true when access is open to everyone on a public site" do
      expect(anonymous_guardian.resenha_public_access?).to eq(true)
    end

    it "is false on login-required sites even when access is open to everyone" do
      SiteSetting.login_required = true

      expect(anonymous_guardian.resenha_public_access?).to eq(false)
    end
  end

  describe "#can_see_resenha_room?" do
    it "lets anonymous visitors see public rooms when access is open to everyone" do
      expect(anonymous_guardian.can_see_resenha_room?(public_room)).to eq(true)
    end

    it "hides public rooms from anonymous visitors on login-required sites" do
      SiteSetting.login_required = true

      expect(anonymous_guardian.can_see_resenha_room?(public_room)).to eq(false)
    end
  end
end
