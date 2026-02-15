# Windows آیکون مشکل‌حل

## چرا آیکون در ویندوز نشون داده نمیشه؟

### دلایل عمده:

| دلیل                         | نشانه                            | حل                                     |
| ---------------------------- | -------------------------------- | -------------------------------------- |
| **icon.ico موجود نیست**      | Program Files میک تر تولید میکنه | باید `build\icons\icon.ico` موجود باشه |
| **Path غلط در package.json** | هنگام بیلد Warning میده          | چک کن موقعیت `.icon` entries           |
| **صرافی Icon**               | FileType icon تغییر نکرده        | فایل corrupt هست، دوباره ساخت          |
| **npm install ناقص**         | Dependencies ناقص                | `npm install` دوباره اجرا کن           |

---

## راه‌حل (مرتب شده توسط احتمال موفقیت)

### راه‌حل 1: سریع‌ترین (90% کار میکنه)

```cmd
cd Download_Manager
npm install
npm run build:windows
```

**اگر مشکل حل شد:** ✓ تموم!

---

### راه‌حل 2: Package.json Check

اطمینان بده این قسمت توی `package.json` دقیقاً اینه:

```json
"build": {
  "appId": "com.downloadmanager.app",
  "productName": "Download Manager",
  "icon": "build/icons/icon.png",
  "win": {
    "target": [
      { "target": "nsis", "arch": ["x64"] },
      { "target": "portable", "arch": ["x64"] }
    ],
    "icon": "build/icons/icon.ico"
  }
}
```

**نقاط عمده:**

- Line path: `build/icons/icon.png` (Forward slash `/`)
- Windows path: `build/icons/icon.ico` (همچنین `/`)
- ✅ فایل‌های `.ico` و `.png` باید موجود باشند

---

### راه‌حل 3: دوباره Icon تولید کن

اگر شک داری فایل corrupt شده:

```cmd
cd build\icons
python create_icon.py
cd ..\..\

REM یا اگر Python نداری، فقط icon.ico رو دوباره دانلود کن
```

اگر Python نداری:

1. **Option A:** `logo.png` فایل رو پیدا کن (باید توی `build/icons/` باشه)
2. **Option B:** هر برنامهٔ دیگهٔ Icon editor استفاده کن (مثلاً GIMP) برای ساخت `.ico`

**متدع بهتر:** از این سایت استفاده کن:

- https://convertio.co/png-ico/ (PNG رو Upload کن)

---

### راه‌حل 4: کامل Reset و Rebuild

```cmd
REM پاک کن همه چیز
rmdir /s /q dist
rmdir /s /q node_modules

REM دوباره نصب کن
npm install

REM دوباره Build کن
npm run build:windows

REM بررسی کن
dir dist
```

باید این فایل‌ها رو ببینی:

```
Download Manager-1.0.0-Portable.exe
Download Manager-1.0.0-Setup.exe
```

---

### راه‌حل 5: Debug Mode

اگر هنوز کار نمیکنه:

```cmd
REM Build کن با verbose output
npm run build:windows -- -d
```

نگاه کن برای این log:

- `icon: "build/icons/icon.ico"`
- `Wrote to` messages

اگر Warning بود مثل:

```
Warning: icon not found: build/icons/icon.ico
```

پس فایل واقعاً موجود نیست. چک کن:

```cmd
dir build\icons\icon.ico
```

---

## فایل‌های ضروری

```
Download_Manager/
├── build/
│   └── icons/
│       ├── icon.ico          ⬅️ MUST exist
│       ├── icon.png
│       ├── 256x256.png
│       └── create_icon.py
├── package.json              ⬅️ شامل icon paths
└── dist/                      ⬅️ بعد از build
```

---

## نحوه تصدیق آیکون موفق است

### Visual Check

1. بیلد تموم شد
2. `dist\Download Manager-1.0.0-Portable.exe` رو دو برابر کلیک کن
3. **قبل من نصب کن** بررسی کن:
   - بالای پنجره icon تغییر کرده
   - File Explorer میشناسه icon رو

### Terminal Check

```cmd
REM Windows 10+
wmic datafile where name="C:\\Users\\<YOUR_USER>\\Desktop\\Download Manager-portable.exe" get Description,Version
```

یا:

```cmd
REM PowerShell
(Get-Item "C:\Users\<YOUR_USER>\Downloaded\Download Manager-1.0.0-Portable.exe").VersionInfo
```

---

## Antivirus/Security Warning

اگر Windows Defender یا antivirus دارید:

1. بیلد شده اجرا نکن (Quarantine میکنه)
2. موقت Antivirus رو بند کن
3. Build کن
4. Antivirus دوباره فعال کن

---

## Package.json اگر مشکل دار باشه

اگر فایل خراب شده:

```cmd
git checkout package.json
```

یا دستی درست کن - **بسیار مهم:** JSON باید valid باشه!

---

## اگر _هنوز_ کار نمیکنه

```cmd
REM Complete nuke
git clean -fdx
git checkout .
npm install
npm run build:windows

REM یا
npm install --force
npm cache clean --force
npm install
npm run build:windows
```

---

## Icon Quick Test

```cmd
REM ساخت یک ساده icon برای تست
REM (اگر فقط چک کردن میخوای)

REM Logo.png رو icon.ico میکنی
REM استفاده از online converter یا Python:

python -c "from PIL import Image; Image.open('build/icons/logo.png').save('build/icons/icon.ico')"
```

---

## خلاصه چک‌لیست

- [ ] Node.js 18+؟
- [ ] `build\icons\icon.ico` موجود است؟ (حجم > 50KB)
- [ ] `package.json` درست؟
- [ ] `npm install` اجرا شد؟
- [ ] `npm run build:windows` اجرا شد؟
- [ ] فایل‌های .exe فی `dist/ موجود؟
- [ ] Icon توی نتیجه visible است؟

اگر همهٔ these ✓ return تو، آیکون باید visible باشه!

---

## اگر still نمیتونی حل کنی

فایل لاگ رو چک کن:

```cmd
npm run build:windows 2>&1 | tee build-log.txt
```

و `build-log.txt` رو دیده.
