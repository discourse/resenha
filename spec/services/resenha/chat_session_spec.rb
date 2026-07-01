# frozen_string_literal: true

require "rails_helper"
require_relative "../../../db/migrate/20241107000000_create_resenha_rooms"
require_relative "../../../db/migrate/20260612135211_add_video_enabled_to_resenha_rooms"
require_relative "../../../db/migrate/20260630183841_add_chat_settings_to_resenha_rooms"

RSpec.describe Resenha::ChatSession do
  before do
    ActiveRecord::Migration.suppress_messages do
      unless ActiveRecord::Base.connection.table_exists?(:resenha_rooms)
        CreateResenhaRooms.new.change
      end
      unless ActiveRecord::Base.connection.column_exists?(:resenha_rooms, :video_enabled)
        AddVideoEnabledToResenhaRooms.new.change
      end
      unless ActiveRecord::Base.connection.column_exists?(:resenha_rooms, :chat_channel_id)
        AddChatSettingsToResenhaRooms.new.change
      end
    end
    Resenha::Room.reset_column_information
  end

  fab!(:user) { Fabricate(:user, trust_level: TrustLevel[2]) }
  fab!(:other) { Fabricate(:user, trust_level: TrustLevel[2]) }
  fab!(:channel) { Fabricate(:chat_channel, threading_enabled: true) }
  fab!(:room) { Fabricate(:resenha_room, public: true) }

  before do
    SiteSetting.resenha_enabled = true
    SiteSetting.resenha_chat_enabled = true
    SiteSetting.chat_enabled = true
    SiteSetting.chat_allowed_groups = Group::AUTO_GROUPS[:everyone]
    room.update!(chat_channel_id: channel.id, chat_idle_minutes: 15)
    described_class.clear(room.id)
  end

  after { described_class.clear(room.id) }

  describe ".available_for?" do
    it "is false without a linked channel" do
      room.update!(chat_channel_id: nil)
      expect(described_class.available_for?(room, user.guardian)).to eq(false)
    end

    it "is false when chat is disabled" do
      SiteSetting.chat_enabled = false
      expect(described_class.available_for?(room, user.guardian)).to eq(false)
    end

    it "is true with a linked channel and a chat-allowed user" do
      expect(described_class.available_for?(room, user.guardian)).to eq(true)
    end
  end

  describe ".post_message! without a thread template (plain room)" do
    it "posts the first message to the channel without opening a thread" do
      message = described_class.post_message!(room, user, "hello")

      expect(message.thread_id).to be_nil
      expect(message.message).to eq("hello")
      expect(described_class.active_thread_id(room)).to be_nil

      state = described_class.state(room)
      expect(state[:thread_id]).to be_nil
      expect(state[:root_message_id]).to eq(message.id)
      expect(state[:root_message][:cooked]).to include("hello")
    end

    it "opens a thread from the first message once a second arrives" do
      first = described_class.post_message!(room, user, "first")
      second = described_class.post_message!(room, other, "second")

      expect(second.thread_id).to be_present
      thread = second.thread
      expect(thread.original_message_id).to eq(first.id)
      expect(first.reload.thread_id).to eq(thread.id)
      expect(described_class.active_thread_id(room)).to eq(thread.id)
      expect(described_class.state(room)[:root_message_id]).to be_nil
    end

    it "reuses the thread for later messages" do
      described_class.post_message!(room, user, "first")
      second = described_class.post_message!(room, other, "second")
      third = described_class.post_message!(room, user, "third")
      expect(third.thread_id).to eq(second.thread_id)
    end

    it "starts a fresh session after going idle and empty" do
      described_class.post_message!(room, user, "first")
      first_thread = described_class.post_message!(room, other, "second").thread_id

      # No messages and no heartbeats for longer than the room's timeout: the
      # session has gone idle and empty.
      freeze_time(31.minutes.from_now) do
        # The next message is a brand-new lone root again (no thread yet)...
        rolled = described_class.post_message!(room, user, "later")
        expect(rolled.thread_id).to be_nil
        expect(described_class.active_thread_id(room)).to be_nil

        # ...and only the following one opens a new, distinct thread.
        follow_up = described_class.post_message!(room, other, "reply")
        expect(follow_up.thread_id).to be_present
        expect(follow_up.thread_id).not_to eq(first_thread)
      end
    end

    it "keeps the session alive while participants are present (heartbeat)" do
      described_class.post_message!(room, user, "first")
      first_thread = described_class.post_message!(room, other, "second").thread_id

      # A heartbeat within the timeout keeps the session warm...
      freeze_time(10.minutes.from_now) { described_class.touch!(room) }

      # ...so a message a bit later still lands in the same thread.
      freeze_time(20.minutes.from_now) do
        reply = described_class.post_message!(room, user, "still here")
        expect(reply.thread_id).to eq(first_thread)
      end
    end

    it "does not let a late heartbeat revive an already-idle session" do
      described_class.post_message!(room, user, "first")
      first_thread = described_class.post_message!(room, other, "second").thread_id

      # The session has already gone idle and empty; a heartbeat from a returning
      # joiner must not resurrect it.
      freeze_time(31.minutes.from_now) do
        described_class.touch!(room)
        rolled = described_class.post_message!(room, user, "later")
        expect(rolled.thread_id).to be_nil

        follow_up = described_class.post_message!(room, other, "reply")
        expect(follow_up.thread_id).not_to eq(first_thread)
      end
    end

    it "refreshes the session key TTL on heartbeat so a long quiet session isn't dropped" do
      described_class.post_message!(room, user, "first")
      described_class.post_message!(room, other, "second")
      thread_key = "resenha:room:#{room.id}:chat_thread"

      Discourse.redis.expire(thread_key, 60)
      described_class.touch!(room)

      expect(Discourse.redis.ttl(thread_key)).to be > 60
    end

    it "is a no-op for .start!" do
      described_class.start!(room, user)
      expect(described_class.active_thread_id(room)).to be_nil
      expect(described_class.state(room)[:root_message_id]).to be_nil
    end

    it "broadcasts nothing when .start! is a plain-room no-op" do
      published = []
      allow(MessageBus).to receive(:publish) { |ch, data, opts| published << [ch, data, opts] }

      described_class.start!(room, user)

      expect(published.select { |ch, _, _| ch == Resenha.room_chat_channel(room.id) }).to be_empty
    end

    it "treats a deleted pending root as a fresh first message" do
      first = described_class.post_message!(room, user, "first")
      ::Chat::Message.find(first.id).trash!(Discourse.system_user)

      second = described_class.post_message!(room, other, "second")

      expect(second.thread_id).to be_nil
      expect(described_class.state(room)[:root_message_id]).to eq(second.id)
    end

    it "abandons a thread whose original message was deleted" do
      described_class.post_message!(room, user, "first")
      thread = described_class.post_message!(room, other, "second").thread
      thread.original_message.trash!(Discourse.system_user)

      expect(described_class.active_thread_id(room)).to be_nil

      fresh = described_class.post_message!(room, user, "again")
      expect(fresh.thread_id).to be_nil
      expect(described_class.state(room)[:root_message_id]).to eq(fresh.id)
    end

    it "auto-follows the poster to the channel" do
      described_class.post_message!(room, user, "hi")
      expect(channel.membership_for(user)).to be_present
    end

    it "surfaces the chat plugin's own error when a message is rejected" do
      described_class.post_message!(room, user, "dup")

      # The chat plugin blocks an identical message posted seconds apart; that
      # reason must reach the caller, not be masked as a generic access error.
      expect { described_class.post_message!(room, user, "dup") }.to raise_error(
        Resenha::ChatSession::Error,
        /identical message/i,
      )
    end

    it "keeps a usable thread when the promoting reply is rejected" do
      root = described_class.post_message!(room, user, "dup")

      # The second (identical) message is rejected, but the thread promotion it
      # triggered must leave a real, reusable thread rather than an orphan whose
      # root the next message would promote all over again.
      expect { described_class.post_message!(room, user, "dup") }.to raise_error(
        Resenha::ChatSession::Error,
      )

      thread_id = described_class.active_thread_id(room)
      expect(thread_id).to be_present
      expect(::Chat::Thread.find(thread_id).original_message_id).to eq(root.id)

      later = described_class.post_message!(room, other, "carry on")
      expect(later.thread_id).to eq(thread_id)
    end
  end

  describe "MessageBus broadcast" do
    # publish_state's audience is the room's (anyone who can see the voice
    # room), which can be broader than who's authorized for the linked chat
    # channel — so the payload itself must never carry message content or
    # thread/channel identifiers. Clients re-fetch through the guarded
    # chat_session endpoint instead, which re-checks channel access per user.
    it "never publishes message content or thread/channel identifiers" do
      published = []
      allow(MessageBus).to receive(:publish) do |channel, data, opts|
        published << [channel, data, opts]
      end

      described_class.post_message!(room, user, "sensitive content")

      chat_events =
        published.select { |channel, _, _| channel == Resenha.room_chat_channel(room.id) }
      expect(chat_events).to be_present
      chat_events.each { |_, data, _| expect(data).to eq({ type: "updated" }) }
    end
  end

  describe ".post_message! with a thread template (team room)" do
    before { room.update!(chat_thread_title_template: "Team Meeting at {time}") }

    it "opens a thread with a system starter + title and posts the message as a reply" do
      message = described_class.post_message!(room, user, "hello everyone")
      thread = message.thread

      expect(thread).to be_present
      expect(thread.channel_id).to eq(channel.id)
      expect(thread.title).to start_with("Team Meeting at ")
      expect(thread.original_message.message).to start_with("Team Meeting at ")
      expect(thread.original_message.user_id).to eq(Discourse.system_user.id)
      expect(message.message).to eq("hello everyone")
      expect(message.user_id).to eq(user.id)
      expect(described_class.active_thread_id(room)).to eq(thread.id)
    end

    it "reuses the active thread for subsequent messages" do
      first = described_class.post_message!(room, user, "one")
      second = described_class.post_message!(room, user, "two")
      expect(second.thread_id).to eq(first.thread_id)
    end

    it "opens a new thread once the session has gone idle" do
      first = described_class.post_message!(room, user, "one")

      freeze_time(31.minutes.from_now) do
        second = described_class.post_message!(room, other, "two")
        expect(second.thread_id).not_to eq(first.thread_id)
      end
    end

    it "starts an empty session via .start! with just the system starter" do
      described_class.start!(room, user)

      thread_id = described_class.active_thread_id(room)
      expect(thread_id).to be_present
      thread = ::Chat::Thread.find(thread_id)
      expect(thread.original_message.user_id).to eq(Discourse.system_user.id)
      expect(thread.original_message.message).to start_with("Team Meeting at ")
    end

    it "does not rebroadcast when .start! finds an already-live thread" do
      described_class.post_message!(room, user, "hi")

      published = []
      allow(MessageBus).to receive(:publish) { |ch, data, opts| published << [ch, data, opts] }

      described_class.start!(room, user)

      expect(published.select { |ch, _, _| ch == Resenha.room_chat_channel(room.id) }).to be_empty
    end

    it "raises a clear error without orphaning a starter when threading is off" do
      channel.update!(threading_enabled: false)

      expect { described_class.post_message!(room, user, "hello") }.to raise_error(
        Resenha::ChatSession::Error,
        /threading/i,
      )

      # The starter must not be left behind as a loose channel message.
      expect(channel.chat_messages.count).to eq(0)
      expect(described_class.active_thread_id(room)).to be_nil
    end
  end
end
