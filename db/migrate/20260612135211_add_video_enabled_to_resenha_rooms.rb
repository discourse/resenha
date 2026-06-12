# frozen_string_literal: true
class AddVideoEnabledToResenhaRooms < ActiveRecord::Migration[8.0]
  def change
    add_column :resenha_rooms, :video_enabled, :boolean, null: false, default: true
  end
end
