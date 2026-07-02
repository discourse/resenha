import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { getOwner } from "@ember/owner";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import { next } from "@ember/runloop";
import { service } from "@ember/service";
import { htmlSafe } from "@ember/template";
import DButton from "discourse/components/d-button";
import dConcatClass from "discourse/ui-kit/helpers/d-concat-class";
import dIcon from "discourse/ui-kit/helpers/d-icon";
import { i18n } from "discourse-i18n";
import {
  toggleFullscreen,
  trackFullscreen,
} from "../../lib/resenha/fullscreen";
import {
  bestRowHeight,
  DEFAULT_TILE_ASPECT,
  trackGridSize,
} from "../../lib/resenha/video-grid-layout";
import ResenhaChatPanel from "./chat-panel";
import ResenhaVideoTile from "./video-tile";

const MOBILE_VIDEO_TILE_BUDGET = 4;

export default class ResenhaRoomPage extends Component {
  @service capabilities;
  @service currentUser;
  @service router;
  @service resenhaRooms;
  @service resenhaWebrtc;
  @service siteSettings;

  @tracked gridWidth = 0;
  @tracked gridHeight = 0;
  @tracked gridGap = 0;
  @tracked stageWidth = 0;
  @tracked stageHeight = 0;
  @tracked stageGap = 0;
  @tracked tileAspects = new Map();
  @tracked gridFullscreen = false;
  @tracked chatOpen = !!this.args.openChat;

  gridElement = null;
  controlsElement = null;

  trackGridSize = trackGridSize;
  trackFullscreen = trackFullscreen;

