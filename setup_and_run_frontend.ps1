<#
.SYNOPSIS
    Automated Flutter SDK installer, environment configurator, and frontend runner.
.DESCRIPTION
    Checks for an existing Flutter installation, automatically searches standard paths,
    downloads and installs Flutter SDK if missing, and launches the web application.
#>

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "    Continuum Engine - Automated Flutter Launcher" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check if flutter command is already available
$flutterCmd = Get-Command flutter -ErrorAction SilentlyContinue

if (-not $flutterCmd) {
    Write-Host "[*] Flutter not detected in standard PATH. Searching common locations..." -ForegroundColor Yellow
    
    $commonPaths = @(
        "$PSScriptRoot\flutter\bin",
        "C:\src\flutter\bin",
        "C:\flutter\bin",
        "C:\tools\flutter\bin",
        "$env:USERPROFILE\flutter\bin",
        "$env:LOCALAPPDATA\flutter\bin",
        "D:\flutter\bin",
        "E:\flutter\bin"
    )

    foreach ($path in $commonPaths) {
        if (Test-Path "$path\flutter.bat") {
            Write-Host "[+] Found Flutter at: $path" -ForegroundColor Green
            $env:PATH = "$path;$env:PATH"
            $flutterCmd = Get-Command flutter -ErrorAction SilentlyContinue
            break
        }
    }
}

# 2. If still missing, automatically download and setup Flutter SDK
if (-not $flutterCmd) {
    Write-Host "[!] Flutter is not installed on this system." -ForegroundColor Yellow
    Write-Host "[*] Preparing automated download of Flutter SDK (Windows Stable)..." -ForegroundColor Cyan

    $installDir = "C:\src"
    $flutterZipUrl = "https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.24.5-stable.zip"
    $zipPath = "$env:TEMP\flutter_windows.zip"

    if (-not (Test-Path $installDir)) {
        New-Item -ItemType Directory -Path $installDir -Force | Out-Null
    }

    Write-Host "[*] Downloading Flutter SDK from $flutterZipUrl..." -ForegroundColor Cyan
    Write-Host "    This may take a few minutes depending on your internet connection." -ForegroundColor DarkGray
    
    # Use BITS or WebClient for resilient download
    try {
        Start-BitsTransfer -Source $flutterZipUrl -Destination $zipPath -DisplayName "Downloading Flutter SDK"
    } catch {
        Invoke-WebRequest -Uri $flutterZipUrl -OutFile $zipPath
    }

    Write-Host "[*] Extracting Flutter to $installDir\flutter..." -ForegroundColor Cyan
    Expand-Archive -Path $zipPath -DestinationPath $installDir -Force
    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue

    $flutterBin = "$installDir\flutter\bin"
    $env:PATH = "$flutterBin;$env:PATH"

    # Add to permanent User PATH
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($userPath -notlike "*$flutterBin*") {
        [Environment]::SetEnvironmentVariable("Path", "$userPath;$flutterBin", "User")
        Write-Host "[+] Added $flutterBin to User Environment PATH." -ForegroundColor Green
    }
}

# 3. Configure and Launch Flutter
Write-Host "[*] Validating Flutter Environment..." -ForegroundColor Cyan
& flutter config --no-analytics | Out-Null
& flutter config --enable-web | Out-Null

$frontendDir = Join-Path $PSScriptRoot "frontend"
if (-not (Test-Path $frontendDir)) {
    $frontendDir = "c:\unstop hackathon\frontend"
}
Set-Location $frontendDir

Write-Host "[*] Installing Frontend Dependencies (flutter pub get)..." -ForegroundColor Cyan
& flutter pub get

Write-Host "[+] Launching Flutter Web in Chrome..." -ForegroundColor Green
Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
& flutter run -d chrome
