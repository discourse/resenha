import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import DButton from "discourse/ui-kit/d-button";
import DConditionalLoadingSpinner from "discourse/ui-kit/d-conditional-loading-spinner";
import DPageSubheader from "discourse/ui-kit/d-page-subheader";
import dAvatar from "discourse/ui-kit/helpers/d-avatar";
import dFormatDate from "discourse/ui-kit/helpers/d-format-date";
import { i18n } from "discourse-i18n";

const PREFIX = "resenha.admin.recordings";

function formatDuration(durationMs) {
  if (!durationMs) {
    return "-";
  }

  const totalSeconds = Math.round(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value) => String(value).padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

export default class ResenhaRecordingList extends Component {
  @tracked extraRecordings = [];
  @tracked hasMoreOverride = null;
  @tracked loadingMore = false;

  statusLabel = (status) => i18n(`${PREFIX}.status_${status}`);

  formatDuration = (durationMs) => formatDuration(durationMs);

  isDownloadUrl = (location) => /^https?:\/\//.test(location);

  filePath = (recording) =>
    recording.location || recording.filename || recording.filepath;

  get recordings() {
    return [...this.args.model.recordings, ...this.extraRecordings];
  }

  get hasMore() {
    return this.hasMoreOverride ?? this.args.model.has_more;
  }

  @action
  async loadMore() {
    this.loadingMore = true;
    try {
      const payload = await ajax(
        `/admin/plugins/resenha/recordings.json?offset=${this.recordings.length}`
      );
      this.extraRecordings = [...this.extraRecordings, ...payload.recordings];
      this.hasMoreOverride = payload.has_more;
    } catch (error) {
      popupAjaxError(error);
    } finally {
      this.loadingMore = false;
    }
  }

  <template>
    <section class="resenha-recordings">
      <DPageSubheader
        @titleLabel={{i18n "resenha.admin.recordings_title"}}
        @descriptionLabel={{i18n "resenha.admin.recordings.description"}}
      />

      {{#if this.recordings.length}}
        <table class="d-admin-table resenha-recordings__table">
          <thead>
            <tr>
              <th>{{i18n "resenha.admin.recordings.room"}}</th>
              <th>{{i18n "resenha.admin.recordings.requested_by"}}</th>
              <th>{{i18n "resenha.admin.recordings.status"}}</th>
              <th>{{i18n "resenha.admin.recordings.started_at"}}</th>
              <th>{{i18n "resenha.admin.recordings.duration"}}</th>
              <th>{{i18n "resenha.admin.recordings.file"}}</th>
            </tr>
          </thead>
          <tbody>
            {{#each this.recordings as |recording|}}
              <tr class="d-admin-row__content">
                <td class="d-admin-row__overview resenha-recordings__room">
                  {{recording.room_name}}
                </td>
                <td class="d-admin-row__detail resenha-recordings__requester">
                  <div class="d-admin-row__mobile-label">
                    {{i18n "resenha.admin.recordings.requested_by"}}
                  </div>
                  {{#if recording.started_by}}
                    {{dAvatar recording.started_by imageSize="tiny"}}
                    {{recording.started_by.username}}
                  {{else}}
                    -
                  {{/if}}
                </td>
                <td class="d-admin-row__detail resenha-recordings__status">
                  <div class="d-admin-row__mobile-label">
                    {{i18n "resenha.admin.recordings.status"}}
                  </div>
                  <span
                    class="resenha-recordings__status-badge --{{recording.status}}"
                  >
                    {{this.statusLabel recording.status}}
                  </span>
                </td>
                <td class="d-admin-row__detail resenha-recordings__started-at">
                  <div class="d-admin-row__mobile-label">
                    {{i18n "resenha.admin.recordings.started_at"}}
                  </div>
                  {{dFormatDate recording.started_at leaveAgo="true"}}
                </td>
                <td class="d-admin-row__detail resenha-recordings__duration">
                  <div class="d-admin-row__mobile-label">
                    {{i18n "resenha.admin.recordings.duration"}}
                  </div>
                  {{this.formatDuration recording.duration_ms}}
                </td>
                <td class="d-admin-row__detail resenha-recordings__file">
                  <div class="d-admin-row__mobile-label">
                    {{i18n "resenha.admin.recordings.file"}}
                  </div>
                  {{#if (this.isDownloadUrl recording.location)}}
                    <a
                      href={{recording.location}}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {{i18n "resenha.admin.recordings.download"}}
                    </a>
                  {{else}}
                    <code>{{this.filePath recording}}</code>
                  {{/if}}
                </td>
              </tr>
            {{/each}}
          </tbody>
        </table>

        <DConditionalLoadingSpinner @condition={{this.loadingMore}}>
          {{#if this.hasMore}}
            <DButton
              @action={{this.loadMore}}
              @label="resenha.admin.recordings.load_more"
              class="btn-default resenha-recordings__load-more"
            />
          {{/if}}
        </DConditionalLoadingSpinner>
      {{else}}
        <p class="resenha-recordings__empty">
          {{i18n "resenha.admin.recordings.empty"}}
        </p>
      {{/if}}
    </section>
  </template>
}
