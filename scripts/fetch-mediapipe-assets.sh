#!/usr/bin/env bash
#
# Fetches the MediaPipe assets used for camera background blur:
#   1. @mediapipe/tasks-vision JS bundle + WASM runtime (from npm)
#   2. The selfie segmentation model (from Google's model repository)
#
# Output: public/javascripts/mediapipe/
#
# Commit the fetched files. The script only needs to be re-run when
# bumping the MediaPipe version.

set -euo pipefail

TASKS_VISION_VERSION="0.10.35"
SEGMENTER_MODEL_VERSION="1"
SEGMENTER_MODEL_SHA256="191ac9529ae506ee0beefa6b2c945a172dab9d07d1e802a290a4e4038226658b"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
OUTPUT_DIR="${PLUGIN_DIR}/public/javascripts/mediapipe"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

echo "==> Fetching @mediapipe/tasks-vision@${TASKS_VISION_VERSION}"
curl -fsSL \
  "https://registry.npmjs.org/@mediapipe/tasks-vision/-/tasks-vision-${TASKS_VISION_VERSION}.tgz" \
  -o "${TMP_DIR}/tasks-vision.tgz"
tar -xzf "${TMP_DIR}/tasks-vision.tgz" -C "${TMP_DIR}"

mkdir -p "${OUTPUT_DIR}/wasm"
# .js rather than .mjs: Discourse serves unknown extensions as text/plain,
# which browsers reject for dynamic import().
cp "${TMP_DIR}/package/vision_bundle.mjs" "${OUTPUT_DIR}/vision_bundle.js"
cp "${TMP_DIR}/package/wasm/vision_wasm_internal.js" "${OUTPUT_DIR}/wasm/"
cp "${TMP_DIR}/package/wasm/vision_wasm_internal.wasm" "${OUTPUT_DIR}/wasm/"
cp "${TMP_DIR}/package/wasm/vision_wasm_nosimd_internal.js" "${OUTPUT_DIR}/wasm/"
cp "${TMP_DIR}/package/wasm/vision_wasm_nosimd_internal.wasm" "${OUTPUT_DIR}/wasm/"

echo "==> Fetching selfie segmentation model"
curl -fsSL \
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/${SEGMENTER_MODEL_VERSION}/selfie_segmenter.tflite" \
  -o "${OUTPUT_DIR}/selfie_segmenter.tflite"

echo "==> Verifying model checksum"
echo "${SEGMENTER_MODEL_SHA256}  ${OUTPUT_DIR}/selfie_segmenter.tflite" | shasum -a 256 -c -

echo "==> Done"
ls -lh "${OUTPUT_DIR}" "${OUTPUT_DIR}/wasm"
