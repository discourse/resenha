# frozen_string_literal: true

class CreateResenhaInvites < ActiveRecord::Migration[8.0]
  def change
    # No user/room foreign keys: like sessions, invites are history that must
    # not block (or be erased by) user and room deletion.
    create_table :resenha_invites do |t|
      t.bigint :room_id, null: false
      t.bigint :user_id, null: false
      t.bigint :invited_by_id, null: false
      t.integer :source, null: false, default: 0
      t.datetime :redeemed_at
      t.timestamps
    end

    add_index :resenha_invites, %i[room_id user_id invited_by_id], unique: true
    add_index :resenha_invites, %i[user_id room_id]
    add_index :resenha_invites,
              %i[invited_by_id user_id],
              where: "redeemed_at IS NOT NULL",
              name: "idx_resenha_invites_redeemed"
  end
end
