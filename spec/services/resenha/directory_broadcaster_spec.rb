# frozen_string_literal: true

RSpec.describe Resenha::DirectoryBroadcaster do
  before { SiteSetting.resenha_enabled = true }

  it "publishes public room events without targets when allowed groups include everyone" do
    SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:everyone].to_s
    room = Fabricate(:resenha_room, public: true)

    messages =
      MessageBus.track_publish(Resenha.room_index_channel) do
        described_class.broadcast(action: :updated, room: room)
      end

    expect(messages.size).to eq(1)
    expect(messages.first.user_ids).to be_nil
    expect(messages.first.group_ids).to be_nil
  end

  it "targets members for private room events" do
    room = Fabricate(:resenha_room, public: false)

    messages =
      MessageBus.track_publish(Resenha.room_index_channel) do
        described_class.broadcast(action: :updated, room: room)
      end

    expect(messages.first.user_ids).to contain_exactly(room.creator_id)
  end
end
