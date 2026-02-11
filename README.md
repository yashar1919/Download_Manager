# Download Manager

> **A minimalist, production-ready desktop download manager built with Electron.js and React**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js: 16+](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org)
[![Platforms: Linux, macOS, Windows](https://img.shields.io/badge/Platforms-Linux%20%7C%20macOS%20%7C%20Windows-blue.svg)](https://github.com/yashar1919/download_manager)

## Features

### 🚀 Core Functionality

- ✅ **Stream-based Downloading** - Download any file without loading into memory
- ✅ **Pause & Resume** - Stop and continue downloads using HTTP Range requests
- ✅ **Progress Tracking** - Real-time speed, ETA, percentage, and size information
- ✅ **Error Handling** - Graceful recovery with clear error messages
- ✅ **Multiple Downloads** - Manage several concurrent downloads
- ✅ **Clipboard Detection** - Automatic URL detection from clipboard

### 🎨 User Experience

- ✅ **Dark & Light Themes** - System preference detection with manual override
- ✅ **5 Color Palettes** - Zorin, Ubuntu, Mint, Manjaro, Elementary OS
- ✅ **Modern Minimal UI** - Clean design with smooth animations
- ✅ **Responsive Layout** - Works on all screen sizes
- ✅ **Theme Persistence** - Preferences saved automatically

### 🏗️ Architecture

- ✅ **Secure IPC** - Context isolation with safe preload APIs
- ✅ **Modular Design** - Separated concerns (engine, UI, communication)
- ✅ **Production Ready** - Proper error handling and edge cases
- ✅ **Well Documented** - Comprehensive guides and inline comments

### 🐧 Linux Support

- ✅ **Debian Package (.deb)** - Traditional package management
- ✅ **AppImage** - Portable, no-installation executable
- ✅ **Desktop Integration** - Application menu and launcher support
- ✅ **Multi-Architecture** - x64, ARM (Raspberry Pi friendly)

---

## Quick Links

- 📖 [Quick Start Guide](./QUICK_START.md) - Get running in 2 minutes
- 📚 [Architecture Guide](./DOWNLOAD_MANAGER_GUIDE.md) - Deep dive into design
- 🔨 [Linux Build Guide](./LINUX_BUILD_GUIDE.md) - Build and package for Linux
- 🐛 [Issues](https://github.com/yashar1919/download_manager/issues) - Report bugs

---

## Installation

### From Pre-built Packages

**Ubuntu/Debian:**

```bash
# Download from releases page, then:
sudo apt install ./download-manager-1.0.0.deb
download-manager
```

**AppImage (Any Linux):**

```bash
chmod +x download-manager-1.0.0.AppImage
./download-manager-1.0.0.AppImage
```

### From Source

```bash
git clone https://github.com/yashar1919/download_manager.git
cd download_manager

npm install
npm run dev              # Development
npm run build:renderer   # Production build
npm run dist             # Package for Linux
```

---

## Usage

### Starting a Download

1. Paste or type a URL in the input field
2. Confirm filename and select save location
3. Click "Start Download" to begin
4. Monitor progress in real-time

### Download Controls

| Action     | During Download | Notes                    |
| ---------- | --------------- | ------------------------ |
| **Pause**  | ⏸️ Pause        | Can be resumed later     |
| **Resume** | ▶️ Resume       | Continues from last byte |
| **Cancel** | ⛔ Cancel       | Partial file deleted     |
| **Clear**  | ✅ Complete     | Remove from list         |

### Keyboard Shortcuts

- `Enter` - Submit URL
- `Esc` - Close dialogs

---

## Architecture Overview

```
download_manager/
├── main/
│   ├── index.js              # Electron main process & IPC
│   ├── preload.js            # Secure IPC bridge
│   └── downloadManager.js    # Download engine
├── src/renderer/
│   ├── App.jsx               # Main component
│   ├── components/
│   │   ├── URLInput.jsx      # URL input field
│   │   ├── DownloadDialog.jsx # Confirmation dialog
│   │   ├── DownloadItem.jsx  # Download row
│   │   └── ThemeSwitch.jsx   # Theme switcher
│   └── index.css             # Unified styling
└── package.json              # Config & scripts
```

### Key Components

**Download Engine (`downloadManager.js`)**

- Stream-based file downloads
- HTTP Range request support
- Progress tracking
- Pause/resume logic
- Error recovery

**IPC Communication**

- Main ↔ Renderer messaging
- Secure API exposure
- Progress event streaming
- Clipboard monitoring

**React Components**

- URLInput - URL entry with validation
- DownloadDialog - File details confirmation
- DownloadItem - Progress display and controls
- ThemeSwitch - Light/dark/palette selection

---

## Supported File Types

Any file accessible via HTTP/HTTPS:

- **Video:** MP4, MKV, WebM, AVI, MOV
- **Audio:** MP3, FLAC, WAV, AAC, M4A
- **Document:** PDF, DOCX, XLSX, PPTX
- **Archive:** ZIP, RAR, 7Z, TAR, GZ
- **Image:** JPG, PNG, GIF, WebP, SVG
- **Other:** ISO, EXE, APK, and more...

---

## System Requirements

### Minimum

- **OS:** Ubuntu 18.04+, Debian 10+, or equivalent
- **RAM:** 256 MB
- **Disk:** 100 MB free space
- **Node.js:** 16+ (development only)

### Recommended

- **OS:** Ubuntu 20.04 LTS / Ubuntu 22.04 LTS
- **RAM:** 512 MB +
- **Disk:** 500 MB free space
- **CPU:** Dual-core

---

## Development

### Setup

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Launches Electron with hot-reload on `http://localhost:5173`

### Build for Production

```bash
npm run build:renderer   # Optimize React bundle
npm run build            # Build Electron app
```

### Create Distribution Packages

```bash
npm run dist             # Build .deb
npm run dist:appimage    # Build AppImage
npm run dist:all         # Build both
```

### Environment Variables

```bash
VITE_DEV_SERVER_URL=http://localhost:5173  # Dev server URL
CSC_IDENTITY_AUTO_DISCOVERY=false          # Skip code signing
```

---

## Configuration

### Themes

Persistent storage in `localStorage`:

- `dm-theme` - `'light'`, `'dark'`, or `'system'`
- `dm-palette` - `'zorin'`, `'ubuntu'`, `'mint'`, `'manjaro'`, `'elementary'`

### Download Settings

- Default location: User's Downloads folder
- Maximum concurrent downloads: Unlimited
- Progress update interval: 100ms
- Clipboard poll interval: 500ms

---

## Performance

| Metric                   | Value                        |
| ------------------------ | ---------------------------- |
| **Memory (idle)**        | ~50 MB                       |
| **Memory (downloading)** | ~60-80 MB                    |
| **Max file size**        | Up to 2 TB (via streams)     |
| **Concurrent downloads** | Limited by bandwidth         |
| **Speed limit**          | None (use bandwidth control) |

---

## Security Features

- ✅ **Context Isolation** - Renderer and main process isolated
- ✅ **Preload Security** - Only safe APIs exposed to renderer
- ✅ **No Node Integration** - Renderer can't access Node.js
- ✅ **Sandbox Mode** - Renderer runs in restricted environment
- ✅ **No Telemetry** - No data collection or tracking

---

## Troubleshooting

### Common Issues

**Q: Download won't start**  
A: Verify URL starts with `http://` or `https://`, select destination folder, check internet connection.

**Q: Pause/Resume not working**  
A: Some servers don't support Range requests. Try a different URL.

**Q: AppImage won't run**  
A: Make it executable: `chmod +x download-manager-*.AppImage`

**Q: High memory usage**  
A: Downloads use streaming for efficiency. Close other applications if needed.

**Q: URL detection not showing**  
A: Clipboard monitored every 500ms. Copy URL and wait a moment.

### Getting Help

1. Check [QUICK_START.md](./QUICK_START.md) for usage guide
2. Review [DOWNLOAD_MANAGER_GUIDE.md](./DOWNLOAD_MANAGER_GUIDE.md) for architecture
3. Check [Electron documentation](https://www.electronjs.org/docs)
4. Open an [issue on GitHub](https://github.com/yashar1919/download_manager/issues)

---

## Known Limitations

- ❌ No authentication (basic auth, certificates)
- ❌ No proxy support (planned)
- ❌ No torrent/magnet links (planned)
- ❌ No download scheduling (planned)
- ❌ No bandwidth throttling (planned)

---

## Roadmap

### Version 1.0 (Current)

- ✅ Basic download functionality
- ✅ Pause/Resume support
- ✅ Dark/Light themes
- ✅ Linux packaging

### Version 1.1 (Planned)

- 🔄 Bandwidth throttling
- 🔄 Download queue/scheduling
- 🔄 Download history
- 🔄 Batch downloads

### Version 2.0 (Future)

- 🔄 Torrent support
- 🔄 Authentication support
- 🔄 Proxy configuration
- 🔄 Browser extension

---

## Building & Distribution

### Build Commands

```bash
npm run dev              # Start dev server
npm run build:renderer   # Build React bundle
npm run build            # Build Electron app
npm run dist             # Build .deb package
npm run dist:appimage    # Build AppImage
npm run dist:all         # Build all formats
```

### Distribution Formats

- **Debian Package** - `dist/download-manager-1.0.0.deb`
- **AppImage** - `dist/download-manager-1.0.0.AppImage`
- **Windows NSIS** - `dist/download-manager-Setup-1.0.0.exe`
- **Windows Portable** - `dist/download-manager-1.0.0-Portable.exe`

See [LINUX_BUILD_GUIDE.md](./LINUX_BUILD_GUIDE.md) for detailed build instructions.

---

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

All code should follow:

- ESLint configuration in `.eslintrc`
- Prettier formatting
- Conventional commits

---

## License

MIT License - See [LICENSE](./LICENSE) for details

Free to use commercially and personally.

---

## Project Structure

- Electron.js v39+ - Desktop framework
- React 19+ - UI framework
- Vite 7+ - Build tool
- electron-builder - Packaging
- Node.js streams - Download engine

---

## Changelog

### v1.0.0 (January 2026)

- Initial release
- Stream-based downloads
- Pause/Resume support
- Dark/Light themes
- Linux packaging (deb, AppImage)
- Clipboard URL detection
- Multiple concurrent downloads

---

## Related Projects

- [Electron](https://www.electronjs.org) - Desktop app framework
- [React](https://react.dev) - UI library
- [electron-builder](https://www.electron.build) - Packaging tool
- [Vite](https://vitejs.dev) - Build tool

---

## Author

**Yashar** - [GitHub](https://github.com/yashar1919)

---

## Support

- 📧 Email: yashar@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yashar1919/download_manager/issues)
- 📚 Documentation: [DOWNLOAD_MANAGER_GUIDE.md](./DOWNLOAD_MANAGER_GUIDE.md)

---

<div align="center">
  <p>
    <strong>Made with ❤ by <a href="https://github.com/yashar1919">Univision Studio</a></strong>
  </p>
  <p>
    <em>Building tools that make a difference</em>
  </p>
</div>
