# InvestWise - Intelligente Investitionsberatung

Eine moderne Web-App im Apple-Design-Stil, die KI-gestützte Investitionsempfehlungen basierend auf deinem Budget, Risikoprofil und Anlagehorizont bietet.

## Features

- 🎨 **Apple-inspiriertes Design** - Minimalistisch und elegant
- 🤖 **KI-gestützte Empfehlungen** - Powered by Claude API (Anthropic)
- 📊 **Personalisierte Portfolios** - Basierend auf individuellem Risikoprofil
- 📱 **Responsive Design** - Funktioniert auf allen Geräten
- 🔒 **Keine Daten gespeichert** - Alle Analysen erfolgen in Echtzeit

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **API**: Anthropic Claude API
- **Deployment**: Netlify
- **Version Control**: GitHub

## Installation & Lokale Entwicklung

1. **Repository klonen**
```bash
git clone https://github.com/DEIN-USERNAME/investwise.git
cd investwise
```

2. **Lokal öffnen**
   - Öffne `index.html` direkt in deinem Browser oder
   - Nutze einen lokalen Server (z.B. mit VS Code Live Server Extension)

## Deployment auf GitHub

### Schritt 1: GitHub Repository erstellen

1. Gehe zu [GitHub](https://github.com) und logge dich ein
2. Klicke auf das "+" Symbol oben rechts und wähle "New repository"
3. Repository-Name: `investwise` (oder einen anderen Namen)
4. Beschreibung: "KI-gestützte Investitionsberatung im Apple-Stil"
5. Wähle "Public" (oder "Private" wenn du möchtest)
6. Klicke auf "Create repository"

### Schritt 2: Code zu GitHub hochladen

Öffne dein Terminal/Command Prompt im Projektordner und führe aus:

```bash
# Git initialisieren
git init

# Alle Dateien hinzufügen
git add .

# Commit erstellen
git commit -m "Initial commit: InvestWise App"

# Mit GitHub verbinden (ersetze DEIN-USERNAME und investwise mit deinen Werten)
git remote add origin https://github.com/DEIN-USERNAME/investwise.git

# Hochladen
git branch -M main
git push -u origin main
```

## Deployment auf Netlify

### Methode 1: Über GitHub (Empfohlen)

1. Gehe zu [Netlify](https://www.netlify.com/) und melde dich an (mit GitHub)
2. Klicke auf "Add new site" → "Import an existing project"
3. Wähle "Deploy with GitHub"
4. Autorisiere Netlify für GitHub
5. Wähle dein `investwise` Repository
6. **Build Settings:**
   - Build command: (leer lassen)
   - Publish directory: `/` (oder leer lassen)
7. Klicke auf "Deploy site"

### Methode 2: Manueller Upload

1. Gehe zu [Netlify](https://www.netlify.com/)
2. Ziehe den gesamten Projektordner in den "Drop zone" Bereich
3. Netlify deployt automatisch

### Nach dem Deployment

- Netlify gibt dir eine URL wie `https://random-name.netlify.app`
- Du kannst diese in den Site Settings unter "Site details" → "Change site name" anpassen

## API-Schlüssel Konfiguration

⚠️ **WICHTIG:** Der aktuelle Code hat keine API-Key-Konfiguration, da die Anthropic API einen Schlüssel benötigt.

### Für Produktion: Backend mit Netlify Functions

Um die App produktionsreif zu machen, musst du ein Backend erstellen:

1. **Erstelle Netlify Functions Ordner:**

```bash
mkdir netlify
cd netlify
mkdir functions
```

2. **Erstelle `netlify/functions/analyze.js`:**

```javascript
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Nur POST-Requests erlauben
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { amount, risk, timeHorizon } = JSON.parse(event.body);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // Wird in Netlify hinterlegt
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `[Dein Prompt hier mit ${amount}, ${risk}, ${timeHorizon}]`
        }]
      })
    });

    const data = await response.json();
    
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API request failed' })
    };
  }
};
```

3. **Erstelle `netlify.toml` im Root-Verzeichnis:**

```toml
[build]
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

4. **API-Schlüssel in Netlify hinzufügen:**
   - Gehe zu Site Settings → Environment Variables
   - Füge hinzu: `ANTHROPIC_API_KEY` = dein-api-key

5. **Frontend anpassen (`app.js`):**
   - Ändere die API-URL von `https://api.anthropic.com/v1/messages` zu `/api/analyze`

## API-Schlüssel erhalten

1. Gehe zu [Anthropic Console](https://console.anthropic.com/)
2. Registriere dich / Logge dich ein
3. Navigiere zu "API Keys"
4. Erstelle einen neuen Key
5. Kopiere den Key (wird nur einmal angezeigt!)

## Projektstruktur

```
investwise/
├── index.html          # Hauptseite
├── styles.css          # Apple-Stil CSS
├── app.js             # Frontend-Logik
├── README.md          # Dokumentation
├── netlify.toml       # Netlify Konfiguration
└── netlify/
    └── functions/
        └── analyze.js  # Backend API-Funktion
```

## Anpassungen

### Domain ändern
1. In Netlify: Site Settings → Domain Management
2. Füge deine eigene Domain hinzu oder ändere die Subdomain

### Design anpassen
- Farben: Bearbeite die CSS-Variablen in `styles.css` unter `:root`
- Layout: Passe die HTML-Struktur in `index.html` an

## Sicherheitshinweise

- ⚠️ Niemals API-Keys direkt im Frontend-Code einfügen
- ✅ Nutze immer Netlify Functions oder ein Backend
- ✅ Setze Environment Variables in Netlify

## Disclaimer

Diese App bietet KI-gestützte Empfehlungen und ist keine professionelle Finanzberatung. Alle Investitionsentscheidungen sollten nach eigener Recherche und ggf. mit einem Finanzberater getroffen werden.

## Support

Bei Fragen oder Problemen:
- GitHub Issues: [Your Repo Issues](https://github.com/DEIN-USERNAME/investwise/issues)
- Anthropic API Docs: https://docs.anthropic.com

## Lizenz

MIT License - Frei nutzbar und anpassbar
