# frozen_string_literal: true

# name: resenha
# about: Voice chat rooms powered by WebRTC inside Discourse
# version: 0.1
# authors: Discourse Contributors
# url: https://github.com/discourse/resenha

enabled_site_setting :resenha_enabled

register_svg_icon "microphone-lines"
register_svg_icon "phone"
register_svg_icon "waveform"
register_svg_icon "ear-listen"
register_svg_icon "volume-high"
register_svg_icon "microphone"
register_svg_icon "microphone-slash"
register_svg_icon "volume-xmark"
register_svg_icon "walkie-talkie"
register_svg_icon "keyboard"
register_svg_icon "phone-slash"
register_svg_icon "podcast"
register_svg_icon "handshake"
register_svg_icon "users"
register_svg_icon "user-group"
register_svg_icon "compass"
register_svg_icon "calendar"
register_svg_icon "house"
register_svg_icon "bullhorn"
register_svg_icon "star"
register_svg_icon "moon"
register_svg_icon "sun"
register_svg_icon "people-group"
register_svg_icon "calendar-week"
register_svg_icon "trophy"
register_svg_icon "clock"
register_asset "stylesheets/common/resenha.scss"
register_asset "stylesheets/common/resenha-admin.scss", :admin

add_admin_route "resenha.admin.title", "resenha", use_new_show_route: true

require_relative "lib/resenha"

after_initialize do
  SeedFu.fixture_paths << Rails.root.join("plugins", "resenha", "db", "fixtures").to_s

  require_relative "lib/resenha/user_extension"

  Discourse::Application.routes.append { mount ::Resenha::Engine, at: "/resenha" }

  Guardian.prepend Resenha::GuardianExtension

  # Lets the client decide whether to render the rooms sidebar for anonymous
  # visitors without exposing the configured group ids.
  add_to_serializer(:site, :resenha_public_access) { scope.resenha_public_access? }

  Resenha::DefaultRoomSeeder.ensure! if SiteSetting.resenha_enabled?

  on(:site_setting_changed) do |name, _old_value, new_value|
    if name.to_sym == :resenha_enabled
      Resenha::DefaultRoomSeeder.ensure! if new_value
      clear_all_resenha_statuses unless new_value
    end

    if name.to_sym == :resenha_badges_enabled
      if new_value
        Resenha::BadgeGranterHooks.enable_all!
      else
        Resenha::BadgeGranterHooks.disable_all!
      end
    end

    clear_all_resenha_statuses if name.to_sym == :resenha_auto_status_enabled && !new_value
  end

  def self.clear_all_resenha_statuses
    UserStatus
      .where(emoji: [Resenha::UserStatusManager::EMOJI, Resenha::UserStatusManager::AFK_EMOJI])
      .find_each { |status| User.find_by(id: status.user_id)&.clear_status! }
  end
end
