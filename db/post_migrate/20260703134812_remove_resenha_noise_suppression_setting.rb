# frozen_string_literal: true
class RemoveResenhaNoiseSuppressionSetting < ActiveRecord::Migration[8.0]
  def up
    execute "DELETE FROM site_settings WHERE name = 'resenha_noise_suppression'"
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
