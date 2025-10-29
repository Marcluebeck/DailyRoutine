# GitHub-Veröffentlichung

So kannst du das Projekt in ein eigenes GitHub-Repository hochladen und veröffentlichen:

1. **Neues Repository anlegen**  
   Erstelle auf [github.com/new](https://github.com/new) ein leeres Repository (ohne README, Lizenz oder `.gitignore`).

2. **Remote-Verbindung setzen**  
   Ersetze `USERNAME` und `REPO` im folgenden Befehl und führe ihn im Projektverzeichnis aus:
   ```bash
   git remote add origin git@github.com:USERNAME/REPO.git
   ```
   Alternativ kannst du auch die HTTPS-URL verwenden (`https://github.com/USERNAME/REPO.git`).

3. **Aktuellen Stand prüfen**  
   Stelle sicher, dass alle Dateien erfasst sind:
   ```bash
   git status
   ```
   Füge ggf. fehlende Dateien hinzu:
   ```bash
   git add .
   ```

4. **Commit erstellen**  
   Falls noch Änderungen offen sind, committe sie mit einer sinnvollen Nachricht:
   ```bash
   git commit -m "chore: initial project setup"
   ```

5. **Ersten Push durchführen**  
   Für einen neuen Branch (z. B. `main`) sieht der Push so aus:
   ```bash
   git push -u origin main
   ```
   Beim ersten Push musst du dich gegenüber GitHub authentifizieren (SSH-Key oder HTTPS mit Token).

6. **Weitere Updates**  
   Für spätere Änderungen genügt:
   ```bash
   git add <dateien>
   git commit -m "<beschreibung>"
   git push
   ```

7. **Release-Optionen**  
   - Aktiviere unter "Settings → Pages" optional GitHub Pages, um die PWA direkt bereitzustellen.
   - Nutze GitHub Actions (Ordner `.github/workflows/`) für automatische Tests oder Deployments.

Damit ist das Projekt mit allen Assets (Code, Tests, Dokumentation, Medien) vollständig in GitHub verfügbar.
