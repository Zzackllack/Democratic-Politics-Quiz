# Demokratie Quiz 🏛️

Ein interaktives Quiz zur Stärkung des Verständnisses für demokratische Werte und Prozesse. Entwickelt mit **Astro**, **React** und **Tailwind CSS v4**.

## 🚀 Installation & Start

### Voraussetzungen

- Node.js 18+
- npm oder yarn

### Projekt starten

```bash
# In das Frontend-Verzeichnis wechseln
cd applications/frontend

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Für Produktion bauen
npm run build

# Produktions-Vorschau
npm run preview
```

## 📁 Projektstruktur

```plaintext
applications/frontend/
├── src/
│   ├── components/          # React Komponenten
│   │   ├── Hero.tsx         # Startseite mit Spielmodus-Auswahl
│   │   ├── Quiz.tsx         # Quiz-Komponente
│   │   ├── Leaderboard.tsx  # Bestenliste
│   │   ├── Reflection.tsx   # Reflexions-Fragen
│   │   └── Lobby.tsx        # Mehrspieler-Lobbies
│   ├── data/
│   │   └── mockData.ts      # Mock-Daten für Quiz-Fragen
│   ├── layouts/
│   │   └── Layout.astro     # Basis-Layout
│   ├── pages/               # Astro-Seiten
│   │   ├── index.astro      # Startseite
│   │   ├── quiz.astro       # Quiz-Seite
│   │   ├── leaderboard.astro # Bestenliste
│   │   ├── reflection.astro  # Reflexion
│   │   └── lobby.astro      # Mehrspieler-Lobbies
│   └── styles/
│       └── global.css       # Globale Styles
├── astro.config.mjs         # Astro-Konfiguration
├── tailwind.config.js       # Tailwind-Konfiguration
└── package.json
```

## 🎮 Spielmodi

### Schwierigkeitsgrade

1. **Einfach** 🌱 - Grundlegende Fragen zur Demokratie
2. **Mittel** ⚡ - Erweiterte Kenntnisse erforderlich
3. **Schwer** 🔥 - Für echte Demokratie-Experten
4. **Lustig** 😄 - Demokratie mit einem Augenzwinkern
5. **Einbürgerungstest** 🏛️ - Offizielle Fragen zur deutschen Staatsbürgerschaft

## 📄 Lizenz

BSD 3-Clause License - siehe LICENSE Datei für Details.
