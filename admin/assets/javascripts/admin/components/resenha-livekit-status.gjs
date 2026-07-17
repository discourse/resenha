import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import ConditionalLoadingSpinner from "discourse/components/conditional-loading-spinner";
import DButton from "discourse/components/d-button";
import icon from "discourse/helpers/d-icon";
import formatDate from "discourse/helpers/format-date";
import { ajax } from "discourse/lib/ajax";
import { i18n } from "discourse-i18n";

const STATE_ICONS = {
  ok: "circle-check",
  warning: "triangle-exclamation",
  error: "circle-xmark",
};

const PREFIX = "resenha.admin.dashboard.livekit";

export default class ResenhaLivekitStatus extends Component {
  @tracked status;
  @tracked loading = true;
  @tracked loadFailed = false;

  constructor() {
    super(...arguments);
    this.load();
  }

  @action
  async load({ refreshProbe = false } = {}) {
    this.loading = true;
    this.loadFailed = false;

    try {
      this.status = await ajax(
        `/admin/plugins/resenha/livekit/${refreshProbe ? "probe" : "status"}.json`,
        refreshProbe ? { type: "POST" } : {}
      );
    } catch {
      this.loadFailed = true;
    } finally {
      this.loading = false;
    }
  }

  @action
  async refresh() {
    await this.load({ refreshProbe: true });
  }

  // Pure-mesh installs (no LiveKit setting touched) never see the card.
  get visible() {
    if (this.loading && !this.status) {
      return false;
    }
    if (this.loadFailed) {
      return true;
    }

    const settings = this.status?.settings;
    if (!settings) {
      return false;
    }

    return (
      settings.url_present ||
      settings.api_key_present ||
      settings.api_secret_present ||
      settings.policy !== "disabled"
    );
  }

  get checks() {
    const status = this.status;
    if (!status) {
      return [];
    }

    const checks = [];

    if (status.configured) {
      checks.push({
        state: "ok",
        label: i18n(`${PREFIX}.config_ok`, { policy: status.settings.policy }),
      });
    } else {
      const missing = [];
      if (!status.settings.url_present) {
        missing.push("resenha_livekit_url");
      }
      if (!status.settings.api_key_present) {
        missing.push("resenha_livekit_api_key");
      }
      if (!status.settings.api_secret_present) {
        missing.push("resenha_livekit_api_secret");
      }
      checks.push({
        state: "error",
        label: i18n(`${PREFIX}.config_missing`, {
          settings: missing.join(", "),
        }),
      });
    }

    if (status.token_check) {
      checks.push(
        status.token_check.ok
          ? { state: "ok", label: i18n(`${PREFIX}.token_ok`) }
          : {
              state: "error",
              label: i18n(`${PREFIX}.token_error`, {
                error: status.token_check.error,
              }),
            }
      );
    }

    if (status.server_check) {
      checks.push(
        status.server_check.ok
          ? {
              state: "ok",
              label: i18n(`${PREFIX}.server_ok`, {
                latency: status.server_check.latency_ms,
                count: status.server_check.room_count,
              }),
            }
          : {
              state: "error",
              label: i18n(`${PREFIX}.server_error`, {
                error: status.server_check.error,
              }),
            }
      );
    }

    if (status.last_probe) {
      checks.push({
        state: status.last_probe.ok ? "ok" : "error",
        label: i18n(
          `${PREFIX}.${status.last_probe.ok ? "probe_ok" : "probe_failed"}`
        ),
        at: status.last_probe.checked_at,
      });
    } else if (status.configured) {
      checks.push({ state: "warning", label: i18n(`${PREFIX}.probe_never`) });
    }

    checks.push(
      status.last_webhook_at
        ? {
            state: "ok",
            label: i18n(`${PREFIX}.webhook_received`),
            at: status.last_webhook_at,
          }
        : { state: "warning", label: i18n(`${PREFIX}.webhook_never`) }
    );

    return checks.map((check) => ({
      ...check,
      icon: STATE_ICONS[check.state],
    }));
  }

  get roomRows() {
    return (this.status?.rooms || []).map((room) => {
      const probed = room.livekit_user_ids !== undefined || !!room.error;

      return {
        name: room.name,
        presenceCount: room.presence_user_ids.length,
        livekitCount: room.livekit_user_ids?.length,
        probed,
        error: room.error,
        inSync:
          probed &&
          !room.error &&
          !room.missing_on_livekit?.length &&
          !room.missing_in_presence?.length,
        missingOnLivekit: this.#usernames(room.missing_on_livekit),
        missingInPresence: this.#usernames(room.missing_in_presence),
      };
    });
  }

