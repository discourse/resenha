import Route from "@ember/routing/route";
import { ajax } from "discourse/lib/ajax";

export default class ResenhaRecordingsRoute extends Route {
  async model() {
    return await ajax("/admin/plugins/resenha/recordings.json");
  }
}
