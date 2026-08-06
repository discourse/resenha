import Component from "@glimmer/component";
import { action } from "@ember/object";
import { service } from "@ember/service";
import { clipboardCopy } from "discourse/lib/utilities";
import DButton from "discourse/ui-kit/d-button";
import DDropdownMenu from "discourse/ui-kit/d-dropdown-menu";
import { i18n } from "discourse-i18n";
import ResenhaRoomInfoModal from "./modal/resenha-room-info";

export default class ResenhaRoomSidebarContextMenu extends Component {
  @service modal;
  @service resenhaWebrtc;
  @service router;
  @service toasts;

  get room() {
    return this.args.data.room;
  }

  get isConnected() {
    return this.resenhaWebrtc.connectionStateFor(this.room.id) === "connected";
  }

  @action
  openRoomPage() {
    this.router.transitionTo("resenha-room", this.room.slug);
    this.args.close();
  }

  @action
  openRoomInfo() {
    this.modal.show(ResenhaRoomInfoModal, { model: { room: this.room } });
    this.args.close();
  }

  @action
  copyRoomLink() {
    const url = this.router.urlFor("resenha-room", this.room.slug);
    clipboardCopy(new URL(url, window.location.origin).href);
    this.toasts.success({
      duration: "short",
      data: { message: i18n("resenha.room.link_copied") },
    });
    this.args.close();
  }

  @action
  editRoom() {
    this.modal.show(ResenhaRoomInfoModal, {
      model: { room: this.room, isEditing: true },
    });
    this.args.close();
  }

  @action
  toggleCallWidget() {
    this.resenhaWebrtc.toggleCallWidgetHidden();
    this.args.close();
  }

  @action
  leaveRoom() {
    this.resenhaWebrtc.leave(this.room);
    this.args.close();
  }

  <template>
    <DDropdownMenu class="resenha-room-sidebar-context-menu" as |dropdown|>
      <dropdown.item>
        <DButton
          @action={{this.openRoomPage}}
          @icon="expand"
          @label="resenha.room.open_page"
          @title="resenha.room.open_page"
          class="resenha-room-sidebar-context-menu__open-page"
        />
      </dropdown.item>
      <dropdown.item>
        <DButton
          @action={{this.openRoomInfo}}
          @icon="circle-info"
          @label="resenha.room.info"
          @title="resenha.room.info"
          class="resenha-room-sidebar-context-menu__room-info"
        />
      </dropdown.item>
      <dropdown.item>
        <DButton
          @action={{this.copyRoomLink}}
          @icon="link"
          @label="resenha.room.copy_link"
          @title="resenha.room.copy_link"
          class="resenha-room-sidebar-context-menu__copy-link"
        />
      </dropdown.item>
      {{#if this.room.can_manage}}
        <dropdown.item>
          <DButton
            @action={{this.editRoom}}
            @icon="pencil"
            @label="resenha.room.edit"
            @title="resenha.room.edit"
            class="resenha-room-sidebar-context-menu__edit-room"
          />
        </dropdown.item>
      {{/if}}
      {{#if this.isConnected}}
        <dropdown.item>
          <DButton
            @action={{this.toggleCallWidget}}
            @icon={{if this.resenhaWebrtc.callWidgetHidden "eye" "eye-slash"}}
            @label={{if
              this.resenhaWebrtc.callWidgetHidden
              "resenha.widget.show"
              "resenha.widget.hide"
            }}
            @title={{if
              this.resenhaWebrtc.callWidgetHidden
              "resenha.widget.show"
              "resenha.widget.hide"
            }}
            class="resenha-room-sidebar-context-menu__toggle-widget"
          />
        </dropdown.item>
        <dropdown.item>
          <DButton
            @action={{this.leaveRoom}}
            @icon="phone-slash"
            @label="resenha.room.leave"
            @title="resenha.room.leave"
            class="resenha-room-sidebar-context-menu__leave-room --danger"
          />
        </dropdown.item>
      {{/if}}
    </DDropdownMenu>
  </template>
}
