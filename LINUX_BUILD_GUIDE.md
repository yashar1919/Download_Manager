# Linux Build Guide - Download Manager

## System Requirements

### Ubuntu/Debian

```bash
# Dependencies
sudo apt-get update
sudo apt-get install -y \
    nodejs npm \
    git \
    libx11-dev \
    libxext-dev \
    libxss-dev \
    libxrandr-dev \
    libnss3-dev \
    libgconf-2-4 \
    libappindicator1 \
    libnotify-dev \
    libxkbfile-dev
```

### Node.js Version

- **Required:** Node.js 16+
- **Recommended:** Node.js 18 LTS or 20 LTS

Verify:

```bash
node --version  # Should be v16+
npm --version   # Should be 7+
```

---

## Building for Linux

### 1. Install Dependencies

```bash
cd download_manager
npm install
```

### 2. Build the Application

#### Build for Development

```bash
npm run dev
```

This will:

- Start Vite dev server on `http://localhost:5173`
- Launch Electron with hot-reload
- Open developer tools automatically

#### Build for Production

```bash
npm run build:renderer
```

This creates optimized React bundle in `dist/`

---

## Packaging for Linux

### Option 1: Debian Package (.deb)

```bash
npm run dist
```

**Output:** `dist/uvdm_1.0.0_amd64.deb`

**Install:**

```bash
sudo dpkg -i dist/uvdm_1.0.0_amd64.deb
```

**Uninstall:**

```bash
sudo apt-get remove uvdm
```

**Benefits:**

- Traditional package management
- Desktop menu integration
- System-wide installation
- Easy updates via package manager

### Option 2: AppImage

```bash
npm run dist:appimage
```

**Output:** `dist/UVDM-1.0.0.AppImage`

**Run:**

```bash
chmod +x dist/UVDM-1.0.0.AppImage
./dist/UVDM-1.0.0.AppImage
```

**Benefits:**

- No installation needed
- Single file distribution
- Works on any Linux system
- Portable (USB drive friendly)

### Build Both

```bash
npm run dist:all
```

Creates both `.deb` and `.AppImage` in `dist/`

---

## Advanced Build Configuration

### Custom Configuration

Edit `package.json` `build` section to customize:

```json
"linux": {
    "target": ["deb", "AppImage"],
    "category": "Utility",
    "icon": "build/icons/icon.png",
    "desktop": {
        "entry": {
            "Name": "UVDM",
            "Comment": "Univision Download Manager",
            "Exec": "uvdm %U",
            "Terminal": "false",
            "Type": "Application",
            "Categories": "Utility;Network;",
            "Keywords": "download;manager;"
        }
    }
}
```

### Build Options

```bash
# Build with specific target
electron-builder --linux deb

# Build with verbose output
electron-builder --linux --verbose

# Build without publishing
electron-builder --linux --publish never

# Build specific architecture
electron-builder --linux --arch x64
```

---

## Creating Application Icons

### Required Icons

Place in `build/icons/`:

- `icon.png` - 512x512 for Linux
- `icon.ico` - 256x256 for Windows (optional)

### Generate PNG

```bash
# Using ImageMagick
convert icon.svg -resize 512x512 icon.png

# Using ffmpeg
ffmpeg -i icon.svg -vf scale=512:512 icon.png
```

---

## Verification

### Verify Installation

```bash
# Check if installed
which uvdm

# Check version
uvdm --version

# Check system integration
desktop-file-validate /usr/share/applications/uvdm.desktop
```

### Test Download Functionality

1. Launch application
2. Test with a small file URL: `https://www.w3.org/WAI/WCAG21/Techniques/pdf/G148.pdf`
3. Test pause/resume
4. Test cancel
5. Test theme switching

---

## Troubleshooting

### Build Fails with "electron-builder not found"

```bash
npm install --save-dev electron-builder
npm install
```

### "Permission denied" when running AppImage

```bash
chmod +x dist/UVDM-*.AppImage
```

