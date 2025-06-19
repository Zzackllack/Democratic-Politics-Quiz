
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Clock, Users, Flag, CheckCircle, XCircle } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

const QuizGame = () => {
  const navigate = useNavigate();
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const { gameSession, currentPlayer, submitAnswer, nextQuestion, getLeaderboard } = useGame();
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null);
  const [shortAnswer, setShortAnswer] = useState('');
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!gameSession || !currentPlayer) {
      navigate('/');
      return;
    }

    if (gameSession.gameStatus === 'finished') {
      navigate(`/leaderboard/${sessionCode}`);
      return;
    }

    // Reset state for new question
    setSelectedAnswer(null);
    setShortAnswer('');
    setHasAnswered(false);
    setShowExplanation(false);
    setTimeLeft(30);
  }, [gameSession?.currentQuestionIndex, gameSession, currentPlayer, sessionCode, navigate]);

  useEffect(() => {
    if (timeLeft > 0 && !hasAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !hasAnswered) {
      handleSubmitAnswer();
    }
  }, [timeLeft, hasAnswered]);

  const handleSubmitAnswer = () => {
    if (hasAnswered) return;

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    let answer: string | boolean;
    if (currentQuestion.type === 'short-answer') {
      answer = shortAnswer.trim();
    } else if (currentQuestion.type === 'true-false') {
      answer = selectedAnswer as boolean;
    } else {
      answer = selectedAnswer as string;
    }

    if (answer !== null && answer !== '') {
      submitAnswer(currentQuestion.id, answer);
      setHasAnswered(true);
      setShowExplanation(true);
    }
  };

  const handleNextQuestion = () => {
    nextQuestion();
  };

  const getCurrentQuestion = () => {
    if (!gameSession?.currentQuiz) return null;
    return gameSession.currentQuiz.questions[gameSession.currentQuestionIndex];
  };

  if (!gameSession || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lade...</h2>
          <p className="text-gray-600">Quizfrage wird geladen</p>
        </div>
      </div>
    );
  }

  const currentQuestion = getCurrentQuestion();
  if (!currentQuestion) {
    navigate(`/leaderboard/${sessionCode}`);
    return null;
  }

  const progress = ((gameSession.currentQuestionIndex + 1) / gameSession.currentQuiz!.questions.length) * 100;
  const leaderboard = getLeaderboard().slice(0, 3);

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
                <h1 className="text-xl font-bold text-gray-900">Demokratie-Quiz</h1>
                <p className="text-sm text-blue-600">
                  Frage {gameSession.currentQuestionIndex + 1} von {gameSession.currentQuiz!.questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="font-mono">
                {sessionCode}
              </Badge>
              <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{timeLeft}s</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Question Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Fortschritt</span>
                <span>{Math.round(progress)}% abgeschlossen</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>

            {/* Question Card */}
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-100 text-blue-800">
                    {currentQuestion.type.replace('-', ' ').toUpperCase()}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-800">
                    {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                  </Badge>
                </div>
                <CardTitle className="text-2xl leading-relaxed">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Answer Options */}
                {!showExplanation && (
                  <div className="space-y-4">
                    {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                      <div className="grid gap-3">
                        {currentQuestion.options.map((option, index) => (
                          <Button
                            key={index}
                            variant={selectedAnswer === option ? "default" : "outline"}
                            className={`justify-start p-4 h-auto text-left ${
                              selectedAnswer === option 
                                ? 'bg-blue-600 text-white' 
                                : 'hover:bg-blue-50'
                            }`}
                            onClick={() => setSelectedAnswer(option)}
                            disabled={hasAnswered}
                          >
                            <span className="mr-3 font-medium">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            {option}
                          </Button>
                        ))}
                      </div>
                    )}

                    {currentQuestion.type === 'true-false' && (
                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          variant={selectedAnswer === true ? "default" : "outline"}
                          className={`p-6 text-lg ${
                            selectedAnswer === true 
                              ? 'bg-green-600 text-white' 
                              : 'hover:bg-green-50'
                          }`}
                          onClick={() => setSelectedAnswer(true)}
                          disabled={hasAnswered}
                        >
                          ✓ Wahr
                        </Button>
                        <Button
                          variant={selectedAnswer === false ? "default" : "outline"}
                          className={`p-6 text-lg ${
                            selectedAnswer === false 
                              ? 'bg-red-600 text-white' 
                              : 'hover:bg-red-50'
                          }`}
                          onClick={() => setSelectedAnswer(false)}
                          disabled={hasAnswered}
                        >
                          ✗ Falsch
                        </Button>
                      </div>
                    )}

                    {currentQuestion.type === 'short-answer' && (
                      <div className="space-y-4">
                        <Input
                          placeholder="Antwort hier eingeben..."
                          value={shortAnswer}
                          onChange={(e) => setShortAnswer(e.target.value)}
                          disabled={hasAnswered}
                          className="text-lg p-4"
                        />
                      </div>
                    )}

                    <div className="pt-4">
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={
                          hasAnswered || 
                          (currentQuestion.type === 'short-answer' && !shortAnswer.trim()) ||
                          (currentQuestion.type !== 'short-answer' && selectedAnswer === null)
                        }
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                        size="lg"
                      >
                        {hasAnswered ? 'Antwort abgegeben' : 'Antwort senden'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {showExplanation && (
                  <div className="space-y-6">
                    <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-3">
                        {(() => {
                          let isCorrect = false;
                          if (currentQuestion.type === 'short-answer') {
                            isCorrect = shortAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toString().toLowerCase();
                          } else {
                            isCorrect = selectedAnswer === currentQuestion.correctAnswer;
                          }
                          
                          return isCorrect ? (
                            <>
                              <CheckCircle className="w-6 h-6 text-green-600" />
                              <span className="font-semibold text-green-800">Richtig!</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-6 h-6 text-red-600" />
                              <span className="font-semibold text-red-800">Falsch</span>
                            </>
                          );
                        })()}
                      </div>
                      <p className="text-gray-800 mb-3">
                        <strong>Richtige Antwort:</strong> {currentQuestion.correctAnswer.toString()}
                      </p>
                      <p className="text-gray-700">{currentQuestion.explanation}</p>
                    </div>

                    {currentPlayer.isHost && (
                      <Button
                        onClick={handleNextQuestion}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
                        size="lg"
                      >
                          {gameSession.currentQuestionIndex + 1 < gameSession.currentQuiz!.questions.length
                          ? 'Nächste Frage'
                          : 'Quiz beenden'
                        }
                      </Button>
                    )}

                    {!currentPlayer.isHost && (
                      <div className="text-center py-4">
                        <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          <Clock className="w-4 h-4 mr-2" />
                          Warte auf den Gastgeber, um fortzufahren...
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Live-Punkte</span>
                </CardTitle>
                  <CardDescription>Aktueller Stand</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        player.id === currentPlayer.id 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-400 text-gray-900' :
                          index === 2 ? 'bg-orange-400 text-orange-900' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {player.pseudonym}
                            {player.id === currentPlayer.id && (
                              <span className="text-blue-600 text-xs ml-1">(Du)</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-mono">
                        {player.score}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quiz Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quiz-Info</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                  <p><strong>Thema:</strong> {gameSession.currentQuiz!.title}</p>
                  <p><strong>Schwierigkeit:</strong> {gameSession.currentQuiz!.difficulty}</p>
                  <p><strong>Fragen:</strong> {gameSession.currentQuiz!.questions.length}</p>
                  <p><strong>Spieler:</strong> {gameSession.players.length}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuizGame;
