import { withPluginApi } from "discourse/lib/plugin-api";
import ResenhaAnonRoomsBlock from "discourse/plugins/resenha/discourse/components/resenha-anon-rooms-block";

export default {
  name: "resenha-register-blocks",
  before: "freeze-block-registry",

  initialize() {
    withPluginApi((api) => api.registerBlock(ResenhaAnonRoomsBlock));
  },
};
