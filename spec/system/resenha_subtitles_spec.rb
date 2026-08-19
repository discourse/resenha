# frozen_string_literal: true

require_relative "../support/resenha_fake_media"

describe "Resenha subtitles", type: :system do
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

  def stub_webgpu
    page.driver.with_playwright_page do |playwright_page|
      playwright_page.add_init_script(script: <<~JS)
        if (!navigator.gpu) {
          Object.defineProperty(navigator, "gpu", { configurable: true, value: {} });
        }
      JS
    end
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

  it "hides the subtitles toggle when the site setting is off" do
    SiteSetting.resenha_subtitles_enabled = false
    stub_webgpu
    join_room
    open_voice_settings

    within(".resenha-voice-settings") do
      expect(page).to have_no_content(I18n.t("js.resenha.voice_settings.subtitles"))
    end
  end

  it "offers the subtitles toggle and enables the caption overlay" do
    SiteSetting.resenha_subtitles_enabled = true
    stub_webgpu
    join_room
    open_voice_settings

    toggle =
      PageObjects::Components::DToggleSwitch.new(
        ".resenha-voice-settings__subtitles-toggle .d-toggle-switch__checkbox",
      )
    toggle.toggle
    expect(toggle.checked?).to eq(true)

    find(".modal-close").click
    expect(page).to have_css(".resenha-captions", visible: :all)
  end
end
