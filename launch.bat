@echo off
setlocal
set PORT=8080
cd /d "%~dp0"

:: ── Already running? Just open the browser ───────────────────────────────────
netstat -ano 2>nul | findstr /R ":%PORT% .*LISTENING" >nul
if %errorlevel% == 0 goto open

:: ── Start PowerShell and run Python HTTP server ───────────────────────────────
start "PromptLens Server" powershell -NoExit -Command "cd '%~dp0'; py -m http.server %PORT%"

:: Wait for it to bind
timeout /t 2 /nobreak >nul

:: ── Open browser ─────────────────────────────────────────────────────────────
:open
start "" "http://localhost:%PORT%/PromptLense.html"
exit
