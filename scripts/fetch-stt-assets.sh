#!/usr/bin/env bash
#
# Fetches the speech-to-text assets used for live subtitles:
#   1. MoonshineJS bundle + Moonshine tiny model weights (from npm)
#   2. onnxruntime-web WASM runtime (from npm)
#   3. Silero VAD model + audio worklet (from npm)
#
# Output: public/javascripts/stt/
#
# Commit the fetched files. The script only needs to be re-run when
# bumping one of the pinned versions.

set -euo pipefail

MOONSHINE_JS_VERSION="0.1.29"
# Must stay in the semver range moonshine-js declares for onnxruntime-web:
# the runtime glue below is fetched at runtime by the ort build compiled
# into the moonshine bundle.
ONNXRUNTIME_WEB_VERSION="1.22.0"
VAD_WEB_VERSION="0.0.24"

MOONSHINE_ENCODER_SHA256="c6fc4b7bc5af75c0591fd157a1f3829b533d18e9769a888fd95a62e470dd4f4a"
MOONSHINE_DECODER_SHA256="eed87831c3a6103534aae7d47a5d485025c659a1323901513961c39fe8a1a367"
SILERO_VAD_SHA256="2623a2953f6ff3d2c1e61740c6cdb7168133479b267dfef114a4a3cc5bdd788f"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
OUTPUT_DIR="${PLUGIN_DIR}/public/javascripts/stt"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

fetch_npm_package() {
  local name="$1" version="$2" dest="$3"
  local tarball_name="${name##*/}"
  curl -fsSL \
    "https://registry.npmjs.org/${name}/-/${tarball_name}-${version}.tgz" \
    -o "${TMP_DIR}/${tarball_name}.tgz"
  mkdir -p "${TMP_DIR}/${dest}"
  tar -xzf "${TMP_DIR}/${tarball_name}.tgz" -C "${TMP_DIR}/${dest}"
}

echo "==> Fetching @moonshine-ai/moonshine-js@${MOONSHINE_JS_VERSION}"
fetch_npm_package "@moonshine-ai/moonshine-js" "${MOONSHINE_JS_VERSION}" "moonshine"

mkdir -p "${OUTPUT_DIR}/model/tiny/quantized"
cp "${TMP_DIR}/moonshine/package/dist/moonshine.min.js" "${OUTPUT_DIR}/"
cp "${TMP_DIR}/moonshine/package/dist/model/tiny/quantized/encoder_model.onnx" \
  "${OUTPUT_DIR}/model/tiny/quantized/"
cp "${TMP_DIR}/moonshine/package/dist/model/tiny/quantized/decoder_model_merged.onnx" \
  "${OUTPUT_DIR}/model/tiny/quantized/"

echo "==> Fetching onnxruntime-web@${ONNXRUNTIME_WEB_VERSION}"
fetch_npm_package "onnxruntime-web" "${ONNXRUNTIME_WEB_VERSION}" "ort"

mkdir -p "${OUTPUT_DIR}/onnxruntime"
cp "${TMP_DIR}/ort/package/dist/ort-wasm-simd-threaded.mjs" "${OUTPUT_DIR}/onnxruntime/"
cp "${TMP_DIR}/ort/package/dist/ort-wasm-simd-threaded.wasm" "${OUTPUT_DIR}/onnxruntime/"

echo "==> Fetching @ricky0123/vad-web@${VAD_WEB_VERSION}"
fetch_npm_package "@ricky0123/vad-web" "${VAD_WEB_VERSION}" "vad"

mkdir -p "${OUTPUT_DIR}/vad"
cp "${TMP_DIR}/vad/package/dist/silero_vad_v5.onnx" "${OUTPUT_DIR}/vad/"
cp "${TMP_DIR}/vad/package/dist/vad.worklet.bundle.min.js" "${OUTPUT_DIR}/vad/"

echo "==> Verifying model checksums"
if command -v sha256sum >/dev/null; then
  sha256_check() { sha256sum -c -; }
else
  sha256_check() { shasum -a 256 -c -; }
fi
sha256_check <<CHECKSUMS
${MOONSHINE_ENCODER_SHA256}  ${OUTPUT_DIR}/model/tiny/quantized/encoder_model.onnx
${MOONSHINE_DECODER_SHA256}  ${OUTPUT_DIR}/model/tiny/quantized/decoder_model_merged.onnx
${SILERO_VAD_SHA256}  ${OUTPUT_DIR}/vad/silero_vad_v5.onnx
CHECKSUMS

echo "==> Done"
find "${OUTPUT_DIR}" -type f -exec ls -lh {} +
