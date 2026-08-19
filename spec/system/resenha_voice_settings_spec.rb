# frozen_string_literal: true

require_relative "../support/resenha_fake_media"

describe "Resenha voice settings", type: :system do
  fab!(:user)
  fab!(:admin)
  fab!(:room) { Fabricate(:resenha_room, name: "Voice Room", creator: admin, public: true) }

  before do
    user.activate
    SiteSetting.resenha_enabled = true
    SiteSetting.resenha_mesh_privacy_warning_enabled = false
    SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:everyone]
    sign_in(user)
    install_resenha_fake_media
  end

  def join_room
    visit("/resenha/r/#{room.slug}")
    click_button(I18n.t("js.resenha.room.join"))
    expect(page).to have_css(".resenha-room-page__leave")
  end

  def open_voice_settings
    find("button[data-identifier='resenha-audio-menu']").click
    within(".fk-d-menu[data-identifier='resenha-audio-menu']") do
      click_button(I18n.t("js.resenha.voice_settings.audio_settings"))
    end
    expect(page).to have_css(".resenha-voice-settings-modal")
  end

  it "offers a noise suppression toggle" do
    join_room
    open_voice_settings

    within(".resenha-voice-settings") do
      expect(page).to have_css(".d-toggle-switch")
      expect(page).to have_content(I18n.t("js.resenha.voice_settings.noise_suppression"))
    end
  end

  # These run the real DTLN pipeline (wasm fetch, worklet ready handshake),
  # so the "on" assertions only pass once the filter is genuinely running.
  it "enables noise suppression from the voice settings modal and shows the mic badge" do
    join_room
    open_voice_settings

    within(".resenha-voice-settings") do
      find(".d-toggle-switch__checkbox").click
      expect(page).to have_css(".d-toggle-switch__checkbox[aria-checked='true']", wait: 15)
    end

    expect(page).to have_css(".resenha-call-controls__ns-badge")
  end

  it "enables noise suppression from the mic dropdown quick toggle" do
    join_room

    find("button[data-identifier='resenha-audio-menu']").click
    within(".fk-d-menu[data-identifier='resenha-audio-menu']") do
      click_button(I18n.t("js.resenha.voice_settings.noise_suppression"))
      expect(page).to have_css(".resenha-call-menu__noise-suppression.--active", wait: 15)
    end

    expect(page).to have_css(".resenha-call-controls__ns-badge")
  end
end
