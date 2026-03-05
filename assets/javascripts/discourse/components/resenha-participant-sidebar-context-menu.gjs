import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { service } from "@ember/service";
import DButton from "discourse/components/d-button";
import DropdownMenu from "discourse/components/dropdown-menu";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { not } from "discourse/truth-helpers";
import { i18n } from "discourse-i18n";
import { humanKeyName } from "../lib/resenha/ptt-utils";
import ResenhaPttKeyCapture from "./resenha-ptt-key-capture";

export default class ResenhaParticipantSidebarContextMenu extends Component {
  @service resenhaWebrtc;
  @service siteSettings;

  @tracked volume = 100;
  @tracked isMuted = false;
  @tracked showKeyCapture = false;

  constructor() {
    super(...arguments);
    const { room, participant } = this.args.data;
    this.volume = Math.round(
      this.resenhaWebrtc.getParticipantVolume(room.id, participant.id) * 100
    );
    this.isMuted = this.resenhaWebrtc.isParticipantMuted(
      room.id,
      participant.id
    );
  }

  get room() {
    return this.args.data.room;
  }

  get participant() {
    return this.args.data.participant;
  }

  get isCurrentUser() {
    return this.args.data.isCurrentUser;
  }

  get canManageRoom() {
    return this.args.data.canManageRoom;
  }

  get canKick() {
    return this.canManageRoom && this.participant.id !== this.room.creator_id;
  }

  get isStageRoom() {
    return this.room.room_type === "stage";
  }

  get isListenerInStage() {
    if (!this.isStageRoom || !this.isCurrentUser) {
      return false;
    }
    const role = this.participant.role;
    return role !== "moderator" && role !== "speaker";
  }

  get participantIsSpeakerOrMod() {
    const role = this.participant.role;
    return role === "moderator" || role === "speaker";
  }

  get canPromoteToSpeaker() {
    return (
      this.canManageRoom &&
      this.isStageRoom &&
      !this.isCurrentUser &&
      !this.participantIsSpeakerOrMod
    );
  }

  get canDemoteToListener() {
    return (
      this.canManageRoom &&
      this.isStageRoom &&
      !this.isCurrentUser &&
      this.participant.role === "speaker"
    );
  }

  get muteLabel() {
    return this.isMuted
      ? i18n("resenha.participant.unmute")
      : i18n("resenha.participant.mute");
  }

  get muteIcon() {
    return this.isMuted ? "volume-xmark" : "volume-high";
  }

  get micIcon() {
    return this.resenhaWebrtc.audioEnabled ? "microphone" : "microphone-slash";
  }

  get micLabel() {
    return this.resenhaWebrtc.audioEnabled
      ? i18n("resenha.room.mic_on")
      : i18n("resenha.room.mic_off");
  }

  get deafenIcon() {
    return this.resenhaWebrtc.deafened ? "volume-xmark" : "volume-high";
  }

  get deafenLabel() {
    return this.resenhaWebrtc.deafened
      ? i18n("resenha.room.deafen_off")
      : i18n("resenha.room.deafen_on");
  }

  get isPttEnabled() {
    return this.resenhaWebrtc.pttEnabled;
  }

  get pttToggleLabel() {
    return this.isPttEnabled
      ? i18n("resenha.ptt.disable")
      : i18n("resenha.ptt.enable");
  }

  get pttKeyLabel() {
    return i18n("resenha.ptt.configure_key", {
      key: humanKeyName(this.resenhaWebrtc.pttKey),
    });
  }

  get micDisabledByPtt() {
    return this.isCurrentUser && this.isPttEnabled;
  }

  get showNoiseSuppressionToggle() {
    return this.isCurrentUser && this.siteSettings.resenha_noise_suppression;
  }

  get noiseSuppressionIcon() {
    return this.resenhaWebrtc.noiseSuppressionEnabled
      ? "ear-listen"
      : "volume-high";
  }

  get noiseSuppressionLabel() {
    return this.resenhaWebrtc.noiseSuppressionEnabled
      ? "resenha.room.noise_suppression_on"
      : "resenha.room.noise_suppression_off";
  }

