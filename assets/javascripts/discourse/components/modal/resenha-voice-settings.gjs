import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { hash } from "@ember/helper";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { service } from "@ember/service";
import { htmlSafe } from "@ember/template";
import DButton from "discourse/components/d-button";
import DModal from "discourse/components/d-modal";
import ComboBox from "discourse/select-kit/components/combo-box";
import { i18n } from "discourse-i18n";
import { rmsToPercent, sampleRms } from "../../lib/resenha/input-gate";
import {
  applyOutputDevice,
  audioConstraints,
  enumerateAudioDevices,
  outputSelectionSupported,
  SYSTEM_DEFAULT_DEVICE_ID,
} from "../../lib/resenha/media-devices";

const METER_INTERVAL_MS = 50;

export default class ResenhaVoiceSettingsModal extends Component {
  @service resenhaWebrtc;

  @tracked inputDevices = [];
  @tracked outputDevices = [];
  @tracked level = 0;
  @tracked micError = false;
  @tracked testingOutput = false;

  #previewStream = null;
  #previewContext = null;
  #meterTimer = null;
  #onDeviceChange = () => this.refreshDevices();

  constructor() {
    super(...arguments);
    this.startPreview();
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

  get outputSupported() {
    return outputSelectionSupported();
  }

  get showOutputPrompt() {
    return (
      this.outputSupported &&
      this.outputDevices.length <= 1 &&
      !!navigator.mediaDevices?.selectAudioOutput
    );
  }

  get gateThreshold() {
    return this.resenhaWebrtc.gateThreshold;
  }

  get gateOpen() {
    return this.gateThreshold === 0 || this.level >= this.gateThreshold;
  }

  get meterFillStyle() {
    return htmlSafe(`width: ${Math.round(this.level)}%`);
  }

  get thresholdMarkerStyle() {
    return htmlSafe(`left: ${this.gateThreshold}%`);
  }

  async startPreview() {
    this.#stopPreview();
    this.micError = false;

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints(this.resenhaWebrtc.inputDeviceId),
      });
    } catch {
      if (!this.isDestroying && !this.isDestroyed) {
        this.micError = true;
        this.level = 0;
      }
      return;
    }

    if (this.isDestroying || this.isDestroyed) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    this.#previewStream = stream;

    try {
      const context = new AudioContext();
      if (context.state === "suspended") {
        context.resume().catch(() => {});
      }
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      this.#previewContext = context;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const sample = () => {
        this.level = rmsToPercent(sampleRms(analyser, dataArray));
        this.#meterTimer = setTimeout(sample, METER_INTERVAL_MS);
      };
      sample();
    } catch {
      this.micError = true;
    }

    await this.refreshDevices();
  }

  async refreshDevices() {
    const { inputs, outputs } = await enumerateAudioDevices();
    if (this.isDestroying || this.isDestroyed) {
      return;
    }

    const defaultOption = {
      id: SYSTEM_DEFAULT_DEVICE_ID,
      name: i18n("resenha.devices.system_default"),
    };
    this.inputDevices = [defaultOption, ...inputs];
    this.outputDevices = [defaultOption, ...outputs];
  }

  @action
  async onInputChange(deviceId) {
    await this.resenhaWebrtc.setInputDevice(deviceId);
    await this.startPreview();
  }

  @action
  onOutputChange(deviceId) {
    this.resenhaWebrtc.setOutputDevice(deviceId);
  }

  @action
  async chooseOutputDevice() {
    try {
      const device = await navigator.mediaDevices.selectAudioOutput();
      this.resenhaWebrtc.setOutputDevice(device.deviceId);
      await this.refreshDevices();
    } catch {}
  }

  @action
  onThresholdChange(event) {
    this.resenhaWebrtc.setGateThreshold(parseInt(event.target.value, 10));
  }

  @action
  async playOutputTest() {
    if (this.testingOutput) {
      return;
    }
    this.testingOutput = true;

    try {
      const context = new AudioContext();
      const destination = context.createMediaStreamDestination();
      const now = context.currentTime;

      [523.25, 659.25].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.frequency.value = frequency;
        const start = now + index * 0.15;
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
        oscillator.connect(gain).connect(destination);
        oscillator.start(start);
        oscillator.stop(start + 0.3);
      });

      const element = new Audio();
      element.srcObject = destination.stream;
      applyOutputDevice(element, this.resenhaWebrtc.outputDeviceId);
      await element.play();

      setTimeout(() => {
        element.pause();
        element.srcObject = null;
        context.close().catch(() => {});
        if (!this.isDestroying && !this.isDestroyed) {
          this.testingOutput = false;
        }
      }, 700);
    } catch {
      this.testingOutput = false;
    }
  }

  #stopPreview() {
    if (this.#meterTimer) {
      clearTimeout(this.#meterTimer);
      this.#meterTimer = null;
    }

    if (this.#previewContext) {
      try {
        this.#previewContext.close();
      } catch {}
      this.#previewContext = null;
    }

    if (this.#previewStream) {
      this.#previewStream.getTracks().forEach((track) => track.stop());
      this.#previewStream = null;
    }
  }

  <template>
    <DModal
      @closeModal={{@closeModal}}
      @title={{i18n "resenha.voice_settings.title"}}
      class="resenha-voice-settings-modal"
    >
      <:body>
        <div class="resenha-voice-settings">
          <div class="resenha-voice-settings__field">
            <label class="resenha-voice-settings__label">
              {{i18n "resenha.voice_settings.input_device"}}
            </label>
            <ComboBox
              @content={{this.inputDevices}}
              @value={{this.resenhaWebrtc.inputDeviceId}}
              @onChange={{this.onInputChange}}
              @options={{hash none=false}}
              class="resenha-voice-settings__input-select"
            />
          </div>

          {{#if this.outputSupported}}
            <div class="resenha-voice-settings__field">
              <label class="resenha-voice-settings__label">
                {{i18n "resenha.voice_settings.output_device"}}
              </label>
              <div class="resenha-voice-settings__output-row">
                {{#if this.showOutputPrompt}}
                  <DButton
                    @action={{this.chooseOutputDevice}}
                    @icon="headphones"
                    @label="resenha.voice_settings.choose_output"
                    class="resenha-voice-settings__choose-output-btn"
                  />
                {{else}}
                  <ComboBox
                    @content={{this.outputDevices}}
                    @value={{this.resenhaWebrtc.outputDeviceId}}
                    @onChange={{this.onOutputChange}}
                    @options={{hash none=false}}
                    class="resenha-voice-settings__output-select"
                  />
                {{/if}}
                <DButton
                  @action={{this.playOutputTest}}
                  @icon="play"
                  @label="resenha.voice_settings.test_output"
                  @disabled={{this.testingOutput}}
                  class="resenha-voice-settings__test-output-btn"
                />
              </div>
            </div>
          {{/if}}

          <div class="resenha-voice-settings__field">
            <label class="resenha-voice-settings__label">
              {{i18n "resenha.voice_settings.mic_test"}}
            </label>
            {{#if this.micError}}
              <p class="resenha-voice-settings__mic-error">
                {{i18n "resenha.voice_settings.mic_error"}}
              </p>
            {{else}}
              <div
                class="resenha-voice-settings__meter
                  {{if this.gateOpen '--open'}}"
              >
                <span
                  class="resenha-voice-settings__meter-fill"
                  style={{this.meterFillStyle}}
                ></span>
                {{#if this.gateThreshold}}
                  <span
                    class="resenha-voice-settings__meter-threshold"
                    style={{this.thresholdMarkerStyle}}
                  ></span>
                {{/if}}
              </div>
              <p class="resenha-voice-settings__hint">
                {{i18n "resenha.voice_settings.mic_test_hint"}}
              </p>
            {{/if}}
          </div>

          <div class="resenha-voice-settings__field">
            <label
              class="resenha-voice-settings__label"
              for="resenha-voice-settings-sensitivity"
            >
              {{i18n "resenha.voice_settings.input_sensitivity"}}
            </label>
            <input
              type="range"
              id="resenha-voice-settings-sensitivity"
              min="0"
              max="100"
              value={{this.gateThreshold}}
              class="resenha-voice-settings__sensitivity-slider"
              {{on "input" this.onThresholdChange}}
            />
            <p class="resenha-voice-settings__hint">
              {{i18n "resenha.voice_settings.input_sensitivity_hint"}}
            </p>
          </div>
        </div>
      </:body>
    </DModal>
  </template>
}
