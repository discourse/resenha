#!/usr/bin/env bash
#
# Builds the vendored LiveKit client SDK bundle.
#
# The SDK is served from the plugin's public dir and dynamically imported at
# join time only for rooms resolved to the "livekit" transport, so it must be
# a single self-contained ESM file — never part of the app's build graph
# (zero LiveKit bytes shipped or parsed on the pure-P2P path).
#
# Prerequisites: Node.js >= 22 with pnpm (livekit-client and esbuild are
# devDependencies).
#
# To upgrade the SDK: bump the livekit-client devDependency, re-run this
# script, and commit the regenerated bundle. Document the tested LiveKit
# server version range in the README when bumping.
#
# Output: public/javascripts/livekit/livekit-client.js

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
OUTPUT_DIR="${PLUGIN_DIR}/public/javascripts/livekit"

cd "${PLUGIN_DIR}"

if [ ! -d "node_modules/livekit-client" ] || [ ! -f "node_modules/.bin/esbuild" ]; then
  echo "    Installing dependencies..."
  pnpm install
fi

VERSION="$(node -p "require('./node_modules/livekit-client/package.json').version")"

echo "==> Bundling livekit-client v${VERSION}"

mkdir -p "${OUTPUT_DIR}"

./node_modules/.bin/esbuild \
  --bundle \
  --format=esm \
  --minify \
  --target=es2022 \
  --banner:js="// livekit-client v${VERSION} — built by scripts/build-livekit-bundle.sh; do not edit." \
  --outfile="${OUTPUT_DIR}/livekit-client.js" \
  node_modules/livekit-client/dist/livekit-client.esm.mjs

# The bundle must stay self-contained: a bare import would make the browser
# resolve a module specifier against the site origin at runtime and fail.
if grep -qE '(^|;)import[^"]*"[^./]' "${OUTPUT_DIR}/livekit-client.js"; then
  echo "ERROR: bundle contains bare imports; it is not self-contained." >&2
  exit 1
fi

echo "==> Build complete!"
echo "    Output: ${OUTPUT_DIR}/livekit-client.js"
echo ""
echo "    Commit this file to the repository. The build only needs to be"
echo "    re-run when updating the livekit-client dependency."
