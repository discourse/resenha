# frozen_string_literal: true

require_relative "../support/resenha_fake_media"

describe "Resenha room chat panel", type: :system do
  fab!(:user)
  fab!(:admin)
  fab!(:channel, :chat_channel) { Fabricate(:chat_channel, threading_enabled: true) }
  fab!(:room) do
    Fabricate(
      :resenha_room,
      name: "Team Room",
      creator: admin,
      public: true,
      chat_channel_id: channel.id,
      chat_idle_minutes: 15,
    )
  end

  before do
    SiteSetting.resenha_enabled = true
    SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:everyone]
    chat_system_bootstrap(user, [channel])
    sign_in(user)
    install_resenha_fake_media
  end

  it "renders an existing session thread through chat's own thread UI and posts through it" do
    Resenha::ChatSession.post_message!(room, admin, "hi from admin")

    visit("/resenha/r/#{room.slug}?chat=true")
    click_button(I18n.t("js.resenha.room.join"))

    # The real chat thread component, not a re-implementation.
    expect(page).to have_css(".resenha-chat .chat-thread")
    expect(page).to have_css(".resenha-chat .chat-message-text", text: "hi from admin")

    # The native composer posts through chat's own API.
    find(".resenha-chat .chat-composer__input").fill_in(with: "hello from the room")
    find(".resenha-chat .chat-composer__input").send_keys(:enter)

    expect(page).to have_css(".resenha-chat .chat-message-text", text: "hello from the room")
    expect(Chat::Message.where(chat_channel_id: channel.id).order(:created_at).last.message).to eq(
      "hello from the room",
    )
  end

  it "opens the session thread from the first message sent through the starter composer" do
    visit("/resenha/r/#{room.slug}?chat=true")
    click_button(I18n.t("js.resenha.room.join"))

    # No thread yet: the panel offers the starter composer, not the thread UI.
    expect(page).to have_css(".resenha-chat__input")
    expect(page).to have_no_css(".resenha-chat .chat-thread")

    find(".resenha-chat__input").fill_in(with: "kicking things off")
    find(".resenha-chat__input").send_keys(:enter)

    # The first message creates the thread and the panel swaps to the native UI.
    expect(page).to have_css(".resenha-chat .chat-thread")
    expect(page).to have_css(".resenha-chat .chat-message-text", text: "kicking things off")

    thread = Chat::Thread.find_by(channel_id: channel.id)
    expect(thread.original_message.message).to eq("kicking things off")
    expect(thread.original_message.user_id).to eq(user.id)
  end
end
