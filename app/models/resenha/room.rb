# frozen_string_literal: true

module Resenha
  class Room < ActiveRecord::Base
    self.table_name = "#{Resenha.table_name_prefix}rooms"

    ROOM_TYPE_OPEN = 0
    ROOM_TYPE_STAGE = 1
    ROOM_TYPES = { "open" => ROOM_TYPE_OPEN, "stage" => ROOM_TYPE_STAGE }.freeze

    belongs_to :creator, class_name: "User"
    has_many :room_memberships, class_name: "Resenha::RoomMembership", dependent: :destroy
    has_many :members, through: :room_memberships, source: :user

    validates :name, presence: true, length: { maximum: 80 }
    validates :slug, presence: true, uniqueness: true
    validates :room_type, inclusion: { in: ROOM_TYPES.values }
    validates :max_participants,
              numericality: {
                only_integer: true,
                allow_nil: true,
                greater_than_or_equal_to: 2,
                less_than_or_equal_to: ->(r) { r.stage? ? 200 : 50 },
              }

    before_validation :ensure_slug
    before_save :cook_description
    after_commit :ensure_creator_membership, on: :create

    scope :public_rooms, -> { where(public: true) }

    def open?
      room_type == ROOM_TYPE_OPEN
    end

    def stage?
      room_type == ROOM_TYPE_STAGE
    end

    def room_type_name
      ROOM_TYPES.key(room_type) || "open"
    end

    def moderator_ids
      room_memberships.moderator.pluck(:user_id)
    end

    def member_ids
      room_memberships.pluck(:user_id)
    end

    def message_bus_targets
      if public?
        { group_ids: [Group::AUTO_GROUPS[:trust_level_0]] }
      else
        { user_ids: member_ids }
      end
    end

    private

    def ensure_slug
      self.slug = Slug.for(name) if slug.blank? && name.present?
    end

    def cook_description
      self.cooked_description = (PrettyText.cook(description) if description.present?)
    end

    def ensure_creator_membership
      room_memberships.find_or_create_by!(user: creator) do |membership|
        membership.role = Resenha::RoomMembership::ROLE_MODERATOR
      end
    end
  end
end

# == Schema Information
#
# Table name: resenha_rooms
#
#  id                 :bigint           not null, primary key
#  cooked_description :text
#  description        :text
#  max_participants   :integer
#  name               :string           not null
#  public             :boolean          default(FALSE), not null
#  slug               :string           not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  creator_id         :bigint           not null
#
# Indexes
#
#  index_resenha_rooms_on_creator_id  (creator_id)
#  index_resenha_rooms_on_slug        (slug) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (creator_id => users.id)
#
