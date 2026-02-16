# UVDM Chrome Extension + Desktop Bridge (Linux + Windows, Free)

This setup keeps everything local and free:

- Chrome extension (unpacked, no Web Store required)
- Native messaging host (optional but recommended)
- Electron app local API bridge (`127.0.0.1:37821`)

## 1) Start Desktop App

Run your app in dev mode or packaged mode. It now exposes:

- `POST http://127.0.0.1:37821/api/enqueue`

Payload:

```json
{ "url": "https://example.com/file.zip", "source": "chrome" }
```

If valid, the app receives the URL and shows it as a suggestion in the UI.

Prerequisite for native host auto-start:

- Node.js 16+ must be installed on the machine (`node --version`)

## 2) Load Chrome Extension (unpacked)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select folder: `extension/chrome`
5. Copy the extension ID shown by Chrome
6. Click **Reload** whenever extension files are changed

## 3) Install Native Host (optional, recommended)

Native host lets the extension use `chrome.runtime.sendNativeMessage(...)`.

```bash
cd native-host
chmod +x install_linux.sh run_bridge.sh bridge.js
./install_linux.sh <YOUR_EXTENSION_ID> chrome
```

Optional custom launch command (used when app is closed):

```bash
./install_linux.sh <YOUR_EXTENSION_ID> chrome "uvdm"
```

Supported browsers: `chrome`, `chromium`, `brave`, `edge`, `all`

You can also run from project root:

```bash
npm run native-host:install -- <YOUR_EXTENSION_ID> chrome
```

This writes:

- `~/.config/google-chrome/NativeMessagingHosts/com.univision.uvdm.bridge.json`

### Windows (Chrome)

Open PowerShell inside `native-host` and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\install_windows.ps1 <YOUR_EXTENSION_ID> chrome
```

Optional custom app path:

```powershell
powershell -ExecutionPolicy Bypass -File .\install_windows.ps1 <YOUR_EXTENSION_ID> chrome "C:\Path\To\UVDM.exe"
```

Or from project root:

```powershell
npm run native-host:install:windows -- <YOUR_EXTENSION_ID> chrome
```

Uninstall (Windows):

```powershell
powershell -ExecutionPolicy Bypass -File .\uninstall_windows.ps1 chrome
```

## 4) How It Works

- Right-click any link -> **Download with UVDM**
- Extension sends URL:
  - First try: native host (`com.univision.uvdm.bridge`)
  - Fallback: local HTTP bridge (`127.0.0.1:37821`)
- Desktop app focuses window and injects URL suggestion

## 5) Popup Controls

Click the extension icon in Chrome toolbar to open popup.

- **Auto Capture**: Enable/disable interception of new Chrome downloads
- **Test Connection**: Checks desktop app availability via `GET /api/health`

When Auto Capture is enabled, extension badge shows **ON**.

## 6) Auto-capture Mode (experimental)

The extension has `autoCapture` support in background worker (default `false`).
When enabled, it tries to intercept new Chrome downloads and reroute URL to desktop app.

## 7) Notes

- No domain, no hosting, no paid service required.
- No Chrome Web Store publish required.
- For friend installs, each machine should:
  - load unpacked extension
  - run native host install with that machine's extension ID
- If native host is installed, extension can auto-start desktop app when it is closed
- Keep desktop app running (`npm run dev` or packaged app) while testing extension

## 8) Packaging For Sharing

Create a zip package for the extension:

```bash
npm run extension:zip
```

Output: `dist/extension/uvdm-bridge-vX.Y.Z.zip`

## 9) One-Click Setup Helpers

To make setup easier for non-technical users:

### Linux

```bash
npm run native-host:setup
```

### Windows

```powershell
npm run native-host:setup:windows
```

### Build Full Share Bundle

```bash
npm run share:bundle
```

Output:

- `dist/share/uvdm-share-bundle-vX.Y.Z/` (folder)
- `dist/share/uvdm-share-bundle-vX.Y.Z.zip` (ready to upload/share)
