import { tracked } from "@glimmer/tracking";
import InputGateManager, { sliderToRms } from "./input-gate";
import {
  audioConstraints,
  preferredInputDeviceId,
  setPreferredInputDeviceId,
} from "./media-devices";
import NoiseSuppressionManager from "./noise-suppression";

// Owns the local microphone pipeline: raw mic → optional noise suppression →
// optional input gate → the published `stream`. All restructures of the
// pipeline (device switch, suppression toggle, gate crossing zero) notify the
// service so it can re-sync monitors and move peers onto the new track.
export default class LocalAudioPipeline {
  @tracked stream = null;
  @tracked noiseSuppressionEnabled = false;
  @tracked gateThreshold = InputGateManager.storedSliderValue();
  @tracked inputDeviceId = preferredInputDeviceId();

  #rawStream = null;
  #upstream = null;
  #noiseSuppression;
  #inputGate;
  #onStreamChanged;
  #onSuppressionFailed;
  #replaceTrackOnPeers;

  constructor({ onStreamChanged, onSuppressionFailed, replaceTrackOnPeers }) {
    this.#onStreamChanged = onStreamChanged;
    this.#onSuppressionFailed = onSuppressionFailed;
    this.#replaceTrackOnPeers = replaceTrackOnPeers;

    this.#noiseSuppression = new NoiseSuppressionManager({
      onStreamReady: (stream) => this.#setOutgoingStream(stream),
    });
    this.noiseSuppressionEnabled = this.#noiseSuppression.isPreferred();

    this.#inputGate = new InputGateManager();
  }

  async acquireMicrophone() {
    try {
      const rawStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints(this.inputDeviceId),
      });
      // eslint-disable-next-line no-console
      console.log("[resenha] local stream obtained");

      this.#rawStream = rawStream;

      if (this.#noiseSuppression.isPreferred()) {
        try {
          await this.#noiseSuppression.setup(rawStream);
          this.noiseSuppressionEnabled = true;
          // eslint-disable-next-line no-console
          console.log("[resenha] noise suppression enabled");
        } catch (nsError) {
          // eslint-disable-next-line no-console
          console.warn(
            "[resenha] noise suppression setup failed, using raw stream",
            nsError
          );
          this.noiseSuppressionEnabled = false;
          this.#setOutgoingStream(rawStream);
        }
      } else {
        this.#setOutgoingStream(rawStream);
      }

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[resenha] failed to obtain local stream", error);
      return false;
    }
  }

  async toggleNoiseSuppression() {
    // Without a live mic (e.g. a stage listener) just store the preference;
    // it applies when the microphone is next acquired.
    if (!this.#rawStream) {
      this.noiseSuppressionEnabled = !this.noiseSuppressionEnabled;
      this.#noiseSuppression.setPreference(this.noiseSuppressionEnabled);
      return;
    }

    if (this.noiseSuppressionEnabled) {
      this.#noiseSuppression.teardown();
      this.noiseSuppressionEnabled = false;
      this.#setOutgoingStream(this.#rawStream);
      this.#noiseSuppression.setPreference(false);
      // eslint-disable-next-line no-console
      console.log("[resenha] noise suppression disabled");
    } else {
      try {
        await this.#noiseSuppression.setup(this.#rawStream);
        this.noiseSuppressionEnabled = true;
        this.#noiseSuppression.setPreference(true);
        // eslint-disable-next-line no-console
        console.log("[resenha] noise suppression enabled");
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("[resenha] failed to enable noise suppression", error);
        this.#revertSuppressionPreference();
        // #setOutgoingStream rebuilds the input gate, so the published stream
        // may be a brand-new track; peers must be moved onto it or they keep
        // the torn-down gate's dead track and hear silence.
        this.#setOutgoingStream(this.#rawStream);
        await this.#replaceTrackOnPeers();
        return;
      }
    }

    await this.#replaceTrackOnPeers();
  }

  async setInputDevice(deviceId) {
    const previousDeviceId = this.inputDeviceId;
    this.inputDeviceId = deviceId;
    setPreferredInputDeviceId(deviceId);

    if (!this.#rawStream) {
      return true;
    }

    let newRawStream;
    try {
      newRawStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints(deviceId, { exact: true }),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[resenha] failed to switch input device", error);
      this.inputDeviceId = previousDeviceId;
      setPreferredInputDeviceId(previousDeviceId);
      return false;
    }

    const oldRawStream = this.#rawStream;
    this.#rawStream = newRawStream;

    if (this.noiseSuppressionEnabled) {
      this.#noiseSuppression.teardown();
      try {
        await this.#noiseSuppression.setup(newRawStream);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(
          "[resenha] noise suppression setup failed after device switch",
          error
        );
        this.#revertSuppressionPreference();
        this.#setOutgoingStream(newRawStream);
      }
    } else {
      this.#setOutgoingStream(newRawStream);
    }

    oldRawStream.getTracks().forEach((track) => track.stop());
    await this.#replaceTrackOnPeers();
    return true;
  }

  async setGateThreshold(value) {
    const clamped = Math.max(0, Math.min(100, Math.round(value)));
    this.gateThreshold = clamped;
    InputGateManager.storeSliderValue(clamped);

    if (!this.#upstream) {
      return;
    }

    // Adjusting an already-running gate is just a new compare value; only
    // crossing zero (gate off ↔ on) restructures the pipeline and needs the
    // peers' senders updated.
    if (this.#inputGate.active && clamped > 0) {
      this.#inputGate.setThreshold(sliderToRms(clamped));
      return;
    }
    if (!this.#inputGate.active && clamped === 0) {
      return;
    }

    this.#setOutgoingStream(this.#upstream);
    await this.#replaceTrackOnPeers();
  }

  stop() {
    this.#noiseSuppression.teardown();
    this.noiseSuppressionEnabled = this.#noiseSuppression.isPreferred();
    this.#inputGate.teardown();
    this.#upstream = null;

    if (this.#rawStream) {
      this.#rawStream.getTracks().forEach((track) => track.stop());
      this.#rawStream = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.#onStreamChanged();
  }

  #revertSuppressionPreference() {
    this.noiseSuppressionEnabled = false;
    this.#noiseSuppression.setPreference(false);
    this.#onSuppressionFailed();
  }

  // Final hop of the pipeline: the `upstream` argument is the raw mic or the
  // noise-suppressed stream; the gate wraps it when enabled.
  #setOutgoingStream(upstream) {
    this.#upstream = upstream;
    this.#inputGate.teardown();

    let stream = upstream;
    if (upstream && this.gateThreshold > 0) {
      try {
        stream = this.#inputGate.setup(
          upstream,
          sliderToRms(this.gateThreshold)
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn("[resenha] failed to set up input gate", error);
        stream = upstream;
      }
    }

    this.stream = stream;
    this.#onStreamChanged();
  }
}
