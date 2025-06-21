# Demokratie Quiz 🏛️

Ein interaktives Quiz zur Stärkung des Verständnisses für demokratische Werte und Prozesse. Entwickelt mit **Next.js**, **React** und **Tailwind CSS v4**.

## 🚀 Installation & Start

### Voraussetzungen

- Node.js 18+
- npm oder yarn

### Projekt starten

```bash
# In das Next.js Frontend-Verzeichnis wechseln
cd applications/nextfrontend

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev

# Für Produktion bauen
npm run build
```

## 📁 Projektstruktur

```plaintext
applications/nextfrontend/
├── src/
│   ├── components/          # React Komponenten
│   │   ├── Hero.tsx         # Startseite mit Spielmodus-Auswahl
│   │   ├── Quiz.tsx         # Quiz-Komponente
│   │   ├── Leaderboard.tsx  # Bestenliste
│   │   ├── Reflection.tsx   # Reflexions-Fragen
│   │   └── Lobby.tsx        # Mehrspieler-Lobbies
│   ├── data/
│   │   └── mockData.ts      # Mock-Daten für Quiz-Fragen
│   ├── pages/               # Next.js Pages
│   │   ├── index.tsx        # Startseite
│   │   ├── quiz.tsx         # Quiz-Seite
│   │   ├── leaderboard.tsx  # Bestenliste
│   │   ├── reflection.tsx   # Reflexion
│   │   └── lobby.tsx        # Mehrspieler-Lobbies
│   └── styles/
│       └── globals.css      # Globale Styles
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
