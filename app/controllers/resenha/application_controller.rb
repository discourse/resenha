# frozen_string_literal: true

module Resenha
  class ApplicationController < ::ApplicationController
    requires_plugin ::Resenha::PLUGIN_NAME

    before_action :ensure_logged_in
    before_action :ensure_enabled!

    private

    def ensure_enabled!
      unless Resenha.enabled?
        raise Discourse::InvalidAccess.new(I18n.t("resenha.errors.not_enabled"))
      end
    end
  end
end
