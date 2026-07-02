import Component from "@glimmer/component";
import { fn } from "@ember/helper";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import didUpdate from "@ember/render-modifiers/modifiers/did-update";
import { service } from "@ember/service";

export default class ResenhaVoiceCanvas extends Component {
  @service resenhaWebrtc;

  get localStream() {
    return this.resenhaWebrtc.localStream;
  }

  get remoteStreams() {
    return this.resenhaWebrtc.remoteStreams;
  }

  get remoteScreenAudioStreams() {
    return this.resenhaWebrtc.remoteScreenAudioStreams;
  }

  <template>
    <section class="resenha-voice-canvas">
      {{#if this.localStream}}
        <audio
          {{didInsert (fn this.resenhaWebrtc.attachStream this.localStream)}}
          {{didUpdate
            (fn this.resenhaWebrtc.attachStream this.localStream)
            this.localStream
          }}
          autoplay
          muted
          playsinline
        />
      {{/if}}

      {{#each this.remoteStreams key="id" as |stream|}}
        <audio
          {{didInsert (fn this.resenhaWebrtc.attachStream stream)}}
          {{didUpdate (fn this.resenhaWebrtc.attachStream stream) stream}}
          autoplay
          playsinline
        />
      {{/each}}

      {{#each this.remoteScreenAudioStreams key="id" as |stream|}}
        <audio
          {{didInsert (fn this.resenhaWebrtc.attachStream stream)}}
          {{didUpdate (fn this.resenhaWebrtc.attachStream stream) stream}}
          autoplay
          playsinline
        />
      {{/each}}
    </section>
  </template>
}
