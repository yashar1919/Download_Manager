# UVDM - Quick Start

## Installation

### Prerequisites

- Node.js 16+
- npm 7+
- Linux/macOS/Windows

### Setup

```bash
# Clone or enter project directory
cd download_manager

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open automatically with hot-reload enabled.

---

## Usage

### Basic Download

1. **Enter URL** - Paste or type a download link
2. **Click Download** - Opens file details dialog
3. **Confirm** - Select save location and start
4. **Monitor** - Watch progress bar and stats
5. **Done** - Download completes or manage multiple downloads

### Controls

**During Download:**

- ⏸️ **Pause** - Temporarily stop (can resume later)
- ▶️ **Resume** - Continue paused download
- ⛔ **Cancel** - Stop and delete partial file

**Completed Downloads:**

- 🗑️ **Clear** - Remove from download list

### Keyboard Shortcuts

- `Enter` - Submit URL (when focused)
- `Cmd/Ctrl+C` - Copy URL from downloads list

---

## Features

### Smart URL Detection

- **Automatic Clipboard Detection** - Pasted URLs show in a suggestion box
- **URL Validation** - Only valid HTTP/HTTPS URLs accepted
- **File Metadata** - Auto-detected filename and file size

### Download Management

- **Pause & Resume** - Stop and continue downloads seamlessly
- **Progress Tracking** - Real-time speed, ETA, and percentage
- **Multiple Downloads** - Manage several downloads concurrently
- **Error Handling** - Clear error messages with recovery options

### Themes

**Theme Modes:**

- Light Mode
- Dark Mode
- System Default

**Color Palettes:**

- Zorin (Blue) - Default
- Ubuntu (Orange)
- Linux Mint (Green)
- Manjaro (Teal)
- Elementary OS (Blue)

Toggle themes in top-right corner. Preferences auto-save.

---

## File Information Dialog

When starting a download, you'll see:

| Field         | Description                            |
| ------------- | -------------------------------------- |
| **URL**       | The download link (read-only)          |
| **Filename**  | Editable download filename             |
| **File Size** | Auto-detected file size (if available) |
| **Save to**   | Browse and select destination folder   |

The dialog prevents starting without a destination selected.

---

## Download States

| State           | Icon | Description                        |
| --------------- | ---- | ---------------------------------- |
| **Downloading** | ⬇️   | Active download in progress        |
| **Paused**      | ⏸️   | Download stopped, can be resumed   |
| **Completed**   | ✅   | Download finished successfully     |
| **Error**       | ⚠️   | Download failed with error message |
| **Cancelled**   | ❌   | Download was stopped by user       |

---

## Tips & Tricks

### For Large Files

- Use **Pause** to resume downloads interrupted by connection loss
- Check **File Size** before starting
- Ensure **Free Disk Space** at destination

### For Batch Downloads

- Start first download
- While downloading, you can paste new URLs in the background
- Prepare destination folder while first download completes

### For Slow Connections

- Monitor **Download Speed** in the progress display
- **ETA** helps you plan around connection limits
- **Pause** during peak hours and **Resume** later

### Optimal Performance

- Keep 3-5 downloads maximum running
- Close other bandwidth-heavy applications
- Use wired connection for faster, more stable downloads

---

## Troubleshooting

### Download won't start

- ✓ Check URL is valid (starts with `http://` or `https://`)
- ✓ Verify you selected a save location
- ✓ Ensure destination folder is writable
- ✓ Check internet connection

### Cannot pause/resume

- Some servers don't support pause (older or restricted servers)
- Try a different URL to test
- Error message will indicate "Resume not supported"

### File downloaded with wrong name

- Edit the filename in the download dialog before starting
- After starting, filename is locked

### Disk space issues

- Check available space in destination folder
- Download will show error if disk fills up
- Paused downloads are safe to delete and restart

### Theme not saving

- Check browser localStorage is enabled
- Refresh the application if theme resets

### Performance issues

- Close other applications using network
- Reduce number of concurrent downloads
- Restart the application

---

## System Integration

### Linux Installation

```bash
# Build deb package
npm run dist

# Install
sudo dpkg -i dist/uvdm_1.0.0_amd64.deb

# Run from terminal
uvdm

# Or click in application menu
```

### macOS / Windows

```bash
# Build for your platform
npm run build
electron-builder --publish never
```

---

## File Support

UVDM supports any file type accessible via HTTP/HTTPS:

- **Videos:** MP4, MKV, AVI, MOV
- **Audio:** MP3, FLAC, WAV, M4A
- **Documents:** PDF, DOCX, XLSX
- **Archives:** ZIP, RAR, 7Z
- **Images:** JPG, PNG, GIF
- **Discs:** ISO, IMG
- **And more...** Any direct download link!

---

## Network Requirements

- **Internet Connection** - Stable HTTP/HTTPS connection
- **Port 80/443** - Standard web ports must be accessible
- **No Proxy** - Proxy support coming in future update
- **No Auth** - Password-protected downloads not yet supported

---

## Data & Privacy

- ✅ **All downloads are local** - No cloud synchronization
- ✅ **Theme preferences stored locally** - In browser localStorage
- ✅ **No telemetry** - No usage data sent anywhere
- ✅ **Open source** - Full code transparency

Downloaded files are yours alone.

---

## Getting Help

### Common Issues

**Q: Download stuck at 99%**
A: Some servers don't send final chunk until connection closes. Give it a moment, or pause and resume.

**Q: AppImage won't run**
A: Make executable first: `chmod +x UVDM-*.AppImage`

**Q: High memory usage**
A: Large files use streaming to avoid memory overload. Close other apps if needed.

**Q: URL detection not working**
A: Clipboard monitoring runs every 500ms. Copy a URL and wait a moment for suggestion.

### Reporting Bugs

Include when reporting issues:

1. Operating system version
2. Download URL (or URL type)
3. Error message shown
4. Steps to reproduce

---

## Keyboard Navigation

- `Tab` - Move focus between controls
- `Enter/Space` - Activate button
- `Esc` - Close dialog
- `Ctrl+A` - Select all text in input

---

## Accessibility

- Full keyboard navigation
- High contrast theme support
- Clear status indicators
- Readable font sizes
- Screen reader compatible (when enabled)

---

## What's Next?

- Monitor multiple downloads
- Test pause/resume feature
- Explore different color themes
- Build and install on Linux

Happy downloading! 📥

---

**Version:** 1.0.0  
**Last Updated:** January 2026  
**License:** MIT
