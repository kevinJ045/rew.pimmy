# PowerShell script to install rew.exe on Windows

$ErrorActionPreference = 'Stop'

# Config
$downloadUrl = "https://github.com/kevinj045/rew/releases/latest/download/rew.exe"
$tempFile = "$env:TEMP\rew.exe"

Write-Host "⬇️  Downloading rew.exe..."
Invoke-WebRequest -Uri $downloadUrl -OutFile $tempFile

# Determine if running as admin
$isAdmin = ([bool]([Security.Principal.WindowsIdentity]::GetCurrent()).Groups -match "S-1-5-32-544")

if ($isAdmin) {
    $installDir = "C:\Program Files\Rew"
    $pathType = "Machine"
} else {
    $installDir = "$env:LOCALAPPDATA\Programs\Rew"
    $pathType = "User"
}

Write-Host "📁 Installing to: $installDir"
New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Copy-Item $tempFile -Destination "$installDir\rew.exe" -Force

# Add to PATH if not present
$envPath = [Environment]::GetEnvironmentVariable("Path", $pathType)
if ($envPath -notlike "*$installDir*") {
    Write-Host "🔧 Adding $installDir to $pathType PATH"
    [Environment]::SetEnvironmentVariable("Path", "$envPath;$installDir", $pathType)
} else {
    Write-Host "ℹ️  $installDir already in PATH"
}

Write-Host "✅ Installation complete. Restart your terminal to use 'rew'."
