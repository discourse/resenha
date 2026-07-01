import RestModel from "discourse/models/rest";

const SAVED_PROPERTIES = [
  "name",
  "description",
  "public",
  "max_participants",
  "video_enabled",
  "chat_channel_id",
  "chat_idle_minutes",
  "chat_thread_title_template",
];

export default class ResenhaRoom extends RestModel {
  createProperties() {
    return this.getProperties(SAVED_PROPERTIES);
  }

  updateProperties() {
    return this.getProperties(SAVED_PROPERTIES);
  }
}
