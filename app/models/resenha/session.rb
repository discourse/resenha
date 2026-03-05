# frozen_string_literal: true

module Resenha
  class Session < ActiveRecord::Base
    self.table_name = "#{Resenha.table_name_prefix}sessions"

    belongs_to :user
    belongs_to :room, class_name: "Resenha::Room"

    scope :orphaned, -> { where(left_at: nil) }

    def close!(at: Time.current)
      update!(left_at: at)
    end
  end
end

# == Schema Information
#
# Table name: resenha_sessions
#
#  id         :bigint           not null, primary key
#  joined_at  :datetime         not null
#  left_at    :datetime
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  room_id    :bigint           not null
#  user_id    :bigint           not null
#
# Indexes
#
#  idx_resenha_sessions_orphaned                                (left_at) WHERE (left_at IS NULL)
#  index_resenha_sessions_on_room_id                            (room_id)
#  index_resenha_sessions_on_room_id_and_joined_at              (room_id,joined_at)
#  index_resenha_sessions_on_user_id                            (user_id)
#  index_resenha_sessions_on_user_id_and_joined_at              (user_id,joined_at)
#  index_resenha_sessions_on_user_id_and_room_id_and_joined_at  (user_id,room_id,joined_at)
#
# Foreign Keys
#
#  fk_rails_...  (room_id => resenha_rooms.id)
#  fk_rails_...  (user_id => users.id)
#
