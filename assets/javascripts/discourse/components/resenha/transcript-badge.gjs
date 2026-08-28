import Component from "@glimmer/component";
import { service } from "@ember/service";
import DTooltip from "discourse/float-kit/components/d-tooltip";
import dIcon from "discourse/ui-kit/helpers/d-icon";
import { i18n } from "discourse-i18n";

// The transcript consent signal: a quiet pill rendered wherever a room's
// call is shown, so nobody can be transcribed without a way of noticing.
// Deliberately calmer than the recording badge — the transcript never
// leaves the recorder's browser.
export default class ResenhaTranscriptBadge extends Component {
  @service currentUser;
  @service resenhaWebrtc;

  get selfTranscribing() {
    return this.resenhaWebrtc.isTranscribingRoom(this.args.room.id);
  }

  get otherTranscribers() {
    return (this.args.room.active_participants || [])
      .filter(
        (participant) =>
          participant?.is_transcribing &&
          Number(participant.id) !== this.currentUser?.id
      )
      .map((participant) => participant.username);
  }

  get visible() {
    return this.selfTranscribing || this.otherTranscribers.length > 0;
  }

  get transcriberNames() {
    const names = this.otherTranscribers;
    if (this.selfTranscribing) {
      names.unshift(i18n("resenha.transcript.transcriber_you"));
    }
    return names;
  }

  get tooltip() {
    const names = this.transcriberNames;
    if (this.selfTranscribing && names.length === 1) {
      return i18n("resenha.transcript.indicator_tooltip_self");
    }
    return i18n("resenha.transcript.indicator_tooltip", {
      count: names.length,
      usernames: names.join(", "),
    });
  }

  // While the model is still loading/downloading there would otherwise be no
  // feedback at all when captions are off, so the badge doubles as progress.
  get label() {
    if (this.selfTranscribing && this.resenhaWebrtc.subtitlesLoading) {
      const percent = this.resenhaWebrtc.subtitlesProgress;
      return percent !== null
        ? i18n("resenha.subtitles.downloading", { percent })
        : i18n("resenha.subtitles.loading");
    }
    return i18n("resenha.transcript.indicator");
  }

  <template>
    {{#if this.visible}}
      <DTooltip
        @identifier="resenha-transcript-badge"
        @placement="bottom"
        class="resenha-transcript-badge"
      >
        <:trigger>
          {{dIcon "closed-captioning"}}
          <span class="resenha-transcript-badge__label">
            {{this.label}}
          </span>
        </:trigger>
        <:content>
          {{this.tooltip}}
        </:content>
      </DTooltip>
    {{/if}}
  </template>
}
