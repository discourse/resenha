# frozen_string_literal: true

# User deletion must not be blocked by resenha rows; cleanup happens in the
# plugin's user_destroyed handler instead (rooms reassigned to the system
# user, memberships and co-presences removed, sessions kept as history).
class RemoveResenhaUserForeignKeys < ActiveRecord::Migration[8.0]
  def up
    remove_foreign_key :resenha_sessions, column: :user_id, if_exists: true
    remove_foreign_key :resenha_room_memberships, column: :user_id, if_exists: true
    remove_foreign_key :resenha_co_presences, column: :user_id_1, if_exists: true
    remove_foreign_key :resenha_co_presences, column: :user_id_2, if_exists: true
    remove_foreign_key :resenha_rooms, column: :creator_id, if_exists: true
  end

  def down
    # Re-adding would fail once rows reference deleted users.
    raise ActiveRecord::IrreversibleMigration
  end
end
