@echo off
title KhetKamai demo - keep this window open
cd /d "%~dp0"
where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Node.js is not installed. Please install the LTS version from https://nodejs.org and run this file again.
  echo.
  pause
  exit /b
)
if not exist node_modules (
  echo Installing packages for the first time - this takes 1-2 minutes...
  call npm install
)
echo.
echo  Starting KhetKamai... your browser will open at http://localhost:5173
echo  Keep this window open while you demo. Close it to stop.
echo.
call npm run dev -- --open
pause
