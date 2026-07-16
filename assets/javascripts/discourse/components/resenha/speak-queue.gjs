import Component from "@glimmer/component";
import { fn } from "@ember/helper";
import { action } from "@ember/object";
import { service } from "@ember/service";
import DButton from "discourse/components/d-button";
import avatar from "discourse/helpers/avatar";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { prioritizeNameInUx } from "discourse/lib/settings";
import dConcatClass from "discourse/ui-kit/helpers/d-concat-class";
import { i18n } from "discourse-i18n";
import { speakQueue } from "../../lib/resenha/speak-queue";

// The ordered request-to-speak queue of a stage room. Everyone sees the
// order; moderators get approve/dismiss controls, a queued viewer can lower
// their own hand.
export default class ResenhaSpeakQueue extends Component {
  @service currentUser;

  get room() {
    return this.args.room;
  }

  get canManage() {
    return this.room?.can_manage;
  }

  get entries() {
    return speakQueue(this.room).map((participant, index) => ({
      participant,
      position: index + 1,
      isSelf: Number(participant.id) === this.currentUser?.id,
      name: prioritizeNameInUx(participant.name)
        ? participant.name
        : participant.username,
    }));
  }

  @action
  async approve(participant) {
    try {
      await ajax(`/resenha/rooms/${this.room.id}/memberships`, {
        type: "POST",
        data: { user_id: participant.id, role: "speaker" },
      });
    } catch (error) {
      popupAjaxError(error);
    }
  }

  @action
  async dismiss(participant) {
    try {
      await ajax(`/resenha/rooms/${this.room.id}/request_to_speak`, {
        type: "DELETE",
        data: { user_id: participant.id },
      });
    } catch (error) {
      popupAjaxError(error);
    }
  }

  @action
  async lowerHand() {
    try {
      await ajax(`/resenha/rooms/${this.room.id}/request_to_speak`, {
        type: "DELETE",
      });
    } catch (error) {
      popupAjaxError(error);
    }
  }

  <template>
    <div class="resenha-speak-queue">
      <h3 class="resenha-speak-queue__title">
        {{i18n "resenha.stage.queue_title"}}
      </h3>
      {{#if this.entries.length}}
        <ul class="resenha-speak-queue__list">
          {{#each this.entries key="participant.id" as |entry|}}
            <li
              class={{dConcatClass
                "resenha-speak-queue__item"
                (if entry.isSelf "--self")
              }}
            >
              <span
                class="resenha-speak-queue__position"
              >{{entry.position}}</span>
              {{avatar entry.participant imageSize="small"}}
              <span class="resenha-speak-queue__name">{{entry.name}}</span>
              <span class="resenha-speak-queue__actions">
                {{#if this.canManage}}
                  <DButton
                    @action={{fn this.approve entry.participant}}
                    @icon="check"
                    @title="resenha.stage.approve_request"
                    class="btn-transparent resenha-speak-queue__approve"
                  />
                  <DButton
                    @action={{fn this.dismiss entry.participant}}
                    @icon="xmark"
                    @title="resenha.stage.dismiss_request"
                    class="btn-transparent resenha-speak-queue__dismiss"
                  />
                {{else if entry.isSelf}}
                  <DButton
                    @action={{this.lowerHand}}
                    @icon="xmark"
                    @title="resenha.stage.lower_hand"
                    class="btn-transparent resenha-speak-queue__lower"
                  />
                {{/if}}
              </span>
            </li>
          {{/each}}
        </ul>
      {{else}}
        <div class="resenha-speak-queue__empty">
          {{i18n "resenha.stage.queue_empty"}}
        </div>
      {{/if}}
    </div>
  </template>
}
