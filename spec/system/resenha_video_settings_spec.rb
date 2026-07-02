# frozen_string_literal: true

require_relative "../support/resenha_fake_media"

describe "Resenha video settings", type: :system do
  fab!(:user)
  fab!(:admin)
  fab!(:room) { Fabricate(:resenha_room, name: "Video Room", creator: admin, public: true) }

  let(:camera_select) do
    PageObjects::Components::SelectKit.new(".resenha-video-settings__camera-select")
  end

  before do
    user.activate
    SiteSetting.resenha_enabled = true
    SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:everyone]
    SiteSetting.resenha_video_enabled = true
    sign_in(user)
    install_resenha_fake_media
  end

  def join_room
    visit("/resenha/r/#{room.slug}")
    click_button(I18n.t("js.resenha.room.join"))
    expect(page).to have_css(".resenha-room-page__leave")
  end

  def open_call_settings_menu
    find("button[data-identifier='resenha-call-settings']").click
    expect(page).to have_css(".fk-d-menu[data-identifier='resenha-call-settings']")
  end

  def open_video_settings
    open_call_settings_menu
    within(".fk-d-menu[data-identifier='resenha-call-settings']") do
      click_button(I18n.t("js.resenha.video_settings.title"))
    end
    expect(page).to have_css(".resenha-video-settings-modal")
  end

  it "offers voice and video settings from the call settings menu" do
    join_room
    open_call_settings_menu

    within(".fk-d-menu[data-identifier='resenha-call-settings']") do
      expect(page).to have_button(I18n.t("js.resenha.voice_settings.title"))
      expect(page).to have_button(I18n.t("js.resenha.video_settings.title"))
    end
  end

  it "shows a camera preview and lists camera devices" do
    join_room
    open_video_settings

    expect(page).to have_css(".resenha-video-settings__preview video")
    expect(
      resenha_media_track_live?(".resenha-video-settings__preview video"),
    ).to eq(true)

    camera_select.expand
    expect(camera_select).to have_option_name("Resenha fake camera A")
    expect(camera_select).to have_option_name("Resenha fake camera B")
  end

  it "keeps the published camera live after switching devices" do
    join_room
    click_button(I18n.t("js.resenha.video.camera_on"))

    video_selector =
      ".resenha-video-tile.--video[data-user-id='#{user.id}'] video.resenha-video-tile__video"
    expect(page).to have_css(video_selector)

    open_video_settings
    camera_select.expand
    camera_select.select_row_by_name("Resenha fake camera B")

    expect(camera_select).to have_selected_name("Resenha fake camera B")
    expect(resenha_media_track_live?(video_selector)).to eq(true)
  end

  it "shows the background blur toggle when the setting is enabled" do
    join_room
    open_video_settings

    within(".resenha-video-settings") do
      expect(page).to have_css(".d-toggle-switch")
    end
  end

  it "hides background blur when the site setting is disabled" do
    SiteSetting.resenha_video_background_blur_enabled = false

    join_room
    open_video_settings

    within(".resenha-video-settings") do
      expect(page).to have_css(".resenha-video-settings__camera-select")
      expect(page).to have_no_css(".d-toggle-switch")
    end
  end
end
