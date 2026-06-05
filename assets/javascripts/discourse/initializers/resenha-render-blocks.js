import { apiInitializer } from "discourse/lib/api";
import ResenhaAnonRoomsBlock from "discourse/plugins/resenha/discourse/components/resenha-anon-rooms-block";

export default apiInitializer((api) => {
  api.renderBlocks("sidebar-blocks", [
    {
      block: ResenhaAnonRoomsBlock,
      conditions: [{ type: "user", loggedIn: false }],
    },
  ]);
});
