import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { service } from "@ember/service";
import { i18n } from "discourse-i18n";

const MAX_VISIBLE_LINES = 3;
const LINE_TTL_MS = 10000;
const PRUNE_INTERVAL_MS = 1000;

export default class ResenhaCaptionOverlay extends Component {
  @service resenhaWebrtc;

  // Bumped on a timer so lines fall off the overlay once they go stale,
  // not only when a newer caption pushes them out.
  @tracked now = Date.now();

  #pruneTimer = setInterval(() => {
    this.now = Date.now();
  }, PRUNE_INTERVAL_MS);

  willDestroy() {
    super.willDestroy(...arguments);
    clearInterval(this.#pruneTimer);
  }

  get visibleCaptions() {
    const cutoff = this.now - LINE_TTL_MS;
    return this.resenhaWebrtc
      .captionsFor(this.args.room.id)
      .filter((caption) => caption.at > cutoff)
      .slice(-MAX_VISIBLE_LINES);
  }

  get showLoading() {
    return this.resenhaWebrtc.subtitlesLoading && !this.visibleCaptions.length;
  }

  get loadingLabel() {
    const percent = this.resenhaWebrtc.subtitlesProgress;
    if (percent !== null) {
      return i18n("resenha.subtitles.downloading", { percent });
    }
    return i18n("resenha.subtitles.loading");
  }

  <template>
    {{#if this.resenhaWebrtc.subtitlesEnabled}}
      <div class="resenha-captions" aria-live="polite">
        {{#if this.showLoading}}
          <p class="resenha-captions__line --loading">
            {{this.loadingLabel}}
          </p>
        {{else}}
          {{#each this.visibleCaptions key="id" as |caption|}}
            <p
              class="resenha-captions__line {{if caption.interim '--interim'}}"
            >
              {{#if caption.username}}
                <span
                  class="resenha-captions__speaker"
                >{{caption.username}}</span>
              {{/if}}
              {{caption.text}}
            </p>
          {{/each}}
        {{/if}}
      </div>
    {{/if}}
  </template>
}
