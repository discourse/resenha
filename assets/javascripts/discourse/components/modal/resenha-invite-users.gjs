import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { fn, hash } from "@ember/helper";
import { action } from "@ember/object";
import { service } from "@ember/service";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { durationTiny } from "discourse/lib/formatter";
import { clipboardCopy } from "discourse/lib/utilities";
import UserChooser from "discourse/select-kit/components/user-chooser";
import DButton from "discourse/ui-kit/d-button";
import DModal from "discourse/ui-kit/d-modal";
import dAvatar from "discourse/ui-kit/helpers/d-avatar";
import dIcon from "discourse/ui-kit/helpers/d-icon";
import { i18n } from "discourse-i18n";

export default class ResenhaInviteUsersModal extends Component {
  @service currentUser;
  @service router;
  @service toasts;

  @tracked suggestions = [];
  @tracked loadingSuggestions = true;
  @tracked selectedUsernames = [];
  @tracked invitedUsernames = [];
  @tracked inviting = false;

  constructor() {
    super(...arguments);
    this.loadSuggestions();
  }

  get room() {
    return this.args.model.room;
  }

  get inviteUrl() {
    const url = this.router.urlFor(
      "resenha-room-invite",
      this.room.slug,
      this.currentUser.username_lower
    );
    return new URL(url, window.location.origin).href;
  }

  get suggestionRows() {
    return this.suggestions.map((suggestion) => ({
      ...suggestion,
      timeTogether: durationTiny(suggestion.total_seconds),
      invited: this.invitedUsernames.includes(suggestion.username),
    }));
  }

  async loadSuggestions() {
    try {
      const result = await ajax(
        `/resenha/rooms/${this.room.id}/invites/suggestions`
      );
      this.suggestions = result.suggestions;
    } catch (error) {
      popupAjaxError(error);
    } finally {
      this.loadingSuggestions = false;
    }
  }

  async #invite(usernames) {
    this.inviting = true;
    try {
      const result = await ajax(`/resenha/rooms/${this.room.id}/invites`, {
        type: "POST",
        data: { usernames },
      });
      this.invitedUsernames = [
        ...this.invitedUsernames,
        ...result.invited_usernames,
      ];
      if (result.invited_usernames.length) {
        this.toasts.success({
          duration: "short",
          data: {
            message: i18n("resenha.invite.sent", {
              count: result.invited_usernames.length,
            }),
          },
        });
      }
      if (result.skipped_usernames.length) {
        this.toasts.warning({
          data: {
            message: i18n("resenha.invite.skipped", {
              usernames: result.skipped_usernames
                .map((username) => `@${username}`)
                .join(", "),
            }),
          },
        });
      }
    } catch (error) {
      popupAjaxError(error);
    } finally {
      this.inviting = false;
    }
  }

  @action
  setSelectedUsernames(usernames) {
    this.selectedUsernames = usernames;
  }

  @action
  async inviteSelected() {
    if (!this.selectedUsernames.length) {
      return;
    }
    await this.#invite(this.selectedUsernames);
    this.selectedUsernames = [];
  }

  @action
  async inviteSuggestion(suggestion) {
    await this.#invite([suggestion.username]);
  }

  @action
  copyLink() {
    clipboardCopy(this.inviteUrl);
    this.toasts.success({
      duration: "short",
      data: { message: i18n("resenha.room.link_copied") },
    });
  }

  <template>
    <DModal
      @closeModal={{@closeModal}}
      @title={{i18n "resenha.invite.title" room_name=this.room.name}}
      class="resenha-invite-modal"
    >
      <:body>
        <div class="resenha-invite-modal__search">
          <span class="resenha-invite-modal__label">
            {{i18n "resenha.invite.search_label"}}
          </span>
          <div class="resenha-invite-modal__search-row">
            <UserChooser
              @value={{this.selectedUsernames}}
              @onChange={{this.setSelectedUsernames}}
              @options={{hash
                excludeCurrentUser=true
                filterPlaceholder="resenha.invite.search_placeholder"
              }}
              class="resenha-invite-modal__user-chooser"
            />
            <DButton
              @action={{this.inviteSelected}}
              @icon="paper-plane"
              @label="resenha.invite.send"
              @disabled={{this.inviting}}
              class="btn-primary resenha-invite-modal__send"
            />
          </div>
        </div>

        {{#if this.loadingSuggestions}}
          <div class="resenha-invite-modal__loading">
            <div class="spinner small"></div>
            {{i18n "loading"}}
          </div>
        {{else if this.suggestionRows.length}}
          <div class="resenha-invite-modal__suggestions">
            <h3 class="resenha-invite-modal__section-title">
              {{i18n "resenha.invite.suggestions_title"}}
            </h3>
            <div class="resenha-invite-modal__suggestion-list">
              {{#each this.suggestionRows as |suggestion|}}
                <div class="resenha-invite-modal__suggestion">
                  <div class="resenha-invite-modal__suggestion-avatar">
                    {{dAvatar suggestion imageSize="medium"}}
                  </div>
                  <div class="resenha-invite-modal__suggestion-details">
                    <span
                      class="resenha-invite-modal__suggestion-username"
                    >{{suggestion.username}}</span>
                    <span class="resenha-invite-modal__suggestion-time">
                      {{i18n
                        "resenha.invite.time_together"
                        duration=suggestion.timeTogether
                      }}
                    </span>
                  </div>
                  {{#if suggestion.invited}}
                    <span class="resenha-invite-modal__suggestion-invited">
                      {{dIcon "check"}}
                      {{i18n "resenha.invite.invited"}}
                    </span>
                  {{else}}
                    <DButton
                      @action={{fn this.inviteSuggestion suggestion}}
                      @icon="user-plus"
                      @label="resenha.invite.invite"
                      @disabled={{this.inviting}}
                      class="btn-small resenha-invite-modal__suggestion-invite"
                    />
                  {{/if}}
                </div>
              {{/each}}
            </div>
          </div>
        {{/if}}

        <div class="resenha-invite-modal__link">
          <label class="resenha-invite-modal__label" for="resenha-invite-link">
            {{i18n "resenha.invite.link_label"}}
          </label>
          <div class="resenha-invite-modal__link-row">
            <input
              id="resenha-invite-link"
              type="text"
              readonly
              value={{this.inviteUrl}}
              class="resenha-invite-modal__link-input"
            />
            <DButton
              @action={{this.copyLink}}
              @icon="copy"
              @label="resenha.invite.copy"
              class="resenha-invite-modal__copy"
            />
          </div>
        </div>
      </:body>
    </DModal>
  </template>
}
