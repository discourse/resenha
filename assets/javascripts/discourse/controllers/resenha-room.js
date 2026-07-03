import Controller from "@ember/controller";

export default class ResenhaRoomController extends Controller {
  queryParams = ["chat", "join"];
  chat = false;
  join = false;
}
