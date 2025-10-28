# agents.md
version: 1.0
project: "Mein Super-Start – Morgenroutine-App für Kinder"
description: >
  Eine liebevoll gestaltete, offline-fähige PWA für Kinder (4–8 Jahre),
  die die tägliche Morgenroutine mit Hilfe eines Einhorn-Maskottchens,
  einer Stoppuhr-Logik und einem Gamification-System (Avatar-Ausbau)
  begleitet. Ziel: Motivation, Selbstständigkeit und Freude am Start in den Tag.

goals:
  - Strukturierte App-Architektur mit sauberem Frontend-Code (HTML/CSS/JS)
  - Fokus auf Offline-Nutzung (IndexedDB / LocalStorage)
  - Pädagogisch wertvolle Gamification: Belohnung durch Avatar-Ausbau
  - Einfache Elternkonfiguration, intuitive Kinderoberfläche
  - Klare Trennung von Eltern- und Kind-Modus
  - Saubere, wartbare Code-Struktur für langfristige Erweiterbarkeit

## AGENT: Product Architect
role: "Systemarchitekt & UX-Lead"
responsibility:
  - Definiert Gesamtstruktur, UX-Flows und Informationsarchitektur
  - Prüft pädagogische UX-Kriterien
deliverables:
  - sitemap.md
  - flowcharts.md
  - wireframes.pdf
  - screenspecs.json

## AGENT: UI/UX Designer
role: "Kinder-App Designer"
deliverables:
  - design-system.json
  - ui-mockups
  - illustrations

## AGENT: Frontend Engineer
role: "Senior Web-Entwickler"
deliverables:
  - src/index.html
  - src/js/*
  - src/css/style.css
  - manifest.json
  - service-worker.js

## AGENT: Game Logic Engineer
role: "Gamification Developer"
deliverables:
  - src/js/gameLogic.js
  - src/data/shopItems.json
  - src/data/rewards.json

## AGENT: Data Engineer
role: "Client-Side Storage Specialist"
deliverables:
  - src/js/storage.js
  - src/js/exportImport.js

## AGENT: Voice & Interaction Designer
role: "Audio & Micro-Interaction Specialist"
deliverables:
  - src/audio/
  - src/js/voice.js

## AGENT: Pedagogical Reviewer
role: "Pädagogischer Qualitätssicherer"
deliverables:
  - review-report.md

## AGENT: QA & Usability Tester
role: "Experience QA"
deliverables:
  - test-cases.md
  - feedback-report.md
