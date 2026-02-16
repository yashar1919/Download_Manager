#!/usr/bin/env bash
set -euo pipefail

HOST_NAME="com.univision.uvdm.bridge"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNNER_PATH="$SCRIPT_DIR/run_bridge.sh"

usage() {
  cat <<EOF
Usage: $0 <chrome_extension_id> [browser] [app_launch_command]

browser:
  chrome      (default)
  chromium
  brave
  edge
  all

Example:
  $0 abcdefghijklmnopqrstuvwxyzabcdef chrome
  $0 abcdefghijklmnopqrstuvwxyzabcdef chrome "uvdm"
EOF
}

resolve_manifest_dir() {
  local browser="$1"
  case "$browser" in
    chrome)
      echo "$HOME/.config/google-chrome/NativeMessagingHosts"
      ;;
    chromium)
      echo "$HOME/.config/chromium/NativeMessagingHosts"
      ;;
    brave)
      echo "$HOME/.config/BraveSoftware/Brave-Browser/NativeMessagingHosts"
      ;;
    edge)
      echo "$HOME/.config/microsoft-edge/NativeMessagingHosts"
      ;;
    *)
      return 1
      ;;
  esac
}

write_manifest_for_browser() {
  local extension_id="$1"
  local browser="$2"
  local manifest_dir
  manifest_dir="$(resolve_manifest_dir "$browser")"
  local manifest_path="$manifest_dir/${HOST_NAME}.json"

  mkdir -p "$manifest_dir"
  cat > "$manifest_path" <<JSON
{
  "name": "${HOST_NAME}",
  "description": "Bridge messages from Chrome extension to UVDM desktop app",
  "path": "${RUNNER_PATH}",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://${extension_id}/"
  ]
}
JSON

  echo "Installed for ${browser}: $manifest_path"
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required for native host bridge. Install Node.js 16+ and retry."
  exit 1
fi

EXTENSION_ID="$1"
BROWSER="${2:-chrome}"
APP_LAUNCH_COMMAND="${3:-uvdm}"

if [[ ! "$EXTENSION_ID" =~ ^[a-z]{32}$ ]]; then
  echo "Invalid extension id: $EXTENSION_ID"
  echo "Expected 32 lowercase letters (from chrome://extensions)."
  exit 1
fi

chmod +x "$RUNNER_PATH"
chmod +x "$SCRIPT_DIR/bridge.js"

cat > "$SCRIPT_DIR/host.config.json" <<JSON
{
  "launchCommands": {
    "linux": "${APP_LAUNCH_COMMAND}"
  },
  "retryIntervalMs": 700,
  "maxRetries": 10
}
JSON

echo "Auto-start config written: $SCRIPT_DIR/host.config.json"
echo "Linux launch command: $APP_LAUNCH_COMMAND"

if [[ "$BROWSER" == "all" ]]; then
  for item in chrome chromium brave edge; do
    write_manifest_for_browser "$EXTENSION_ID" "$item"
  done
else
  if ! resolve_manifest_dir "$BROWSER" >/dev/null; then
    usage
    exit 1
  fi

  write_manifest_for_browser "$EXTENSION_ID" "$BROWSER"
fi

echo "Allowed extension: chrome-extension://${EXTENSION_ID}/"
