import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { fn } from "@ember/helper";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { service } from "@ember/service";
import DMenu from "discourse/float-kit/components/d-menu";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import DButton from "discourse/ui-kit/d-button";
import DDropdownMenu from "discourse/ui-kit/d-dropdown-menu";
import dConcatClass from "discourse/ui-kit/helpers/d-concat-class";
import dIcon from "discourse/ui-kit/helpers/d-icon";
import { i18n } from "discourse-i18n";
import {
  enumerateAudioDevices,
  enumerateVideoDevices,
  outputSelectionSupported,
  SYSTEM_DEFAULT_DEVICE_ID,
} from "../../lib/resenha/media-devices";
import { prefetchDtlnWasm } from "../../lib/resenha/noise-suppression";
import { queuePosition } from "../../lib/resenha/speak-queue";
import ResenhaVideoSettingsModal from "../modal/resenha-video-settings";
import ResenhaVoiceSettingsModal from "../modal/resenha-voice-settings";
import ResenhaCallSubmenu from "./call-submenu";

const AUDIO_MENU = "resenha-audio-menu";
const VIDEO_MENU = "resenha-video-menu";
const SUBMENU = "resenha-call-submenu";

// The audio/video capture controls shared by the room page and the persistent
// call widget: mic and camera "combo" buttons (a toggle plus a caret opening
// device pickers and settings), plus the deafen and screen-share buttons.
//
// Hosts render this inside their own `__controls` footer and append their
// context-specific tail (overflow menu, leave button, etc.) as siblings.
export default class ResenhaCallControls extends Component {
  @service currentUser;
  @service dialog;
  @service menu;
  @service modal;
  @service resenhaWebrtc;
  @service siteSettings;

  @tracked audioInputDevices = [];
  @tracked audioOutputDevices = [];
  @tracked videoInputDevices = [];
  @tracked recordingPending = false;

  get room() {
    return this.args.room;
  }

  get videoAllowed() {
    return this.resenhaWebrtc.videoAllowedIn(this.room);
  }

  get cameraActive() {
    return this.resenhaWebrtc.localVideoKind === "camera";
  }

  get screenShareActive() {
    return this.resenhaWebrtc.localVideoKind === "screen";
  }

  get cameraDisabled() {
    return (
      !this.cameraActive && !this.resenhaWebrtc.canPublishVideo(this.room?.id)
    );
  }

  get screenShareDisabled() {
    return (
      !this.screenShareActive &&
      !this.resenhaWebrtc.canPublishVideo(this.room?.id)
    );
  }

  get showScreenShare() {
    return this.videoAllowed && this.resenhaWebrtc.screenShareSupported;
  }

