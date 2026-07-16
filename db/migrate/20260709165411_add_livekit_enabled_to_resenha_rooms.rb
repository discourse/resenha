# frozen_string_literal: true
class AddLivekitEnabledToResenhaRooms < ActiveRecord::Migration[8.0]
  def change
    add_column :resenha_rooms, :livekit_enabled, :boolean, null: false, default: false
  end
end