  #usernames(userIds) {
    if (!userIds?.length) {
      return null;
    }
    return userIds
      .map((id) => this.status.usernames?.[id] || `#${id}`)
      .join(", ");
  }

  <template>
    {{#if this.visible}}
      <div class="resenha-livekit-status">
        <div class="resenha-livekit-status__header">
          <h3>{{i18n "resenha.admin.dashboard.livekit.title"}}</h3>
          <DButton
            class="btn-default btn-small resenha-livekit-status__refresh"
            @icon="arrows-rotate"
            @label="resenha.admin.dashboard.livekit.refresh"
            @action={{this.refresh}}
            @disabled={{this.loading}}
          />
        </div>

        <ConditionalLoadingSpinner @condition={{this.loading}}>
          {{#if this.loadFailed}}
            <p class="resenha-livekit-status__load-failed">{{i18n
                "resenha.admin.dashboard.livekit.load_failed"
              }}</p>
          {{else}}
            <ul class="resenha-livekit-status__checks">
              {{#each this.checks as |check|}}
                <li class="resenha-livekit-status__check --{{check.state}}">
                  {{icon check.icon}}
                  <span>
                    {{check.label}}
                    {{#if check.at}}{{formatDate
                        check.at
                        leaveAgo="true"
                      }}{{/if}}
                  </span>
                </li>
              {{/each}}
            </ul>

            {{#if this.status.configured}}
              <h4>{{i18n "resenha.admin.dashboard.livekit.rooms_title"}}</h4>
              {{#if this.roomRows.length}}
                <table class="d-admin-table resenha-livekit-status__rooms">
                  <thead>
                    <tr>
                      <th>{{i18n "resenha.admin.dashboard.livekit.room"}}</th>
                      <th>{{i18n
                          "resenha.admin.dashboard.livekit.discourse_participants"
                        }}</th>
                      <th>{{i18n
                          "resenha.admin.dashboard.livekit.livekit_participants"
                        }}</th>
                      <th>{{i18n
                          "resenha.admin.dashboard.livekit.room_status"
                        }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {{#each this.roomRows as |row|}}
                      <tr class="d-admin-row__content">
                        <td class="d-admin-row__overview">{{row.name}}</td>
                        <td class="d-admin-row__detail">
                          {{row.presenceCount}}
                        </td>
                        <td class="d-admin-row__detail">
                          {{if row.probed row.livekitCount "—"}}
                        </td>
                        <td
                          class="d-admin-row__detail resenha-livekit-status__room-diff"
                        >
                          {{#if row.error}}
                            <span class="--error">
                              {{icon "circle-xmark"}}
                              {{i18n
                                "resenha.admin.dashboard.livekit.room_error"
                                error=row.error
                              }}
                            </span>
                          {{else if row.inSync}}
                            <span class="--ok">
                              {{icon "circle-check"}}
                              {{i18n "resenha.admin.dashboard.livekit.in_sync"}}
                            </span>
                          {{else if row.probed}}
                            {{#if row.missingOnLivekit}}
                              <div class="--warning">
                                {{icon "triangle-exclamation"}}
                                {{i18n
                                  "resenha.admin.dashboard.livekit.missing_on_livekit"
                                  users=row.missingOnLivekit
                                }}
                              </div>
                            {{/if}}
                            {{#if row.missingInPresence}}
                              <div class="--warning">
                                {{icon "triangle-exclamation"}}
                                {{i18n
                                  "resenha.admin.dashboard.livekit.missing_in_presence"
                                  users=row.missingInPresence
                                }}
                              </div>
                            {{/if}}
                          {{else}}
                            —
                          {{/if}}
                        </td>
                      </tr>
                    {{/each}}
                  </tbody>
                </table>
              {{else}}
                <p class="resenha-livekit-status__no-rooms">{{i18n
                    "resenha.admin.dashboard.livekit.no_rooms"
                  }}</p>
              {{/if}}
            {{/if}}
          {{/if}}
        </ConditionalLoadingSpinner>
      </div>
    {{/if}}
  </template>
}
