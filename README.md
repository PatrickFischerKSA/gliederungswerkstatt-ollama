# Roter Faden – Gliederungswerkstatt mit Ollama

Eine deutschsprachige, statische Browseranwendung, um Materialien zu sammeln und daraus eine bearbeitbare Gliederung zu entwickeln. Für Fach-, Projekt- und Maturaarbeiten. Ohne Konto oder API-Schlüssel. Die KI-Funktion nutzt einen lokalen Node.js-Dienst und Ollama auf demselben Rechner.

## Eigenständiger Stand: Ollama-Edition

Dieser Stand wird separat unter **gliederungswerkstatt-ollama** veröffentlicht. Ollama, Modell und Node.js werden einmal pro Rechner eingerichtet, nicht pro Browser. Die lokale Adresse dieser Edition verwendet Port **4189**, damit sie neben der bisherigen Werkstatt (4188) laufen kann.

- Neuer Rechner: Ollama, Modell und lokale Werkstatt dort einrichten.
- Weiterer Browser auf demselben Rechner: dieselbe lokale Adresse öffnen, keine erneute Modellinstallation.
- Nach einem Neustart: Ollama und die Werkstatt starten; das Modell bleibt installiert.
- Projektdaten bleiben pro Browser getrennt. JSON-Sicherung und -Import übertragen bestehende Projekte, auch aus der ursprünglichen Werkstatt.
- Diese Lösung richtet sich an macOS-, Windows- und Linux-Rechner. Smartphones und Tablets können die statische Webversion nutzen, aber nicht diese Desktop-Ollama-Anbindung.

[Installationsanleitung mit Windows-Schritten](OLLAMA-ANLEITUNG.md)

## Starten auf Windows und Mac

Nach einmaliger Installation von Node.js 22+ sowie Ollama und dem Modell:

| System | Startdatei im entpackten Projektordner |
| --- | --- |
| Windows | `Start-Windows.cmd` |
| macOS | `Start-Mac.command` |

Danach **http://127.0.0.1:4189** im Browser öffnen. Das Startfenster offen lassen; Ollama läuft separat. Es ist kein `npm install` nötig. Die vollständige [Anleitung](OLLAMA-ANLEITUNG.md) erklärt Installation, alternative Terminalbefehle und Projektübertragung.

### Alternativ im Terminal starten

Windows (PowerShell oder Eingabeaufforderung):

```powershell
npm.cmd start
```

macOS/Linux:

```sh
npm start
```

Danach http://127.0.0.1:4189 öffnen. Node.js 22 LTS oder neuer ist für den lokalen Server erforderlich. Nicht per Doppelklick öffnen: PDF-Worker und JavaScript-Module brauchen HTTP. Andere statische Webserver ermöglichen die Grundfunktionen, aber nicht die lokale KI-Verbindung.

## Arbeitsablauf

1. Titel und Leitfrage festhalten.
2. Über drei separate Uploadfelder Quellen, Notizen und Vorgaben hinzufügen. Mehrfachauswahl ist möglich. Alternativ Text direkt eingeben.
3. Ein Grundmodell und optional mehrere Modelle für die Unterkapitel wählen. Über **Weiteres Modell anhängen** lassen sich zusätzliche Modelle ergänzen und wieder entfernen.
4. Gliederung erzeugen, Kapitel umbenennen, verschieben, ergänzen oder löschen. Unterkapitel sind ebenfalls bearbeitbar.
5. Materialien einem oder mehreren Hauptkapiteln zuordnen. Unzugeordnete Materialien bleiben sichtbar. Volltexte und Materialtitel lassen sich im Materialspeicher bearbeiten.
6. Projekt als JSON sichern oder wieder öffnen; Gliederung mit Materialverzeichnis als Markdown exportieren. Über den Browserdialog lässt sich die Gliederung drucken oder als PDF sichern.

## Modelle und didaktischer Bezug

Als fachliche Orientierung diente der vom Auftraggeber bereitgestellte Scan „Der rote FadenII“, insbesondere die Abschnitte 13 und 14 (gedruckte Seiten 101–114): chronologische Kette, vergleichende Waage, systematischer Rhombus, Phänomen–Ursache/Wirkung und IMRAD. Hinzu kommen induktives, deduktives und dialektisches Vorgehen. Die Beschreibungen und Vorlagen sind eigenständig formuliert; der Scan wird nicht mitveröffentlicht.

