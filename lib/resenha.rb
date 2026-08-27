# frozen_string_literal: true

module ::Resenha
  PLUGIN_NAME = "resenha"
  ROOM_CHANNEL_PREFIX = "/resenha/rooms"
  ROOM_INDEX_CHANNEL = "/resenha/rooms/index"

  # Chat::Thread custom field marking a thread as a room's voice session
  # thread, so it can be traced back to its room long after the live session
  # pointer in Redis has expired.
  THREAD_ROOM_ID_FIELD = "resenha_room_id"

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

  # Pseudo-groups have no group_users rows, but a client's message-bus groups
  # don't come only from that table: every logged-in client carries the
  # logged_in_users pseudo-group (see config/initializers/004-message_bus.rb),
  # so it can be targeted directly. Only access that includes anonymous
  # visitors (everyone / anonymous_users) publishes untargeted — falling back
  # to untargeted for logged_in_users would hand room directory and
  # participant data to anonymous subscribers on predictable channels.
  def self.public_room_message_bus_targets
    allowed_group_ids = SiteSetting.resenha_allowed_groups_map

    anonymous_reachable_group_ids = [
      Group::AUTO_GROUPS[:everyone],
      Group::AUTO_GROUPS[:anonymous_users],
    ]

    return {} if allowed_group_ids.intersect?(anonymous_reachable_group_ids)

    { group_ids: allowed_group_ids }
  end
end

require_relative "resenha/engine"
require_relative "resenha/guardian_extension"
require_relative "resenha/ice_config"
require_relative "resenha/livekit"
require_relative "resenha/livekit/twirp"
require_relative "resenha/livekit/egress_client"
require_relative "resenha/livekit/health_check"
require_relative "resenha/livekit/room_service_client"
require_relative "resenha/livekit/webhook_verifier"
require_relative "resenha/room_hashtag_data_source"
require_relative "resenha/user_status_manager"
