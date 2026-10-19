@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js fehlt. Bitte Node.js 22 LTS oder neuer von https://nodejs.org installieren.
  echo Danach diese Startdatei erneut oeffnen.
  pause
  exit /b 1
)
node -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)"
if errorlevel 1 (
  echo Bitte Node.js auf Version 22 oder neuer aktualisieren: https://nodejs.org
  pause
  exit /b 1
)
echo Ollama bitte separat starten. Das Modell muss nur einmal installiert werden.
echo Im Browser oeffnen: http://127.0.0.1:4189
echo Dieses Fenster waehrend der Nutzung offen lassen. Beenden: Ctrl+C.
node local-server.mjs
if errorlevel 1 pause
endlocal
