import Component from "@glimmer/component";
import { service } from "@ember/service";
import { modifier } from "ember-modifier";
import ResenhaCallWidget from "./call-widget";
import ResenhaVoiceCanvas from "./voice-canvas";

// Always-mounted host for the call surfaces: the hidden audio sinks (which
// must stay in the main document — output-device routing doesn't survive
// crossing documents) and exactly one call widget, rendered either as the
// normal floating surface or into the picture-in-picture window's body.
export default class ResenhaGlobalCallLayer extends Component {
  @service resenhaPip;
  @service resenhaWebrtc;

  // Auto-pip eligibility follows call state: while a call is active the
  // browser may fire enterpictureinpicture on tab switch; when the call ends
  // (any teardown path — they all funnel through activeRoomId) the handler
  // goes away and an open pip window is dismissed with it.
  autoPipGate = modifier(() => {
    this.resenhaPip.enableAutoPip();

    return () => {
      this.resenhaPip.disableAutoPip();
      this.resenhaPip.close();
    };
  });

  <template>
    <ResenhaVoiceCanvas />

    {{#if this.resenhaWebrtc.hasActiveRoom}}
      <span hidden {{this.autoPipGate}}></span>
    {{/if}}

    {{#if this.resenhaPip.pipBody}}
      {{#in-element this.resenhaPip.pipBody}}
        <ResenhaCallWidget @pipMode={{true}} />
      {{/in-element}}
    {{else}}
      <ResenhaCallWidget />
    {{/if}}
  </template>
}
