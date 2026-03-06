import Component from "@glimmer/component";
import DashboardPeriodSelector from "discourse/admin/components/dashboard-period-selector";
import avatar from "discourse/helpers/avatar";
import { i18n } from "discourse-i18n";

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) {
    return "0m";
  }

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m}m`;
}

export default class ResenhaDashboard extends Component {
  get overview() {
    return this.args.model?.overview;
  }

  get rooms() {
    return this.args.model?.rooms || [];
  }

  get users() {
    return this.args.model?.users || [];
  }

  get hasData() {
    return this.overview?.total_sessions > 0;
  }

  <template>
    <section class="resenha-dashboard">
      <div class="resenha-dashboard__header">
        <h2>{{i18n "resenha.admin.dashboard.overview"}}</h2>
        <DashboardPeriodSelector
          @period={{@controller.period}}
          @setPeriod={{@controller.setPeriod}}
          @startDate={{@controller.startDate}}
          @endDate={{@controller.endDate}}
          @setCustomDateRange={{@controller.setCustomDateRange}}
        />
      </div>

      {{#if this.hasData}}
        <div class="resenha-dashboard__stats-cards">
          <div class="resenha-dashboard__card">
            <span
              class="resenha-dashboard__card-value"
            >{{this.overview.total_sessions}}</span>
            <span class="resenha-dashboard__card-label">{{i18n
                "resenha.admin.dashboard.total_sessions"
              }}</span>
          </div>
          <div class="resenha-dashboard__card">
            <span
              class="resenha-dashboard__card-value"
            >{{this.overview.unique_users}}</span>
            <span class="resenha-dashboard__card-label">{{i18n
                "resenha.admin.dashboard.unique_users"
              }}</span>
          </div>
          <div class="resenha-dashboard__card">
            <span class="resenha-dashboard__card-value">{{formatDuration
                this.overview.avg_duration
              }}</span>
            <span class="resenha-dashboard__card-label">{{i18n
                "resenha.admin.dashboard.avg_duration"
              }}</span>
          </div>
        </div>

        {{#if this.rooms.length}}
          <h3>{{i18n "resenha.admin.dashboard.top_rooms"}}</h3>
          <table class="d-admin-table resenha-dashboard__rooms-table">
            <thead>
              <tr>
                <th>{{i18n "resenha.admin.dashboard.room_name"}}</th>
                <th>{{i18n "resenha.admin.dashboard.unique_users"}}</th>
                <th>{{i18n "resenha.admin.dashboard.total_time"}}</th>
              </tr>
            </thead>
            <tbody>
              {{#each this.rooms as |room|}}
                <tr class="d-admin-row__content">
                  <td class="d-admin-row__overview">{{room.room_name}}</td>
                  <td class="d-admin-row__detail">{{room.unique_users}}</td>
                  <td class="d-admin-row__detail">{{formatDuration
                      room.total_seconds
                    }}</td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        {{/if}}

        {{#if this.users.length}}
          <h3>{{i18n "resenha.admin.dashboard.top_users"}}</h3>
          <table class="d-admin-table resenha-dashboard__users-table">
            <thead>
              <tr>
                <th>{{i18n "resenha.admin.dashboard.user"}}</th>
                <th>{{i18n "resenha.admin.dashboard.sessions"}}</th>
                <th>{{i18n "resenha.admin.dashboard.total_time"}}</th>
              </tr>
            </thead>
            <tbody>
              {{#each this.users as |u|}}
                <tr class="d-admin-row__content">
                  <td class="d-admin-row__overview">
                    <a
                      href="/admin/users/{{u.user_id}}/{{u.username}}"
                      data-user-card={{u.username}}
                      class="resenha-dashboard__user-cell"
                    >
                      {{avatar u imageSize="small"}}
                      <span>{{u.username}}</span>
                    </a>
                  </td>
                  <td class="d-admin-row__detail">{{u.session_count}}</td>
                  <td class="d-admin-row__detail">{{formatDuration
                      u.total_seconds
                    }}</td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        {{/if}}
      {{else}}
        <p class="resenha-dashboard__empty">{{i18n
            "resenha.admin.dashboard.no_data"
          }}</p>
      {{/if}}
    </section>
  </template>
}
