export interface Question {
  id: string;
  type: "multiple-choice" | "true-false";
  question: string;
  options?: string[];
  correctAnswer: string | boolean;
  difficulty: "einfach" | "mittel" | "schwer" | "lustig" | "einbürgerungstest";
  explanation: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  joinedAt: Date;
}

export interface Lobby {
  id: string;
  code?: string;
  name: string;
  players: Player[];
  maxPlayers: number;
  gameMode: string;
  isActive: boolean;
  createdAt: Date;
}

// Mock questions data
export const mockQuestions: Question[] = [
  // Einfach (Easy)
  {
    id: "1",
    type: "multiple-choice",
    question: "Wer ist das Staatsoberhaupt der Bundesrepublik Deutschland?",
    options: [
      "Der Bundeskanzler",
      "Der Bundespräsident",
      "Der Bundestagspräsident",
      "Der Bundesminister",
    ],
    correctAnswer: "Der Bundespräsident",
    difficulty: "einfach",
    explanation:
      "Der Bundespräsident ist das Staatsoberhaupt Deutschlands und wird von der Bundesversammlung gewählt.",
  },
  {
    id: "2",
    type: "true-false",
    question: "Deutschland ist eine parlamentarische Demokratie.",
    correctAnswer: true,
    difficulty: "einfach",
    explanation: "Deutschland ist eine parlamentarische und föderale Demokratie.",
  },

  // Mittel (Medium)
  {
    id: "3",
    type: "multiple-choice",
    question: "Wie oft wird der Deutsche Bundestag normalerweise gewählt?",
    options: ["Alle 3 Jahre", "Alle 4 Jahre", "Alle 5 Jahre", "Alle 6 Jahre"],
    correctAnswer: "Alle 4 Jahre",
    difficulty: "mittel",
    explanation: "Der Deutsche Bundestag wird alle vier Jahre vom Volk gewählt.",
  },
  {
    id: "4",
    type: "multiple-choice",
    question: "Welches Organ wählt den Bundeskanzler?",
    options: ["Das Volk direkt", "Der Bundestag", "Der Bundesrat", "Die Bundesversammlung"],
    correctAnswer: "Der Bundestag",
    difficulty: "mittel",
    explanation: "Der Bundeskanzler wird vom Bundestag gewählt, nicht direkt vom Volk.",
  },

  // Schwer (Hard)
  {
    id: "5",
    type: "multiple-choice",
    question: "Welcher Artikel des Grundgesetzes garantiert die Menschenwürde?",
    options: ["Artikel 1", "Artikel 2", "Artikel 3", "Artikel 4"],
    correctAnswer: "Artikel 1",
    difficulty: "schwer",
    explanation: 'Artikel 1 des Grundgesetzes besagt: "Die Würde des Menschen ist unantastbar."',
  },
  {
    id: "6",
    type: "true-false",
    question: "Der Bundesrat kann Gesetze des Bundestages mit absoluter Mehrheit ablehnen.",
    correctAnswer: false,
    difficulty: "schwer",
    explanation:
      "Der Bundesrat kann nur bei zustimmungspflichtigen Gesetzen ein absolutes Veto einlegen.",
  },

  // Lustig (Fun)
  {
    id: "7",
    type: "multiple-choice",
    question: "Was passiert, wenn der Bundeskanzler beim Vertrauensvotum durchfällt?",
    options: [
      "Er muss Kuchen für alle backen",
      "Er kann die Vertrauensfrage stellen",
      "Er wird sofort entlassen",
      "Er bekommt eine Verwarnung",
    ],
    correctAnswer: "Er kann die Vertrauensfrage stellen",
    difficulty: "lustig",
    explanation:
      "Nach einem gescheiterten Vertrauensvotum kann der Bundeskanzler die Vertrauensfrage stellen - aber Kuchen wäre auch nett!",
  },

  // Einbürgerungstest
  {
    id: "8",
    type: "multiple-choice",
    question: "Das deutsche Grundgesetz besteht seit...",
    options: ["1945", "1949", "1951", "1990"],
    correctAnswer: "1949",
    difficulty: "einbürgerungstest",
    explanation: "Das Grundgesetz der Bundesrepublik Deutschland trat am 23. Mai 1949 in Kraft.",
  },
  {
    id: "9",
    type: "multiple-choice",
    question: "Wie viele Bundesländer hat die Bundesrepublik Deutschland?",
    options: ["14", "15", "16", "17"],
    correctAnswer: "16",
    difficulty: "einbürgerungstest",
    explanation: "Deutschland besteht aus 16 Bundesländern.",
  },
];

// Mock players data
export const mockPlayers: Player[] = [
  {
    id: "1",
    name: "Anna Schmidt",
    score: 850,
    joinedAt: new Date("2024-01-15T10:30:00"),
  },
  {
    id: "2",
    name: "Max Mueller",
    score: 780,
    joinedAt: new Date("2024-01-15T10:32:00"),
  },
  {
    id: "3",
    name: "Lisa Weber",
    score: 720,
    joinedAt: new Date("2024-01-15T10:35:00"),
  },
  {
    id: "4",
    name: "Tom Fischer",
    score: 680,
    joinedAt: new Date("2024-01-15T10:38:00"),
  },
  {
    id: "5",
    name: "Sarah Klein",
    score: 650,
    joinedAt: new Date("2024-01-15T10:40:00"),
  },
];

// Mock lobbies data
export const mockLobbies: Lobby[] = [
  {
    id: "1",
    code: "AAAAAA",
    name: "Demokratie-Profis",
    players: mockPlayers.slice(0, 3),
    maxPlayers: 4,
    gameMode: "schwer",
    isActive: true,
    createdAt: new Date("2024-01-15T10:25:00"),
  },
  {
    id: "2",
    code: "BBBBBB",
    name: "Einsteiger-Runde",
    players: mockPlayers.slice(3, 5),
    maxPlayers: 6,
    gameMode: "einfach",
    isActive: true,
    createdAt: new Date("2024-01-15T10:30:00"),
  },
];

// Game modes configuration
export const gameModes = {
  einfach: {
    label: "Einfach",
    description: "Grundlegende Fragen zur Demokratie",
    color: "bg-green-500",
    icon: "🌱",
  },
  mittel: {
    label: "Mittel",
    description: "Erweiterte Kenntnisse erforderlich",
    color: "bg-yellow-500",
    icon: "⚡",
  },
  schwer: {
    label: "Schwer",
    description: "Für echte Demokratie-Experten",
    color: "bg-red-500",
    icon: "🔥",
  },
  lustig: {
    label: "Lustig",
    description: "Demokratie mit einem Augenzwinkern",
    color: "bg-purple-500",
    icon: "😄",
  },
  einbürgerungstest: {
    label: "Einbürgerungstest",
    description: "Offizielle Fragen zur deutschen Staatsbürgerschaft",
    color: "bg-blue-500",
    icon: "🏛️",
  },
};
