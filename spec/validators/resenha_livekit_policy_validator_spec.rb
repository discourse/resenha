# frozen_string_literal: true

RSpec.describe ResenhaLivekitPolicyValidator do
  subject(:validator) { described_class.new }

  it "always accepts the disabled policy, even unconfigured" do
    expect(validator.valid_value?("disabled")).to eq(true)
  end

  it "accepts a non-disabled policy when fully configured" do
    SiteSetting.resenha_livekit_url = "wss://livekit.example.com"
    SiteSetting.resenha_livekit_api_key = "lk_api_key"
    SiteSetting.resenha_livekit_api_secret = "lk_api_secret"

    expect(validator.valid_value?("per_room")).to eq(true)
    expect(validator.valid_value?("all_rooms")).to eq(true)
  end

  it "rejects a non-disabled policy when the url is blank or not ws(s)://" do
    SiteSetting.resenha_livekit_api_key = "lk_api_key"
    SiteSetting.resenha_livekit_api_secret = "lk_api_secret"

    expect(validator.valid_value?("per_room")).to eq(false)

    SiteSetting.resenha_livekit_url = "https://livekit.example.com"
    expect(validator.valid_value?("per_room")).to eq(false)
    expect(validator.error_message).to eq(
      I18n.t("site_settings.errors.resenha_livekit_policy_requires_url"),
    )
  end

  it "rejects a non-disabled policy when the api key is missing" do
    SiteSetting.resenha_livekit_url = "wss://livekit.example.com"
    SiteSetting.resenha_livekit_api_secret = "lk_api_secret"

    expect(validator.valid_value?("all_rooms")).to eq(false)
    expect(validator.error_message).to eq(
      I18n.t("site_settings.errors.resenha_livekit_policy_requires_api_key"),
    )
  end

  it "rejects a non-disabled policy when the api secret is missing" do
    SiteSetting.resenha_livekit_url = "ws://livekit.internal:7880"
    SiteSetting.resenha_livekit_api_key = "lk_api_key"

    expect(validator.valid_value?("all_rooms")).to eq(false)
    expect(validator.error_message).to eq(
      I18n.t("site_settings.errors.resenha_livekit_policy_requires_api_secret"),
    )
  end
end
