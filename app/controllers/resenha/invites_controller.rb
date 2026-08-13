# frozen_string_literal: true

module Resenha
  class InvitesController < ApplicationController
    MAX_USERS_PER_REQUEST = 10
    SUGGESTION_LIMIT = 10

    before_action :load_room

    def create
      guardian.ensure_can_invite_to_resenha_room!(@room)
      RateLimiter.new(current_user, "resenha-invites", 10, 1.minute).performed!

      usernames = Array.wrap(params.require(:usernames)).map(&:to_s).uniq
      raise Discourse::InvalidParameters.new(:usernames) if usernames.blank?

      users =
        User
          .real
          .not_staged
          .where(username_lower: usernames.map(&:downcase))
          .limit(MAX_USERS_PER_REQUEST)

      invited = Resenha::RoomInviter.invite!(room: @room, inviter: current_user, users: users)
      # Users the inviter named but the inviter service refused (no access to
      # resenha, can't join this room, …) — surfaced so the modal can explain
      # instead of failing silently.
      skipped = users.to_a - invited
      render json: {
               invited_usernames: invited.map(&:username),
               skipped_usernames: skipped.map(&:username),
             }
    end

    # People the current user has shared this room with recently, most time
    # together first — the shortlist the invite modal opens with.
    def suggestions
      guardian.ensure_can_invite_to_resenha_room!(@room)

      rows =
        if SiteSetting.resenha_analytics_enabled
          Resenha::Session.top_room_companions_for(
            current_user.id,
            @room.id,
            since: 30.days.ago,
            # Overfetched so dropping whoever is already in the call cannot
            # leave the list short.
            limit: SUGGESTION_LIMIT * 2,
          )
        else
          []
        end

      present_ids = Resenha::ParticipantTracker.user_ids(@room.id)
      rows = rows.reject { |row| present_ids.include?(row.companion_id) }

      users = User.real.not_staged.where(id: rows.map(&:companion_id)).index_by(&:id)

      suggestions =
        rows
          .filter_map do |row|
            user = users[row.companion_id]
            next unless user
            # Session history outlives group membership: only people who can
            # still use voice rooms are worth suggesting.
            next unless user.guardian.can_access_resenha?

            BasicUserSerializer
              .new(user, scope: guardian, root: false)
              .as_json
              .merge(total_seconds: row.total_seconds, last_together_at: row.last_together_at)
          end
          .first(SUGGESTION_LIMIT)

      render json: { suggestions: suggestions }
    end

    private

    def load_room
      @room = Resenha::Room.find(params[:room_id])
    end
  end
end
