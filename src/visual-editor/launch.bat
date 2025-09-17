@echo off
title AI-LEY Visual Flow Editor

REM AI-LEY Visual Flow Editor Launch Script
REM This script launches the visual flow editor in development mode

echo.
echo 🚀 Starting AI-LEY Visual Flow Editor...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the visual-editor directory.
    pause
    exit /b 1
)

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Error: Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Error: npm is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ Error: Failed to install dependencies.
        pause
        exit /b 1
    )
)

echo ✅ Environment check passed
echo 🔧 Starting development server...
echo.
echo 🌐 The visual editor will open in your browser at: http://localhost:5173
echo 📝 Press Ctrl+C to stop the development server
echo.

REM Start the development server
call npm run dev

echo.
echo 👋 Thanks for using AI-LEY Visual Flow Editor!
pause