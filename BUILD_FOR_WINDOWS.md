# Build Instructions for Windows

## Prerequisites
- Node.js 18+ installed
- npm installed

## Quick Setup on Windows

1. **Clone the repository** (or download the source)
   ```bash
   git clone https://github.com/yashar1919/Download_Manager.git
   cd Download_Manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build for Windows**
   ```bash
   npm run build:windows
   ```

   This will create:
   - `dist/Download Manager-1.0.0-Setup.exe` - Full installer
   - `dist/Download Manager-1.0.0-Portable.exe` - Portable executable (no installation needed!)

## Installation Options

### Option A: Use Portable Executable (Recommended)
1. Download `Download Manager-1.0.0-Portable.exe`
2. Run it directly - **no installation required!**
3. Desktop shortcut will be created automatically

### Option B: Use Full Installer
1. Download `Download Manager-1.0.0-Setup.exe`
2. Double-click to run the installer
3. Follow the installation wizard
4. Desktop and Start Menu shortcuts will be created

### Option C: Development Mode
```bash
npm run dev
```
This runs the app in development with hot-reload.

## Troubleshooting

### If Windows Defender shows a warning:
- Click "More info" → "Run anyway"
- This is normal for unsigned apps. You can sign the app in your own certificate if needed.

### If app doesn't start:
- Make sure Node.js is installed
- Try installing with Administrator privileges
- Check that all dependencies installed: `npm install --legacy-peer-deps`

## System Requirements
- Windows 10 or later
- 100MB free disk space
- No additional runtime required (Chromium bundled)

## Features
✓ Download pause/resume
✓ Batch downloads
✓ Dark/Light theme
✓ Download history
✓ Beautiful UI
