# Mein Super-Start – Morgenroutine-App für Kinder 🦄

Eine PWA, die Kindern hilft, ihre Morgenroutine spielerisch zu meistern.  
Mit Einhorn-Begleiter, Stoppuhr, Belohnungssystem und Offline-Funktion.

## Features
- Spielerische Aufgabenliste mit Timer und Motivationssprüchen
- Punkte-System mit Avatar-Shop (Einhorn-Accessoires)
- Offline-first dank LocalStorage & Service Worker
- Elternbereich mit Aufgabenverwaltung, Timer-Optionen & Daten-Export
- Pädagogischer Fokus für Kinder zwischen 4 und 8 Jahren

## Struktur
- agents.md steuert alle Rollen & Aufgaben
- README.md erklärt Setup & Entwicklerprozess
- docs/ enthält Architektur- und QA-Unterlagen
- src/ beherbergt die PWA (HTML, CSS, JS, Daten, Audio)
- manifest.json & service-worker.js für PWA-Setup

## Start im Codex
```
codex run --agents agents.md --multi
```

## Installation zum Testen
Einfach index.html im Browser öffnen
oder PWA lokal hosten:
```
python3 -m http.server 8080
```

Service Worker registriert sich automatisch – Seite nach Änderungen aktualisieren.