  get #ownParticipant() {
    return (this.room?.active_participants || []).find(
      (participant) => Number(participant?.id) === this.currentUser?.id
    );
  }

  get isStageListener() {
    if (this.room?.room_type !== "stage") {
      return false;
    }
    const role = this.#ownParticipant?.role;
    return !!this.#ownParticipant && role !== "moderator" && role !== "speaker";
  }

  get handRaisedAt() {
    return this.#ownParticipant?.hand_raised_at;
  }

  get raiseHandTitle() {
    if (!this.handRaisedAt) {
      return i18n("resenha.stage.raise_hand");
    }

    const position = queuePosition(this.room, this.currentUser?.id);
    const lowerHand = i18n("resenha.stage.lower_hand");
    return position
      ? `${lowerHand} — ${i18n("resenha.stage.queue_position", { position })}`
      : lowerHand;
  }

  get noiseSuppressionOn() {
    return this.resenhaWebrtc.noiseSuppressionState === "on";
  }

  get noiseSuppressionStarting() {
    return this.resenhaWebrtc.noiseSuppressionState === "starting";
  }

  get showNoiseSuppressionBadge() {
    return (
      this.resenhaWebrtc.audioEnabled &&
      this.resenhaWebrtc.noiseSuppressionState !== "off"
    );
  }

  get micTitle() {
    if (this.resenhaWebrtc.pttEnabled) {
      return i18n("resenha.ptt.controlled_by_ptt");
    }
    const title = this.resenhaWebrtc.audioEnabled
      ? i18n("resenha.room.mic_on")
      : i18n("resenha.room.mic_off");
    if (this.showNoiseSuppressionBadge && this.noiseSuppressionOn) {
      return `${title} — ${i18n("resenha.room.noise_suppression_active")}`;
    }
    return title;
  }

  get cameraTitle() {
    return this.cameraActive
      ? i18n("resenha.video.camera_off")
      : i18n("resenha.video.camera_on");
  }

  get screenShareTitle() {
    return this.screenShareActive
      ? i18n("resenha.video.screen_share_stop")
      : i18n("resenha.video.screen_share_start");
  }

  get deafenTitle() {
    return this.resenhaWebrtc.deafened
      ? i18n("resenha.room.deafen_off")
      : i18n("resenha.room.deafen_on");
  }

  get audioOutputSupported() {
    return outputSelectionSupported();
  }

  get canRecord() {
    return (
      this.room?.can_manage &&
      this.siteSettings.resenha_livekit_recording_enabled &&
      this.resenhaWebrtc.isLivekitRoom(this.room?.id)
    );
  }

  get recordingActive() {
    return !!this.room?.recording;
  }

  get recordTitle() {
    return this.recordingActive
      ? i18n("resenha.room.recording_stop")
      : i18n("resenha.room.recording_start");
  }

  @action
  toggleMute() {
    this.resenhaWebrtc.toggleMute();
  }

  @action
  toggleDeafen() {
    this.resenhaWebrtc.toggleDeafen();
  }

  @action
  toggleCamera() {
    this.resenhaWebrtc.toggleCamera();
  }

  @action
  toggleScreenShare() {
    this.resenhaWebrtc.toggleScreenShare();
  }

  @action
  async toggleRaiseHand() {
    try {
      await ajax(`/resenha/rooms/${this.room.id}/request_to_speak`, {
        type: this.handRaisedAt ? "DELETE" : "POST",
      });
    } catch (error) {
      popupAjaxError(error);
    }
  }

  @action
  toggleRecording() {
    const stopping = this.recordingActive;

    this.dialog.yesNoConfirm({
      message: stopping
        ? i18n("resenha.room.recording_stop_confirm")
        : i18n("resenha.room.recording_confirm"),
      didConfirm: async () => {
        this.recordingPending = true;
        try {
          // The room-wide "recording" broadcast flips the button and shows
          // the indicator; no local state to update here.
          await ajax(`/resenha/rooms/${this.room.id}/recording`, {
            type: stopping ? "DELETE" : "POST",
          });
        } catch (error) {
          popupAjaxError(error);
        } finally {
          this.recordingPending = false;
        }
      },
    });
  }

  @action
  openVoiceSettings(closeMenu) {
    closeMenu?.();
    this.modal.show(ResenhaVoiceSettingsModal);
  }

  @action
  openVideoSettings(closeMenu) {
    closeMenu?.();
    this.modal.show(ResenhaVideoSettingsModal);
  }

  #systemDefaultDevice() {
    return {
      id: SYSTEM_DEFAULT_DEVICE_ID,
      name: i18n("resenha.devices.system_default"),
    };
  }

  get currentInputDeviceName() {
    return this.audioInputDevices.find(
      (device) => device.id === this.resenhaWebrtc.inputDeviceId
    )?.name;
  }

  get currentOutputDeviceName() {
    return this.audioOutputDevices.find(
      (device) => device.id === this.resenhaWebrtc.outputDeviceId
    )?.name;
  }

  get currentVideoDeviceName() {
    return this.videoInputDevices.find(
      (device) => device.id === this.resenhaWebrtc.videoInputDeviceId
    )?.name;
  }

  @action
  toggleNoiseSuppression() {
    this.resenhaWebrtc.toggleNoiseSuppression();
  }

  @action
  async loadAudioDevices() {
    // The menu opening is a strong hint a suppression toggle may follow;
    // warming the model bytes makes that toggle near-instant.
    prefetchDtlnWasm().catch(() => {});
    const { inputs, outputs } = await enumerateAudioDevices();
    if (this.isDestroying || this.isDestroyed) {
      return;
    }
    const defaultDevice = this.#systemDefaultDevice();
    this.audioInputDevices = [defaultDevice, ...inputs];
    this.audioOutputDevices = [defaultDevice, ...outputs];
  }

  @action
  async loadVideoDevices() {
    const inputs = await enumerateVideoDevices();
    if (this.isDestroying || this.isDestroyed) {
      return;
    }
    this.videoInputDevices = [this.#systemDefaultDevice(), ...inputs];
  }

  // Opened programmatically (not a nested <DMenu>) so the trigger stays a
  // normal full-width menu item, matching core's channel context menu.
  #openSubmenu(event, parentMenu, items, onSelect) {
    // Anchor to the row button, not the clicked icon/label, so the submenu
    // opens flush to the row's right edge.
    const anchor = event.target.closest(".btn") ?? event.target;
    this.menu.show(anchor, {
      identifier: SUBMENU,
      groupIdentifier: SUBMENU,
      component: ResenhaCallSubmenu,
      placement: "right-start",
      offset: { mainAxis: 8, crossAxis: -5 },
      modalForMobile: true,
      data: {
        items,
        onSelect: (id) => {
          onSelect(id);
          this.menu.close(parentMenu);
        },
      },
    });
  }

  #deviceItems(devices, currentId) {
    return devices.map((device) => ({
      id: device.id,
      label: device.name,
      selected: device.id === currentId,
    }));
  }

  @action
  openInputDeviceMenu(_actionArg, event) {
    this.#openSubmenu(
      event,
      AUDIO_MENU,
      this.#deviceItems(
        this.audioInputDevices,
        this.resenhaWebrtc.inputDeviceId
      ),
      (id) => this.resenhaWebrtc.setInputDevice(id)
    );
  }

  @action
  openOutputDeviceMenu(_actionArg, event) {
    this.#openSubmenu(
      event,
      AUDIO_MENU,
      this.#deviceItems(
        this.audioOutputDevices,
        this.resenhaWebrtc.outputDeviceId
      ),
      (id) => this.resenhaWebrtc.setOutputDevice(id)
    );
  }

  @action
  openCameraMenu(_actionArg, event) {
    this.#openSubmenu(
      event,
      VIDEO_MENU,
      this.#deviceItems(
        this.videoInputDevices,
        this.resenhaWebrtc.videoInputDeviceId
      ),
      (id) => this.resenhaWebrtc.setVideoInputDevice(id)
    );
  }

  <template>
    <div class="resenha-call-controls__combo">
      <DButton
        @action={{this.toggleMute}}
        @icon={{if
          this.resenhaWebrtc.audioEnabled
          "microphone"
          "microphone-slash"
        }}
        @translatedTitle={{this.micTitle}}
        @disabled={{this.resenhaWebrtc.pttEnabled}}
        class={{dConcatClass
          "btn-default resenha-call-controls__combo-main"
          (if this.resenhaWebrtc.audioEnabled "" "--off")
        }}
      >
        {{#if this.showNoiseSuppressionBadge}}
          <span
            class={{dConcatClass
              "resenha-call-controls__ns-badge"
              (if this.noiseSuppressionStarting "--starting")
            }}
            aria-hidden="true"
          >
            {{dIcon "wand-magic-sparkles"}}
          </span>
        {{/if}}
      </DButton>
      <DMenu
        @identifier="resenha-audio-menu"
        @icon="angle-down"
        @title={{i18n "resenha.room.audio_options"}}
        @ariaLabel={{i18n "resenha.room.audio_options"}}
        @placement="top-end"
        @onShow={{this.loadAudioDevices}}
        @triggerClass="btn-default resenha-call-controls__combo-caret"
      >
        <:content as |audioMenu|>
          <DDropdownMenu as |dropdown|>
            <dropdown.item>
              <DButton
                @action={{this.openInputDeviceMenu}}
                @forwardEvent={{true}}
                @icon="microphone"
                @label="resenha.voice_settings.input_audio"
                @suffixIcon="angle-right"
                class="btn-transparent resenha-call-menu__device-row"
              >
                {{#if this.currentInputDeviceName}}
                  <span class="resenha-call-menu__current-device">
                    {{this.currentInputDeviceName}}
                  </span>
                {{/if}}
              </DButton>
            </dropdown.item>
            {{#if this.audioOutputSupported}}
              <dropdown.item>
                <DButton
                  @action={{this.openOutputDeviceMenu}}
                  @forwardEvent={{true}}
                  @icon="volume-high"
                  @label="resenha.voice_settings.output_audio"
                  @suffixIcon="angle-right"
                  class="btn-transparent resenha-call-menu__device-row"
                >
                  {{#if this.currentOutputDeviceName}}
                    <span class="resenha-call-menu__current-device">
                      {{this.currentOutputDeviceName}}
                    </span>
                  {{/if}}
                </DButton>
              </dropdown.item>
            {{/if}}
            <dropdown.divider />
            <dropdown.item>
              {{! The menu stays open on purpose: the check appearing (after
              the worklet's ready handshake) is the confirmation the user is
              waiting for. }}
              <DButton
                @action={{this.toggleNoiseSuppression}}
                @icon="wand-magic-sparkles"
                @label="resenha.voice_settings.noise_suppression"
                @suffixIcon={{if this.noiseSuppressionOn "check"}}
                @disabled={{this.noiseSuppressionStarting}}
                class={{dConcatClass
                  "btn-transparent resenha-call-menu__noise-suppression"
                  (if this.noiseSuppressionOn "--active")
                }}
              />
            </dropdown.item>
            <dropdown.item>
              <DButton
                @action={{fn this.openVoiceSettings audioMenu.close}}
                @icon="sliders"
                @label="resenha.voice_settings.audio_settings"
                class="btn-transparent"
              />
            </dropdown.item>
          </DDropdownMenu>
        </:content>
      </DMenu>
    </div>
    {{#if this.isStageListener}}
      <DButton
        @action={{this.toggleRaiseHand}}
        @icon="hand"
        @translatedTitle={{this.raiseHandTitle}}
        class={{dConcatClass
          "btn-default resenha-call-controls__raise-hand"
          (if this.handRaisedAt "--active")
        }}
      />
    {{/if}}
    {{! Capture buttons are plain <button>s on purpose: DButton defers its
    action via next(), which lands outside the click event dispatch — Firefox
    only allows getDisplayMedia during the actual dispatch, so a deferred call
    throws NotAllowedError. }}
    {{#if this.videoAllowed}}
      <div class="resenha-call-controls__combo">
        <button
          type="button"
          class={{dConcatClass
            "btn btn-icon no-text btn-default resenha-call-controls__combo-main"
            (if this.cameraActive "--active")
          }}
          title={{this.cameraTitle}}
          aria-label={{this.cameraTitle}}
          disabled={{this.cameraDisabled}}
          {{on "click" this.toggleCamera}}
        >
          {{dIcon (if this.cameraActive "video" "video-slash")}}
          {{! Zero-width space: matches DButton so an icon-only button keeps
          full button height and aligns with its DButton siblings. }}
          <span aria-hidden="true">&#8203;</span>
        </button>
        <DMenu
          @identifier="resenha-video-menu"
          @icon="angle-down"
          @title={{i18n "resenha.room.video_options"}}
          @ariaLabel={{i18n "resenha.room.video_options"}}
          @placement="top-end"
          @onShow={{this.loadVideoDevices}}
          @triggerClass="btn-default resenha-call-controls__combo-caret"
        >
          <:content as |videoMenu|>
            <DDropdownMenu as |dropdown|>
              <dropdown.item>
                <DButton
                  @action={{this.openCameraMenu}}
                  @forwardEvent={{true}}
                  @icon="video"
                  @label="resenha.video_settings.camera"
                  @suffixIcon="angle-right"
                  class="btn-transparent resenha-call-menu__device-row"
                >
                  {{#if this.currentVideoDeviceName}}
                    <span class="resenha-call-menu__current-device">
                      {{this.currentVideoDeviceName}}
                    </span>
                  {{/if}}
                </DButton>
              </dropdown.item>
              <dropdown.divider />
              <dropdown.item>
                <DButton
                  @action={{fn this.openVideoSettings videoMenu.close}}
                  @icon="sliders"
                  @label="resenha.video_settings.title"
                  class="btn-transparent"
                />
              </dropdown.item>
            </DDropdownMenu>
          </:content>
        </DMenu>
      </div>
    {{/if}}
    <DButton
      @action={{this.toggleDeafen}}
      @icon={{if this.resenhaWebrtc.deafened "volume-xmark" "ear-listen"}}
      @translatedTitle={{this.deafenTitle}}
      class={{dConcatClass
        "btn-default"
        (if this.resenhaWebrtc.deafened "--off" "")
      }}
    />
    {{#if this.canRecord}}
      <DButton
        @action={{this.toggleRecording}}
        @icon="record-vinyl"
        @translatedTitle={{this.recordTitle}}
        @disabled={{this.recordingPending}}
        class={{dConcatClass
          "btn-default resenha-call-controls__record"
          (if this.recordingActive "--recording")
        }}
      />
    {{/if}}
    {{#if this.showScreenShare}}
      <button
        type="button"
        class={{dConcatClass
          "btn btn-icon no-text btn-default"
          (if this.screenShareActive "--active")
        }}
        title={{this.screenShareTitle}}
        aria-label={{this.screenShareTitle}}
        disabled={{this.screenShareDisabled}}
        {{on "click" this.toggleScreenShare}}
      >
        {{dIcon "display"}}
        <span aria-hidden="true">&#8203;</span>
      </button>
    {{/if}}
  </template>
}
