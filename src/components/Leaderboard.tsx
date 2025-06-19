
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, Users, Flag, Home, RotateCcw } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

const Leaderboard = () => {
  const navigate = useNavigate();
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const { gameSession, currentPlayer, getLeaderboard } = useGame();

  const handlePlayAgain = () => {
    navigate('/quiz-selection');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (!gameSession || !currentPlayer) {
    navigate('/');
    return null;
  }

  const leaderboard = getLeaderboard();
  const currentPlayerRank = leaderboard.findIndex(p => p.id === currentPlayer.id) + 1;
  const totalQuestions = gameSession.currentQuiz?.questions.length || 0;
  const maxPossibleScore = totalQuestions * 10; // 10 points per question

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-400" />;
      default: return <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">{rank}</div>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'border-yellow-300 bg-yellow-50';
      case 2: return 'border-gray-300 bg-gray-50';
      case 3: return 'border-orange-300 bg-orange-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getPerformanceMessage = (rank: number, totalPlayers: number) => {
    const percentage = (rank / totalPlayers) * 100;
    if (rank === 1) return "🎉 Glückwunsch! Du bist der Demokratie-Experte!";
    if (percentage <= 25) return "🏆 Hervorragende Leistung! Du kennst dich richtig gut aus!";
    if (percentage <= 50) return "👏 Gut gemacht! Du hast solides Wissen über die deutsche Demokratie!";
    if (percentage <= 75) return "📚 Nicht schlecht! Lerne weiter über demokratische Prinzipien!";
    return "💪 Gute Leistung! Jede Bürgerreise beginnt irgendwo!";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Flag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Quiz beendet!</h1>
                <p className="text-sm text-blue-600">Endergebnis</p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono">
              {sessionCode}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Results Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            {currentPlayerRank <= 3 && (
              <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
                {getRankIcon(currentPlayerRank)}
              </div>
            )}
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {currentPlayerRank === 1 ? 'Sieg!' : 'Quiz beendet!'}
          </h2>
          <p className="text-xl text-gray-600 mb-4">
            {getPerformanceMessage(currentPlayerRank, leaderboard.length)}
          </p>
          <div className="flex items-center justify-center space-x-6 text-gray-600">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{currentPlayer.score}</p>
              <p className="text-sm">Dein Ergebnis</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">#{currentPlayerRank}</p>
              <p className="text-sm">Dein Rang</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{Math.round((currentPlayer.score / maxPossibleScore) * 100)}%</p>
              <p className="text-sm">Genauigkeit</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span>Endrangliste</span>
            </CardTitle>
              <CardDescription>
                So haben alle Spieler in dieser Runde abgeschnitten
              </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard.map((player, index) => {
                const rank = index + 1;
                const isCurrentPlayer = player.id === currentPlayer.id;
                
                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      getRankColor(rank)
                    } ${isCurrentPlayer ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center">
                        {getRankIcon(rank)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          {player.pseudonym}
                          {isCurrentPlayer && (
                            <span className="text-blue-600 text-sm font-normal ml-2">(Du)</span>
                          )}
                          {player.isHost && (
                            <Badge variant="secondary" className="ml-2 text-xs">Gastgeber</Badge>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          {Math.round((player.score / maxPossibleScore) * 100)}% accuracy
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{player.score}</p>
                      <p className="text-sm text-gray-500">Punkte</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quiz Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quiz-Zusammenfassung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Quizdetails</h4>
                <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Titel:</strong> {gameSession.currentQuiz?.title}</p>
                    <p><strong>Schwierigkeit:</strong> {gameSession.currentQuiz?.difficulty}</p>
                    <p><strong>Fragen:</strong> {totalQuestions}</p>
                    <p><strong>Dauer:</strong> {gameSession.currentQuiz?.duration} Minuten</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Session-Statistiken</h4>
                <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Spieler insgesamt:</strong> {leaderboard.length}</p>
                    <p><strong>Sitzungscode:</strong> {sessionCode}</p>
                    <p><strong>Durchschnittliche Punktzahl:</strong> {Math.round(leaderboard.reduce((sum, p) => sum + p.score, 0) / leaderboard.length)}</p>
                    <p><strong>Höchste Punktzahl:</strong> {leaderboard[0]?.score || 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handlePlayAgain}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-medium"
            size="lg"
          >
              <RotateCcw className="w-5 h-5 mr-2" />
              Noch einmal spielen
          </Button>
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="px-8 py-3 text-lg font-medium"
            size="lg"
          >
              <Home className="w-5 h-5 mr-2" />
              Zur Startseite
          </Button>
        </div>

        {/* Educational Note */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Flag className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-blue-900 mb-2">Bleib am Ball!</h4>
              <p className="text-blue-800 text-sm">
                Demokratie lebt von informierten und engagierten Bürgern. Informiere dich weiter über deutsche Institutionen,
                deine Rechte und deine Pflichten.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Leaderboard;
