import Component from "@glimmer/component";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { service } from "@ember/service";
import DButton from "discourse/components/d-button";
import dConcatClass from "discourse/ui-kit/helpers/d-concat-class";
import dIcon from "discourse/ui-kit/helpers/d-icon";
import { i18n } from "discourse-i18n";
import ResenhaVideoTile from "./video-tile";

const WIDGET_VIDEO_TILE_BUDGET = 4;

export default class ResenhaCallWidget extends Component {
  @service currentUser;
  @service router;
  @service resenhaRooms;
  @service resenhaWebrtc;

  get room() {
    return this.resenhaWebrtc.activeRoom;
  }

  get shouldRender() {
    return !!this.room && !this.onActiveRoomPage;
  }

  get onActiveRoomPage() {
    return this.router.currentURL === `/resenha/r/${this.room?.slug}`;
  }

  get connectionState() {
    return this.room
      ? this.resenhaWebrtc.connectionStateFor(this.room.id)
      : "idle";
  }

  get participants() {
    return this.room?.active_participants || [];
  }

  get tiles() {
    let videoCount = 0;

    return this.participants.map((participant) => {
      const isSelf = participant.id === this.currentUser?.id;
      const publishing = isSelf
        ? !!this.resenhaWebrtc.localVideoKind
        : participant.is_video_on || participant.is_screen_sharing;
      const showVideo = publishing && videoCount < WIDGET_VIDEO_TILE_BUDGET;
      if (showVideo) {
        videoCount++;
      }

      return { participant, isSelf, showVideo };
    });
  }

  get videoAllowed() {
    return this.resenhaWebrtc.videoAllowedIn(this.room);
  }

  get cameraActive() {
    return this.resenhaWebrtc.localVideoKind === "camera";
  }

  get screenShareActive() {
    return this.resenhaWebrtc.localVideoKind === "screen";
  }

  get cameraDisabled() {
    return (
      !this.cameraActive && !this.resenhaWebrtc.canPublishVideo(this.room?.id)
    );
  }

  get screenShareDisabled() {
    return (
      !this.screenShareActive &&
      !this.resenhaWebrtc.canPublishVideo(this.room?.id)
    );
  }

  get showScreenShare() {
    return this.videoAllowed && this.resenhaWebrtc.screenShareSupported;
  }

  get micTitle() {
    if (this.resenhaWebrtc.pttEnabled) {
      return i18n("resenha.ptt.controlled_by_ptt");
    }

    return this.resenhaWebrtc.audioEnabled
      ? i18n("resenha.room.mic_on")
      : i18n("resenha.room.mic_off");
  }

  get cameraTitle() {
    return this.cameraActive
      ? i18n("resenha.video.camera_off")
      : i18n("resenha.video.camera_on");
  }

  get screenShareTitle() {
    return this.screenShareActive
      ? i18n("resenha.video.screen_share_stop")
      : i18n("resenha.video.screen_share_start");
  }

  get deafenTitle() {
    return this.resenhaWebrtc.deafened
      ? i18n("resenha.room.deafen_off")
      : i18n("resenha.room.deafen_on");
  }

  get openRoomTitle() {
    return i18n("resenha.room.open_page");
  }

  @action
  openRoom() {
    if (this.room?.slug) {
      this.router.transitionTo("resenha-room", this.room.slug);
    }
  }

  @action
  leaveRoom() {
    this.resenhaWebrtc.leave(this.room);
  }

  @action
  toggleMute() {
    this.resenhaWebrtc.toggleMute();
  }

  @action
  toggleDeafen() {
    this.resenhaWebrtc.toggleDeafen();
  }

  @action
  toggleCamera() {
    this.resenhaWebrtc.toggleCamera();
  }

  @action
  toggleScreenShare() {
    this.resenhaWebrtc.toggleScreenShare();
  }

  @action
  noopAspect() {}

  <template>
    {{#if this.shouldRender}}
      <section
        class="resenha-call-widget"
        data-room-id={{this.room.id}}
        aria-label={{i18n "resenha.widget.title" room=this.room.name}}
      >
        <header class="resenha-call-widget__header">
          <button
            type="button"
            class="resenha-call-widget__room"
            title={{this.openRoomTitle}}
            {{on "click" this.openRoom}}
          >
            <span
              class="resenha-call-widget__room-name"
            >{{this.room.name}}</span>
            <span
              class="resenha-call-widget__state"
            >{{this.connectionState}}</span>
          </button>
        </header>

        <div class="resenha-call-widget__tiles">
          {{#each this.tiles key="participant.id" as |tile|}}
            <ResenhaVideoTile
              @room={{this.room}}
              @participant={{tile.participant}}
              @isSelf={{tile.isSelf}}
              @showVideo={{tile.showVideo}}
              @onAspect={{this.noopAspect}}
            />
          {{/each}}
        </div>

        <footer class="resenha-call-widget__controls">
          <DButton
            @action={{this.toggleMute}}
            @icon={{if
              this.resenhaWebrtc.audioEnabled
              "microphone"
              "microphone-slash"
            }}
            @translatedTitle={{this.micTitle}}
            @disabled={{this.resenhaWebrtc.pttEnabled}}
            class={{if this.resenhaWebrtc.audioEnabled "" "--off"}}
          />
          <DButton
            @action={{this.toggleDeafen}}
            @icon={{if this.resenhaWebrtc.deafened "volume-xmark" "ear-listen"}}
            @translatedTitle={{this.deafenTitle}}
            class={{if this.resenhaWebrtc.deafened "--off" ""}}
          />
          {{#if this.videoAllowed}}
            <button
              type="button"
              class={{dConcatClass
                "btn btn-icon no-text"
                (if this.cameraActive "--active")
              }}
              title={{this.cameraTitle}}
              aria-label={{this.cameraTitle}}
              disabled={{this.cameraDisabled}}
              {{on "click" this.toggleCamera}}
            >
              {{dIcon (if this.cameraActive "video" "video-slash")}}
            </button>
          {{/if}}
          {{#if this.showScreenShare}}
            <button
              type="button"
              class={{dConcatClass
                "btn btn-icon no-text"
                (if this.screenShareActive "--active")
              }}
              title={{this.screenShareTitle}}
              aria-label={{this.screenShareTitle}}
              disabled={{this.screenShareDisabled}}
              {{on "click" this.toggleScreenShare}}
            >
              {{dIcon "display"}}
            </button>
          {{/if}}
          <DButton
            @action={{this.openRoom}}
            @icon="up-right-from-square"
            @translatedTitle={{this.openRoomTitle}}
          />
          <DButton
            @action={{this.leaveRoom}}
            @icon="phone-slash"
            @label="resenha.room.leave"
            class="btn-danger resenha-call-widget__leave"
          />
        </footer>
      </section>
    {{/if}}
  </template>
}
