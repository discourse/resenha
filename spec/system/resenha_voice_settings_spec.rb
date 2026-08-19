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

  it "offers the audio processing controls" do
    join_room
    open_voice_settings

    within(".resenha-voice-settings") do
      expect(page).to have_css(".resenha-voice-settings__noise-suppression-select")
      expect(page).to have_content(I18n.t("js.resenha.voice_settings.echo_cancellation"))
      expect(page).to have_content(I18n.t("js.resenha.voice_settings.auto_gain_control"))
    end
  end

  it "toggles echo cancellation and automatic gain control" do
    join_room
    open_voice_settings

    ec_toggle =
      PageObjects::Components::DToggleSwitch.new(
        ".resenha-voice-settings__echo-cancellation-toggle",
      )
    agc_toggle =
      PageObjects::Components::DToggleSwitch.new(".resenha-voice-settings__auto-gain-toggle")

    expect(ec_toggle.checked?).to eq(true)
    expect(agc_toggle.checked?).to eq(true)

    ec_toggle.toggle
    expect(ec_toggle.unchecked?).to eq(true)
    expect(agc_toggle.checked?).to eq(true)
  end

  # These run the real DTLN pipeline (wasm fetch, worklet ready handshake),
  # so the "AI" assertions only pass once the filter is genuinely running.
  it "enables AI noise cancellation from the voice settings modal and shows the mic badge" do
    join_room
    open_voice_settings

    mode_select =
      PageObjects::Components::SelectKit.new(".resenha-voice-settings__noise-suppression-select")
    mode_select.expand
    mode_select.select_row_by_value("ai")

    expect(page).to have_css(".resenha-call-controls__ns-badge", wait: 15)
  end

  it "enables AI noise cancellation from the mic dropdown submenu" do
    join_room

    find("button[data-identifier='resenha-audio-menu']").click
    within(".fk-d-menu[data-identifier='resenha-audio-menu']") do
      click_button(I18n.t("js.resenha.voice_settings.noise_suppression"))
    end
    within(".fk-d-menu[data-identifier='resenha-call-submenu']") do
      click_button(I18n.t("js.resenha.voice_settings.noise_suppression_modes.ai"))
    end

    expect(page).to have_css(".resenha-call-controls__ns-badge", wait: 15)
  end
end
