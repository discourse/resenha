import Component from "@glimmer/component";
import { action } from "@ember/object";
import { service } from "@ember/service";
import DModal from "discourse/components/d-modal";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { i18n } from "discourse-i18n";
import ResenhaRoomForm from "discourse/plugins/resenha/admin/components/resenha-room-form";

export default class ResenhaCreateRoomModal extends Component {
  @service resenhaRooms;
  @service toasts;

  @action
  async handleSubmit(data) {
    try {
      const result = await ajax("/resenha/rooms", {
        type: "POST",
        data: { room: data },
      });
      this.resenhaRooms.handleDirectoryEvent({
        type: "created",
        room: result.room,
      });
      this.toasts.success({ data: { message: i18n("resenha.room.created") } });
      this.args.closeModal();
    } catch (e) {
      popupAjaxError(e);
    }
  }

  <template>
    <DModal
      @closeModal={{@closeModal}}
      @title={{i18n "resenha.sidebar.create"}}
      class="resenha-create-room-modal"
    >
      <:body>
        <ResenhaRoomForm @onSubmit={{this.handleSubmit}} />
      </:body>
    </DModal>
  </template>
}
