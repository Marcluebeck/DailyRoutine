# Test Cases – QA & Usability

## TC-001: Aufgabe starten
- **Given** Standardaufgaben vorhanden
- **When** Kind tippt auf Aufgabe
- **Then** Timer startet, Aufgabe markiert als aktiv

## TC-002: Aufgabe abschließen
- **Given** Aufgabe aktiv, Timer 0 erreicht
- **When** System stoppt Timer
- **Then** Aufgabe wird als erledigt markiert, Punkte vergeben

## TC-003: Offline-Modus
- **Given** App im Cache
- **When** Gerät verliert Verbindung
- **Then** App lädt weiterhin Aufgaben aus LocalStorage

## TC-004: Eltern-PIN Schutz
- **Given** Elternbereich
- **When** falsche PIN 3x eingeben
- **Then** 30 Sekunden Sperre
