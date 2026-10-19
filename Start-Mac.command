#!/bin/bash
# Lokale Werkstatt auf macOS starten; keine Installation oder Systemeinstellungen.
cd -- "$(dirname -- "$0")" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js fehlt. Bitte Node.js 22 LTS oder neuer von https://nodejs.org installieren."
  echo "Danach diese Startdatei erneut oeffnen."
  read -r -p "Zum Schliessen Enter druecken. "
  exit 1
fi
if ! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 22 ? 0 : 1)'; then
  echo "Bitte Node.js auf Version 22 oder neuer aktualisieren: https://nodejs.org"
  read -r -p "Zum Schliessen Enter druecken. "
  exit 1
fi
echo "Ollama bitte separat starten. Das Modell muss nur einmal installiert werden."
echo "Im Browser oeffnen: http://127.0.0.1:4189"
echo "Dieses Fenster waehrend der Nutzung offen lassen. Beenden: Ctrl+C."
exec node local-server.mjs
