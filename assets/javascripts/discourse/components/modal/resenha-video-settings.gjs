import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { fn, hash } from "@ember/helper";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import didInsert from "@ember/render-modifiers/modifiers/did-insert";
import didUpdate from "@ember/render-modifiers/modifiers/did-update";
import { service } from "@ember/service";
import DModal from "discourse/components/d-modal";
import DToggleSwitch from "discourse/components/d-toggle-switch";
import ComboBox from "discourse/select-kit/components/combo-box";
import { and, not, or } from "discourse/truth-helpers";
import { i18n } from "discourse-i18n";
import BackgroundBlurManager from "../../lib/resenha/background-blur";
import {
  cameraConstraints,
  enumerateVideoDevices,
  SYSTEM_DEFAULT_DEVICE_ID,
} from "../../lib/resenha/media-devices";

export default class ResenhaVideoSettingsModal extends Component {
  @service resenhaWebrtc;

  @tracked videoDevices = [];
  @tracked previewStream = null;
  @tracked previewError = false;
  @tracked busy = false;

  #previewRawStream = null;
  #previewBlur = null;
  #previewEpoch = 0;
  #onDeviceChange = () => this.refreshDevices();

  constructor() {
    super(...arguments);
    if (this.usingLiveStream) {
      this.refreshDevices();
    } else {
      this.startPreview();
    }
    navigator.mediaDevices?.addEventListener?.(
      "devicechange",
      this.#onDeviceChange
    );
  }

  willDestroy() {
    super.willDestroy(...arguments);
    navigator.mediaDevices?.removeEventListener?.(
      "devicechange",
      this.#onDeviceChange
    );
    this.#stopPreview();
  }

  get blurAvailable() {
    return this.resenhaWebrtc.videoBlurAvailable;
  }

  get blurSupported() {
    return this.resenhaWebrtc.videoBlurSupported;
  }

  get blurUsable() {
    return this.blurAvailable && this.blurSupported;
  }

  get blurEnabled() {
    return this.resenhaWebrtc.videoBlurEnabled;
  }

  get blurAmount() {
    return this.resenhaWebrtc.videoBlurAmount;
  }

  get usingLiveStream() {
    return this.resenhaWebrtc.localVideoKind === "camera";
  }

  get stream() {
    return this.usingLiveStream
      ? this.resenhaWebrtc.localVideoStream
      : this.previewStream;
  }

  async startPreview() {
    this.#stopPreview();
    const epoch = ++this.#previewEpoch;
    this.previewError = false;

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: cameraConstraints(this.resenhaWebrtc.videoInputDeviceId),
      });
    } catch {
      if (!this.isDestroying && !this.isDestroyed) {
        this.previewError = true;
      }
      return;
    }

    if (epoch !== this.#previewEpoch || this.isDestroying || this.isDestroyed) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    this.#previewRawStream = stream;
    await this.#applyPreviewEffect(epoch);
    await this.refreshDevices();
  }

  async refreshDevices() {
    const inputs = await enumerateVideoDevices();
    if (this.isDestroying || this.isDestroyed) {
      return;
    }

    this.videoDevices = [
      {
        id: SYSTEM_DEFAULT_DEVICE_ID,
        name: i18n("resenha.devices.system_default"),
      },
      ...inputs,
    ];
  }

  async #applyPreviewEffect(epoch = this.#previewEpoch) {
    this.#previewBlur?.teardown();
    this.#previewBlur = null;

    if (!this.#previewRawStream) {
      return;
    }

    if (this.blurEnabled && this.blurUsable) {
      const manager = new BackgroundBlurManager();
      const rawStream = this.#previewRawStream;
      try {
        const processed = await manager.setup(rawStream, this.blurAmount);
        if (
          epoch !== this.#previewEpoch ||
          this.isDestroying ||
          this.isDestroyed
        ) {
          manager.teardown();
          return;
        }
        this.#previewBlur = manager;
        this.previewStream = processed;
        return;
      } catch {
        manager.teardown();
      }

      if (epoch !== this.#previewEpoch) {
        return;
      }
    }

    this.previewStream = this.#previewRawStream;
  }

  #stopPreview() {
    this.#previewEpoch++;
    this.#previewBlur?.teardown();
    this.#previewBlur = null;

    if (this.#previewRawStream) {
      this.#previewRawStream.getTracks().forEach((track) => track.stop());
      this.#previewRawStream = null;
    }

    this.previewStream = null;
  }

  @action
  async onCameraChange(deviceId) {
    await this.resenhaWebrtc.setVideoInputDevice(deviceId);
    if (!this.usingLiveStream) {
      await this.startPreview();
    }
  }

  @action
  async toggleBlur() {
    if (this.busy || !this.blurUsable) {
      return;
    }

    this.busy = true;
    try {
      await this.resenhaWebrtc.toggleVideoBlur();
      if (!this.usingLiveStream) {
        await this.#applyPreviewEffect();
      }
    } finally {
      if (!this.isDestroying && !this.isDestroyed) {
        this.busy = false;
      }
    }
  }

  @action
  onAmountChange(event) {
    const value = parseInt(event.target.value, 10);
    this.resenhaWebrtc.setVideoBlurAmount(value);
    this.#previewBlur?.setAmount(value);
  }

  <template>
    <DModal
      @closeModal={{@closeModal}}
      @title={{i18n "resenha.video_settings.title"}}
      class="resenha-video-settings-modal"
    >
      <:body>
        <div class="resenha-video-settings">
          <div class="resenha-video-settings__preview">
            {{#if this.previewError}}
              <p class="resenha-video-settings__camera-error">
                {{i18n "resenha.video_settings.camera_error"}}
              </p>
            {{else if this.stream}}
              <video
                {{didInsert
                  (fn this.resenhaWebrtc.attachVideoStream this.stream)
                }}
                {{didUpdate
                  (fn this.resenhaWebrtc.attachVideoStream this.stream)
                  this.stream
                }}
                muted
                autoplay
                playsinline
              ></video>
            {{/if}}
          </div>

          <div class="resenha-video-settings__field">
            <label class="resenha-video-settings__label">
              {{i18n "resenha.video_settings.camera"}}
            </label>
            <ComboBox
              @content={{this.videoDevices}}
              @value={{this.resenhaWebrtc.videoInputDeviceId}}
              @onChange={{this.onCameraChange}}
              @options={{hash none=false}}
              class="resenha-video-settings__camera-select"
            />
          </div>

          {{#if this.blurAvailable}}
            <div class="resenha-video-settings__field">
              <DToggleSwitch
                @state={{this.blurEnabled}}
                @label="resenha.video_settings.background_blur"
                disabled={{or this.busy (not this.blurSupported)}}
                {{on "click" this.toggleBlur}}
              />
              {{#unless this.blurSupported}}
                <p class="resenha-video-settings__hint">
                  {{i18n "resenha.video_settings.not_supported"}}
                </p>
              {{/unless}}
            </div>

            {{#if (and this.blurEnabled this.blurSupported)}}
              <div class="resenha-video-settings__field">
                <label
                  class="resenha-video-settings__label"
                  for="resenha-video-settings-blur-amount"
                >
                  {{i18n "resenha.video_settings.blur_amount"}}
                </label>
                <input
                  type="range"
                  id="resenha-video-settings-blur-amount"
                  min="0"
                  max="100"
                  value={{this.blurAmount}}
                  class="resenha-video-settings__blur-slider"
                  {{on "input" this.onAmountChange}}
                />
              </div>
            {{/if}}
          {{/if}}
        </div>
      </:body>
    </DModal>
  </template>
}
