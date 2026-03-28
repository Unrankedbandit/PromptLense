@echo off
setlocal
set PORT=8080
cd /d "%~dp0"

:: ── Already running? Just open the browser ───────────────────────────────────
netstat -ano 2>nul | findstr /R ":%PORT% .*LISTENING" >nul
if %errorlevel% == 0 goto open

:: ── Find Python ──────────────────────────────────────────────────────────────
set PYTHON=
where python >nul 2>&1 && set PYTHON=python
if not defined PYTHON (
    where py >nul 2>&1 && set PYTHON=py
)
if not defined PYTHON (
    echo PromptLens: Python not found.
    echo Install from https://python.org then double-click this file again.
    pause
    exit /b 1
)

:: ── Start server, log to file ────────────────────────────────────────────────
start "PromptLens Server" /min cmd /c "%PYTHON% -m http.server %PORT% > "%~dp0server.log" 2>&1"

:: Wait for it to bind
timeout /t 1 /nobreak >nul

:: ── Open browser ─────────────────────────────────────────────────────────────
:open
start "" "http://localhost:%PORT%/PromptLense.html"
exit
