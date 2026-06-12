import RestModel from "discourse/models/rest";

export default class ResenhaRoom extends RestModel {
  createProperties() {
    return this.getProperties([
      "name",
      "description",
      "public",
      "max_participants",
      "video_enabled",
    ]);
  }

  updateProperties() {
    return this.getProperties([
      "name",
      "description",
      "public",
      "max_participants",
      "video_enabled",
    ]);
  }
}
