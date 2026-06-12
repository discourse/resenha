import { service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import DiscourseRoute from "discourse/routes/discourse";

export default class ResenhaRoomRoute extends DiscourseRoute {
  @service resenhaRooms;

  async model(params) {
    await this.resenhaRooms.ready;

    const room = this.resenhaRooms.roomBySlug(params.slug);
    if (room) {
      return room;
    }

    const response = await ajax(`/resenha/rooms/${params.slug}.json`);
    return response.room;
  }

  titleToken() {
    return this.currentModel?.name;
  }
}
