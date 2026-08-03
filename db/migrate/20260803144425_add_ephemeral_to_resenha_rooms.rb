# frozen_string_literal: true

class AddEphemeralToResenhaRooms < ActiveRecord::Migration[8.0]
  def change
    add_column :resenha_rooms, :ephemeral, :boolean, default: false, null: false
    add_column :resenha_rooms, :last_occupied_at, :datetime

    # The cleanup job scans only ephemeral rooms; persistent rooms dominate
    # the table, so a partial index keeps that scan cheap.
    add_index :resenha_rooms, :id, where: "ephemeral", name: "index_resenha_rooms_on_ephemeral"
  end
end
