# frozen_string_literal: true
class AddMaxQualityProfileToResenhaRooms < ActiveRecord::Migration[8.0]
  def change
    add_column :resenha_rooms, :max_quality_profile, :integer
  end
end
