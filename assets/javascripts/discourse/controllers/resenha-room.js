import Controller from "@ember/controller";

export default class ResenhaRoomController extends Controller {
  queryParams = ["chat", "join", "widget"];
  chat = false;
  join = false;
  // Typed as a string rather than a boolean so that a valueless `?widget`
  // survives deserialization as "" instead of being coerced to false.
  widget = null;
}