Die Kombination erzeugt das Grundmodell als Hauptkapitel. Das zweite Modell und alle zusätzlich angehängten Modelle ergänzen ihre jeweiligen Abschnitte als Unterkapitel innerhalb jedes Hauptkapitels – nacheinander in der ausgewählten Reihenfolge, ohne zusätzliche Verschachtelung. Doppelte Modelle werden beim Erzeugen nur einmal berücksichtigt. Ältere Projektdateien ohne Zusatzmodelle bleiben kompatibel. Einleitung und Schluss stehen außerhalb der Kombination. Die Gliederung ist eine Vorlage, keine fachlich geprüfte fertige Arbeit. Vorgaben sind Material und werden nicht als ausführbare Anweisungen interpretiert.

## Dateiformate und Grenzen

- PDF mit Textebene, DOCX, TXT, MD, CSV; maximal 20 MB pro Datei.
- PDF-Import mit PDF.js, DOCX-Import mit Mammoth. Beide liegen lokal unter `vendor/`, einschließlich ihrer Lizenzen. Keine CDNs und keine Übertragung an KI-Dienste.
- Gescannte PDFs und Bilder benötigen eine separate OCR. Die Anwendung enthält keine OCR und zeigt bei PDFs ohne Text einen Hinweis.
- Tabellen in DOCX sowie Layout, Bilder und Fußnoten werden nicht originalgetreu übernommen: importiert wird Text. CSV wird als Text übernommen.
- Vorschläge zur Zuordnung entstehen ausschließlich aus gemeinsamen Wörtern in Kapitelüberschrift und Materialtext. Ohne Treffer bleibt Material unzugeordnet. Vorgaben werden nicht automatisch zugeordnet. Keine semantische KI-Analyse.
- Automatische Speicherung in `localStorage` des jeweiligen Browsers. Browserdaten können gelöscht werden; große Projekte können die Speichergrenze überschreiten. Deshalb regelmäßig JSON sichern. JSON enthält die importierten Texte, nicht die Originaldateien.
- Die Anwendung lädt keine externen Ressourcen. Andere Skripte unter derselben Web-Origin könnten jedoch auf den Browserspeicher zugreifen. Für sensible Materialien eine eigene Origin und einen vertrauenswürdigen Browser verwenden.
- Beim erneuten Erzeugen werden bestehende Kapitel und Zuordnungen nach Bestätigung ersetzt; Materialien bleiben erhalten.

## GitHub Pages

1. Dieses Verzeichnis als Repository auf GitHub hochladen (Dateien direkt auf oberster Ebene).
2. Den Hauptbranch `main` nennen.
3. Unter **Settings → Pages → Build and deployment → Source** die Option **GitHub Actions** wählen.
4. Der enthaltene Workflow prüft den Code und veröffentlicht die statischen Dateien. Die URL erscheint im Actions-Lauf.

Alle Assetpfade sind relativ; dadurch funktioniert auch eine Projekt-URL wie `https://name.github.io/repository/`. Repository: https://github.com/PatrickFischerKSA/gliederungswerkstatt-ollama

Live-Anwendung: https://patrickfischerksa.github.io/gliederungswerkstatt-ollama/

## Entwicklung und Prüfung

```sh
npm run check
npm test
```

Node.js 22+ erforderlich. Tests prüfen Modellkombinationen, Materialvorschläge, Projektvalidierung und Export. Keine Installation von npm-Paketen nötig. Die Anwendung benötigt einen aktuellen Browser mit ES-Modulen, Web Workern und `crypto.randomUUID` (localhost oder HTTPS).

## Lizenz

Eigener Anwendungscode: MIT, siehe LICENSE. Drittanbieterdateien behalten ihre eigenen Lizenzen in `vendor/`. Materialien, die Nutzer importieren, gehören nicht zur Code-Lizenz.

## Integrierter Argumentationsprüfer

