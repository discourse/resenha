# frozen_string_literal: true

RSpec.describe Jobs::PublishRoomParticipants do
  fab!(:room, :resenha_room)
  fab!(:user1, :user)
  fab!(:user2, :user)

  before { SiteSetting.resenha_enabled = true }

  it "publishes participants for rooms with active participants" do
    Resenha::ParticipantTracker.add(room.id, user1.id)
    Resenha::ParticipantTracker.add(room.id, user2.id)

    # Verify participants were added
    expect(Resenha::ParticipantTracker.user_ids(room.id)).to contain_exactly(user1.id, user2.id)

    messages = MessageBus.track_publish { subject.execute({}) }

    room_messages = messages.select { |m| m.channel == Resenha.room_channel(room.id) }
    expect(room_messages.size).to eq(1)
    expect(room_messages.first.data[:type]).to eq("participants")
    expect(room_messages.first.data[:participants].map { |p| p[:id] }).to contain_exactly(
      user1.id,
      user2.id,
    )
  end

  it "reflects TTL-expired participants in broadcast" do
    Resenha::ParticipantTracker.add(room.id, user1.id)
    Resenha::ParticipantTracker.add(room.id, user2.id)

    # Set user2's heartbeat to a stale timestamp to simulate TTL expiration
    Discourse.redis.zadd(
      "#{Resenha::ParticipantTracker::KEY_NAMESPACE}:#{room.id}:participants",
      1.hour.ago.to_f,
      user2.id,
    )

    messages = MessageBus.track_publish { subject.execute({}) }

    room_messages = messages.select { |m| m.channel == Resenha.room_channel(room.id) }
    expect(room_messages.size).to eq(1)
    expect(room_messages.first.data[:participants].map { |p| p[:id] }).to contain_exactly(user1.id)
  end

  it "does not publish for rooms without recent membership activity" do
    messages = MessageBus.track_publish { subject.execute({}) }

    expect(messages).to be_empty
  end

  it "publishes an empty list for rooms that recently emptied" do
    Resenha::ParticipantTracker.add(room.id, user1.id)
    Resenha::ParticipantTracker.remove(room.id, user1.id)

    messages = MessageBus.track_publish { subject.execute({}) }

    room_messages = messages.select { |m| m.channel == Resenha.room_channel(room.id) }
    expect(room_messages.size).to eq(1)
    expect(room_messages.first.data[:participants]).to be_empty
  end

  it "stops publishing once a room's last activity leaves the safety window" do
    Resenha::ParticipantTracker.add(room.id, user1.id)
    Resenha::ParticipantTracker.remove(room.id, user1.id)
    Discourse.redis.zadd(
      Resenha::ParticipantTracker::RECENTLY_ACTIVE_ROOMS_KEY,
      1.hour.ago.to_f,
      room.id,
    )

    messages = MessageBus.track_publish { subject.execute({}) }

    expect(messages).to be_empty
  end

  it "handles rooms that no longer exist" do
    Resenha::ParticipantTracker.add(99_999, user1.id)

    expect { subject.execute({}) }.not_to raise_error
  end

  it "deletes an emptied livekit-pinned room from the SFU exactly once" do
    SiteSetting.resenha_livekit_url = "wss://livekit.example.com"
    SiteSetting.resenha_livekit_api_key = "lk_api_key"
    SiteSetting.resenha_livekit_api_secret = "lk_api_secret"
    Resenha::ParticipantTracker.pin_transport!(room.id, "livekit")
    Resenha::ParticipantTracker.add(room.id, user1.id)
    Resenha::ParticipantTracker.remove(room.id, user1.id)
    stub = stub_request(:post, "https://livekit.example.com/twirp/livekit.RoomService/DeleteRoom")

    subject.execute({})

    expect(stub).to have_been_requested.once
    expect(Resenha::ParticipantTracker.pinned_transport(room.id)).to be_nil

    # The room stays in the recently-active sweep for a while; with the pin
    # gone, later sweeps must not keep re-deleting it.
    subject.execute({})

    expect(stub).to have_been_requested.once
  end

  it "does not publish when plugin is disabled" do
    Resenha::ParticipantTracker.add(room.id, user1.id)

    SiteSetting.resenha_enabled = false

    messages = MessageBus.track_publish { subject.execute({}) }

    expect(messages).to be_empty
  end
end
