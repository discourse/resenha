# frozen_string_literal: true
class AddChatSettingsToResenhaRooms < ActiveRecord::Migration[8.0]
  def change
    add_column :resenha_rooms, :chat_channel_id, :bigint
    add_column :resenha_rooms, :chat_idle_minutes, :integer, default: 15, null: false
    add_column :resenha_rooms, :chat_thread_title_template, :string
    add_index :resenha_rooms, :chat_channel_id
  end
end
