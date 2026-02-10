#!/usr/bin/env bash
#
# Builds the dtln-worklet.js AudioWorklet bundle for noise suppression.
#
# Prerequisites:
#   - Rust toolchain (rustup)
#   - Emscripten SDK (emcc in PATH)
#   - Node.js >= 22 with pnpm
#
# The script:
#   1. Clones/updates dtln-rs and compiles it to WASM via Emscripten
#   2. Copies the generated dtln.js (WASM embedded via SINGLE_FILE=1) to the worklet source dir
#   3. Bundles the AudioWorklet processor + dtln.js into a single file with webpack
#
# Output: public/javascripts/dtln-worklet.js

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
VENDOR_DIR="${PLUGIN_DIR}/vendor/dtln-rs"
WORKLET_SRC_DIR="${PLUGIN_DIR}/src/dtln-worklet"
OUTPUT_DIR="${PLUGIN_DIR}/public/javascripts"

echo "==> Step 1: Compile dtln-rs to WASM"

if [ ! -d "${VENDOR_DIR}" ]; then
  echo "    Cloning dtln-rs..."
  git clone https://github.com/DataDog/dtln-rs "${VENDOR_DIR}"
else
  echo "    dtln-rs already cloned, updating..."
  cd "${VENDOR_DIR}" && git pull --ff-only
fi

cd "${VENDOR_DIR}"
echo "    Running npm run install-wasm..."
npm run install-wasm

# The build produces dtln.js with WASM embedded (SINGLE_FILE=1)
DTLN_JS="${VENDOR_DIR}/dtln.js"

if [ ! -f "${DTLN_JS}" ]; then
  echo "ERROR: dtln.js not found at ${DTLN_JS}"
  echo "       Check that 'npm run install-wasm' completed successfully."
  exit 1
fi

echo "    Copying dtln.js to worklet source directory..."
cp "${DTLN_JS}" "${WORKLET_SRC_DIR}/dtln.js"

echo "==> Step 2: Bundle AudioWorklet processor"

cd "${PLUGIN_DIR}"

# Install webpack locally if not present
if [ ! -f "node_modules/.bin/webpack" ]; then
  echo "    Installing webpack..."
  pnpm add -D webpack webpack-cli
fi

mkdir -p "${OUTPUT_DIR}"

echo "    Running webpack..."
npx webpack --config "${WORKLET_SRC_DIR}/webpack.config.js"

echo "==> Build complete!"
echo "    Output: ${OUTPUT_DIR}/dtln-worklet.js"
echo ""
echo "    Commit this file to the repository. The build only needs"
echo "    to be re-run when updating the dtln-rs dependency."
