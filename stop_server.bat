@echo off
title Stop Continuum Engine Server
color 0C
cls
echo ===============================================================================
echo     STOPPING CONTINUUM ENGINE BACKGROUND SERVER
echo ===============================================================================
echo.
echo [*] Terminating processes running on port 8000...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo [*] Killing Process PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [OK] Continuum Engine server stopped successfully.
timeout /t 2 >nul
