# frozen_string_literal: true

require_relative "page_objects/components/resenha_sidebar"
require_relative "../support/resenha_fake_media"

describe "Resenha voice rooms", type: :system do
  let(:resenha_sidebar) { PageObjects::Components::ResenhaSidebar.new }

  def click_room_page_widget_mode_button
    within(".resenha-room-page__controls") { all(".btn-icon").last.click }
  end

  def click_call_widget_open_page_button
    within(".resenha-call-widget__controls") { all(".btn-icon").last.click }
  end

  fab!(:user)
  fab!(:other_user) { Fabricate(:user) }
  fab!(:admin)

  before do
    user.activate
    SiteSetting.resenha_enabled = true
    SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:everyone]
    SiteSetting.resenha_create_room_allowed_groups = "#{Group::AUTO_GROUPS[:trust_level_2]}"
  end

  context "when plugin is disabled" do
    it "does not show voice rooms section" do
      SiteSetting.resenha_enabled = false
      Fabricate(:resenha_room, name: "Test Room", creator: admin, public: true)
      sign_in(user)

      visit("/latest")

      expect(resenha_sidebar).to be_not_visible
    end
  end

  context "when plugin is enabled" do
    context "as anonymous user" do
      it "shows public rooms when access is open to everyone" do
        Fabricate(:resenha_room, name: "Test Room", creator: admin, public: true)

        visit("/latest")

        expect(resenha_sidebar).to be_visible
      end

      it "does not show voice rooms section when access is restricted to a group" do
        SiteSetting.resenha_allowed_groups = "#{Group::AUTO_GROUPS[:trust_level_2]}"
        Fabricate(:resenha_room, name: "Test Room", creator: admin, public: true)

        visit("/latest")

        expect(resenha_sidebar).to be_not_visible
      end
    end

    context "as logged in user" do
      fab!(:room) { Fabricate(:resenha_room, name: "Test Room", creator: admin, public: true) }

      before do
        user.update!(trust_level: TrustLevel[2])
        Group.refresh_automatic_groups!
        sign_in(user)
      end

      it "shows voice rooms section when rooms exist" do
        visit("/latest")

        expect(resenha_sidebar).to be_visible
      end

      it "displays public rooms in the sidebar" do
        visit("/latest")

        expect(resenha_sidebar).to be_visible
        expect(resenha_sidebar).to have_room(room.name)
      end

      it "shows private rooms when user can manage rooms" do
        private_room = Fabricate(:resenha_room, name: "Private Room", creator: admin, public: false)

        visit("/latest")

        # Users with sufficient trust level can see and manage all rooms, including private ones
        expect(resenha_sidebar).to have_room(room.name)
        expect(resenha_sidebar).to have_room(private_room.name)
      end

      it "can publish a fake camera stream on the room page" do
        SiteSetting.resenha_video_enabled = true
        install_resenha_fake_media

        visit("/resenha/r/#{room.slug}")
        click_button(I18n.t("js.resenha.room.join"))

        expect(page).to have_button(I18n.t("js.resenha.video.camera_on"))
        click_button(I18n.t("js.resenha.video.camera_on"))

        video_selector =
          ".resenha-video-tile.--video[data-user-id='#{user.id}'] video.resenha-video-tile__video"
        expect(page).to have_css(video_selector)
        expect(resenha_media_track_count(video_selector)).to eq(1)
      end

      it "keeps the active call in a widget after switching to widget mode" do
        SiteSetting.resenha_video_enabled = true
        install_resenha_fake_media

        visit("/resenha/r/#{room.slug}")
        click_button(I18n.t("js.resenha.room.join"))
        click_button(I18n.t("js.resenha.video.camera_on"))

        click_room_page_widget_mode_button

        expect(page).to have_css(".resenha-call-widget", text: room.name)
        expect(page).to have_button(I18n.t("js.resenha.video.camera_off"))
        expect(page).to have_button(I18n.t("js.resenha.room.leave"))

        widget_video_selector =
          ".resenha-call-widget .resenha-video-tile.--video[data-user-id='#{user.id}'] video.resenha-video-tile__video"
        expect(page).to have_css(widget_video_selector)
        expect(resenha_media_track_count(widget_video_selector)).to eq(1)

        click_call_widget_open_page_button

        page_video_selector =
          ".resenha-room-page .resenha-video-tile.--video[data-user-id='#{user.id}'] video.resenha-video-tile__video"
        expect(page).to have_current_path("/resenha/r/#{room.slug}")
        expect(page).to have_css(page_video_selector)
        expect(resenha_media_track_count(page_video_selector)).to eq(1)
      end

      it "can stop video and leave the call from the persistent widget" do
        SiteSetting.resenha_video_enabled = true
        install_resenha_fake_media

        visit("/resenha/r/#{room.slug}")
        click_button(I18n.t("js.resenha.room.join"))
        click_button(I18n.t("js.resenha.video.camera_on"))

        click_room_page_widget_mode_button

        within(".resenha-call-widget") { click_button(I18n.t("js.resenha.video.camera_off")) }

        expect(page).to have_button(I18n.t("js.resenha.video.camera_on"))
        expect(page).to have_no_css(".resenha-call-widget .resenha-video-tile.--video")

        within(".resenha-call-widget") { click_button(I18n.t("js.resenha.room.leave")) }

        expect(page).to have_no_css(".resenha-call-widget")
      end

      it "shows remote fake video when another user publishes a camera stream" do
        SiteSetting.resenha_video_enabled = true
        other_user.activate
        other_user.update!(trust_level: TrustLevel[2])
        Group.refresh_automatic_groups!

        using_session(:alice) do
          sign_in(user)
          install_resenha_fake_media(
            video_feeds: [
              {
                label: "Alice fake camera",
                width: 640,
                height: 360,
                color: "#2563eb",
                accent: "#f97316",
              },
            ],
          )
          visit("/resenha/r/#{room.slug}")
          click_button(I18n.t("js.resenha.room.join"))
          expect(page).to have_button(I18n.t("js.resenha.video.camera_on"))
        end

        using_session(:bob) do
          sign_in(other_user)
          install_resenha_fake_media(
            video_feeds: [
              {
                label: "Bob fake camera",
                width: 640,
                height: 360,
                color: "#16a34a",
                accent: "#7c3aed",
              },
            ],
          )
          visit("/resenha/r/#{room.slug}")
          click_button(I18n.t("js.resenha.room.join"))
          click_button(I18n.t("js.resenha.video.camera_on"))

          local_video_selector =
            ".resenha-video-tile.--video[data-user-id='#{other_user.id}'] video.resenha-video-tile__video"
          expect(page).to have_css(local_video_selector)
          expect(resenha_media_track_count(local_video_selector)).to eq(1)
        end

        using_session(:alice) do
          remote_video_selector =
            ".resenha-video-tile.--video[data-user-id='#{other_user.id}'] video.resenha-video-tile__video"
          expect(page).to have_css(remote_video_selector, wait: 10)
          expect(resenha_media_track_count(remote_video_selector, timeout: 10)).to eq(1)
        end
      end
    end

    context "as admin" do
      before do
        admin.activate
        sign_in(admin)
      end

      it "shows voice rooms section when rooms exist" do
        Fabricate(:resenha_room, name: "Admin Room", creator: admin, public: true)

        visit("/latest")

        expect(resenha_sidebar).to be_visible
      end
    end

    context "when user is not in create room groups" do
      fab!(:low_trust_user) { Fabricate(:user, trust_level: TrustLevel[0]) }

      before do
        low_trust_user.activate
        SiteSetting.resenha_create_room_allowed_groups = "#{Group::AUTO_GROUPS[:trust_level_2]}"
        sign_in(low_trust_user)
      end

      it "shows public rooms but hides private rooms" do
        public_room = Fabricate(:resenha_room, name: "Public Room", creator: admin, public: true)
        private_room = Fabricate(:resenha_room, name: "Private Room", creator: admin, public: false)

        visit("/latest")

        expect(resenha_sidebar).to be_visible
        expect(resenha_sidebar).to have_room(public_room.name)
        expect(resenha_sidebar).to have_no_room(private_room.name)
      end
    end
  end
end
