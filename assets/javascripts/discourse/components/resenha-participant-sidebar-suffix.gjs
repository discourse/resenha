import dIcon from "discourse/ui-kit/helpers/d-icon";
import { i18n } from "discourse-i18n";

const ResenhaParticipantSidebarSuffix = <template>
  {{! Always rendered, even with no icons — this is the element that pushes
      itself and the hover menu button to the right edge of the row. }}
  <span class="resenha-participant-suffix">
    {{#if @suffixArgs.isScreenSharing}}
      {{dIcon "display" title="resenha.participant.status_screen_sharing"}}
    {{/if}}
    {{#if @suffixArgs.isVideoOn}}
      {{dIcon "video" title="resenha.participant.status_video"}}
    {{/if}}
    {{#if @suffixArgs.isPtt}}
      {{dIcon "walkie-talkie" title="resenha.participant.status_ptt"}}
    {{/if}}
    {{#if @suffixArgs.isSpeaking}}
      <span
        class="resenha-participant-suffix__bars"
        title={{i18n "resenha.participant.status_speaking"}}
      ></span>
    {{/if}}
    {{#if @suffixArgs.isMuted}}
      {{dIcon "microphone-slash" title="resenha.participant.status_muted"}}
    {{/if}}
    {{#if @suffixArgs.isDeafened}}
      {{dIcon "volume-xmark" title="resenha.participant.status_deafened"}}
    {{/if}}
  </span>
</template>;

export default ResenhaParticipantSidebarSuffix;
