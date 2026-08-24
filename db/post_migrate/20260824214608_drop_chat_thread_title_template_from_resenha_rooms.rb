# frozen_string_literal: true

class DropChatThreadTitleTemplateFromResenhaRooms < ActiveRecord::Migration[8.0]
  DROPPED_COLUMNS = { resenha_rooms: %i[chat_thread_title_template] }

  def up
    DROPPED_COLUMNS.each { |table, columns| Migration::ColumnDropper.execute_drop(table, columns) }
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
