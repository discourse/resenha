# frozen_string_literal: true

module ::Resenha
  PLUGIN_NAME = "resenha"
  ROOM_CHANNEL_PREFIX = "/resenha/rooms"
  ROOM_INDEX_CHANNEL = "/resenha/rooms/index"

  def self.table_name_prefix
    "resenha_"
  end

  def self.enabled?
    SiteSetting.resenha_enabled
  end

  def self.room_channel(room_id)
    "#{ROOM_CHANNEL_PREFIX}/#{room_id}"
  end

  def self.room_chat_channel(room_id)
    "#{ROOM_CHANNEL_PREFIX}/#{room_id}/chat"
  end

  def self.room_index_channel
    ROOM_INDEX_CHANNEL
  end

  # MessageBus can only target groups whose members are enumerated in
  # group_users, and a client's message-bus groups come from that table (see
  # config/initializers/004-message_bus.rb). The everyone, anonymous_users and
  # logged_in_users pseudo-groups have no rows (Group.ensure_automatic_groups!),
  # so a publish targeted at them reaches nobody except admins. When
  # resenha_allowed_groups includes one of them, access is effectively
  # unrestricted — publish without targets instead.
  def self.public_room_message_bus_targets
    allowed_group_ids = SiteSetting.resenha_allowed_groups_map

    untargetable_group_ids = [
      Group::AUTO_GROUPS[:everyone],
      Group::AUTO_GROUPS[:anonymous_users],
      Group::AUTO_GROUPS[:logged_in_users],
    ]

    return {} if allowed_group_ids.intersect?(untargetable_group_ids)

    { group_ids: allowed_group_ids }
  end
end

require_relative "resenha/engine"
require_relative "resenha/guardian_extension"
require_relative "resenha/user_status_manager"
