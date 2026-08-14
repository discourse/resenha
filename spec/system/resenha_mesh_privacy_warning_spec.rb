# frozen_string_literal: true

require_relative "../support/resenha_fake_media"

describe "Resenha mesh privacy warning", type: :system do
  fab!(:user)
  fab!(:room) { Fabricate(:resenha_room, public: true) }

  before do
    user.activate
    SiteSetting.resenha_enabled = true
    SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:everyone]
    sign_in(user)
    install_resenha_fake_media
  end

  def click_join
    click_button(I18n.t("js.resenha.room.join"))
  end

  it "gates a mesh join behind the warning" do
    visit("/resenha/r/#{room.slug}")

    click_join
    expect(page).to have_css(".resenha-mesh-privacy-warning-modal")
    click_button(I18n.t("js.resenha.mesh_privacy_warning.cancel"))
    expect(page).to have_no_css(".resenha-mesh-privacy-warning-modal")
    expect(page).to have_no_css(".resenha-room-page__leave")

    click_join
    click_button(I18n.t("js.resenha.mesh_privacy_warning.join"))
    expect(page).to have_css(".resenha-room-page__leave")
  end

  it "doesn't warn again on a device that opted out" do
    visit("/resenha/r/#{room.slug}")

    click_join
    find(".resenha-mesh-privacy-warning-modal__dont-show-again input").click
    click_button(I18n.t("js.resenha.mesh_privacy_warning.join"))
    expect(page).to have_css(".resenha-room-page__leave")
    click_button(I18n.t("js.resenha.room.leave"))

    click_join
    expect(page).to have_css(".resenha-room-page__leave")
    expect(page).to have_no_css(".resenha-mesh-privacy-warning-modal")
  end

  it "doesn't warn when disabled site-wide" do
    SiteSetting.resenha_mesh_privacy_warning_enabled = false

    visit("/resenha/r/#{room.slug}")

    click_join
    expect(page).to have_css(".resenha-room-page__leave")
    expect(page).to have_no_css(".resenha-mesh-privacy-warning-modal")
  end
end
