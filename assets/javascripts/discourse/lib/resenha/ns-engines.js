import { getURLWithCDN } from "discourse/lib/get-url";
import { i18n } from "discourse-i18n";
import * as dfn3 from "./ns-assets/dfn3";
import * as dtln from "./ns-assets/dtln";
import * as rnnoise from "./ns-assets/rnnoise";

const NS_PATH = "/plugins/resenha/javascripts";

// getURLWithCDN's cdn is the app-proxying CDN, which serves the plugin's
// public dir. Absolutized against the page URL because this compiled chunk
// may itself be served from a CDN origin.
export function nsUrl(file) {
  return new URL(getURLWithCDN(`${NS_PATH}/${file}`), window.location).href;
}

// The selectable AI noise-suppression engines. Every engine ships a worklet
// bundle speaking the same protocol (see src/ns-worklet/runtime.js): asset
// bytes posted in, ready/error handshake out, mono frames filtered at the
// engine's own rate. Asset filenames come from the generated per-engine
// manifests under ./ns-assets/ (rebuilt by scripts/build-<id>-worklet.sh)
// and resolve to URLs through nsUrl().
//
// Order here is the order shown in the mode selectors.
export const NS_ENGINES = {
  rnnoise: {
    workletFile: rnnoise.WORKLET_FILE,
    wasmFile: rnnoise.WASM_FILE,
  },
  dtln: {
    workletFile: dtln.WORKLET_FILE,
    wasmFile: dtln.WASM_FILE,
  },
  dfn3: {
    workletFile: dfn3.WORKLET_FILE,
    wasmFile: dfn3.WASM_FILE,
    modelFile: dfn3.MODEL_FILE,
  },
};

export function engineForMode(mode) {
  if (!mode?.startsWith?.("ai:")) {
    return null;
  }
  return NS_ENGINES[mode.slice(3)] ?? null;
}

// "ai:dtln" → the "…noise_suppression_modes.ai_dtln" translation ("ai:dtln"
// itself stays the stored/mode value; colons just make poor YAML keys).
export function noiseSuppressionModeLabel(mode) {
  return i18n(
    `resenha.voice_settings.noise_suppression_modes.${mode.replace(":", "_")}`
  );
}
