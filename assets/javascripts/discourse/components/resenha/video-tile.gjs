import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { fn } from "@ember/helper";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import didUpdate from "@ember/render-modifiers/modifiers/did-update";
import { service } from "@ember/service";
import { htmlSafe } from "@ember/template";
import { avatarUrl } from "discourse/lib/avatar-utils";
import { eq } from "discourse/truth-helpers";
import dConcatClass from "discourse/ui-kit/helpers/d-concat-class";
import dIcon from "discourse/ui-kit/helpers/d-icon";
import { i18n } from "discourse-i18n";
import {
  toggleTileFullscreen,
  trackFullscreen,
} from "../../lib/resenha/fullscreen";
import {
  DEFAULT_TILE_ASPECT,
  trackVideoAspect,
} from "../../lib/resenha/video-grid-layout";

export default class ResenhaVideoTile extends Component {
  @service resenhaWebrtc;

  @tracked aspect = null;
  @tracked isFullscreen = false;

  trackVideoAspect = trackVideoAspect;
  trackFullscreen = trackFullscreen;

  get participant() {
    return this.args.participant;
  }

  get tileStyle() {
    return htmlSafe(`aspect-ratio: ${this.aspect ?? DEFAULT_TILE_ASPECT};`);
  }

  @action
  handleAspect(aspect) {
    this.aspect = aspect;
    this.args.onAspect?.(this.participant.id, aspect);
  }

  @action
  setFullscreen(isFullscreen) {
    this.isFullscreen = isFullscreen;
  }

  @action
  toggleFullscreen(event) {
    toggleTileFullscreen(event.currentTarget.closest(".resenha-video-tile"));
  }

  get fullscreenTitle() {
    return this.isFullscreen
      ? i18n("resenha.video.exit_fullscreen")
      : i18n("resenha.video.fullscreen");
  }

  get stream() {
    if (this.args.isSelf) {
      return this.resenhaWebrtc.localVideoStream;
    }

    return this.resenhaWebrtc.remoteStreamFor(
      this.args.room.id,
      this.participant.id
    );
  }

  get publishingKind() {
    if (this.args.isSelf) {
      return this.resenhaWebrtc.localVideoKind;
    }

    if (this.participant.is_screen_sharing) {
      return "screen";
    }

    if (this.participant.is_video_on) {
      return "camera";
    }

    return null;
  }

  get showVideo() {
    return this.args.showVideo && !!this.publishingKind && !!this.stream;
  }

  get avatarSrc() {
    return avatarUrl(this.participant.avatar_template, "huge");
  }

  get displayName() {
    return this.participant.name || this.participant.username;
  }

  <template>
    <div
      class={{dConcatClass
        "resenha-video-tile"
        (if this.showVideo "--video" "--avatar")
        (if (eq this.publishingKind "screen") "--screen")
        (if @isSelf "--self")
        (if this.participant.is_speaking "--speaking")
      }}
      data-user-id={{this.participant.id}}
      style={{this.tileStyle}}
      {{this.trackFullscreen this.setFullscreen}}
    >
      {{#if this.showVideo}}
        <video
          class="resenha-video-tile__video"
          {{didInsert (fn this.resenhaWebrtc.attachVideoStream this.stream)}}
          {{didUpdate
            (fn this.resenhaWebrtc.attachVideoStream this.stream)
            this.stream
          }}
          {{this.trackVideoAspect this.handleAspect}}
          muted
          autoplay
          playsinline
        ></video>
      {{else}}
        <div class="resenha-video-tile__avatar">
          <img src={{this.avatarSrc}} alt={{this.displayName}} />
        </div>
      {{/if}}

      <div class="resenha-video-tile__info">
        <span class="resenha-video-tile__name">{{this.displayName}}</span>
        {{#if this.participant.is_muted}}
          {{dIcon "microphone-slash"}}
        {{/if}}
        {{#if this.participant.is_deafened}}
          {{dIcon "volume-xmark"}}
        {{/if}}
        {{#if (eq this.publishingKind "screen")}}
          {{dIcon "display"}}
        {{/if}}
      </div>

      {{#if this.showVideo}}
        <button
          type="button"
          class="btn btn-icon no-text resenha-video-tile__fullscreen"
          title={{this.fullscreenTitle}}
          aria-label={{this.fullscreenTitle}}
          {{on "click" this.toggleFullscreen}}
        >
          {{dIcon (if this.isFullscreen "compress" "expand")}}
        </button>
      {{/if}}
    </div>
  </template>
}
