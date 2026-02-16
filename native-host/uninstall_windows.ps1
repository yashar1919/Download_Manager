param(
    [ValidateSet("chrome", "edge")]
    [string]$Browser = "chrome"
)

$ErrorActionPreference = "Stop"

$HostName = "com.univision.uvdm.bridge"

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

$ManifestPath = Join-Path $ManifestDir "$HostName.json"
if (Test-Path $ManifestPath) {
    Remove-Item -Path $ManifestPath -Force
    Write-Host "Removed manifest: $ManifestPath"
} else {
    Write-Host "Manifest not found: $ManifestPath"
}

$RegistryPath = Join-Path $RegistryBase $HostName
if (Test-Path $RegistryPath) {
    Remove-Item -Path $RegistryPath -Force
    Write-Host "Removed registry key: $RegistryPath"
} else {
    Write-Host "Registry key not found: $RegistryPath"
}