  @action
  onVolumeChange(event) {
    this.volume = parseInt(event.target.value, 10);
    this.resenhaWebrtc.setParticipantVolume(
      this.room.id,
      this.participant.id,
      this.volume / 100
    );
  }

  @action
  toggleMute() {
    this.isMuted = this.resenhaWebrtc.toggleParticipantMute(
      this.room.id,
      this.participant.id
    );
  }

  @action
  async kick() {
    try {
      await ajax(`/resenha/rooms/${this.room.id}/kick`, {
        type: "DELETE",
        data: { user_id: this.participant.id },
      });
      this.args.close();
    } catch (error) {
      popupAjaxError(error);
    }
  }

  @action
  toggleMic() {
    this.resenhaWebrtc.toggleMute();
  }

  @action
  toggleDeafen() {
    this.resenhaWebrtc.toggleDeafen();
  }

  @action
  async toggleNoiseSuppression() {
    await this.resenhaWebrtc.toggleNoiseSuppression();
  }

  @action
  togglePtt() {
    if (this.isPttEnabled) {
      this.resenhaWebrtc.disablePtt();
    } else {
      this.resenhaWebrtc.enablePtt();
    }
  }

  @action
  openKeyCapture() {
    this.showKeyCapture = true;
  }

  @action
  onKeyCaptureConfirm(keyCode) {
    this.resenhaWebrtc.setPttKey(keyCode);
    this.showKeyCapture = false;
  }

  @action
  onKeyCaptureCancel() {
    this.showKeyCapture = false;
  }

  @action
  async promoteToSpeaker() {
    await this.#changeParticipantRole("speaker");
  }

  @action
  async demoteToListener() {
    await this.#changeParticipantRole("participant");
  }

