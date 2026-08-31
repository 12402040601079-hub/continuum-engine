@echo off
title Continuum Engine - 3D Quantum Vault Server
color 0B
cls
echo ===============================================================================
echo     CONTINUUM ENGINE - 3D QUANTUM STATE GUARDIAN & GEMINI AI SERVER
echo ===============================================================================
echo.
echo [*] Initializing Continuum Engine Backend Server on 0.0.0.0:8000...
echo.

cd /d "%~dp0backend"

:: Detect Local LAN IP Address for Mobile / Smartphone / Tablet access
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0 ^| findstr /v "0.0.0.0.*0.0.0.0"') do (
    set LOCAL_IP=%%a
)

echo [OK] Server is active and accessible across ALL devices on your network:
echo.
echo   💻 Local PC / Laptop:     http://localhost:8000/app
echo   📱 Mobile / iOS / Android: http://%LOCAL_IP%:8000/app
echo.
echo [*] Launching default browser to application...
start http://localhost:8000/app

echo.
echo [*] Press Ctrl+C in this window to stop the server anytime.
echo ===============================================================================
echo.

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
pause
