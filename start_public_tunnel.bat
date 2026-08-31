@echo off
title Continuum Engine - Public Instant Internet Access
echo ========================================================
echo   ⚡ Continuum Engine - Public Global Access Gateway ⚡
echo ========================================================
echo.
echo Starting Continuum Engine backend if not already running...
start /b python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000

echo.
echo --------------------------------------------------------
echo Generating instant public HTTPS URL so anyone can access
echo your Continuum Engine app from anywhere in the world!
echo --------------------------------------------------------
echo.

:: Try localtunnel via npx
where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Launching Cloud Tunnel via localtunnel...
    echo.
    echo Share the generated URL below with anyone:
    npx localtunnel --port 8000
    goto end
)

:: Fallback to SSH Remote Port Forwarding (no installation needed)
where ssh >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Launching Secure Cloud Tunnel via SSH...
    echo.
    echo Share the generated URL below with anyone:
    ssh -R 80:localhost:8000 a.pinggy.io
    goto end
)

echo [!] To share publicly, install Node.js (for npx localtunnel) or use Cloudflare Tunnel.
pause

:end
