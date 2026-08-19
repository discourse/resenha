#!/usr/bin/env bash
#
# Builds the RNNoise noise-suppression AudioWorklet assets.
#
# Prerequisites: Emscripten SDK (emcc in PATH), Node.js >= 22 with pnpm.
#
# RNNoise v0.1.1 is used deliberately: its classic ~85KB model yields a
# ~130KB standalone wasm and very low CPU cost — the lightweight engine in
# the selector. Later upstream models (2023 retrain) are 5-15MB, which
# defeats the purpose; DTLN/DeepFilterNet cover the higher-quality tiers.
#
# The wasm is built with STANDALONE_WASM: plain C, no filesystem, so no
# Emscripten JS glue is needed at all — the worklet instantiates the bytes
# directly.

set -euo pipefail

RNNOISE_REPO="https://github.com/xiph/rnnoise"
RNNOISE_SHA="6cbfd53eb348a8d394e0757b4025c6ded34eb2b6" # v0.1.1

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
VENDOR_DIR="${PLUGIN_DIR}/vendor/rnnoise"

source "${SCRIPT_DIR}/ns-build-common.sh"

echo "==> Step 1: Check out rnnoise @ ${RNNOISE_SHA}"

if [ ! -d "${VENDOR_DIR}/.git" ]; then
  git clone "${RNNOISE_REPO}" "${VENDOR_DIR}"
fi

cd "${VENDOR_DIR}"
git fetch origin "${RNNOISE_SHA}" 2>/dev/null || git fetch origin
git reset --hard "${RNNOISE_SHA}"

echo "==> Step 2: Compile standalone wasm"

if ! command -v emcc >/dev/null; then
  echo "ERROR: emcc not in PATH. Install the Emscripten SDK first." >&2
  exit 1
fi

WASM_TMP="$(mktemp --suffix=.wasm)"
BUNDLE_TMP="$(mktemp --suffix=.js)"
trap 'rm -f "${WASM_TMP}" "${BUNDLE_TMP}"' EXIT

emcc -O3 -msimd128 -Iinclude \
  src/celt_lpc.c src/denoise.c src/kiss_fft.c src/pitch.c \
  src/rnn.c src/rnn_data.c src/rnn_reader.c \
  -sSTANDALONE_WASM --no-entry -sSTRICT=1 -sMALLOC=emmalloc \
  -sSTACK_SIZE=200KB -sALLOW_MEMORY_GROWTH=1 \
  -sEXPORTED_FUNCTIONS=_rnnoise_create,_rnnoise_process_frame,_rnnoise_destroy,_rnnoise_get_frame_size,_malloc,_free \
  -o "${WASM_TMP}"

echo "==> Step 3: Bundle AudioWorklet processor"

bundle_worklet "rnnoise" "${BUNDLE_TMP}"

echo "==> Step 4: Emit content-hashed assets + manifest"

emit_ns_assets "rnnoise" "${BUNDLE_TMP}" "${WASM_TMP}"
