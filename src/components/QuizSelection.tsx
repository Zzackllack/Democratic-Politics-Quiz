
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Users, Flag } from 'lucide-react';
import { useGame, mockQuizzes } from '../contexts/GameContext';

const QuizSelection = () => {
  const navigate = useNavigate();
  const { createSession } = useGame();
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [pseudonym, setPseudonym] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSession = async () => {
    if (!selectedQuiz || !pseudonym.trim()) return;

    setIsCreating(true);
    try {
      const sessionCode = createSession(selectedQuiz, pseudonym);
      navigate(`/lobby/${sessionCode}`);
    } catch (error) {
        alert('Sitzung konnte nicht erstellt werden. Bitte versuche es erneut.');
    }
    setIsCreating(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🟢';
      case 'intermediate': return '🟡';
      case 'advanced': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                  <span>Zurück</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Flag className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Quiz auswählen</h1>
                    <p className="text-sm text-blue-600">Wähle deinen Schwierigkeitsgrad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Quiz Selection */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Wähle dein Quiz</h2>
          <p className="text-gray-600 mb-6">
            Wähle eine Schwierigkeitsstufe, die deinem Kenntnisstand der deutschen Demokratie entspricht
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockQuizzes.map((quiz) => (
              <Card 
                key={quiz.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedQuiz === quiz.id 
                    ? 'ring-2 ring-blue-500 border-blue-200' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => setSelectedQuiz(quiz.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${getDifficultyColor(quiz.difficulty)} border`}>
                      {getDifficultyIcon(quiz.difficulty)} {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {quiz.duration}min
                    </div>
                  </div>
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {quiz.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{quiz.questions.length} Fragen</span>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        Mehrspieler
                      </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Player Setup */}
        {selectedQuiz && (
          <Card className="border-2 border-blue-200">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Spielvorbereitung</span>
              </CardTitle>
              <CardDescription>
                Gib deinen Anzeigenamen ein, um die Spielsitzung zu erstellen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="pseudonym" className="block text-sm font-medium text-gray-700 mb-2">
                  Dein Anzeigename
                </label>
                <Input
                  id="pseudonym"
                  placeholder="Gib deinen Namen ein (für andere sichtbar)"
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                  className="text-center"
                  maxLength={20}
                />
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-gray-900">Gewähltes Quiz:</p>
                    <p className="text-sm text-gray-600">
                      {mockQuizzes.find(q => q.id === selectedQuiz)?.title}
                    </p>
                  </div>
                  <Badge className={getDifficultyColor(mockQuizzes.find(q => q.id === selectedQuiz)?.difficulty || '')}>
                    {getDifficultyIcon(mockQuizzes.find(q => q.id === selectedQuiz)?.difficulty || '')} 
                    {mockQuizzes.find(q => q.id === selectedQuiz)?.difficulty?.charAt(0).toUpperCase() + 
                     mockQuizzes.find(q => q.id === selectedQuiz)?.difficulty?.slice(1)}
                  </Badge>
                </div>
                
                <Button
                  onClick={handleCreateSession}
                  disabled={!pseudonym.trim() || isCreating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                  size="lg"
                >
                  {isCreating ? 'Sitzung wird erstellt...' : 'Spielsitzung erstellen'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default QuizSelection;
