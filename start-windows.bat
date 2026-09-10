@echo off
title Switchyard Sprint - Launcher
echo ========================================================
echo    Switchyard Sprint - Subway Surfers Astra
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please download and install Node.js (LTS version) from:
    echo https://nodejs.org/
    echo.
    echo After installing, restart your computer or reopen this file.
    pause
    exit /b
)

if not exist node_modules (
    echo [INFO] Installing required libraries (first time setup, please wait)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install packages. Check your internet connection.
        pause
        exit /b
    )
)

echo.
echo [INFO] Launching game server...
echo [INFO] Opening game in your default browser...
echo.

start http://localhost:5173
call npm run dev
pause
