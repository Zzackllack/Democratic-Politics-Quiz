
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Player {
  id: string;
  pseudonym: string;
  score: number;
  isHost: boolean;
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string | boolean;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: Question[];
  duration: number; // in minutes
}

interface GameSession {
  sessionCode: string;
  currentQuiz: Quiz | null;
  players: Player[];
  currentQuestionIndex: number;
  gameStatus: 'waiting' | 'active' | 'finished';
  scores: Record<string, number>;
}

interface GameContextType {
  gameSession: GameSession | null;
  currentPlayer: Player | null;
  createSession: (quizId: string, pseudonym: string) => string;
  joinSession: (sessionCode: string, pseudonym: string) => boolean;
  startQuiz: () => void;
  submitAnswer: (questionId: string, answer: string | boolean) => void;
  nextQuestion: () => void;
  getLeaderboard: () => Player[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Mock data for quizzes
const mockQuizzes: Quiz[] = [
  {
    id: 'beginner-democracy',
    title: 'Grundlagen der deutschen Demokratie',
    description: 'Lerne die Grundlagen des deutschen demokratischen Systems',
    difficulty: 'beginner',
    duration: 15,
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Wie heißt das deutsche Parlament?',
        options: ['Bundestag', 'Bundesrat', 'Landtag', 'Reichstag'],
        correctAnswer: 'Bundestag',
        explanation: 'Der Bundestag ist das deutsche Bundesparlament, in dem Gesetze beschlossen werden.',
        difficulty: 'beginner'
      },
      {
        id: 'q2',
        type: 'true-false',
        question: 'Deutschland ist eine Bundesrepublik.',
        correctAnswer: true,
        explanation: 'Deutschland ist tatsächlich eine Bundesrepublik, die aus 16 Bundesländern besteht.',
        difficulty: 'beginner'
      },
      {
        id: 'q3',
        type: 'short-answer',
        question: 'Wie viele Bundesländer hat Deutschland?',
        correctAnswer: '16',
        explanation: 'Deutschland besteht aus 16 Bundesländern, die jeweils eine eigene Regierung haben.',
        difficulty: 'beginner'
      }
    ]
  },
  {
    id: 'intermediate-democracy',
    title: 'Deutsches Regierungssystem',
    description: 'Erkunde Aufbau und Aufgaben der deutschen Regierung',
    difficulty: 'intermediate',
    duration: 20,
    questions: [
      {
        id: 'q4',
        type: 'multiple-choice',
        question: 'Wer steht an der Spitze der deutschen Regierung?',
        options: ['Bundespräsident', 'Bundeskanzler', 'Ministerpräsident', 'Bundestagspräsident'],
        correctAnswer: 'Chancellor',
        explanation: 'Der Bundeskanzler ist Regierungschef und leitet das Bundeskabinett.',
        difficulty: 'intermediate'
      },
      {
        id: 'q5',
        type: 'true-false',
        question: 'Der Bundesrat vertritt die Länder im Gesetzgebungsprozess.',
        correctAnswer: true,
        explanation: 'Der Bundesrat ist der Bundesrat, der die 16 deutschen Länder repräsentiert.',
        difficulty: 'intermediate'
      }
    ]
  },
  {
    id: 'advanced-democracy',
    title: 'Verfassungsrecht & Grundrechte',
    description: 'Tiefer Einblick in das Grundgesetz und die Bürgerrechte',
    difficulty: 'advanced',
    duration: 25,
    questions: [
      {
        id: 'q6',
        type: 'multiple-choice',
        question: 'Welches Prinzip wird in Artikel 20 des Grundgesetzes NICHT ausdrücklich genannt?',
        options: ['Bundesstaat', 'Rechtsstaat', 'Sozialstaat', 'Säkularer Staat'],
        correctAnswer: 'Säkularer Staat',
        explanation: 'Artikel 20 nennt Bundesstaat, Demokratie, Sozialstaat und Rechtsstaat, aber nicht die Säkularität.',
        difficulty: 'advanced'
      }
    ]
  }
];

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  const generateSessionCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createSession = (quizId: string, pseudonym: string): string => {
    const sessionCode = generateSessionCode();
    const quiz = mockQuizzes.find(q => q.id === quizId);
    
    if (!quiz) throw new Error('Quiz not found');

    const player: Player = {
      id: Math.random().toString(36).substring(2, 9),
      pseudonym,
      score: 0,
      isHost: true
    };

    const session: GameSession = {
      sessionCode,
      currentQuiz: quiz,
      players: [player],
      currentQuestionIndex: 0,
      gameStatus: 'waiting',
      scores: { [player.id]: 0 }
    };

    setGameSession(session);
    setCurrentPlayer(player);
    return sessionCode;
  };

  const joinSession = (sessionCode: string, pseudonym: string): boolean => {
    // Mock implementation - in real app this would connect to backend
    if (sessionCode.length !== 6) return false;

    const player: Player = {
      id: Math.random().toString(36).substring(2, 9),
      pseudonym,
      score: 0,
      isHost: false
    };

    // Create a mock session if none exists
    if (!gameSession || gameSession.sessionCode !== sessionCode) {
      const mockSession: GameSession = {
        sessionCode,
        currentQuiz: mockQuizzes[0],
        players: [player],
        currentQuestionIndex: 0,
        gameStatus: 'waiting',
        scores: { [player.id]: 0 }
      };
      setGameSession(mockSession);
    } else {
      setGameSession(prev => prev ? {
        ...prev,
        players: [...prev.players, player],
        scores: { ...prev.scores, [player.id]: 0 }
      } : null);
    }

    setCurrentPlayer(player);
    return true;
  };

  const startQuiz = () => {
    setGameSession(prev => prev ? { ...prev, gameStatus: 'active' } : null);
  };

  const submitAnswer = (questionId: string, answer: string | boolean) => {
    if (!gameSession || !currentPlayer) return;

    const currentQuestion = gameSession.currentQuiz?.questions[gameSession.currentQuestionIndex];
    if (!currentQuestion || currentQuestion.id !== questionId) return;

    const isCorrect = currentQuestion.correctAnswer === answer;
    const points = isCorrect ? 10 : 0;

    setGameSession(prev => {
      if (!prev || !currentPlayer) return prev;
      
      const newScore = (prev.scores[currentPlayer.id] || 0) + points;
      return {
        ...prev,
        scores: {
          ...prev.scores,
          [currentPlayer.id]: newScore
        },
        players: prev.players.map(p => 
          p.id === currentPlayer.id ? { ...p, score: newScore } : p
        )
      };
    });
  };

  const nextQuestion = () => {
    setGameSession(prev => {
      if (!prev || !prev.currentQuiz) return prev;
      
      const nextIndex = prev.currentQuestionIndex + 1;
      const isFinished = nextIndex >= prev.currentQuiz.questions.length;
      
      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        gameStatus: isFinished ? 'finished' : 'active'
      };
    });
  };

  const getLeaderboard = (): Player[] => {
    if (!gameSession) return [];
    return [...gameSession.players].sort((a, b) => b.score - a.score);
  };

  return (
    <GameContext.Provider value={{
      gameSession,
      currentPlayer,
      createSession,
      joinSession,
      startQuiz,
      submitAnswer,
      nextQuestion,
      getLeaderboard
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export { mockQuizzes };
export type { Quiz, Question, Player, GameSession };
