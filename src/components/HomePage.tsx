
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Vote, Flag } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { joinSession } = useGame();
  const [sessionCode, setSessionCode] = useState('');
  const [joinPseudonym, setJoinPseudonym] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateGame = () => {
    navigate('/quiz-selection');
  };

  const handleJoinGame = async () => {
    if (!sessionCode.trim() || !joinPseudonym.trim()) return;
    
    setIsJoining(true);
    const success = joinSession(sessionCode.toUpperCase(), joinPseudonym);
    
    if (success) {
      navigate(`/lobby/${sessionCode.toUpperCase()}`);
    } else {
      alert('Session not found. Please check the code and try again.');
    }
    setIsJoining(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Vote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Democracy Quiz</h1>
                <p className="text-sm text-blue-600">Learn German Democracy</p>
              </div>
            </div>
            <Badge variant="outline" className="hidden sm:flex">
              <Flag className="w-4 h-4 mr-1" />
              Deutschland
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Test Your Knowledge of
              <span className="text-blue-600 block">German Democracy</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Join friends in an interactive quiz about Germany's democratic system, 
              constitution, and civic principles. Learn while you compete!
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Create Game Card */}
            <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Create New Game</CardTitle>
                <CardDescription className="text-gray-600">
                  Start a new quiz session and invite others to join
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  onClick={handleCreateGame}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                  size="lg"
                >
                  Create Game
                </Button>
              </CardContent>
            </Card>

            {/* Join Game Card */}
            <Card className="border-2 border-green-200 hover:border-green-300 transition-colors">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Vote className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Join Existing Game</CardTitle>
                <CardDescription className="text-gray-600">
                  Enter a session code to join a quiz in progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Input
                    placeholder="Enter session code"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                    className="text-center text-lg font-mono"
                    maxLength={6}
                  />
                  <Input
                    placeholder="Your display name"
                    value={joinPseudonym}
                    onChange={(e) => setJoinPseudonym(e.target.value)}
                    className="text-center"
                  />
                </div>
                <Button 
                  onClick={handleJoinGame}
                  disabled={!sessionCode.trim() || !joinPseudonym.trim() || isJoining}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
                  size="lg"
                >
                  {isJoining ? 'Joining...' : 'Join Game'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multiplayer</h3>
              <p className="text-gray-600 text-sm">
                Compete with friends in real-time quiz sessions
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Vote className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Democratic Topics</h3>
              <p className="text-gray-600 text-sm">
                Learn about German government, rights, and civic duties
              </p>
            </div>
            <div className="p-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Flag className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Multiple Levels</h3>
              <p className="text-gray-600 text-sm">
                From basics to constitutional law - choose your difficulty
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            Built to promote civic education and democratic participation
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
