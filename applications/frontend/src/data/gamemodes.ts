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
  name: string;
  players: Player[];
  maxPlayers: number;
  gameMode: string;
  isActive: boolean;
  createdAt: Date;
}

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
