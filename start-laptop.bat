@echo off
title Leos - AI Cockpit (Laptop Launcher)
cd /d "%~dp0"

echo =======================================================
echo              LEOS - UNIVERSAL AI COCKPIT
echo =======================================================
echo.

:: Check if pre-built standalone executable exists
if exist "release\win-unpacked\Leos.exe" (
    echo [OK] Found compiled standalone Leos desktop app!
    echo Launching Leos Desktop...
    start "" "release\win-unpacked\Leos.exe"
    exit /b 0
)

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules\" (
    echo Installing required dependencies...
    call npm install
)

echo Starting Leos local cockpit...
start http://localhost:5173
call npm run dev
pause
