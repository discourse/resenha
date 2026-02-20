# frozen_string_literal: true

class AddCookedDescriptionToResenhaRooms < ActiveRecord::Migration[7.2]
  def change
    add_column :resenha_rooms, :cooked_description, :text
  end
end
