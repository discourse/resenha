# frozen_string_literal: true

class AddRoomTypeToResenhaRooms < ActiveRecord::Migration[8.0]
  def change
    add_column :resenha_rooms, :room_type, :integer, default: 0, null: false
  end
end
