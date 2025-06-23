export const questions = [
  // Einfach (Easy)
  {
    id: "q1",
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
    id: "q2",
    type: "true-false",
    question: "Deutschland ist eine parlamentarische Demokratie.",
    correctAnswer: "true",
    difficulty: "einfach",
    explanation: "Deutschland ist eine parlamentarische und föderale Demokratie.",
  },

  // Mittel (Medium)
  {
    id: "q3",
    type: "multiple-choice",
    question: "Wie oft wird der Deutsche Bundestag normalerweise gewählt?",
    options: ["Alle 3 Jahre", "Alle 4 Jahre", "Alle 5 Jahre", "Alle 6 Jahre"],
    correctAnswer: "Alle 4 Jahre",
    difficulty: "mittel",
    explanation: "Der Deutsche Bundestag wird alle vier Jahre vom Volk gewählt.",
  },
  {
    id: "q4",
    type: "multiple-choice",
    question: "Welches Organ wählt den Bundeskanzler?",
    options: ["Das Volk direkt", "Der Bundestag", "Der Bundesrat", "Die Bundesversammlung"],
    correctAnswer: "Der Bundestag",
    difficulty: "mittel",
    explanation: "Der Bundeskanzler wird vom Bundestag gewählt, nicht direkt vom Volk.",
  },

  // Schwer (Hard)
  {
    id: "q5",
    type: "multiple-choice",
    question: "Welcher Artikel des Grundgesetzes garantiert die Menschenwürde?",
    options: ["Artikel 1", "Artikel 2", "Artikel 3", "Artikel 4"],
    correctAnswer: "Artikel 1",
    difficulty: "schwer",
    explanation: 'Artikel 1 des Grundgesetzes besagt: "Die Würde des Menschen ist unantastbar."',
  },
  {
    id: "q6",
    type: "true-false",
    question: "Der Bundesrat kann Gesetze des Bundestages mit absoluter Mehrheit ablehnen.",
    correctAnswer: "false",
    difficulty: "schwer",
    explanation:
      "Der Bundesrat kann nur bei zustimmungspflichtigen Gesetzen ein absolutes Veto einlegen.",
  },

  // Lustig (Fun)
  {
    id: "q7",
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
    id: "q8",
    type: "multiple-choice",
    question: "Das deutsche Grundgesetz besteht seit...",
    options: ["1945", "1949", "1951", "1990"],
    correctAnswer: "1949",
    difficulty: "einbürgerungstest",
    explanation: "Das Grundgesetz der Bundesrepublik Deutschland trat am 23. Mai 1949 in Kraft.",
  },
  {
    id: "q9",
    type: "multiple-choice",
    question: "Wie viele Bundesländer hat die Bundesrepublik Deutschland?",
    options: ["14", "15", "16", "17"],
    correctAnswer: "16",
    difficulty: "einbürgerungstest",
    explanation: "Deutschland besteht aus 16 Bundesländern.",
  },
  {
    id: "q10",
    type: "true-false",
    question: "Der Bundestag hat mehr als 600 Abgeordnete.",
    correctAnswer: "true",
    difficulty: "mittel",
    explanation:
      "Der Bundestag hat normalerweise 598 Sitze, kann aber durch Überhang- und Ausgleichsmandate auf über 700 Sitze anwachsen.",
  },
];

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
