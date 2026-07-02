# frozen_string_literal: true

RSpec.describe Resenha::RoomBroadcaster do
  fab!(:participant, :user)
  fab!(:room) { Fabricate(:resenha_room, public: true) }

  before { SiteSetting.resenha_enabled = true }

  describe ".publish_participants" do
    it "publishes without targets when allowed groups include everyone" do
      SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:everyone].to_s
      Resenha::ParticipantTracker.add(room.id, participant.id)

      messages =
        MessageBus.track_publish(Resenha.room_channel(room.id)) do
          described_class.publish_participants(room)
        end

      expect(messages.size).to eq(1)
      expect(messages.first.user_ids).to be_nil
      expect(messages.first.group_ids).to be_nil
    end

    it "publishes without targets when allowed groups include logged_in_users" do
      SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:logged_in_users].to_s
      Resenha::ParticipantTracker.add(room.id, participant.id)

      messages =
        MessageBus.track_publish(Resenha.room_channel(room.id)) do
          described_class.publish_participants(room)
        end

      expect(messages.first.user_ids).to be_nil
      expect(messages.first.group_ids).to be_nil
    end

    it "targets allowed groups plus current participants when access is restricted" do
      group = Fabricate(:group)
      SiteSetting.resenha_allowed_groups = group.id.to_s
      Resenha::ParticipantTracker.add(room.id, participant.id)

      messages =
        MessageBus.track_publish(Resenha.room_channel(room.id)) do
          described_class.publish_participants(room)
        end

      expect(messages.first.group_ids).to contain_exactly(group.id)
      expect(messages.first.user_ids).to contain_exactly(participant.id)
    end

    it "targets members plus current participants for private rooms" do
      private_room = Fabricate(:resenha_room, public: false)
      Resenha::ParticipantTracker.add(private_room.id, participant.id)

      messages =
        MessageBus.track_publish(Resenha.room_channel(private_room.id)) do
          described_class.publish_participants(private_room)
        end

      expect(messages.first.user_ids).to contain_exactly(private_room.creator_id, participant.id)
    end
  end
end
