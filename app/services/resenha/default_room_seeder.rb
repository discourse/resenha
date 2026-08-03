# frozen_string_literal: true

module Resenha
  class DefaultRoomSeeder
    DEFAULT_NAME = "Watercooler"
    MUTEX = "resenha-default-room-seeder"

    def self.ensure!
      return unless SiteSetting.resenha_enabled?
      return unless ActiveRecord::Base.connection.table_exists?(:resenha_rooms)
      # Runs at plugin activation, which can precede pending migrations (dev
      # DBs, rake db:migrate itself) — and Room queries the newest columns.
      # DatabaseTasks.migrations_paths is the set that includes plugin paths;
      # the connection pool's migration_context only knows core's.
      if ActiveRecord::MigrationContext.new(
           ActiveRecord::Tasks::DatabaseTasks.migrations_paths,
         ).needs_migration?
        return
      end

      DistributedMutex.synchronize(MUTEX) do
        next if Resenha::Room.persistent.exists?

        room =
          Resenha::Room.create!(
            name: DEFAULT_NAME,
            description: I18n.t("resenha.defaults.watercooler_description"),
            public: true,
            creator: Discourse.system_user,
          )

        Resenha::DirectoryBroadcaster.broadcast(action: :created, room: room)
      end
    end
  end
end
