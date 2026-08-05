import Controller from "@ember/controller";

export default class ResenhaRoomController extends Controller {
  queryParams = ["chat", "join", "widget"];
  chat = false;
  join = false;
  widget = false;
}
