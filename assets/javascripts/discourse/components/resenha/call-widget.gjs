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
const DRAG_AXIS_THRESHOLD = 4;
const DRAG_HOLD_DELAY_MS = 250;

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

  @tracked dockEdge = "bottom";
  @tracked dockOffset = null;
  @tracked dragging = false;

  widgetElement = null;
  dragState = null;
  dragHoldTimer = null;

  willDestroy() {
    super.willDestroy(...arguments);
    window.clearTimeout(this.dragHoldTimer);
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

  get widgetStyle() {
    if (this.dockOffset === null) {
      return null;
    }

    if (this.dockEdge === "right") {
      return htmlSafe(
        `inset-block-start: ${this.dockOffset}px; inset-block-end: auto; inset-inline-start: auto; inset-inline-end: ${WIDGET_VIEWPORT_MARGIN}px;`
      );
    }

    return htmlSafe(
      `inset-inline-start: ${this.dockOffset}px; inset-inline-end: auto; inset-block-start: auto; inset-block-end: ${WIDGET_VIEWPORT_MARGIN}px;`
    );
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

  @action
  registerWidget(element) {
    this.widgetElement = element;
  }

  @action
  startDrag(event) {
    if (event.button !== 0 || !this.widgetElement) {
      return;
    }

    const rect = this.widgetElement.getBoundingClientRect();
    this.dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      rect,
      axis: null,
      armed: false,
    };
    this.widgetElement.setPointerCapture?.(event.pointerId);
    this.dragHoldTimer = window.setTimeout(() => {
      if (this.dragState?.pointerId === event.pointerId) {
        this.dragState.armed = true;
        this.dragging = true;
      }
    }, DRAG_HOLD_DELAY_MS);
    event.preventDefault();
  }

  @action
  dragWidget(event) {
    if (!this.dragState || event.pointerId !== this.dragState.pointerId) {
      return;
    }

    const deltaX = event.clientX - this.dragState.startX;
    const deltaY = event.clientY - this.dragState.startY;

    if (!this.dragState.armed) {
      if (
        Math.abs(deltaX) >= DRAG_AXIS_THRESHOLD ||
        Math.abs(deltaY) >= DRAG_AXIS_THRESHOLD
      ) {
        window.clearTimeout(this.dragHoldTimer);
        this.dragHoldTimer = null;
      }
      return;
    }

    let axis = this.dragState.axis;

    if (!axis) {
      if (
        Math.abs(deltaX) < DRAG_AXIS_THRESHOLD &&
        Math.abs(deltaY) < DRAG_AXIS_THRESHOLD
      ) {
        return;
      }
      axis = Math.abs(deltaX) >= Math.abs(deltaY) ? "x" : "y";
      this.dragState.axis = axis;
    }

    const { rect } = this.dragState;
    if (axis === "y") {
      this.dockEdge = "right";
      this.dockOffset = clamp(
        rect.top + deltaY,
        WIDGET_VIEWPORT_MARGIN,
        window.innerHeight - rect.height - WIDGET_VIEWPORT_MARGIN
      );
    } else {
      this.dockEdge = "bottom";
      this.dockOffset = clamp(
        rect.left + deltaX,
        WIDGET_VIEWPORT_MARGIN,
        window.innerWidth - rect.width - WIDGET_VIEWPORT_MARGIN
      );
    }

    event.preventDefault();
  }

  @action
  stopDrag(event) {
    if (!this.dragState || event.pointerId !== this.dragState.pointerId) {
      return;
    }

    window.clearTimeout(this.dragHoldTimer);
    this.dragHoldTimer = null;
    this.widgetElement?.releasePointerCapture?.(event.pointerId);
    this.dragState = null;
    this.dragging = false;
  }

  <template>
    {{! eslint-disable ember/template-no-pointer-down-event-binding }}
    {{#if this.shouldRender}}
      <section
        class={{dConcatClass
          "resenha-call-widget"
          (if this.dragging "--dragging")
        }}
        style={{this.widgetStyle}}
        data-room-id={{this.room.id}}
        aria-label={{i18n "resenha.widget.title" room=this.room.name}}
        {{didInsert this.registerWidget}}
        {{on "pointermove" this.dragWidget}}
        {{on "pointerup" this.stopDrag}}
        {{on "pointercancel" this.stopDrag}}
      >
        <header class="resenha-call-widget__header">
          <div
            class="resenha-call-widget__room"
            role="heading"
            aria-level="2"
            {{on "pointerdown" this.startDrag}}
          >
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
      </section>
    {{/if}}
  </template>
}
