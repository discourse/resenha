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
register_svg_icon "video"
register_svg_icon "video-slash"
register_svg_icon "display"
register_svg_icon "expand"
register_svg_icon "compress"
register_svg_icon "far-comment"
register_svg_icon "comment-slash"
register_svg_icon "paper-plane"
register_svg_icon "xmark"
register_svg_icon "up-right-from-square"
register_svg_icon "person-chalkboard"
register_svg_icon "table-cells"
register_asset "stylesheets/common/resenha.scss"
register_asset "stylesheets/common/resenha-room-page.scss"
register_asset "stylesheets/common/resenha-chat.scss"
register_asset "stylesheets/common/resenha-admin.scss", :admin

add_admin_route "resenha.admin.title", "resenha", use_new_show_route: true

require_relative "lib/resenha"

after_initialize do
  SeedFu.fixture_paths << Rails.root.join("plugins", "resenha", "db", "fixtures").to_s

  require_relative "lib/resenha/user_extension"

  Discourse::Application.routes.append { mount ::Resenha::Engine, at: "/resenha" }

  Guardian.prepend Resenha::GuardianExtension

  # Chat snapshots the hashtag orderings into Site.markdown_additional_options
  # at its own after_initialize, which runs before this one (plugins load
  # alphabetically) — refresh it so chat transcripts quoted inside posts can
  # cook room hashtags too. The snapshot also bakes in each source's enabled?
  # state, so it must be refreshed again when resenha_enabled toggles.
  def self.refresh_chat_hashtag_configurations
    return unless defined?(::Chat) && Site.markdown_additional_options["chat"]

    Site.markdown_additional_options["chat"][
      :hashtag_configurations
    ] = HashtagAutocompleteService.contexts_with_ordered_types
  end

  # Rooms rank below chat channels (200) but above categories (100) in the
  # chat composer, and below everything (category 100, tag 50, channel 10) in
  # the topic composer, so a bare #slug in a post still means the category.
  register_hashtag_data_source(Resenha::RoomHashtagDataSource)
  register_hashtag_type_priority_for_context("room", "chat-composer", 150)
  register_hashtag_type_priority_for_context("room", "topic-composer", 5)
  refresh_chat_hashtag_configurations

  # Lets the client decide whether to render the rooms sidebar for anonymous
  # visitors without exposing the configured group ids.
  add_to_serializer(:site, :resenha_public_access) { scope.resenha_public_access? }

  # Mediapipe assets live in the plugin's public dir, which is served by the
  # app (and any CDN proxying it) but never uploaded to a static asset CDN,
  # so the client cannot build a working URL with getURLWithCDN.
  add_to_serializer(:site, :resenha_mediapipe_base_url) do
    path = GlobalPath.path("/plugins/resenha/javascripts/mediapipe")
    GlobalSetting.cdn_url.present? ? "#{GlobalSetting.cdn_url}#{path}" : path
  end

  Resenha::DefaultRoomSeeder.ensure! if SiteSetting.resenha_enabled?

  # This can't live in the on(:site_setting_changed) handler below: plugin
  # event handlers are skipped while the plugin is disabled, which silently
  # covers the disabling transition itself.
  on_enabled_change do |_old_value, new_value|
    Resenha::DefaultRoomSeeder.ensure! if new_value
    clear_all_resenha_statuses unless new_value
    refresh_chat_hashtag_configurations
  end

  on(:site_setting_changed) do |name, _old_value, new_value|
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
