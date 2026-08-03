# frozen_string_literal: true

# Sessions are analytics history: they must survive their room's deletion,
# which the FK made impossible (room destroy raised ForeignKeyViolation).
class RemoveResenhaSessionsRoomForeignKey < ActiveRecord::Migration[8.0]
  def up
    remove_foreign_key :resenha_sessions, column: :room_id, if_exists: true
  end

  def down
    # Re-adding would fail once rows reference deleted rooms.
    raise ActiveRecord::IrreversibleMigration
  end
end
