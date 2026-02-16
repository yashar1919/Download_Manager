param()

$ErrorActionPreference = "Stop"

Write-Host "=== UVDM Native Host Setup (Windows) ==="
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$installer = Join-Path $scriptDir "install_windows.ps1"

if (-not (Test-Path $installer)) {
    throw "install_windows.ps1 not found in $scriptDir"
}

$extensionId = Read-Host "Extension ID (32 lowercase chars)"
if ($extensionId -notmatch '^[a-z]{32}$') {
    throw "Invalid extension ID"
}

$browser = Read-Host "Browser [chrome/edge] (default: chrome)"
if ([string]::IsNullOrWhiteSpace($browser)) {
    $browser = "chrome"
}

$appPath = Read-Host "App EXE path (default: $env:LOCALAPPDATA\Programs\UVDM\UVDM.exe)"
if ([string]::IsNullOrWhiteSpace($appPath)) {
    $appPath = "$env:LOCALAPPDATA\Programs\UVDM\UVDM.exe"
}

powershell -ExecutionPolicy Bypass -File $installer $extensionId $browser $appPath

Write-Host ""
Write-Host "Setup completed."
Write-Host "Next: Reload extension in chrome://extensions and run Test Connection."
