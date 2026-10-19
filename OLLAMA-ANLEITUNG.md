# Ollama-Edition – einmal pro Rechner einrichten

Die Gliederungswerkstatt kann deinen argumentativen Entwurf mit einem lokal installierten Sprachmodell prüfen. Der Rechner führt das Modell aus; GitHub Pages führt keine KI aus. Es fallen keine API-Gebühren an. Download, Speicherplatz, Rechenzeit und Strom benötigst du selbst.

## Einmal pro Rechner, nicht pro Browser

Ollama und das Modell werden einmal auf jedem verwendeten Rechner installiert. Alle Browser auf diesem Rechner können anschließend die lokale Adresse `http://127.0.0.1:4189` nutzen. Die Browser speichern jedoch unterschiedliche Projekte; zum Wechsel das Projekt als JSON sichern und im anderen Browser öffnen. Nach einem Neustart nur Ollama und die Werkstatt starten, nicht erneut installieren. Auf einem zweiten Rechner ist eine eigene Installation erforderlich. Smartphone und Tablet unterstützen diese Desktop-Lösung nicht direkt.

Die frühere Werkstatt bleibt separat bestehen. Diese Edition verwendet Port 4189 statt 4188. Ein vorhandenes Ollama-Modell kann von beiden Editionen genutzt werden und muss nicht doppelt heruntergeladen werden.

## 1. Welches Modell? Ist die Qualität gut?

**Empfehlung zum Einstieg: `qwen3:8b`.** Der Standarddownload ist ungefähr 5,2 GB groß. Die Modellfamilie unterstützt viele Sprachen. Das ist eine praktikable Ausgangswahl, keine Qualitätsgarantie für deutsche Schülertexte.

Meine didaktische Einschätzung: sinnvoll als zusätzlicher Gesprächspartner für klare Thesen, fehlende Begründungen, Gegenargumente und alternative Kapitelreihenfolgen. Weniger zuverlässig bei subtilen Fehlschlüssen, anspruchsvollen Interpretationen und sachlichen Fehlern. Ein kleines Modell kann überzeugend klingende, aber falsche Hinweise geben. Keine automatische Benotung und keine Quellenverifikation daraus ableiten.

| Modell | Grobe Orientierung für Arbeitsspeicher* | Einsatz |
| --- | --- | --- |
| `qwen3:4b` | ca. 8–12 GB | Kleinere Rechner, kurze Textabschnitte; fachlich besonders kritisch prüfen |
| `qwen3:8b` | eher 16 GB oder mehr | Empfohlener Ausgangspunkt |
| `qwen3:14b` | eher 24–32 GB oder mehr | Größeres Modell zum Vergleich, höherer Speicherbedarf |

\* Praktische Schätzwerte, keine offiziellen Mindestanforderungen. Kontextlänge, Betriebssystem, laufende Anwendungen und GPU-Speicher beeinflussen den Bedarf. Ein Modell auf der CPU kann funktionieren, aber deutlich langsamer sein. Größer bedeutet nicht in jedem Einzelfall besser.

Hier wurde die Anbindung technisch mit simulierten Ollama-Antworten geprüft. Es wurde kein Modell heruntergeladen und kein Qualitätsvergleich auf echten Schülertexten durchgeführt.

**Qualität selbst prüfen:** Nimm drei kurze, anonymisierte Texte: einen guten, einen mit fehlender Begründung und einen mit absichtlich falschem Schluss. Vergleiche die Hinweise mit deinem eigenen Urteil. Zählt das Modell echte Begründungslücken auf? Zitiert es korrekt? Erfindet es Fehler oder Quellen? Erst danach für deine Lerngruppe einsetzen.

## 2. Ollama installieren

**Windows:** Windows 10 ab Version 22H2 oder Windows 11 verwenden. Den offiziellen Windows-Installer `OllamaSetup.exe` herunterladen. Die Befehle unten funktionieren in PowerShell oder der Eingabeaufforderung. Nach der Installation das Terminal neu öffnen, damit die Befehle gefunden werden.

