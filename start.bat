@echo off
echo Starting Prompt Analyzer...
cd /d "%~dp0"

:: Kill anything already on port 8080
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080 "') do taskkill /f /pid %%a >nul 2>&1

:: Start Ollama with CORS
set OLLAMA_ORIGINS=*
start "Ollama" /min cmd /c ollama serve

:: Give Ollama a moment to boot
timeout /t 2 /nobreak >nul

:: Start HTTP server
start "HTTP Server" /min cmd /c "py -m http.server 8080"

:: Give the server a moment to start
timeout /t 1 /nobreak >nul

:: Open the browser
start http://localhost:8080/PromptLense.html

echo Done! Both servers are running in the background.
echo Close the Ollama and HTTP Server windows to stop them.
