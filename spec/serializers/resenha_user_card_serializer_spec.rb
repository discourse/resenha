# frozen_string_literal: true

RSpec.describe UserCardSerializer do
  fab!(:viewer) { Fabricate(:user, trust_level: TrustLevel[2]) }
  fab!(:target) { Fabricate(:user, trust_level: TrustLevel[2]) }

  before do
    SiteSetting.resenha_enabled = true
    SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:everyone]
  end

  def serialize(user, scope_user)
    described_class.new(user, scope: scope_user.guardian, root: false).as_json
  end

  describe "#resenha_can_call" do
    it "is true for a callable user when the viewer may start direct calls, false for oneself" do
      SiteSetting.resenha_direct_calls_allowed_groups = Group::AUTO_GROUPS[:trust_level_2]

      expect(serialize(target, viewer)[:resenha_can_call]).to eq(true)
      expect(serialize(viewer, viewer)[:resenha_can_call]).to eq(false)
    end

    it "is false for a target outside the voice-room groups" do
      SiteSetting.resenha_allowed_groups = Group::AUTO_GROUPS[:trust_level_2]
      SiteSetting.resenha_direct_calls_allowed_groups = Group::AUTO_GROUPS[:trust_level_2]
      outsider = Fabricate(:user, trust_level: TrustLevel[0])

      expect(serialize(outsider, viewer)[:resenha_can_call]).to eq(false)
    end

    it "is false when the target has muted the viewer" do
      SiteSetting.resenha_direct_calls_allowed_groups = Group::AUTO_GROUPS[:trust_level_2]
      MutedUser.create!(user_id: target.id, muted_user_id: viewer.id)

      expect(serialize(target, viewer)[:resenha_can_call]).to eq(false)
    end

    it "is false when the target does not accept personal messages from the viewer" do
      SiteSetting.resenha_direct_calls_allowed_groups = Group::AUTO_GROUPS[:trust_level_2]
      target.user_option.update!(allow_private_messages: false)

      expect(serialize(target, viewer)[:resenha_can_call]).to eq(false)
    end

    it "is omitted entirely when direct calls are disabled (the default)" do
      expect(serialize(target, viewer)).not_to have_key(:resenha_can_call)
    end
  end
end
