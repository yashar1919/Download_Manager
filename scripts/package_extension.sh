#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXT_DIR="$ROOT_DIR/extension/chrome"
OUT_DIR="$ROOT_DIR/dist/extension"

if [[ ! -f "$EXT_DIR/manifest.json" ]]; then
  echo "manifest.json not found in $EXT_DIR"
  exit 1
fi

if ! command -v zip >/dev/null 2>&1; then
  echo "zip command is required. Install it first (e.g. sudo apt install zip)."
  exit 1
fi

VERSION="$(node -e "const fs=require('fs');const m=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(m.version||'0.0.0');" "$EXT_DIR/manifest.json")"

mkdir -p "$OUT_DIR"
ARCHIVE_PATH="$OUT_DIR/uvdm-bridge-v${VERSION}.zip"

rm -f "$ARCHIVE_PATH"
(
  cd "$EXT_DIR"
  zip -r "$ARCHIVE_PATH" . -x "*.DS_Store"
)

echo "Extension package created: $ARCHIVE_PATH"
