@echo off
TITLE Continuum Engine - One-Click Launcher
echo ========================================================
echo       Starting Continuum Engine (Backend + Frontend)
echo ========================================================

REM 1. Start Backend in a separate window
echo [*] Starting FastAPI Backend server on http://127.0.0.1:8000...
start "Continuum Engine Backend API" cmd /k "cd /d c:\unstop hackathon\backend && python -m uvicorn app.main:app --reload --port 8000"

REM 2. Wait a moment for server to bind port
timeout /t 2 /nobreak >nul

REM 3. Open Web UI in default browser
echo [*] Opening Continuum Engine Web Application in browser...
start http://127.0.0.1:8000/app

REM 4. Optional Flutter Setup & Frontend
echo [*] Starting Flutter Web Frontend if Flutter is available...
powershell -ExecutionPolicy Bypass -File "c:\unstop hackathon\setup_and_run_frontend.ps1"

pause

