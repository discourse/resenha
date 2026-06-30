import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import { service } from "@ember/service";
import { htmlSafe } from "@ember/template";
import DButton from "discourse/components/d-button";
import dConcatClass from "discourse/ui-kit/helpers/d-concat-class";
import dIcon from "discourse/ui-kit/helpers/d-icon";
import { i18n } from "discourse-i18n";
import ResenhaVideoTile from "./video-tile";

const WIDGET_VIDEO_TILE_BUDGET = 4;
const WIDGET_VIEWPORT_MARGIN = 16;
const WIDGET_MIN_WIDTH = 240;
const WIDGET_MIN_HEIGHT = 180;
const WIDGET_SIZE_KEY = "resenha-widget-size";

function clamp(value, min, max) {
  if (max < min) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

export default class ResenhaCallWidget extends Component {
  @service currentUser;
  @service router;
  @service resenhaRooms;
  @service resenhaWebrtc;
  @service keyValueStore;

  @tracked widgetWidth = null;
  @tracked widgetHeight = null;
  @tracked resizing = false;

  widgetElement = null;
  resizeState = null;

  constructor() {
    super(...arguments);
    this.#loadSize();
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.#removeResizeListeners();
  }

  #loadSize() {
    const raw = this.keyValueStore.get(WIDGET_SIZE_KEY);
    if (!raw) {
      return;
    }
    try {
      const { width, height } = JSON.parse(raw);
      this.widgetWidth = this.#clampWidth(width);
      this.widgetHeight = this.#clampHeight(height);
    } catch {
      this.widgetWidth = null;
      this.widgetHeight = null;
    }
  }

  #saveSize() {
    this.keyValueStore.set({
      key: WIDGET_SIZE_KEY,
      value: JSON.stringify({
        width: this.widgetWidth,
        height: this.widgetHeight,
      }),
    });
  }

  #clampWidth(width) {
    if (!width) {
      return null;
    }
    return clamp(
      width,
      WIDGET_MIN_WIDTH,
      window.innerWidth - WIDGET_VIEWPORT_MARGIN * 2
    );
  }

  #clampHeight(height) {
    if (!height) {
      return null;
    }
    return clamp(
      height,
      WIDGET_MIN_HEIGHT,
      window.innerHeight - WIDGET_VIEWPORT_MARGIN * 2
    );
  }

  get room() {
    return this.resenhaWebrtc.activeRoom;
  }

  get shouldRender() {
    return !!this.room && !this.onActiveRoomPage;
  }

  get onActiveRoomPage() {
    return this.router.currentURL === `/resenha/r/${this.room?.slug}`;
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

  get resized() {
    return !!(this.widgetWidth && this.widgetHeight);
  }

  get widgetStyle() {
    const parts = [];

    const width = this.#clampWidth(this.widgetWidth);
    const height = this.#clampHeight(this.widgetHeight);

    if (width) {
      parts.push(`width: ${width}px;`);
    }
    if (height) {
      parts.push(`height: ${height}px; max-height: ${height}px;`);
    }

    return parts.length ? htmlSafe(parts.join(" ")) : null;
  }

  @action
  openRoom() {
    if (this.room?.slug) {
      this.router.transitionTo("resenha-room", this.room.slug);
    }
  }

  @action
  startResize(event) {
    if (event.type === "mousedown" && event.button !== 0) {
      return;
    }
    if (!this.widgetElement) {
      return;
    }

    const rect = this.widgetElement.getBoundingClientRect();
    this.resizeState = { anchorX: rect.right, anchorY: rect.bottom };
    this.resizing = true;

    window.addEventListener("mousemove", this.resizeWidget);
    window.addEventListener("touchmove", this.resizeWidget, { passive: false });
    window.addEventListener("mouseup", this.stopResize);
    window.addEventListener("touchend", this.stopResize);

    event.preventDefault();
    event.stopPropagation();
  }

  @action
  resizeWidget(event) {
    const state = this.resizeState;
    if (!state) {
      return;
    }

    const point = this.#eventPoint(event);
    if (!point) {
      return;
    }

    const maxWidth = window.innerWidth - WIDGET_VIEWPORT_MARGIN * 2;
    const maxHeight = window.innerHeight - WIDGET_VIEWPORT_MARGIN * 2;

    this.widgetWidth = clamp(
      Math.abs(point.x - state.anchorX),
      WIDGET_MIN_WIDTH,
      maxWidth
    );
    this.widgetHeight = clamp(
      Math.abs(point.y - state.anchorY),
      WIDGET_MIN_HEIGHT,
      maxHeight
    );

    if (event.cancelable) {
      event.preventDefault();
    }
  }

  @action
  stopResize() {
    if (!this.resizeState) {
      return;
    }

    this.#removeResizeListeners();
    this.resizeState = null;
    this.resizing = false;
    this.#saveSize();
  }

  #removeResizeListeners() {
    window.removeEventListener("mousemove", this.resizeWidget);
    window.removeEventListener("touchmove", this.resizeWidget);
    window.removeEventListener("mouseup", this.stopResize);
    window.removeEventListener("touchend", this.stopResize);
  }

  #eventPoint(event) {
    const touch =
      event.touches?.[0] ||
      event.changedTouches?.[0] ||
      (event.clientX != null ? event : null);
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
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

  @action
  registerWidget(element) {
    this.widgetElement = element;
  }

  <template>
    {{! template-lint-disable no-pointer-down-event-binding no-invalid-interactive }}
    {{#if this.shouldRender}}
      <section
        class={{dConcatClass
          "resenha-call-widget"
          (if this.resizing "--resizing")
          (if this.resized "--resized")
        }}
        style={{this.widgetStyle}}
        data-room-id={{this.room.id}}
        aria-label={{i18n "resenha.widget.title" room=this.room.name}}
        {{didInsert this.registerWidget}}
      >
        <header class="resenha-call-widget__header">
          <div class="resenha-call-widget__room" role="heading" aria-level="2">
            <span
              class="resenha-call-widget__room-name"
            >{{this.room.name}}</span>
          </div>
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
            @icon="expand"
            @translatedTitle={{this.openRoomTitle}}
          />
          <DButton
            @action={{this.leaveRoom}}
            @icon="phone-slash"
            @label="resenha.room.leave"
            class="btn-danger resenha-call-widget__leave"
          />
        </footer>

        <div
          class="resenha-call-widget__resize"
          aria-hidden="true"
          {{on "mousedown" this.startResize}}
          {{on "touchstart" this.startResize}}
        ></div>
      </section>
    {{/if}}
  </template>
}
