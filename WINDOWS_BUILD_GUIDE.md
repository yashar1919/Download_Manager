# راهنمای بیلد ویندوز

## مشکل

برای بیلد گرفتن برای ویندوز روی لینوکس، به Wine نیاز داریم. نصب Wine ممکنه زمان‌بر باشه.

## راه‌حل‌های موجود

### روش 1: صبر کردن تا Wine نصب بشه (توصیه می‌شود)

نصب Wine در حال انجامه. وقتی تموم شد، این دستور رو اجرا کن:

```bash
npm run build:windows
```

یا:

```bash
npx electron-builder --windows nsis portable
```

### روش 2: استفاده از GitHub Actions (بهترین روش)

یک workflow در `.github/workflows/build.yml` بساز که خودکار برای هر دو پلتفرم بیلد بگیره:

```yaml
name: Build

on:
  push:
    tags:
      - "v*"
  workflow_dispatch:

jobs:
  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build:linux
      - uses: actions/upload-artifact@v3
        with:
          name: linux-builds
          path: |
            dist/*.deb
            dist/*.AppImage

  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build:windows
      - uses: actions/upload-artifact@v3
        with:
          name: windows-builds
          path: dist/*.exe
```

### روش 3: بیلد روی ویندوز

اگر دسترسی به ماشین ویندوز داری:

```cmd
npm install
npm run build:windows
```

### روش 4: استفاده از Docker

```bash
docker run --rm -ti \
  --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS_TAG|TRAVIS|TRAVIS_REPO_|TRAVIS_BUILD_|TRAVIS_BRANCH|TRAVIS_PULL_REQUEST_|APPVEYOR_|CSC_|GH_|GITHUB_|BT_|AWS_|STRIP|BUILD_') \
  --env ELECTRON_CACHE="/root/.cache/electron" \
  --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" \
  -v ${PWD}:/project \
  -v ~/.cache/electron:/root/.cache/electron \
  -v ~/.cache/electron-builder:/root/.cache/electron-builder \
  electronuserland/builder:wine \
  /bin/bash -c "npm install && npm run build:windows"
```

## فایل‌های خروجی

### لینوکس (آماده است! ✅)

- `dist/aymusic-player_1.0.0_amd64.deb` - بسته Debian
- `dist/AYMusic Player-1.0.0.AppImage` - بسته AppImage

### ویندوز (در انتظار Wine یا استفاده از روش‌های بالا)

- `dist/AYMusic Player-1.0.0-Setup.exe` - نصب‌کننده NSIS
- `dist/AYMusic Player-1.0.0-Portable.exe` - نسخه قابل حمل

## تنظیمات اعمال شده برای ویندوز

✅ آیکون .ico ساخته شد
✅ NSIS installer با تنظیمات کامل
✅ File associations برای فرمت‌های صوتی
✅ نسخه Portable
✅ Desktop و Start Menu shortcuts
✅ قابلیت انتخاب مسیر نصب

## نکته مهم

اگر می‌خوای بیلد ویندوز رو هم الان داشته باشی، بهترین کار اینه که:

1. از GitHub Actions استفاده کنی (workflow رو push کن)
2. یا منتظر بمونی تا Wine نصب بشه (حدود 5-10 دقیقه)

بیلد‌های لینوکس آماده هستن و می‌تونی ازشون استفاده کنی! 🎉
