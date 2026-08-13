import { service } from "@ember/service";
import DiscourseRoute from "discourse/routes/discourse";
import { setPendingInviteRef } from "discourse/plugins/resenha/discourse/lib/resenha/invite-ref";

// An invite link (/resenha/r/:slug/invited-by/:username) is the room page
// with the inviter remembered: the ref is held until the user actually joins
// the call, so the server credits the inviter on a real join, not a page view.
export default class ResenhaRoomInviteRoute extends DiscourseRoute {
  @service router;

  model(params, transition) {
    setPendingInviteRef(params.slug, params.username);
    this.router.replaceWith("resenha-room", params.slug, {
      queryParams: transition.to.queryParams,
    });
  }
}
