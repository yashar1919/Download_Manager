param(
    [Parameter(Mandatory = $true)]
    [string]$ExtensionId,

    [ValidateSet("chrome", "edge")]
    [string]$Browser = "chrome",

    [string]$AppPath = "$env:LOCALAPPDATA\Programs\UVDM\UVDM.exe"
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is required for native host bridge. Install Node.js 16+ and retry."
}

if ($ExtensionId -notmatch '^[a-z]{32}$') {
    throw "Invalid extension ID. Expected 32 lowercase letters from chrome://extensions"
}

$HostName = "com.univision.uvdm.bridge"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RunnerPath = Join-Path $ScriptDir "run_bridge.cmd"
$ConfigPath = Join-Path $ScriptDir "host.config.json"

if (-not (Test-Path $RunnerPath)) {
    throw "run_bridge.cmd not found at: $RunnerPath"
}

switch ($Browser) {
    "chrome" {
        $ManifestDir = Join-Path $env:LOCALAPPDATA "Google\Chrome\User Data\NativeMessagingHosts"
        $RegistryBase = "HKCU:\Software\Google\Chrome\NativeMessagingHosts"
    }
    "edge" {
        $ManifestDir = Join-Path $env:LOCALAPPDATA "Microsoft\Edge\User Data\NativeMessagingHosts"
        $RegistryBase = "HKCU:\Software\Microsoft\Edge\NativeMessagingHosts"
    }
}

New-Item -Path $ManifestDir -ItemType Directory -Force | Out-Null
$ManifestPath = Join-Path $ManifestDir "$HostName.json"

$manifest = @{
    name = $HostName
    description = "Bridge messages from Chrome extension to UVDM desktop app"
    path = $RunnerPath
    type = "stdio"
    allowed_origins = @("chrome-extension://$ExtensionId/")
}

$manifest | ConvertTo-Json -Depth 5 | Set-Content -Path $ManifestPath -Encoding UTF8

$launchCommand = "start `"`" `"$AppPath`""
$config = @{
    launchCommands = @{
        win32 = $launchCommand
    }
    retryIntervalMs = 700
    maxRetries = 12
}

$config | ConvertTo-Json -Depth 5 | Set-Content -Path $ConfigPath -Encoding UTF8

$RegistryPath = Join-Path $RegistryBase $HostName
New-Item -Path $RegistryPath -Force | Out-Null

if ($Browser -eq "chrome") {
    $RegistryPathRaw = "HKCU\Software\Google\Chrome\NativeMessagingHosts\$HostName"
} else {
    $RegistryPathRaw = "HKCU\Software\Microsoft\Edge\NativeMessagingHosts\$HostName"
}

& reg.exe add $RegistryPathRaw /ve /t REG_SZ /d $ManifestPath /f | Out-Null

Write-Host "Installed native host for $Browser"
Write-Host "Manifest: $ManifestPath"
Write-Host "Auto-start config: $ConfigPath"
Write-Host "Windows launch command: $launchCommand"
Write-Host "Registry: $RegistryPath"
Write-Host "Allowed extension: chrome-extension://$ExtensionId/"
