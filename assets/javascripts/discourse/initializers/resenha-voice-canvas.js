import { withPluginApi } from "discourse/lib/plugin-api";
import ResenhaGlobalCallLayer from "discourse/plugins/resenha/discourse/components/resenha/global-call-layer";

export default {
  name: "resenha-voice-canvas",

  initialize(owner) {
    withPluginApi((api) => {
      const currentUser = api.getCurrentUser();
      const siteSettings = owner.lookup("service:site-settings");

      if (!currentUser || !siteSettings.resenha_enabled) {
        return;
      }

      api.renderInOutlet("below-site-header", ResenhaGlobalCallLayer);
    });
  },
};
