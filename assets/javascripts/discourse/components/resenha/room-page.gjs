import Component from "@glimmer/component";
import { action } from "@ember/object";
import { getOwner } from "@ember/owner";
import { service } from "@ember/service";
import DButton from "discourse/components/d-button";
import { i18n } from "discourse-i18n";
import ResenhaVideoTile from "./video-tile";

const MOBILE_VIDEO_TILE_BUDGET = 4;

export default class ResenhaRoomPage extends Component {
  @service capabilities;
  @service currentUser;
  @service resenhaRooms;
  @service resenhaWebrtc;
  @service siteSettings;

  constructor() {
    super(...arguments);
    this.resenhaWebrtc.setWatching(this.args.room.id, true);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.resenhaWebrtc.setWatching(this.args.room.id, false);
  }

  get room() {
    return (
      this.resenhaRooms.rooms.find((room) => room.id === this.args.room.id) ??
      this.args.room
    );
  }

  get connectionState() {
    return this.resenhaWebrtc.connectionStateFor(this.room.id);
  }

  get joined() {
    return this.connectionState === "connected";
  }

  get connecting() {
    return this.connectionState === "connecting";
  }

  get videoAllowed() {
    return this.resenhaWebrtc.videoAllowedIn(this.room);
  }

  get participants() {
    return this.room.active_participants || [];
  }

  get tiles() {
    const budget = this.capabilities.viewport.md
      ? Infinity
      : MOBILE_VIDEO_TILE_BUDGET;
    let videoCount = 0;

    return this.participants.map((participant) => {
      const isSelf = participant.id === this.currentUser?.id;
      const publishing = isSelf
        ? !!this.resenhaWebrtc.localVideoKind
        : participant.is_video_on || participant.is_screen_sharing;
      const showVideo = publishing && videoCount < budget;
      if (showVideo) {
        videoCount++;
      }
      return { participant, isSelf, showVideo };
    });
  }

  get cameraActive() {
    return this.resenhaWebrtc.localVideoKind === "camera";
  }

  get screenShareActive() {
    return this.resenhaWebrtc.localVideoKind === "screen";
  }

  get cameraDisabled() {
    return (
      !this.cameraActive && !this.resenhaWebrtc.canPublishVideo(this.room.id)
    );
  }

  get screenShareDisabled() {
    return (
      !this.screenShareActive &&
      !this.resenhaWebrtc.canPublishVideo(this.room.id)
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

  @action
  joinRoom() {
    if (!this.currentUser) {
      getOwner(this).lookup("route:application").send("showLogin");
      return;
    }
    this.resenhaWebrtc.join(this.room);
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

  <template>
    <section class="resenha-room-page">
      <header class="resenha-room-page__header">
        <h1 class="resenha-room-page__title">{{this.room.name}}</h1>
        {{#if this.room.description_excerpt}}
          <p class="resenha-room-page__description">
            {{this.room.description_excerpt}}
          </p>
        {{/if}}
      </header>

      {{#if this.tiles.length}}
        <div class="resenha-room-page__grid">
          {{#each this.tiles key="participant.id" as |tile|}}
            <ResenhaVideoTile
              @room={{this.room}}
              @participant={{tile.participant}}
              @isSelf={{tile.isSelf}}
              @showVideo={{tile.showVideo}}
            />
          {{/each}}
        </div>
      {{else}}
        <div class="resenha-room-page__empty">
          {{i18n "resenha.room_page.empty"}}
        </div>
      {{/if}}

      <footer class="resenha-room-page__controls">
        {{#if this.joined}}
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
            <DButton
              @action={{this.toggleCamera}}
              @icon={{if this.cameraActive "video" "video-slash"}}
              @translatedTitle={{this.cameraTitle}}
              @disabled={{this.cameraDisabled}}
              class={{if this.cameraActive "--active" ""}}
            />
          {{/if}}
          {{#if this.showScreenShare}}
            <DButton
              @action={{this.toggleScreenShare}}
              @icon="display"
              @translatedTitle={{this.screenShareTitle}}
              @disabled={{this.screenShareDisabled}}
              class={{if this.screenShareActive "--active" ""}}
            />
          {{/if}}
          <DButton
            @action={{this.leaveRoom}}
            @icon="phone-slash"
            @label="resenha.room.leave"
            class="btn-danger resenha-room-page__leave"
          />
        {{else}}
          <DButton
            @action={{this.joinRoom}}
            @icon="phone"
            @label="resenha.room.join"
            @disabled={{this.connecting}}
            @isLoading={{this.connecting}}
            class="btn-primary resenha-room-page__join"
          />
        {{/if}}
      </footer>
    </section>
  </template>
}
