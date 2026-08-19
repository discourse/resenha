#!/usr/bin/env bash
#
# Builds the DeepFilterNet3 noise-suppression AudioWorklet assets.
#
# Prerequisites:
#   - Rust toolchain (rustup) with the wasm32-unknown-unknown target
#   - wasm-pack
#   - Node.js >= 22 with pnpm
#
# libDF's official `wasm` feature runs the DFN3 model through tract (pure
# Rust ONNX), so this is a plain wasm-bindgen build — no Emscripten. The
# patches drop the `default-model` feature from the wasm bindings: the model
# would otherwise be baked into the binary, but it ships as its own
# content-hashed asset (fetched on the main thread and posted to the worklet
# with the wasm bytes).

set -euo pipefail

DFN_REPO="https://github.com/Rikorose/DeepFilterNet"
# main (0.5.7-pre): the wasm bindings landed after the v0.5.6 release.
DFN_SHA="d375b2d8309e0935d165700c91da9de862a99c31"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
VENDOR_DIR="${PLUGIN_DIR}/vendor/DeepFilterNet"
WORKLET_SRC_DIR="${PLUGIN_DIR}/src/dfn3-worklet"

source "${SCRIPT_DIR}/ns-build-common.sh"

echo "==> Step 1: Check out DeepFilterNet @ ${DFN_SHA} and apply patches"

if [ ! -d "${VENDOR_DIR}/.git" ]; then
  git clone "${DFN_REPO}" "${VENDOR_DIR}"
fi

cd "${VENDOR_DIR}"
git fetch origin "${DFN_SHA}" 2>/dev/null || git fetch origin
git reset --hard "${DFN_SHA}"

for patch in "${WORKLET_SRC_DIR}"/patches/*.patch; do
  echo "    Applying $(basename "${patch}")"
  git apply --3way "${patch}"
done

echo "==> Step 2: Build libDF wasm via wasm-pack"

if ! command -v wasm-pack >/dev/null; then
  echo "ERROR: wasm-pack not installed (cargo install wasm-pack)." >&2
  exit 1
fi
rustup target add wasm32-unknown-unknown

cd libDF
RUSTFLAGS="-C target-feature=+simd128,+bulk-memory" \
  wasm-pack build --target web --release --no-default-features --features wasm

echo "    Copying wasm-bindgen output to worklet source directory..."
rm -rf "${WORKLET_SRC_DIR}/pkg"
mkdir -p "${WORKLET_SRC_DIR}/pkg"
cp pkg/df.js pkg/df_bg.wasm "${WORKLET_SRC_DIR}/pkg/"

echo "==> Step 3: Bundle AudioWorklet processor"

BUNDLE_TMP="$(mktemp --suffix=.js)"
trap 'rm -f "${BUNDLE_TMP}"' EXIT
bundle_worklet "dfn3" "${BUNDLE_TMP}"

echo "==> Step 4: Emit content-hashed assets + manifest"

emit_ns_assets "dfn3" "${BUNDLE_TMP}" \
  "${WORKLET_SRC_DIR}/pkg/df_bg.wasm" \
  "${VENDOR_DIR}/models/DeepFilterNet3_onnx.tar.gz"
