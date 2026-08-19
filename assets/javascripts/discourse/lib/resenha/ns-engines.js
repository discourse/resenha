import { i18n } from "discourse-i18n";
import * as dfn3 from "./ns-assets/dfn3";
import * as dtln from "./ns-assets/dtln";
import * as rnnoise from "./ns-assets/rnnoise";

// The selectable AI noise-suppression engines. Every engine ships a worklet
// bundle speaking the same protocol (see src/ns-worklet/runtime.js): asset
// bytes posted in, ready/error handshake out, mono frames filtered at the
// engine's own rate. Asset paths come from the generated per-engine
// manifests under ./ns-assets/ (rebuilt by scripts/build-<id>-worklet.sh).
//
// Order here is the order shown in the mode selectors.
export const NS_ENGINES = {
  rnnoise: {
    workletPath: rnnoise.WORKLET_PATH,
    wasmPath: rnnoise.WASM_PATH,
  },
  dtln: {
    workletPath: dtln.WORKLET_PATH,
    wasmPath: dtln.WASM_PATH,
  },
  dfn3: {
    workletPath: dfn3.WORKLET_PATH,
    wasmPath: dfn3.WASM_PATH,
    modelPath: dfn3.MODEL_PATH,
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
