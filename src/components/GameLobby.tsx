
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, Clock, Flag, Crown, User } from 'lucide-react';
import { useGame } from '../contexts/GameContext';
import { toast } from '@/hooks/use-toast';

const GameLobby = () => {
  const navigate = useNavigate();
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const { gameSession, currentPlayer, startQuiz } = useGame();

  useEffect(() => {
    if (!gameSession || !currentPlayer) {
      navigate('/');
      return;
    }

    if (gameSession.gameStatus === 'active') {
      navigate(`/quiz/${sessionCode}`);
    }
  }, [gameSession, currentPlayer, sessionCode, navigate]);

  const handleCopySessionCode = () => {
    if (sessionCode) {
      navigator.clipboard.writeText(sessionCode);
      toast({
        title: "Session code copied!",
        description: "Share this code with other players to join the game.",
      });
    }
  };

  const handleStartQuiz = () => {
    if (currentPlayer?.isHost) {
      startQuiz();
    }
  };

  if (!gameSession || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Preparing your game session</p>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
                <h1 className="text-xl font-bold text-gray-900">Game Lobby</h1>
                <p className="text-sm text-blue-600">Waiting for players</p>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-lg px-4 py-2">
              {sessionCode}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Session Info & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Session Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="font-medium text-gray-900">Session Code</p>
                    <p className="text-2xl font-mono font-bold text-blue-600">{sessionCode}</p>
                  </div>
                  <Button
                    onClick={handleCopySessionCode}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </Button>
                </div>

                {gameSession.currentQuiz && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{gameSession.currentQuiz.title}</h3>
                      <Badge className={getDifficultyColor(gameSession.currentQuiz.difficulty)}>
                        {gameSession.currentQuiz.difficulty.charAt(0).toUpperCase() + gameSession.currentQuiz.difficulty.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{gameSession.currentQuiz.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{gameSession.currentQuiz.questions.length} questions</span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {gameSession.currentQuiz.duration} minutes
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Game Controls</CardTitle>
                <CardDescription>
                  {currentPlayer.isHost 
                    ? "As the host, you can start the quiz when all players are ready."
                    : "Waiting for the host to start the quiz..."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentPlayer.isHost ? (
                  <Button
                    onClick={handleStartQuiz}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
                    size="lg"
                    disabled={gameSession.players.length < 1}
                  >
                    Start Quiz
                  </Button>
                ) : (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      <Clock className="w-4 h-4 mr-2" />
                      Waiting for host to start the quiz
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Players List */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span>Players</span>
                  </span>
                  <Badge variant="secondary">{gameSession.players.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Players currently in this session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gameSession.players.map((player) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        player.id === currentPlayer.id 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          player.id === currentPlayer.id ? 'bg-blue-600' : 'bg-gray-400'
                        }`}>
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {player.pseudonym}
                            {player.id === currentPlayer.id && (
                              <span className="text-blue-600 text-sm ml-2">(You)</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">Ready to play</p>
                        </div>
                      </div>
                      {player.isHost && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>Host</span>
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Play</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• Answer questions about German democracy</p>
                <p>• Earn points for correct answers</p>
                <p>• Compete with other players in real-time</p>
                <p>• View explanations after each question</p>
                <p>• Check the leaderboard to see your ranking</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameLobby;