Abschnitt **04 – Argumentation prüfen** portiert die lokalen Prüfregeln aus [PatrickFischerKSA/argumentationspruefer](https://github.com/PatrickFischerKSA/argumentationspruefer) (`server.js`) in ein eigenständiges Browsermodul (`argumentation.js`). Der ursprüngliche Quellcode bleibt im anderen Repository erhalten. Die Integration entstand im Auftrag desselben Repositoryinhabers; sie umfasst keine externen Abhängigkeiten oder Zugangsschlüssel.

Materialtexte und Kapitelnotizen können in einen eigenen Prüfentwurf übernommen werden. Der Entwurf wird mit dem Projekt gespeichert und lässt sich als neue Materialnotiz sichern. Eine Änderung des Entwurfs verwirft die bisherige Anzeige, damit keine veralteten Ergebnisse angezeigt oder exportiert werden. Die Prüfung erfordert mindestens 20 Wörter und erlaubt höchstens 60 000 Zeichen. Alte Projekte ohne Prüfentwurf funktionieren weiterhin.

Acht Bereiche: These und Position, Begründung und Logik, Belege und Beispiele, Gegenargumente, Aufbau und Schluss, sprachliche Wirkung, Adressatenführung, Zitatarbeit. Ergänzt werden Überarbeitungsschritte, Absatz- und Satzhinweise, Stilhinweise und Formulierungshilfen. Ein Markdown-Prüfbericht enthält die Kategorien, Hilfen und den geprüften Text.

Die Regeln arbeiten mit Textlängen, Absätzen und Signalwörtern. Hinweise sind Vermutungen zur Überarbeitung; sie prüfen weder die Wahrheit von Aussagen noch die Gültigkeit von Schlüssen oder die Existenz zitierter Quellen. Auf eine Gesamtnote und Punkteanzeige wird deshalb verzichtet. Die Serverfunktionen des Originals (OpenAI-Vertiefung, LanguageTool, Literaturverifikation) werden nicht aufgerufen und sind nicht Bestandteil dieser statischen Integration. Es werden keine Entwürfe an das Original oder externe Dienste übermittelt.

## Optionale lokale KI mit Ollama

Neu: Die Werkstatt kann den aktuellen Entwurf mit einem lokalen Ollama-Modell inhaltlich untersuchen. Empfehlung zum Einstieg: `qwen3:8b`. Die vollständige [Installations- und Bedienungsanleitung](OLLAMA-ANLEITUNG.md) erklärt Modellwahl, Qualität, Offlinebetrieb und Fehlerbehebung.

```sh
ollama pull qwen3:8b
npm run local-ai
```

Ollama muss separat laufen, Cloudfunktionen bitte wie in der Anleitung deaktivieren. Lokale Oberfläche: http://127.0.0.1:4189/#argumentation. Node.js 22 LTS oder neuer empfohlen. Keine npm-Abhängigkeiten nötig. In der GitHub-Pages-Webversion wird die Einrichtung erklärt; KI-Aufrufe werden ausschließlich über die lokal gestartete Werkstatt ausgeführt. Keine CORS- oder Netzwerkfreigabe von Ollama erforderlich. Der Code wurde mit einer simulierten Ollama-API getestet; ein reales Modell muss vom Nutzer installiert und die Antwortqualität am eigenen Material geprüft werden.

## Eigenes ChatGPT- oder Claude-Konto: Kopierweg

Unter **04 → Eigenes Chat-Konto** einen Prüfauftrag erstellen, kopieren und selbst in ChatGPT oder Claude absenden. Der Auftrag enthält den aktuellen Entwurf, Arbeitstitel, Leitfrage und die Gliederung mit Kapitelnotizen; keine Originaldateien oder Materialvolltexte. Er lässt sich vor dem Kopieren ansehen. Es ist keine API-Verbindung implementiert, kein API-Schlüssel nötig und Ollama muss für diesen Weg nicht installiert sein. Die Funktion arbeitet auch auf GitHub Pages ohne lokalen Dienst. Nutzung und Limits richten sich nach dem jeweiligen Chat-Konto.

Die Antwort aus dem Chat manuell zurückkopieren. Auftrag und Antwort werden mit dem Projekt als JSON gespeichert. Die Antwort kann zusätzlich als Materialnotiz gesichert oder gemeinsam mit dem Auftrag als Markdown heruntergeladen werden. Nach Änderungen an der Arbeit den Prüfauftrag neu erstellen. Bei vorhandener Antwort wird vor dem Ersetzen nachgefragt. Es erfolgt kein automatisches Senden und kein automatisches Lesen aus fremden Chats.
