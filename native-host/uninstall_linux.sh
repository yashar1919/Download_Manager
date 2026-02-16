#!/usr/bin/env bash
set -euo pipefail

HOST_NAME="com.univision.uvdm.bridge"

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

remove_manifest_for_browser() {
  local browser="$1"
  local manifest_dir
  manifest_dir="$(resolve_manifest_dir "$browser")"
  local manifest_path="$manifest_dir/${HOST_NAME}.json"

  if [[ -f "$manifest_path" ]]; then
    rm -f "$manifest_path"
    echo "Removed: $manifest_path"
  else
    echo "Not found: $manifest_path"
  fi
}

usage() {
  cat <<EOF
Usage: $0 [browser]

browser:
  chrome      (default)
  chromium
  brave
  edge
  all
EOF
}

browser="${1:-chrome}"

if [[ "$browser" == "all" ]]; then
  for item in chrome chromium brave edge; do
    remove_manifest_for_browser "$item"
  done
  exit 0
fi

if ! resolve_manifest_dir "$browser" >/dev/null; then
  usage
  exit 1
fi

remove_manifest_for_browser "$browser"
