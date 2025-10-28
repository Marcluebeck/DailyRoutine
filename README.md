# Mein Super-Start – Morgenroutine-App für Kinder 🦄

Eine PWA, die Kindern hilft, ihre Morgenroutine spielerisch zu meistern.  
Mit Einhorn-Begleiter, Stoppuhr, Belohnungssystem und Offline-Funktion.

## Features
- Aufgabenliste mit Stoppuhr (Count-Up)
- Punkte & Einhorn-Avatar-Shop
- Offline-first (IndexedDB + Service Worker)
- Elternbereich zum Konfigurieren
- Ideal für Kinder 4–8 Jahre

## Struktur
- agents.md steuert alle Rollen & Aufgaben
- README.md erklärt Setup & Entwicklerprozess

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
