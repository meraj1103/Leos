@echo off
title Leos - AI Cockpit (Laptop Launcher)
cd /d "%~dp0"

echo =======================================================
echo              LEOS - UNIVERSAL AI COCKPIT
echo =======================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js from https://nodejs.org to run Leos.
    pause
    exit /b 1
)

:: Ensure dependencies are installed
if not exist "node_modules\" (
    echo [1/3] Installing dependencies...
    call npm install
)

:: Ensure fresh build exists
if not exist "dist\index.html" (
    echo [2/3] Building application bundle...
    call npm run build
    call npm run build:electron
)

:: Launch Leos Native Desktop App
echo [3/3] Launching Leos AI Cockpit Desktop...
echo.
call npm run electron

if %errorlevel% neq 0 (
    echo.
    echo Desktop window closed or encountered an issue.
    echo Starting in Web Browser mode instead...
    start http://localhost:5173
    call npm start
)
