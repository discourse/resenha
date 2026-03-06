# frozen_string_literal: true

Fabricator(:resenha_session, class_name: "Resenha::Session") do
  user
  room { Fabricate(:resenha_room) }
  joined_at { 1.hour.ago }
  left_at { Time.current }
end
