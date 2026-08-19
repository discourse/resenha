import { tracked } from "@glimmer/tracking";
import InputGateManager, { sliderToRms } from "./input-gate";
import {
  audioConstraints,
  preferredInputDeviceId,
  setPreferredInputDeviceId,
} from "./media-devices";
import NoiseSuppressionManager, { SupersededError } from "./noise-suppression";

// Owns the local microphone pipeline: raw mic → optional noise suppression →
// optional input gate → the published `stream`. All restructures of the
// pipeline (device switch, suppression toggle, gate crossing zero) notify the
// service so it can re-sync monitors and move peers onto the new track.
export default class LocalAudioPipeline {
  // "off" | "starting" | "on". With a live microphone, "on" means the DTLN
  // worklet confirmed it is filtering (the ready handshake); without one it
  // mirrors the stored preference.
  @tracked noiseSuppressionState = "off";
  @tracked stream = null;
  @tracked gateThreshold = InputGateManager.storedSliderValue();
  @tracked inputDeviceId = preferredInputDeviceId();

  #rawStream = null;
  #upstream = null;
  #noiseSuppression;
  #inputGate;
  #onStreamChanged;
  #onSuppressionFailed;
  #replaceTrackOnPeers;

  // Serializes every pipeline restructure. Suppression toggles now await a
  // multi-second worklet handshake, and they can be triggered from several
  // controls at once; interleaving a toggle with a device switch corrupts
  // which stream peers end up on.
  #queue = Promise.resolve();

  constructor({ onStreamChanged, onSuppressionFailed, replaceTrackOnPeers }) {
    this.#onStreamChanged = onStreamChanged;
    this.#onSuppressionFailed = onSuppressionFailed;
    this.#replaceTrackOnPeers = replaceTrackOnPeers;

    this.#noiseSuppression = new NoiseSuppressionManager({
      onRuntimeFailure: () => this.#handleSuppressionRuntimeFailure(),
    });
    this.noiseSuppressionState = this.#noiseSuppression.isPreferred()
      ? "on"
      : "off";

    this.#inputGate = new InputGateManager();
  }

  get noiseSuppressionEnabled() {
    return this.noiseSuppressionState === "on";
  }

  #serialize(task) {
    const run = this.#queue.then(task, task);
    this.#queue = run.then(
      () => {},
      () => {}
    );
    return run;
  }

  acquireMicrophone() {
    return this.#serialize(() => this.#acquireMicrophone());
  }

  async #acquireMicrophone() {
    try {
      const rawStream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints(this.inputDeviceId),
      });
      // eslint-disable-next-line no-console
      console.log("[resenha] local stream obtained");

      this.#rawStream = rawStream;

      if (this.#noiseSuppression.isPreferred()) {
        this.noiseSuppressionState = "starting";
        try {
          const suppressed = await this.#noiseSuppression.setup(rawStream);
          this.noiseSuppressionState = "on";
          this.#setOutgoingStream(suppressed);
          // eslint-disable-next-line no-console
          console.log("[resenha] noise suppression enabled");
        } catch (error) {
          if (error instanceof SupersededError) {
            return true;
          }
          // eslint-disable-next-line no-console
          console.warn(
            "[resenha] noise suppression setup failed, using raw stream",
            error
          );
          // The preference survives a transient failure; the next
          // acquisition retries.
          this.noiseSuppressionState = "off";
          this.#setOutgoingStream(rawStream);
        }
      } else {
        this.noiseSuppressionState = "off";
        this.#setOutgoingStream(rawStream);
      }

      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("[resenha] failed to obtain local stream", error);
      return false;
    }
  }

  toggleNoiseSuppression() {
    return this.#serialize(() => this.#toggleNoiseSuppression());
  }

  async #toggleNoiseSuppression() {
    // Without a live mic (e.g. a stage listener) just store the preference;
    // it applies when the microphone is next acquired.
    if (!this.#rawStream) {
      const enabling = this.noiseSuppressionState === "off";
      this.noiseSuppressionState = enabling ? "on" : "off";
      this.#noiseSuppression.setPreference(enabling);
      return;
    }

    if (this.noiseSuppressionState === "on") {
      this.#noiseSuppression.teardown();
      this.noiseSuppressionState = "off";
      this.#setOutgoingStream(this.#rawStream);
      this.#noiseSuppression.setPreference(false);
      // eslint-disable-next-line no-console
      console.log("[resenha] noise suppression disabled");
    } else {
      this.noiseSuppressionState = "starting";
      try {
        const suppressed = await this.#noiseSuppression.setup(this.#rawStream, {
          userGesture: true,
        });
        this.noiseSuppressionState = "on";
        this.#setOutgoingStream(suppressed);
        this.#noiseSuppression.setPreference(true);
        // eslint-disable-next-line no-console
        console.log("[resenha] noise suppression enabled");
      } catch (error) {
        if (error instanceof SupersededError) {
          // A newer restructure owns the pipeline (and its state) now.
          return;
        }
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

  setInputDevice(deviceId) {
    return this.#serialize(() => this.#setInputDevice(deviceId));
  }

  async #setInputDevice(deviceId) {
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

    if (this.noiseSuppressionState !== "off") {
      this.#noiseSuppression.teardown();
      this.noiseSuppressionState = "starting";
      try {
        const suppressed = await this.#noiseSuppression.setup(newRawStream, {
          userGesture: true,
        });
        this.noiseSuppressionState = "on";
        this.#setOutgoingStream(suppressed);
      } catch (error) {
        if (error instanceof SupersededError) {
          oldRawStream.getTracks().forEach((track) => track.stop());
          return true;
        }
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

  // Intentionally synchronous and not serialized: leaving the room must take
  // effect immediately. teardown() bumps the suppression epoch, so any
  // in-flight setup unwinds as superseded instead of publishing a stream.
  stop() {
    this.#noiseSuppression.teardown();
    this.noiseSuppressionState = this.#noiseSuppression.isPreferred()
      ? "on"
      : "off";
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

  // The worklet reported a mid-call breakdown (repeated DTLN failures or a
  // late init error): fall all the way back to the raw track so peers don't
  // keep listening through a dead passthrough graph.
  #handleSuppressionRuntimeFailure() {
    this.#serialize(async () => {
      if (this.noiseSuppressionState === "off" || !this.#rawStream) {
        return;
      }
      this.#noiseSuppression.teardown();
      this.#revertSuppressionPreference();
      this.#setOutgoingStream(this.#rawStream);
      await this.#replaceTrackOnPeers();
    });
  }

  #revertSuppressionPreference() {
    this.noiseSuppressionState = "off";
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
