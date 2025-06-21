import React, { useEffect, useState } from "react";
import type { Question } from "../data/mockData";

interface QuizProps {
  gameMode?: string;
  onQuizComplete?: (score: number, answers: any[]) => void;
}

const Quiz: React.FC<QuizProps> = ({ gameMode = "einfach", onQuizComplete = () => {} }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions`);
        const data: Question[] = await res.json();
        const filtered = data.filter((q) => q.difficulty === gameMode);
        setQuestions(filtered.slice(0, 10));
      } catch (err) {
        console.error(err);
      }
    };
    fetchQuestions();
  }, [gameMode]);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered && !isQuizCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleNextQuestion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isAnswered, isQuizCompleted]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string | boolean) => {
    if (isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === currentQuestion.correctAnswer;
    const newAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: answer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect,
      timeSpent: 30 - timeLeft,
    };

    setAnswers([...answers, newAnswer]);

    if (isCorrect) {
      setScore(score + 1);
    }

    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (!isAnswered) {
      // Auto-submit if time runs out
      const newAnswer = {
        questionId: currentQuestion.id,
        selectedAnswer: null,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect: false,
        timeSpent: 30,
      };
      setAnswers([...answers, newAnswer]);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
      setShowExplanation(false);
      setIsAnswered(false);
    } else {
      setIsQuizCompleted(true);
      onQuizComplete(score, answers);
    }
  };

  const handleSubmitScore = async () => {
    if (!playerName) return;
    setIsSubmitting(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName, score }),
      });
      setHasSubmittedScore(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / questions.length) * 100;
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Quiz wird geladen...</p>
        </div>
      </div>
    );
  }

  if (isQuizCompleted) {
    const finalPercentage = (score / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-german-red to-german-gold flex items-center justify-center">
              <span className="text-3xl text-white">🏆</span>
            </div>

            <h2 className="text-3xl font-bold text-german-black mb-4">Quiz abgeschlossen!</h2>

            <div className="text-6xl font-bold mb-4 ${getScoreColor()}">
              {score}/{questions.length}
            </div>

            <p className="text-xl text-gray-600 mb-6">
              Du hast {finalPercentage.toFixed(0)}% der Fragen richtig beantwortet!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-german-black">{score}</div>
                <div className="text-sm text-gray-600">Richtige Antworten</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-german-red">{questions.length - score}</div>
                <div className="text-sm text-gray-600">Falsche Antworten</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-german-gold">
                  {finalPercentage.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Erfolgsquote</div>
              </div>
            </div>

            {!hasSubmittedScore && (
              <div className="space-y-4 mb-6">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Dein Name"
                  className="w-full border border-gray-300 rounded-lg p-3"
                />
                <button
                  onClick={handleSubmitScore}
                  disabled={!playerName || isSubmitting}
                  className="w-full py-3 px-6 bg-gradient-to-r from-german-red to-german-gold text-white font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Zur Bestenliste hinzufügen
                </button>
              </div>
            )}
            {hasSubmittedScore && (
              <p className="mb-6 text-green-600 font-bold">Score gespeichert!</p>
            )}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-6 bg-gradient-to-r from-german-red to-german-gold text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
              >
                Neues Quiz starten
              </button>
              <button
                onClick={() => (window.location.href = "/leaderboard")}
                className="w-full py-3 px-6 bg-white border-2 border-german-gold text-german-gold font-bold rounded-lg hover:bg-german-gold hover:text-white transition-colors"
              >
                Bestenliste ansehen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Progress */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-8 german-stripes rounded"></div>
              <h1 className="text-2xl font-bold text-german-black">Demokratie Quiz</h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold ${getScoreColor()}">{score}</div>
                <div className="text-sm text-gray-600">Punkte</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    timeLeft <= 10 ? "text-red-600" : "text-german-black"
                  }`}
                >
                  {timeLeft}s
                </div>
                <div className="text-sm text-gray-600">Zeit</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-german-red to-german-gold h-3 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>
              Frage {currentQuestionIndex + 1} von {questions.length}
            </span>
            <span>{getProgressPercentage().toFixed(0)}% abgeschlossen</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-german-gold/20 text-german-gold-dark rounded-full text-sm font-medium">
                {currentQuestion.difficulty}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                {currentQuestion.type === "multiple-choice" ? "Multiple Choice" : "Wahr/Falsch"}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-german-black leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-4">
            {currentQuestion.type === "multiple-choice" ? (
              currentQuestion.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                    isAnswered
                      ? option === currentQuestion.correctAnswer
                        ? "border-green-500 bg-green-50 text-green-800"
                        : option === selectedAnswer
                          ? "border-red-500 bg-red-50 text-red-800"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      : selectedAnswer === option
                        ? "border-german-red bg-german-red/10"
                        : "border-gray-200 hover:border-german-red/50 hover:bg-gray-50"
                  } ${!isAnswered ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold mr-4">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium">{option}</span>
                  </div>
                  {isAnswered && option === currentQuestion.correctAnswer && (
                    <span className="ml-12 text-green-600 text-sm">✓ Richtige Antwort</span>
                  )}
                  {isAnswered &&
                    option === selectedAnswer &&
                    option !== currentQuestion.correctAnswer && (
                      <span className="ml-12 text-red-600 text-sm">✗ Falsche Antwort</span>
                    )}
                </button>
              ))
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[true, false].map((option) => (
                  <button
                    key={option.toString()}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswered}
                    className={`p-6 rounded-lg border-2 font-bold text-lg transition-all duration-300 ${
                      isAnswered
                        ? option === currentQuestion.correctAnswer
                          ? "border-green-500 bg-green-50 text-green-800"
                          : option === selectedAnswer
                            ? "border-red-500 bg-red-50 text-red-800"
                            : "border-gray-200 bg-gray-50 text-gray-600"
                        : selectedAnswer === option
                          ? "border-german-red bg-german-red/10"
                          : "border-gray-200 hover:border-german-red/50 hover:bg-gray-50"
                    } ${!isAnswered ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {option ? "Wahr" : "Falsch"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
              <h3 className="font-bold text-blue-800 mb-2">Erklärung:</h3>
              <p className="text-blue-700">{currentQuestion.explanation}</p>
            </div>
          )}
        </div>

        {/* Next Button */}
        {isAnswered && (
          <div className="text-center">
            <button
              onClick={handleNextQuestion}
              className="px-8 py-3 bg-gradient-to-r from-german-red to-german-gold text-white font-bold rounded-lg hover:opacity-90 transition-opacity btn-hover-lift"
            >
              {currentQuestionIndex < questions.length - 1 ? "Nächste Frage" : "Quiz beenden"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
