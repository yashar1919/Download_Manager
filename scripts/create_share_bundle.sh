#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXT_DIR="$ROOT_DIR/extension/chrome"
NATIVE_DIR="$ROOT_DIR/native-host"
OUT_BASE="$ROOT_DIR/dist/share"

if [[ ! -f "$EXT_DIR/manifest.json" ]]; then
  echo "Missing extension manifest: $EXT_DIR/manifest.json"
  exit 1
fi

if ! command -v zip >/dev/null 2>&1; then
  echo "zip command is required. Install it first (e.g. sudo apt install zip)."
  exit 1
fi

VERSION="$(node -e "const fs=require('fs');const m=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));process.stdout.write(m.version||'0.0.0');" "$EXT_DIR/manifest.json")"
BUNDLE_DIR="$OUT_BASE/uvdm-share-bundle-v${VERSION}"
ZIP_PATH="$OUT_BASE/uvdm-share-bundle-v${VERSION}.zip"

rm -rf "$BUNDLE_DIR"
mkdir -p "$BUNDLE_DIR"

mkdir -p "$BUNDLE_DIR/extension"
cp -r "$EXT_DIR" "$BUNDLE_DIR/extension/chrome"

mkdir -p "$BUNDLE_DIR/native-host"
cp "$NATIVE_DIR/bridge.js" "$BUNDLE_DIR/native-host/"
cp "$NATIVE_DIR/run_bridge.sh" "$BUNDLE_DIR/native-host/"
cp "$NATIVE_DIR/run_bridge.cmd" "$BUNDLE_DIR/native-host/"
cp "$NATIVE_DIR/install_linux.sh" "$BUNDLE_DIR/native-host/"
cp "$NATIVE_DIR/uninstall_linux.sh" "$BUNDLE_DIR/native-host/"
cp "$NATIVE_DIR/setup_linux.sh" "$BUNDLE_DIR/native-host/"
cp "$NATIVE_DIR/install_windows.ps1" "$BUNDLE_DIR/native-host/"
cp "$NATIVE_DIR/uninstall_windows.ps1" "$BUNDLE_DIR/native-host/"
cp "$NATIVE_DIR/setup_windows.ps1" "$BUNDLE_DIR/native-host/"

cp "$ROOT_DIR/CHROME_EXTENSION_SETUP.md" "$BUNDLE_DIR/"
cp "$ROOT_DIR/FRIEND_INSTALL_GUIDE.md" "$BUNDLE_DIR/"

cat > "$BUNDLE_DIR/README_FIRST.txt" <<EOF
UVDM Share Bundle v${VERSION}

Quick steps for your friends:
1) Install and run UVDM desktop app.
2) Open chrome://extensions -> Developer mode -> Load unpacked -> select extension/chrome
3) Copy extension ID.
4) Configure native host:
   Linux:   ./native-host/setup_linux.sh
   Windows: powershell -ExecutionPolicy Bypass -File .\\native-host\\setup_windows.ps1
5) In extension popup, click Test Connection.
EOF

rm -f "$ZIP_PATH"
(
  cd "$OUT_BASE"
  zip -r "$ZIP_PATH" "uvdm-share-bundle-v${VERSION}" -x "*.DS_Store"
)

echo "Share bundle folder: $BUNDLE_DIR"
echo "Share bundle zip:    $ZIP_PATH"
