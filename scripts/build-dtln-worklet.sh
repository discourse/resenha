#!/usr/bin/env bash
#
# Builds the DTLN noise-suppression AudioWorklet assets.
#
# Prerequisites:
#   - Rust toolchain (rustup) with the wasm32-unknown-emscripten target
#   - Emscripten SDK (emcc in PATH)
#   - Node.js >= 22 with pnpm (esbuild comes from the plugin's devDependencies)
#
# The script:
#   1. Clones DataDog/dtln-rs at a pinned commit and applies the patches
#      committed under src/dtln-worklet/patches/
#   2. Compiles it to WASM via Emscripten (small modularized JS glue +
#      separate dtln_rs.wasm)
#   3. Bundles the AudioWorklet processor + glue with esbuild
#   4. Emits content-hashed files under public/javascripts/dtln/ and
#      regenerates the manifest module the loader imports
#
# Commit the emitted public/javascripts/dtln/ files and the regenerated
# assets/javascripts/discourse/lib/resenha/ns-assets/dtln.js. The build only
# needs to be re-run when updating dtln-rs, the patches, or the worklet
# processor source.

set -euo pipefail

DTLN_RS_REPO="https://github.com/DataDog/dtln-rs"
DTLN_RS_SHA="5bd53c00d3334615f9b03fa7775402ae2a39b616"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
VENDOR_DIR="${PLUGIN_DIR}/vendor/dtln-rs"
WORKLET_SRC_DIR="${PLUGIN_DIR}/src/dtln-worklet"

source "${SCRIPT_DIR}/ns-build-common.sh"

echo "==> Step 1: Check out dtln-rs @ ${DTLN_RS_SHA} and apply patches"

if [ ! -d "${VENDOR_DIR}/.git" ]; then
  git clone "${DTLN_RS_REPO}" "${VENDOR_DIR}"
fi

cd "${VENDOR_DIR}"
git fetch origin "${DTLN_RS_SHA}" 2>/dev/null || git fetch origin
git reset --hard "${DTLN_RS_SHA}"

for patch in "${WORKLET_SRC_DIR}"/patches/*.patch; do
  echo "    Applying $(basename "${patch}")"
  git apply --3way "${patch}"
done

echo "==> Step 2: Compile dtln-rs to WASM"

if ! command -v emcc >/dev/null; then
  echo "ERROR: emcc not in PATH. Install the Emscripten SDK first." >&2
  exit 1
fi
rustup target add wasm32-unknown-emscripten

cargo build --release --target wasm32-unknown-emscripten

RELEASE_DIR="${VENDOR_DIR}/target/wasm32-unknown-emscripten/release"
GLUE_JS="${RELEASE_DIR}/dtln-rs.js"
WASM="${RELEASE_DIR}/dtln_rs.wasm"

for artifact in "${GLUE_JS}" "${WASM}"; do
  if [ ! -f "${artifact}" ]; then
    echo "ERROR: expected build artifact missing: ${artifact}" >&2
    exit 1
  fi
done

echo "    Copying Emscripten glue to worklet source directory..."
cp "${GLUE_JS}" "${WORKLET_SRC_DIR}/dtln.js"

echo "==> Step 3: Bundle AudioWorklet processor"

BUNDLE_TMP="$(mktemp --suffix=.js)"
trap 'rm -f "${BUNDLE_TMP}"' EXIT
bundle_worklet "dtln" "${BUNDLE_TMP}"

echo "==> Step 4: Emit content-hashed assets + manifest"

emit_ns_assets "dtln" "${BUNDLE_TMP}" "${WASM}"
