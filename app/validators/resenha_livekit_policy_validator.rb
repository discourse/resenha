# frozen_string_literal: true

# Refuses any LiveKit room policy other than "disabled" unless the server URL
# (ws:// or wss://), API key, and API secret are all present, so admins get a
# config-time failure instead of a first-join failure.
class ResenhaLivekitPolicyValidator
  def initialize(opts = {})
    @opts = opts
  end

  def valid_value?(value)
    return true if value == "disabled"

    @error_key =
      if !SiteSetting.resenha_livekit_url.to_s.match?(%r{\Awss?://})
        "resenha_livekit_policy_requires_url"
      elsif SiteSetting.resenha_livekit_api_key.blank?
        "resenha_livekit_policy_requires_api_key"
      elsif SiteSetting.resenha_livekit_api_secret.blank?
        "resenha_livekit_policy_requires_api_secret"
      end

    @error_key.nil?
  end

  def error_message
    I18n.t("site_settings.errors.#{@error_key}") if @error_key
  end
end
