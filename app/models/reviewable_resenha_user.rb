# frozen_string_literal: true

class ReviewableResenhaUser < Reviewable
  include ReviewableActionBuilder

  def serializer
    ReviewableResenhaUserSerializer
  end

  def self.action_aliases
    { agree_and_suspend: :agree_and_keep, agree_and_silence: :agree_and_keep }
  end

  def session
    @session ||= target || Resenha::Session.find_by(id: target_id)
  end

  def flagged_by_user_ids
    @flagged_by_user_ids ||= reviewable_scores.map(&:user_id)
  end

  # Core assumes flag reviewables hang off a post.
  def post
    nil
  end

  def build_combined_actions(actions, guardian, _args)
    return unless pending?

    agree =
      actions.add_bundle("#{id}-agree", icon: "thumbs-up", label: "reviewables.actions.agree.title")
    build_action(actions, :agree_and_keep, icon: "thumbs-up", bundle: agree)

    if guardian.can_suspend?(target_created_by)
      build_action(
        actions,
        :agree_and_suspend,
        icon: "ban",
        bundle: agree,
        client_action: "suspend",
      )
      build_action(
        actions,
        :agree_and_silence,
        icon: "microphone-slash",
        bundle: agree,
        client_action: "silence",
      )
    end

    build_action(actions, :disagree, icon: "thumbs-down")
    build_action(actions, :ignore, icon: "xmark")
  end

  def perform_agree_and_keep(_performed_by, _args)
    create_result(:success, :approved) do |result|
      result.update_flag_stats = { status: :agreed, user_ids: flagged_by_user_ids }
      result.recalculate_score = true
    end
  end

  def perform_disagree(_performed_by, _args)
    create_result(:success, :rejected) do |result|
      result.update_flag_stats = { status: :disagreed, user_ids: flagged_by_user_ids }
      result.recalculate_score = true
    end
  end

  def perform_ignore(_performed_by, _args)
    create_result(:success, :ignored) do |result|
      result.update_flag_stats = { status: :ignored, user_ids: flagged_by_user_ids }
    end
  end
end
