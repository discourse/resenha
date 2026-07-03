import { apiInitializer } from "discourse/lib/api";
import ResenhaBackToVoiceRoomButton from "discourse/plugins/resenha/discourse/components/resenha-back-to-voice-room-button";

export default apiInitializer((api) => {
  api.renderInOutlet(
    "chat-thread-navbar-actions",
    ResenhaBackToVoiceRoomButton
  );
});
