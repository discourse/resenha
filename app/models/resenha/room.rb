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
    validates :chat_idle_minutes,
              numericality: {
                only_integer: true,
                greater_than_or_equal_to: 2,
                less_than_or_equal_to: 1440,
              }
    validate :chat_channel_must_support_threading, if: :chat_channel_id_changed?

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

    def video_allowed?
      SiteSetting.resenha_video_enabled && video_enabled && open?
    end

    def moderator_ids
      room_memberships.moderator.pluck(:user_id)
    end

    def member_ids
      room_memberships.pluck(:user_id)
    end

    def message_bus_targets
      if public?
        Resenha.public_room_message_bus_targets
      else
        { user_ids: member_ids }
      end
    end

    def chat_linked?
      chat_channel_id.present?
    end

    # Memoized (keyed on the current id, so an in-flight reassignment isn't
    # served a stale channel): serialization consults the channel several
    # times per room, which would otherwise be a query each.
    def chat_channel
      return nil unless chat_channel_id && defined?(::Chat)
      if @chat_channel_for_id != chat_channel_id
        @chat_channel_for_id = chat_channel_id
        @chat_channel = ::Chat::Channel.find_by(id: chat_channel_id)
      end
      @chat_channel
    end

    def reload(...)
      @chat_channel_for_id = @chat_channel = nil
      super
    end

    def chat_idle_seconds
      [chat_idle_minutes || 15, 2].max * 60
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

    # Resenha never edits chat channels itself (that would silently change a
    # setting for everyone else using it, on behalf of a user who may not have
    # permission to edit that channel at all) — a channel has to already have
    # threading enabled before it can be linked.
    def chat_channel_must_support_threading
      return if chat_channel_id.blank? || !defined?(::Chat)

      channel = chat_channel
      if channel.nil?
        errors.add(:chat_channel_id, "must reference an existing chat channel")
      elsif !channel.threading_enabled?
        errors.add(:chat_channel_id, "must have threading enabled")
      end
    end
  end
end

# == Schema Information
#
# Table name: resenha_rooms
#
#  id                         :bigint           not null, primary key
#  chat_idle_minutes          :integer          default(15), not null
#  chat_thread_title_template :string
#  cooked_description         :text
#  description                :text
#  max_participants           :integer
#  name                       :string           not null
#  public                     :boolean          default(FALSE), not null
#  room_type                  :integer          default(0), not null
#  slug                       :string           not null
#  video_enabled              :boolean          default(TRUE), not null
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  chat_channel_id            :bigint
#  creator_id                 :bigint           not null
#
# Indexes
#
#  index_resenha_rooms_on_chat_channel_id  (chat_channel_id)
#  index_resenha_rooms_on_creator_id       (creator_id)
#  index_resenha_rooms_on_slug             (slug) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (creator_id => users.id)
#
