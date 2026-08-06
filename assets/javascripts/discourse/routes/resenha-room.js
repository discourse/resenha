import { service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { defaultHomepage } from "discourse/lib/utilities";
import DiscourseRoute from "discourse/routes/discourse";

export default class ResenhaRoomRoute extends DiscourseRoute {
  @service currentUser;
  @service resenhaRooms;
  @service resenhaWebrtc;
  @service router;

  async model(params) {
    await this.resenhaRooms.ready;

    const room = this.resenhaRooms.roomBySlug(params.slug);
    if (room) {
      return room;
    }

    const response = await ajax(`/resenha/rooms/${params.slug}.json`);
    return response.room;
  }

  afterModel(room, transition) {
    if (!this.#widgetRequested(transition)) {
      return;
    }

    this.resenhaWebrtc.setCallWidgetHidden(false);
    this.resenhaWebrtc.join(room);

    // The widget only renders off the room page, so the room page is never
    // entered: navigating within the app stays put, and a full page load lands
    // on the homepage with the call already floating.
    if (transition.from) {
      transition.abort();
      return;
    }

    this.router.replaceWith(`discovery.${defaultHomepage()}`);
  }

  titleToken() {
    return this.currentModel?.name;
  }

  #widgetRequested(transition) {
    // Anonymous visitors cannot join a call, so they get the room page and its
    // login prompt instead.
    if (!this.currentUser) {
      return false;
    }

    const { widget } = transition.to?.queryParams ?? {};

    // A valueless `?widget` arrives as an empty string, and is the spelling a
    // hand-written link is most likely to use.
    return (
      widget === "" || widget === true || widget === "true" || widget === "1"
    );
  }
}