  async #changeParticipantRole(newRole) {
    try {
      await ajax(`/resenha/rooms/${this.room.id}/memberships`, {
        type: "POST",
        data: { user_id: this.participant.id, role: newRole },
      });
      this.args.close();
    } catch (error) {
      popupAjaxError(error);
    }
  }

  <template>
    <DropdownMenu
      class="resenha-participant-sidebar-context-menu"
      as |dropdown|
    >
      {{#if this.isCurrentUser}}
        {{#unless this.isListenerInStage}}
          <dropdown.item>
            <DButton
              @action={{this.toggleMic}}
              @icon={{this.micIcon}}
              @translatedLabel={{this.micLabel}}
              @translatedTitle={{if
                this.micDisabledByPtt
                (i18n "resenha.ptt.controlled_by_ptt")
                this.micLabel
              }}
              @disabled={{this.micDisabledByPtt}}
              class="resenha-participant-sidebar-context-menu__mic-btn
                {{if this.micDisabledByPtt '--disabled-by-ptt'}}"
            />
            {{#if this.micDisabledByPtt}}
              <span
                class="resenha-participant-sidebar-context-menu__ptt-hint"
              >{{i18n "resenha.ptt.controlled_by_ptt"}}</span>
            {{/if}}
          </dropdown.item>
        {{/unless}}
        <dropdown.item>
          <DButton
            @action={{this.toggleDeafen}}
            @icon={{this.deafenIcon}}
            @translatedLabel={{this.deafenLabel}}
            @translatedTitle={{this.deafenLabel}}
            class="resenha-participant-sidebar-context-menu__deafen-btn"
          />
        </dropdown.item>
        {{#unless this.isListenerInStage}}
          {{#if this.showNoiseSuppressionToggle}}
            <dropdown.item>
              <DButton
                @action={{this.toggleNoiseSuppression}}
                @icon={{this.noiseSuppressionIcon}}
                @label={{this.noiseSuppressionLabel}}
                @title={{this.noiseSuppressionLabel}}
                class="resenha-participant-sidebar-context-menu__noise-suppression"
              />
            </dropdown.item>
          {{/if}}
          <dropdown.item>
            <DButton
              @action={{this.togglePtt}}
              @icon={{if this.isPttEnabled "walkie-talkie" "walkie-talkie"}}
              @translatedLabel={{this.pttToggleLabel}}
              @translatedTitle={{this.pttToggleLabel}}
              class="resenha-participant-sidebar-context-menu__ptt-btn
                {{if this.isPttEnabled '--active'}}"
            />
          </dropdown.item>
          {{#if this.isPttEnabled}}
            <dropdown.item>
              {{#if this.showKeyCapture}}
                <ResenhaPttKeyCapture
                  @onConfirm={{this.onKeyCaptureConfirm}}
                  @onCancel={{this.onKeyCaptureCancel}}
                />
              {{else}}
                <DButton
                  @action={{this.openKeyCapture}}
                  @icon="keyboard"
                  @translatedLabel={{this.pttKeyLabel}}
                  @translatedTitle={{this.pttKeyLabel}}
                  class="resenha-participant-sidebar-context-menu__ptt-key-btn"
                />
              {{/if}}
            </dropdown.item>
          {{/if}}
        {{/unless}}
        {{#if this.isListenerInStage}}
          <dropdown.item>
            <span
              class="resenha-participant-sidebar-context-menu__stage-hint"
            >{{i18n "resenha.room.listeners_cannot_unmute"}}</span>
          </dropdown.item>
        {{/if}}
      {{else}}
        {{#if this.participantIsSpeakerOrMod}}
          <dropdown.item
            class="resenha-participant-sidebar-context-menu__volume"
          >
            <label
              class="resenha-participant-sidebar-context-menu__volume-label"
            >
              {{i18n "resenha.participant.volume"}}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={{this.volume}}
              class="resenha-participant-sidebar-context-menu__volume-slider"
              {{on "input" this.onVolumeChange}}
            />
          </dropdown.item>
          <dropdown.item>
            <DButton
              @action={{this.toggleMute}}
              @icon={{this.muteIcon}}
              @translatedLabel={{this.muteLabel}}
              @translatedTitle={{this.muteLabel}}
              class="resenha-participant-sidebar-context-menu__mute-btn"
            />
          </dropdown.item>
        {{else if (not this.isStageRoom)}}
          <dropdown.item
            class="resenha-participant-sidebar-context-menu__volume"
          >
            <label
              class="resenha-participant-sidebar-context-menu__volume-label"
            >
              {{i18n "resenha.participant.volume"}}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={{this.volume}}
              class="resenha-participant-sidebar-context-menu__volume-slider"
              {{on "input" this.onVolumeChange}}
            />
          </dropdown.item>
          <dropdown.item>
            <DButton
              @action={{this.toggleMute}}
              @icon={{this.muteIcon}}
              @translatedLabel={{this.muteLabel}}
              @translatedTitle={{this.muteLabel}}
              class="resenha-participant-sidebar-context-menu__mute-btn"
            />
          </dropdown.item>
        {{/if}}
        {{#if this.canPromoteToSpeaker}}
          <dropdown.item>
            <DButton
              @action={{this.promoteToSpeaker}}
              @icon="microphone"
              @label="resenha.stage.make_speaker"
              @title="resenha.stage.make_speaker"
              class="resenha-participant-sidebar-context-menu__promote-btn"
            />
          </dropdown.item>
        {{/if}}
        {{#if this.canDemoteToListener}}
          <dropdown.item>
            <DButton
              @action={{this.demoteToListener}}
              @icon="volume-xmark"
              @label="resenha.stage.move_to_listeners"
              @title="resenha.stage.move_to_listeners"
              class="resenha-participant-sidebar-context-menu__demote-btn"
            />
          </dropdown.item>
        {{/if}}
        {{#if this.canKick}}
          <dropdown.item>
            <DButton
              @action={{this.kick}}
              @icon="right-from-bracket"
              @label="resenha.participant.kick"
              @title="resenha.participant.kick"
              class="resenha-participant-sidebar-context-menu__kick-btn btn-danger"
            />
          </dropdown.item>
        {{/if}}
      {{/if}}
    </DropdownMenu>
  </template>
}
