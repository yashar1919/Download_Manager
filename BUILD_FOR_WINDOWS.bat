@echo off
REM ============================================
REM Download Manager - Windows Build Script
REM ============================================
REM
REM این اسکریپت برای بیلد گرفتن از Download Manager روی ویندوز هست
REM اینجا کلیک کن و صبر کن!
REM

cls
echo.
echo ====================================
echo   Download Manager - Windows Build
echo ====================================
echo.

REM چک کن که Node.js نصب شده
echo [1/4] در حال بررسی Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo !!! خطا: Node.js نصب نیست!!!
    echo لطفاً از https://nodejs.org Node.js نصب کن
    echo.
    pause
    exit /b 1
)
echo Node.js موجود است ✓

REM چک کن که icon.ico موجود است
echo.
echo [2/4] در حال بررسی آیکون...
if not exist "build\icons\icon.ico" (
    echo.
    echo !!! خطا: build\icons\icon.ico پیدا نشد!!!
    echo.
    pause
    exit /b 1
)
echo آیکون موجود است ✓

REM npm install
echo.
echo [3/4] Dependencies نصب کردن...
call npm install
if errorlevel 1 (
    echo.
    echo !!! خطا هنگام npm install !!!
    pause
    exit /b 1
)
echo Dependencies نصب شد ✓

REM Build
echo.
echo [4/4] Build شروع شد...
echo.
call npm run build:windows

if errorlevel 1 (
    echo.
    echo !!! خطا هنگام Build !!!
    pause
    exit /b 1
)

echo.
echo ====================================
echo   Build موفق بود!
echo ====================================
echo.
echo نتیجهٔ بیلد در اینجا است:
echo   dist\Download Manager-1.0.0-Portable.exe
echo   dist\Download Manager-1.0.0-Setup.exe
echo.
pause
