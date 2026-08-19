// Per-device preferences for the browser's microphone processing chain and
// the noise suppression mode. Echo cancellation and automatic gain control
// default to on (matching what browsers do when the constraints are absent);
// they are stored only when the user turns one off.
//
// Noise suppression is a three-way mode:
//   "none"     — no filtering at all
//   "standard" — the browser's native noise suppression
//   "ai"       — the DTLN worklet; native suppression is turned OFF so the
//                two filters don't stack (stacked suppressors produce the
//                classic underwater/musical artifacts)

const EC_STORAGE_KEY = "resenha:echo-cancellation";
const AGC_STORAGE_KEY = "resenha:auto-gain-control";
const NS_MODE_STORAGE_KEY = "resenha:noise-suppression-mode";
const LEGACY_NS_STORAGE_KEY = "resenha:noise-suppression";

export const NOISE_SUPPRESSION_MODES = ["none", "standard", "ai"];

function readDefaultOnFlag(key) {
  try {
    return localStorage.getItem(key) !== "0";
  } catch {
    return true;
  }
}

function storeDefaultOnFlag(key, enabled) {
  try {
    if (enabled) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, "0");
    }
  } catch {
    // ignore storage errors
  }
}

export function echoCancellationPreferred() {
  return readDefaultOnFlag(EC_STORAGE_KEY);
}

export function setEchoCancellationPreferred(enabled) {
  storeDefaultOnFlag(EC_STORAGE_KEY, enabled);
}

export function autoGainControlPreferred() {
  return readDefaultOnFlag(AGC_STORAGE_KEY);
}

export function setAutoGainControlPreferred(enabled) {
  storeDefaultOnFlag(AGC_STORAGE_KEY, enabled);
}

export function preferredNoiseSuppressionMode() {
  try {
    const mode = localStorage.getItem(NS_MODE_STORAGE_KEY);
    if (NOISE_SUPPRESSION_MODES.includes(mode)) {
      return mode;
    }
    // The boolean predates the mode: "1" meant the DTLN worklet was on.
    if (localStorage.getItem(LEGACY_NS_STORAGE_KEY) === "1") {
      return "ai";
    }
  } catch {
    // fall through to the default
  }
  return "standard";
}

export function setPreferredNoiseSuppressionMode(mode) {
  if (!NOISE_SUPPRESSION_MODES.includes(mode)) {
    return;
  }
  try {
    localStorage.setItem(NS_MODE_STORAGE_KEY, mode);
    localStorage.removeItem(LEGACY_NS_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

// The audio-processing member of getUserMedia constraints. Explicit even for
// the defaults, so what the pipeline believes and what the browser applies
// can't drift apart.
export function processingConstraints() {
  return {
    echoCancellation: echoCancellationPreferred(),
    autoGainControl: autoGainControlPreferred(),
    noiseSuppression: preferredNoiseSuppressionMode() === "standard",
  };
}
