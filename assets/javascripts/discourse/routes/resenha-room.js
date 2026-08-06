import { service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { defaultHomepage } from "discourse/lib/utilities";
import DiscourseRoute from "discourse/routes/discourse";
import urlFlagSet from "discourse/plugins/resenha/discourse/lib/resenha/url-flag";

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
    if (!this.#widgetJoinRequested(transition)) {
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

  // `widget` says where a call should live, not that there should be one, so it
  // composes with `join` instead of implying it. Skipping the room page is only
  // right when both are asked for: `?widget` on its own opens the room page,
  // which then docks whatever the user joins from there.
  #widgetJoinRequested(transition) {
    // Anonymous visitors cannot join a call, so they get the room page and its
    // login prompt instead.
    if (!this.currentUser) {
      return false;
    }

    const { join, widget } = transition.to?.queryParams ?? {};

    return urlFlagSet(widget) && urlFlagSet(join);
  }
}