### Cannot find icon file

```bash
# Verify icon exists
ls -la build/icons/icon.png

# If missing, create dummy
mkdir -p build/icons
# Place a 512x512 PNG file as icon.png
```

### deb install fails with dependencies

```bash
# View required dependencies
sudo apt-get install -f  # Fix broken dependencies

# Or manually install
sudo apt-get install libnss3 libxss1 libappindicator1
```

### AppImage not running on Ubuntu

```bash
# Try with FUSE disabled
./dist/UVDM-*.AppImage --appimage-extract
./squashfs-root/AppRun
```

---

## Distribution

### Publishing Options

1. **GitHub Releases**
   - Upload `.deb` and `.AppImage` files
   - Generate release notes
   - Tag version with `v1.0.0`

2. **PPA (Personal Package Archive)**
   - Create Launchpad account
   - Host .deb packages
   - Automatic updates via `apt`

3. **Flathub**
   - Submit for review
   - Distributed sandboxed installation
   - Automatic updates

4. **Your Website**
   - Direct download links
   - Manual versioning

### Example: GitHub Release

```bash
# Tag the release
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# Upload to GitHub Releases
hub release create v1.0.0 \
    -a dist/uvdm_1.0.0_amd64.deb \
    -a dist/UVDM-1.0.0.AppImage \
    -m "UVDM v1.0.0"
```

---

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/build.yml`:

```yaml
name: Build Linux Packages

on:
  push:
    tags:
      - "v*"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm install

      - name: Build renderer
        run: npm run build:renderer

      - name: Build packages
        run: npm run dist:all

      - name: Upload to releases
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/*.deb
            dist/*.AppImage
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Performance Optimization

### For Faster Builds

```bash
# Skip code signing (development)
export CSC_IDENTITY_AUTO_DISCOVERY=false
npm run dist

# Use caching
npm cache clean --force
npm ci
npm run dist
```

### Reduce Bundle Size

- Remove unused dependencies
- Enable Vite minification
- Tree-shake unused code

Current bundle size: ~50MB (including Electron runtime)

---

## Security Considerations

### Code Signing (Optional)

For production releases, sign the deb package:

```bash
# Install dpkg-sig
sudo apt-get install dpkg-sig

# Sign the package
dpkg-sig --sign builder dist/uvdm_1.0.0_amd64.deb
```

### Update Security

Consider implementing auto-update:

```bash
npm install electron-updater
```

---

## Post-Installation

### Desktop Integration

Once installed via deb:

```bash
# Application should appear in application menu
# Or run from terminal
uvdm

# Create custom launcher
cat > ~/.local/share/applications/uvdm.desktop << EOF
[Desktop Entry]
Name=UVDM
Exec=uvdm
Icon=uvdm
Type=Application
Categories=Utility;Network;
EOF

# Update desktop database
update-desktop-database ~/.local/share/applications/
```

---

## Version Updates

### Bump Version

Edit `package.json`:

```json
{
  "version": "1.1.0"
}
```

### Rebuild and Package

```bash
npm run build:renderer
npm run dist:all

# Test installation
sudo dpkg -i dist/uvdm_1.1.0_amd64.deb
uvdm --version  # Should show 1.1.0
```

---

## Support & Issues

### Getting Help

1. Check [Electron documentation](https://www.electronjs.org/docs)
2. Review [electron-builder issues](https://github.com/electron-userland/electron-builder/issues)
3. Check application logs: `~/.config/UVDM/`

### Reporting Bugs

Include:

- OS version (`lsb_release -a`)
- Node.js version (`node --version`)
- Download URL
- Error message from app

---

## Next Steps

1. ✅ Build and test locally
2. ✅ Test on Ubuntu 20.04 LTS
3. ✅ Test on Ubuntu 22.04 LTS
4. ✅ Create GitHub releases
5. ✅ Submit to Flathub (optional)
6. ✅ Monitor user feedback

Happy building! 🚀
