# frozen_string_literal: true

# rubocop:disable Discourse/NoAddReferenceOrAliasesActiveRecordMigration
class CreateResenhaSessions < ActiveRecord::Migration[8.0]
  def change
    create_table :resenha_sessions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :room, null: false, foreign_key: { to_table: :resenha_rooms }
      t.datetime :joined_at, null: false
      t.datetime :left_at
      t.timestamps
    end

    add_index :resenha_sessions, %i[user_id room_id joined_at]
    add_index :resenha_sessions, %i[room_id joined_at]
    add_index :resenha_sessions, %i[user_id joined_at]
    add_index :resenha_sessions,
              :left_at,
              where: "left_at IS NULL",
              name: "idx_resenha_sessions_orphaned"
  end
end
# rubocop:enable Discourse/NoAddReferenceOrAliasesActiveRecordMigration
