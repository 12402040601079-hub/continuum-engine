@echo off
title Continuum Engine - Desktop Application
color 0A
cls
echo ===============================================================================
echo                ⚡ CONTINUUM ENGINE - DESKTOP APPLICATION ⚡
echo ===============================================================================
echo.
echo [*] Checking local server status on http://127.0.0.1:8000...

powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:8000/api/v1/health' -TimeoutSec 2; exit 0 } catch { exit 1 }"
if %ERRORLEVEL% NEQ 0 (
    echo [*] Server inactive. Initializing Continuum Engine Backend Server...
    start /b python -m uvicorn app.main:app --app-dir "%~dp0backend" --host 127.0.0.1 --port 8000 > nul 2>&1
    ping 127.0.0.1 -n 4 > nul
)

echo [OK] Continuum Engine active!
echo [*] Launching Native Desktop App Window...

start msedge --app=http://127.0.0.1:8000/app --window-size=1280,850 || start chrome --app=http://127.0.0.1:8000/app || start http://127.0.0.1:8000/app

echo.
echo [SUCCESS] Continuum Engine Desktop App launched successfully!
exit
