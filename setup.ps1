# setup.ps1

# Ensure .artifacts folder exists
$artifactsDir = ".artifacts"
if (-Not (Test-Path $artifactsDir)) {
    New-Item -ItemType Directory -Path $artifactsDir | Out-Null
}

# GitHub repo info
$repo = "kevinj045/rew.pimmy"
$apiUrl = "https://api.github.com/repos/$repo/releases/latest"

Write-Host "Fetching latest release info from $repo..."

# Get latest release JSON
$release = Invoke-RestMethod -Uri $apiUrl -Headers @{ "User-Agent" = "PowerShell" }

# Find archiveman.dll asset
$asset = $release.assets | Where-Object { $_.name -eq "archiveman.dll" }

if (-Not $asset) {
    Write-Error "Could not find archiveman.dll in the latest release."
    exit 1
}

# Download archiveman.dll -> .artifacts/libarchiveman.dll
$targetFile = Join-Path $artifactsDir "libarchiveman.dll"
Write-Host "Downloading archiveman.dll to $targetFile..."
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $targetFile

# Run rew brew
Write-Host "Running: rew brew main.coffee pimmy.qrew"
rew brew main.coffee pimmy.qrew

Write-Host "Cleaning up..."
$keep = @("apps", ".artifacts", "app.yaml", "pimmy.qrew")

Get-ChildItem -Force | ForEach-Object {
    if ($keep -notcontains $_.Name) {
        if ($_.PSIsContainer) {
            Remove-Item $_.FullName -Recurse -Force
        } else {
            Remove-Item $_.FullName -Force
        }
    }
}

Write-Host "Cleanup done."

Write-Host "Installing pimmy"
rew run pimmy.qrew -- -Aa .
