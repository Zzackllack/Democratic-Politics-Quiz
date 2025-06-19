
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '../components/HomePage';
import QuizSelection from '../components/QuizSelection';
import GameLobby from '../components/GameLobby';
import QuizGame from '../components/QuizGame';
import Leaderboard from '../components/Leaderboard';
import { GameProvider } from '../contexts/GameContext';

const Index = () => {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quiz-selection" element={<QuizSelection />} />
            <Route path="/lobby/:sessionCode" element={<GameLobby />} />
            <Route path="/quiz/:sessionCode" element={<QuizGame />} />
            <Route path="/leaderboard/:sessionCode" element={<Leaderboard />} />
          </Routes>
        </BrowserRouter>
      </div>
    </GameProvider>
  );
};

export default Index;
