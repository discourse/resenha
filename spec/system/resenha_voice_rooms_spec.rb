# frozen_string_literal: true

require_relative "page_objects/components/resenha_sidebar"
require_relative "../support/resenha_fake_media"

describe "Resenha voice rooms", type: :system do
  let(:resenha_sidebar) { PageObjects::Components::ResenhaSidebar.new }

  fab!(:user)
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

        expect(page).to have_css(
          ".resenha-video-tile.--video[data-user-id='#{user.id}'] video.resenha-video-tile__video",
        )
        track_count = page.evaluate_async_script(<<~JS)
          const done = arguments[0];
          const startedAt = performance.now();
          const trackCount = () =>
            document.querySelector(".resenha-video-tile__video")
              ?.srcObject
              ?.getVideoTracks()
              ?.length || 0;
          const waitForTracks = () => {
            const count = trackCount();
            if (count > 0 || performance.now() - startedAt > 5000) {
              done(count);
            } else {
              requestAnimationFrame(waitForTracks);
            }
          };
          waitForTracks();
        JS

        expect(track_count).to eq(1)
      end

      it "provides three distinct fake video feeds for system tests" do
        install_resenha_fake_media

        visit("/latest")

        labels = page.evaluate_async_script(<<~JS)
          const done = arguments[0];
          Promise.all([
            navigator.mediaDevices.getUserMedia({ video: true }),
            navigator.mediaDevices.getUserMedia({ video: true }),
            navigator.mediaDevices.getUserMedia({ video: true }),
          ]).then((streams) => {
            done(streams.map((stream) => stream.__resenhaFakeMediaLabel));
          });
        JS

        expect(labels).to contain_exactly(
          "Resenha fake camera A",
          "Resenha fake camera B",
          "Resenha fake camera C",
        )
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
