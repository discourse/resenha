import Component from "@glimmer/component";
import { fn } from "@ember/helper";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import didUpdate from "@ember/render-modifiers/modifiers/did-update";
import { service } from "@ember/service";
import { avatarUrl } from "discourse/lib/avatar-utils";
import { eq } from "discourse/truth-helpers";
import dConcatClass from "discourse/ui-kit/helpers/d-concat-class";
import dIcon from "discourse/ui-kit/helpers/d-icon";

export default class ResenhaVideoTile extends Component {
  @service resenhaWebrtc;

  get participant() {
    return this.args.participant;
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
    >
      {{#if this.showVideo}}
        <video
          class="resenha-video-tile__video"
          {{didInsert (fn this.resenhaWebrtc.attachVideoStream this.stream)}}
          {{didUpdate
            (fn this.resenhaWebrtc.attachVideoStream this.stream)
            this.stream
          }}
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
    </div>
  </template>
}