  willDestroy() {
    super.willDestroy(...arguments);
    const resenhaWebrtc = this.resenhaWebrtc;
    const roomId = this.args.room.id;
    const keepVideo = resenhaWebrtc.isActiveRoom(roomId);

    next(() => {
      resenhaWebrtc.setWatching(roomId, false, { keepVideo });
    });
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

  @action
  updateGridSize(width, height, gap) {
    this.gridWidth = width;
    this.gridHeight = height;
    this.gridGap = gap;
  }

  @action
  updateStageSize(width, height, gap) {
    this.stageWidth = width;
    this.stageHeight = height;
    this.stageGap = gap;
  }

  @action
  registerGrid(element) {
    this.gridElement = element;
  }

  @action
  registerControls(element) {
    this.controlsElement = element;
  }

  @action
  watchRoom() {
    next(this, () => {
      if (this.isDestroying || this.isDestroyed) {
        return;
      }

      this.resenhaWebrtc.setWatching(this.args.room.id, true);
    });
  }

  @action
  setGridFullscreen(isFullscreen) {
    this.gridFullscreen = isFullscreen;
  }

  @action
  toggleGridFullscreen() {
    toggleFullscreen(this.gridElement);
  }

  get gridFullscreenTitle() {
    return this.gridFullscreen
      ? i18n("resenha.video.exit_fullscreen")
      : i18n("resenha.video.fullscreen_all");
  }

  @action
  reportTileAspect(participantId, aspect) {
    const current = this.tileAspects.get(participantId) ?? null;
    if (current === aspect) {
      return;
    }

    const nextAspects = new Map(this.tileAspects);
    if (aspect) {
      nextAspects.set(participantId, aspect);
    } else {
      nextAspects.delete(participantId);
    }
    this.tileAspects = nextAspects;
  }

  get gridStyle() {
    // The grid hugs its rows so the controls can sit right below the videos;
    // tile size is computed from the stage (the space the grid MAY use: stage
    // minus the controls), except in fullscreen where the grid itself is the
    // sized box again.
    let width, height;
    if (this.gridFullscreen) {
      width = this.gridWidth;
      height = this.gridHeight;
    } else {
      width = this.stageWidth;
      height =
        this.stageHeight -
        (this.controlsElement?.offsetHeight ?? 0) -
        this.stageGap;
    }

    if (!this.tiles.length || !width || height <= 0) {
      return null;
    }

    const aspects = this.tiles.map(
      (tile) => this.tileAspects.get(tile.participant.id) ?? DEFAULT_TILE_ASPECT
    );

    const rowHeight = bestRowHeight(width, height, aspects, this.gridGap);

    if (rowHeight <= 0) {
      return null;
    }

    return htmlSafe(`--resenha-tile-height: ${rowHeight}px;`);
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
  dockRoom() {
    this.router.transitionTo("discovery.latest");
  }

  get chatAvailable() {
    return this.room.chat_available;
  }

  get chatVisible() {
    return this.chatOpen && this.joined && this.chatAvailable;
  }

  get chatToggleTitle() {
    return this.chatOpen
      ? i18n("resenha.chat.close")
      : i18n("resenha.chat.open");
  }

  @action
  toggleChat() {
    this.setChatOpen(!this.chatOpen);
  }

  @action
  closeChat() {
    this.setChatOpen(false);
  }

  setChatOpen(open) {
    this.chatOpen = open;
    this.router.transitionTo({ queryParams: { chat: open } });
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
    <section
      class={{dConcatClass
        "resenha-room-page"
        (if this.chatVisible "--chat-open")
      }}
      {{didInsert this.watchRoom}}
    >
      <div class="resenha-room-page__body">
        <div class="resenha-room-page__main">
          <header class="resenha-room-page__header">
            <h1 class="resenha-room-page__title">{{this.room.name}}</h1>
            {{#if this.room.description_excerpt}}
              <p class="resenha-room-page__description">
                {{this.room.description_excerpt}}
              </p>
            {{/if}}
          </header>

          <div
            class="resenha-room-page__stage"
            {{this.trackGridSize this.updateStageSize}}
          >
            {{#if this.tiles.length}}
              <div
                class="resenha-room-page__grid"
                style={{this.gridStyle}}
                {{didInsert this.registerGrid}}
                {{this.trackGridSize this.updateGridSize}}
                {{this.trackFullscreen this.setGridFullscreen}}
              >
                <button
                  type="button"
                  class="btn btn-icon no-text resenha-room-page__fullscreen"
                  title={{this.gridFullscreenTitle}}
                  aria-label={{this.gridFullscreenTitle}}
                  {{on "click" this.toggleGridFullscreen}}
                >
                  {{dIcon (if this.gridFullscreen "compress" "expand")}}
                </button>

                {{#each this.tiles key="participant.id" as |tile|}}
                  <ResenhaVideoTile
                    @room={{this.room}}
                    @participant={{tile.participant}}
                    @isSelf={{tile.isSelf}}
                    @showVideo={{tile.showVideo}}
                    @onAspect={{this.reportTileAspect}}
                  />
                {{/each}}
              </div>
            {{else}}
              <div class="resenha-room-page__empty">
                {{i18n "resenha.room_page.empty"}}
              </div>
            {{/if}}
            <footer
              class="resenha-room-page__controls"
              {{didInsert this.registerControls}}
            >
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
                  @icon={{if
                    this.resenhaWebrtc.deafened
                    "volume-xmark"
                    "ear-listen"
                  }}
                  @translatedTitle={{this.deafenTitle}}
                  class={{if this.resenhaWebrtc.deafened "--off" ""}}
                />
                {{! Capture buttons are plain <button>s on purpose: DButton defers
              its action via next(), which lands outside the click event
              dispatch — Firefox only allows getDisplayMedia during the
              actual dispatch, so a deferred call throws NotAllowedError. }}
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
                {{#if this.chatAvailable}}
                  <button
                    type="button"
                    class={{dConcatClass
                      "btn btn-icon no-text resenha-room-page__chat-toggle"
                      (if this.chatVisible "--active")
                    }}
                    title={{this.chatToggleTitle}}
                    aria-label={{this.chatToggleTitle}}
                    {{on "click" this.toggleChat}}
                  >
                    {{dIcon "far-comment"}}
                    {{! Zero-width space: matches DButton so an icon-only button keeps
                  full button height and aligns with its DButton siblings. }}
                    <span aria-hidden="true">&#8203;</span>
                  </button>
                {{/if}}
                <DButton
                  @action={{this.dockRoom}}
                  @icon="compress"
                  @ariaLabel="resenha.room.widget_mode"
                />
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
          </div>
        </div>

        {{#if this.chatVisible}}
          <aside class="resenha-room-page__sidebar">
            <ResenhaChatPanel @room={{this.room}} @onClose={{this.closeChat}} />
          </aside>
        {{/if}}
      </div>
    </section>
  </template>
}