1. Gehe zu [ollama.com/download](https://ollama.com/download).
2. Lade die offizielle Version für macOS, Windows oder Linux herunter und folge den Installationsschritten. Auf macOS/Windows die App anschließend starten.
3. Öffne das Terminal (macOS/Linux) oder PowerShell (Windows) und prüfe:

```sh
ollama --version
```

Falls der Befehl unbekannt ist: Terminal neu öffnen; gegebenenfalls Installation/PATH nach der offiziellen Anleitung prüfen.

## 3. Cloudfunktionen deaktivieren

Die Anbindung akzeptiert nur lokal installierte Modelle und lehnt erkannte Cloudmodelle ab. Deaktiviere zusätzlich Ollamas Cloudfunktionen, damit die lokale Konfiguration eindeutig ist.

Ollama zunächst vollständig beenden. Auf macOS über das Menüleistensymbol, auf Windows über das Taskleistensymbol. Wenn bereits ein `ollama serve` im Terminal läuft, dieses mit Ctrl+C stoppen.

### macOS/Linux: im Terminal starten

```sh
OLLAMA_NO_CLOUD=1 ollama serve
```

### Windows: in PowerShell starten

```powershell
$env:OLLAMA_NO_CLOUD="1"
ollama serve
```

Dieses Terminal offen lassen. Die Variable gilt für diesen Prozess. Für dauerhaftes Starten über die App lässt sich alternativ laut Ollama-Dokumentation in `~/.ollama/server.json` (Windows: `%USERPROFILE%\.ollama\server.json`) `"disable_ollama_cloud": true` setzen. Eine vorhandene Konfiguration ergänzen, nicht blind überschreiben, und Ollama danach neu starten.

Bei Linux-Installationen mit Systemdienst läuft Ollama eventuell bereits als Dienst. Dann `OLLAMA_NO_CLOUD=1` über eine systemd-Umgebungsvariable konfigurieren und den Dienst neu starten; siehe [offizielle FAQ](https://docs.ollama.com/faq). Die Konfiguration darf nicht parallel zwei Server auf Port 11434 starten.

**Keine Netzwerkfreigabe nötig:** `OLLAMA_HOST` und `OLLAMA_ORIGINS` müssen nicht geändert werden. Ollama bleibt auf der Standardadresse `127.0.0.1:11434`. Weder `0.0.0.0` noch eine Freigabe im Router einrichten.

## 4. Modell herunterladen

In einem zweiten Terminal:

```sh
ollama pull qwen3:8b
ollama list
```

Der Modelldownload benötigt Internet und einige GB freien Speicher. Nach dem Download ist für die Analyse keine Internetverbindung nötig. Wähle keinen Modellnamen mit `:cloud`.

Optional kannst du die Antwortsprache testen:

```sh
ollama run qwen3:8b "Antworte auf Deutsch: Was unterscheidet eine These von einer Begründung?"
```

Alternativen:

```sh
ollama pull qwen3:4b
ollama pull qwen3:14b
```

## 5. Lokale Gliederungswerkstatt starten

1. Installiere [Node.js](https://nodejs.org/) 22 LTS oder neuer, falls noch nicht vorhanden.
2. Lade unter [GitHub → Code → Download ZIP](https://github.com/PatrickFischerKSA/gliederungswerkstatt-ollama) das Projekt herunter und entpacke es.
3. Öffne ein Terminal **im entpackten Projektordner**, in dem `package.json` liegt. Nicht im ZIP-Archiv arbeiten.
   - **Windows:** ZIP im Explorer über „Alle extrahieren“ entpacken. Den entpackten Ordner öffnen und prüfen, ob `package.json` sichtbar ist; gegebenenfalls den enthaltenen Unterordner öffnen. In die Adressleiste des Explorers `powershell` eingeben und Enter drücken. Alternativ „Im Terminal öffnen“ verwenden.
   - **macOS:** Im Terminal `cd ` eingeben, den entpackten Ordner hineinziehen und Enter drücken.
   - **Linux:** Im Dateimanager im Projektordner „Im Terminal öffnen“ wählen.
4. Starte unter **Windows**:

```powershell
npm.cmd run local-ai
```

Unter **macOS/Linux**:

```sh
npm run local-ai
```

`npm.cmd` verwendet unter Windows direkt die mit Node.js installierte Befehlsdatei und vermeidet mögliche PowerShell-Sperren für `npm.ps1`. Dafür musst du keine Ausführungsrichtlinie ändern. Falls `npm.cmd` unbekannt ist, Node.js installieren und danach ein neues Terminal öffnen. Prüfen mit `node --version` und `npm.cmd --version`.

Es ist kein `npm install` nötig; der lokale Dienst verwendet nur Node.js-Bordmittel.

5. Öffne im Browser:

[http://127.0.0.1:4189/#argumentation](http://127.0.0.1:4189/#argumentation)

Das Terminal muss geöffnet bleiben. Beenden mit Ctrl+C. Ollama läuft separat. Beim nächsten Einsatz Ollama und die Werkstatt erneut starten: Windows mit `npm.cmd run local-ai`, macOS/Linux mit `npm run local-ai`. Das Modell nicht erneut herunterladen.

Die normale GitHub-Pages-Webversion funktioniert weiterhin mit der Regelprüfung. Für die KI-Funktion ist die lokale Adresse erforderlich. Dadurch entfallen Browserprobleme durch HTTPS-zu-Localhost-Verbindungen und zusätzliche CORS-Freigaben.

## 6. Bestehendes Projekt übertragen und prüfen

1. Auf der [Webversion](https://patrickfischerksa.github.io/gliederungswerkstatt-ollama/) **Projekt sichern** anklicken.
2. In der lokalen Werkstatt **Projekt öffnen** und die JSON-Datei auswählen. Browserdaten werden zwischen Webversion und lokalem Server nicht automatisch geteilt.
3. Unter „04 – Argumentation prüfen“ einen Entwurf eingeben oder Material übernehmen.
4. Im Ollama-Bereich **Verbindung prüfen & Modelle laden** anklicken.
5. Ein Modell auswählen und **Mit lokaler KI prüfen** starten.
6. Die KI erhält ausschließlich diesen Entwurf, die Leitfrage und die Hauptkapitelüberschriften. Vollständige Materialsammlungen und Originaldateien werden nicht mitgesendet.
7. Antwort kritisch lesen, Text überarbeiten, erneut prüfen. **KI-Bericht** exportiert Antwort, Modellname und den untersuchten Text als Markdown.

Grenzen pro Anfrage: 20 Wörter bis 10 000 Zeichen im Entwurf, 1 000 Zeichen in der Leitfrage, 3 000 Zeichen für alle Hauptkapitelüberschriften. Längere Arbeiten kapitelweise prüfen. Es wird nicht stillschweigend gekürzt. Die Kontextgröße wird auf 8 192 Tokens gesetzt; der Dienst begrenzt die Ausgabe auf 2 200 Tokens und wartet höchstens drei Minuten. Eine am Ausgabelimit beendete Antwort wird gekennzeichnet.

## 7. Häufige Probleme

- **Windows: „npm.ps1 kann nicht geladen werden“ / Skriptausführung deaktiviert:** `npm.cmd run local-ai` statt `npm run local-ai` verwenden. Die PowerShell-Ausführungsrichtlinie muss nicht geändert werden.
- **Windows: `npm.cmd` oder `node` nicht gefunden:** Node.js installieren und PowerShell vollständig schließen und neu öffnen. Mit `node --version` und `npm.cmd --version` prüfen.
- **Windows: `package.json` nicht gefunden / ENOENT:** Du bist im falschen Ordner. Die heruntergeladene ZIP vollständig entpacken und ein Terminal in dem Ordner öffnen, in dem `package.json` liegt.

- **„Ollama nicht erreichbar“:** Ollama starten, Terminal mit `ollama serve` auf Fehlermeldungen prüfen. `ollama list` muss funktionieren.
- **Kein Modell gefunden:** `ollama pull qwen3:8b` ausführen, danach „Verbindung prüfen“ erneut anklicken.
- **Webversion meldet lokale Nutzung erforderlich:** `npm run local-ai` starten und die Adresse mit Port **4189** öffnen. `npm start` startet in dieser Edition denselben lokalen Dienst.
- **„Port 4189 ist belegt“:** Ein anderes Terminal mit dieser Werkstatt läuft bereits. Dieses verwenden oder mit Ctrl+C beenden.
- **„address already in use“ bei Ollama:** App oder Dienst läuft bereits. Nicht noch einen zweiten Ollama-Server starten. Cloudmodus im laufenden Dienst konfigurieren oder die App vorher beenden.
- **Zeitlimit / Speichermangel:** Text kürzen, andere Anwendungen schließen, kleineres Modell ausprobieren. Eine CPU kann deutlich langsamer sein. Der erste Start lädt das Modell in den Speicher.
- **Modell unterstützt eine Anfrageoption nicht:** Ollama aktualisieren und zunächst das empfohlene `qwen3:8b` verwenden. Die Integration verwendet `think: false` für eine direkte, kürzere Antwort.
- **Angefangene Antwort:** Die Ausgabelänge wurde erreicht. Kürzeren Text prüfen und Hinweise abschnittsweise einholen.
- **„Eine KI-Prüfung läuft bereits“:** Kurz warten. Nach einem Abbruch muss Ollama den vorherigen Auftrag möglicherweise noch beenden.
- **Projekt scheint verschwunden:** Onlineversion und lokale Variante haben getrennte Browserspeicher. Projekt per JSON übertragen.

## Datenschutz und Grenzen

Der lokale Node-Dienst lauscht ausschließlich auf `127.0.0.1:4189`. Er spricht nur die feste Ollama-Adresse `127.0.0.1:11434` an, prüft Host und Browser-Origin und stellt keine beliebige Proxyadresse bereit. Er bietet keine Anmeldedaten, Cloudanfragen oder Modellinstallationen an. KI-Ausgaben werden als Text angezeigt, nicht als HTML ausgeführt. Entwürfe verbleiben wie bisher im lokalen Browserspeicher; der KI-Bericht wird erst auf Knopfdruck als Datei exportiert. Der Dienst schreibt keine Entwürfe in Serverdateien.

Ollama sieht lokale Modellanfragen laut Anbieter nicht. Netzwerkverkehr beim Installieren, Aktualisieren und Herunterladen der Modelle ist davon getrennt. Cloudmodelle sind in dieser Integration ausgeschlossen; nutze trotzdem die oben beschriebene Cloud-Deaktivierung. Die Qualität muss unabhängig von der technischen Lokalität geprüft werden.

## Quellen

- [Ollama für Windows: Installation und Voraussetzungen](https://docs.ollama.com/windows)
- [Ollama Quickstart](https://docs.ollama.com/quickstart)
- [Ollama FAQ: lokale Datenverarbeitung, Cloud-Deaktivierung, Konfiguration](https://docs.ollama.com/faq)
- [Qwen3 8B: Modelldownload, Größe und Modellbeschreibung](https://ollama.com/library/qwen3:8b)
- [Qwen3 14B](https://ollama.com/library/qwen3:14b)
- [Ollama Chat-API](https://docs.ollama.com/api/chat)

Stand der Anleitung: 19. Oktober 2026.
