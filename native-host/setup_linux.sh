#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALLER="$SCRIPT_DIR/install_linux.sh"

if [[ ! -f "$INSTALLER" ]]; then
  echo "install_linux.sh not found in $SCRIPT_DIR"
  exit 1
fi

echo "=== UVDM Native Host Setup (Linux) ==="
echo
read -rp "Extension ID (32 lowercase chars): " EXTENSION_ID

if [[ ! "$EXTENSION_ID" =~ ^[a-z]{32}$ ]]; then
  echo "Invalid extension ID."
  exit 1
fi

echo
read -rp "Browser [chrome/chromium/brave/edge/all] (default: chrome): " BROWSER
BROWSER="${BROWSER:-chrome}"

echo
read -rp "App launch command when closed (default: uvdm): " APP_CMD
APP_CMD="${APP_CMD:-uvdm}"

echo
"$INSTALLER" "$EXTENSION_ID" "$BROWSER" "$APP_CMD"

echo
cat <<EOF
Setup completed.
Next:
1) Keep UVDM installed on this machine.
2) Reload extension in chrome://extensions.
3) Test via extension popup -> Test Connection.
EOF
