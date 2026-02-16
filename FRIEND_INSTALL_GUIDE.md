# UVDM Friend Install Guide (Linux + Windows, Free)

This guide is for sharing your UVDM (Univision Download Manager) + Chrome extension with friends without Chrome Web Store.

## What to Send

- Desktop app package (recommended: `.deb` or `AppImage` from `dist/`)
- Extension source folder: `extension/chrome` (or generated zip package)
- Native host scripts folder: `native-host`

## On Friend Machine

### 1) Install Desktop App

Install your app normally (`.deb` or AppImage) and run it.

### 2) Install Extension (Unpacked)

1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/chrome` folder
5. Copy extension ID from the extension card

### 3) Install Native Host

#### Linux

Open terminal inside `native-host` and run:

```bash
chmod +x setup_linux.sh install_linux.sh run_bridge.sh bridge.js
./setup_linux.sh
```

Optional custom launch command:

```bash
./install_linux.sh <EXTENSION_ID> chrome "uvdm"
```

#### Windows (Chrome)

Open PowerShell inside `native-host` and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\setup_windows.ps1
```

Optional custom app path:

```powershell
powershell -ExecutionPolicy Bypass -File .\install_windows.ps1 <EXTENSION_ID> chrome "C:\Path\To\UVDM.exe"
```

### 4) Verify

- Desktop app can be running, or closed (native host auto-starts it)
- Click extension icon -> **Test Connection**
- Right-click a link -> **Download with UVDM**

## Optional: Build Extension Zip

On your own machine:

```bash
npm run extension:zip
```

Output is generated in `dist/extension/`.

## Optional: Build Full Share Bundle

On your own machine:

```bash
npm run share:bundle
```

Output is generated in `dist/share/` and includes:

- extension source
- native-host scripts (Linux + Windows)
- setup guides

## Remove Native Host (if needed)

Linux:

```bash
./uninstall_linux.sh chrome
```

Windows:

```powershell
powershell -ExecutionPolicy Bypass -File .\uninstall_windows.ps1 chrome
```
