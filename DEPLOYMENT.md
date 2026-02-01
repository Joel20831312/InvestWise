# 🚀 Deployment-Anleitung für InvestWise

Diese Schritt-für-Schritt-Anleitung hilft dir, deine App auf GitHub und Netlify zu deployen.

## � Voraussetzungen

- [ ] GitHub Account ([kostenlos registrieren](https://github.com/signup))
- [ ] Netlify Account ([kostenlos registrieren](https://app.netlify.com/signup))
- [ ] Groq API Key ([hier erhalten](https://console.groq.com/))
- [ ] Git installiert auf deinem Computer

### Git installieren (falls noch nicht vorhanden)

**Windows:**
- Download von [git-scm.com](https://git-scm.com/download/win)
- Installiere mit Standard-Einstellungen

**Mac:**
```bash
# Mit Homebrew
brew install git

# Oder mit Xcode Command Line Tools
xcode-select --install
```

**Linux:**
```bash
sudo apt-get install git  # Ubuntu/Debian
sudo yum install git      # CentOS/Fedora
```

## 🔑 Schritt 1: Groq API Key erhalten

1. Gehe zu [console.groq.com](https://console.groq.com/)
2. Registriere dich oder logge dich ein
3. Navigiere zu **API Keys**
4. Klicke auf **Create API Key**
5. Gib einen Namen ein (z.B. "InvestWise")
6. **WICHTIG:** Kopiere den Key sofort! Er wird nur einmal angezeigt
7. Speichere ihn sicher (z.B. in einem Passwort-Manager)

**Hinweis:** Groq bietet kostenlosen API-Zugriff mit großzügigen Rate Limits!

## 📦 Schritt 2: GitHub Repository erstellen

### Via GitHub Website:

1. Gehe zu [github.com](https://github.com) und logge dich ein
2. Klicke oben rechts auf das **+** Symbol → **New repository**
3. Fülle folgende Felder aus:
   - **Repository name:** `investwise`
   - **Description:** "KI-gestützte Investitionsberatung"
   - **Public** oder **Private** (deine Wahl)
   - ✅ **NICHT** "Initialize with README" ankreuzen
4. Klicke auf **Create repository**

### Repository-URL kopieren:

Nach dem Erstellen siehst du eine Seite mit Anweisungen. Kopiere die URL, die so aussieht:
```
https://github.com/DEIN-USERNAME/investwise.git
```

## 💻 Schritt 3: Code auf GitHub hochladen

Öffne ein Terminal/Command Prompt und navigiere zum Projektordner:

```bash
# Navigiere zum Projektordner (passe den Pfad an)
cd /pfad/zum/investwise

# 1. Git initialisieren
git init

# 2. Alle Dateien zum Staging hinzufügen
git add .

# 3. Ersten Commit erstellen
git commit -m "Initial commit: InvestWise App mit Apple Design"

# 4. Hauptbranch benennen
git branch -M main

# 5. Remote Repository verbinden (ersetze DEIN-USERNAME)
git remote add origin https://github.com/DEIN-USERNAME/investwise.git

# 6. Code hochladen
git push -u origin main
```

### Bei Problemen mit Authentifizierung:

**GitHub Personal Access Token erstellen:**

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Name: "InvestWise Deploy"
4. Scope: Mindestens `repo` anhaken
5. Token kopieren (wird nur einmal angezeigt!)
6. Beim `git push` als Passwort eingeben

## 🌐 Schritt 4: Auf Netlify deployen

### Via GitHub (empfohlen):

1. Gehe zu [app.netlify.com](https://app.netlify.com)
2. Klicke auf **Add new site** → **Import an existing project**
3. Wähle **Deploy with GitHub**
4. Autorisiere Netlify (falls noch nicht geschehen)
5. Wähle das Repository **investwise**
6. **Build Settings:**
   - **Build command:** (leer lassen)
   - **Publish directory:** (leer lassen oder `/`)
7. Klicke auf **Deploy site**

### ⏳ Deployment läuft...

Du siehst nun einen Build-Prozess. Das dauert 1-3 Minuten.

## 🔐 Schritt 5: API Key in Netlify konfigurieren

**WICHTIG:** Dies ist der entscheidende Schritt!

1. In Netlify, gehe zu deiner Site
2. Klicke auf **Site configuration** → **Environment variables**
3. Klicke auf **Add a variable**
4. **Key:** `GROQ_API_KEY`
5. **Value:** [Dein API Key von Schritt 1]
6. **Scopes:** Alle auswählen (oder "All")
7. Klicke auf **Create variable**

### Deployment neu starten:

Da der API Key erst jetzt hinzugefügt wurde:

1. Gehe zu **Deploys**
2. Klicke auf **Trigger deploy** → **Deploy site**
3. Warte, bis der Build abgeschlossen ist (grüner Status)

## ✅ Schritt 6: Testen!

1. Klicke in Netlify auf den **Site Link** (z.B. `https://random-name.netlify.app`)
2. Deine App sollte jetzt live sein! 🎉
3. Teste die Investitionsanalyse:
   - Betrag eingeben (z.B. 10000)
   - Risikoprofil wählen
   - Auf "Empfehlung erhalten" klicken

### Funktioniert nicht? Debugging:

**Site funktioniert nicht:**
- Gehe zu Netlify → Deploys → Klicke auf den letzten Deploy
- Schaue die Build-Logs an
- Häufige Fehler:
  - API Key nicht gesetzt
  - Falsche Node-Version
  - Fehlende Dependencies

**API-Fehler:**
1. Öffne Browser-Konsole (F12)
2. Klicke auf "Empfehlung erhalten"
3. Schaue nach Fehler-Meldungen
4. Prüfe in Netlify → Functions → analyze → Logs

## 🎨 Schritt 7: Domain anpassen (optional)

### Netlify Subdomain ändern:

1. Netlify → Site configuration → Site details
2. **Change site name**
3. Wähle einen Namen, z.B. `mein-investwise`
4. Neue URL: `https://mein-investwise.netlify.app`

### Eigene Domain verbinden:

1. Netlify → Domain management → Add domain
2. Folge den Anweisungen
3. DNS-Einstellungen bei deinem Domain-Anbieter anpassen

## 🔄 Updates hochladen

Wenn du Code änderst:

```bash
# Im Projektordner
git add .
git commit -m "Beschreibung der Änderung"
git push

# Netlify deployt automatisch!
```

## 📊 Monitoring

**Netlify Analytics:**
- Netlify → Analytics (kostenpflichtig)
- Oder Google Analytics einbauen

**Function Logs:**
- Netlify → Functions → analyze
- Hier siehst du alle API-Aufrufe und Fehler

## 🛡️ Sicherheit

✅ **Gut gemacht:**
- API Key ist in Environment Variables (nicht im Code)
- Netlify Functions schützt deinen Key
- Users sehen den Key nie

⚠️ **Zusätzliche Tipps:**
- Setze Rate Limits in Netlify Functions
- Überwache API-Nutzung in Anthropic Console
- Erstelle Backups deines Codes

## 💰 Kosten

**Netlify:**
- ✅ Kostenlos für persönliche Projekte
- 100 GB Bandbreite/Monat
- 300 Build-Minuten/Monat

**Groq API:**
- ✅ **Kostenlos!** Großzügige Rate Limits
- Unbegrenzte kostenlose API-Nutzung (mit Fair-Use Policy)
- Prüfe aktuelle Limits: [groq.com/pricing](https://groq.com/pricing)

**Tipp:** Groq ist ideal für Projekte mit kostenlosen oder niedrigen Budgets!

## 📞 Support

**Probleme beim Deployment?**

1. GitHub Issues: [Dein Repo]/issues
2. Netlify Support Docs: [docs.netlify.com](https://docs.netlify.com)
3. Anthropic Docs: [docs.anthropic.com](https://docs.anthropic.com)

**Häufige Fehler:**

| Fehler | Lösung |
|--------|--------|
| "API Key not found" | `GROQ_API_KEY` Environment Variable in Netlify prüfen |
| "Function timeout" | Prompt kürzen oder max_tokens reduzieren |
| "Build failed" | package.json und netlify.toml prüfen |
| "CORS Error" | Headers in Netlify Function prüfen |
| "Groq API Error" | API Key in Netlify Environment Variables prüfen, oder auf [console.groq.com](https://console.groq.com/) prüfen, ob API aktiv ist |

## 🎉 Geschafft!

Deine App ist jetzt live! Teile den Link mit Freunden und Familie.

**Nächste Schritte:**
- [ ] Domain personalisieren
- [ ] Social Media Sharing hinzufügen
- [ ] Analytics einbauen
- [ ] Weitere Features entwickeln

---

**Viel Erfolg mit InvestWise! 🚀💰**
