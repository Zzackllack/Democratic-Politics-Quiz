import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import AnimatedNumber from "./AnimatedNumber";

interface MultiplayerQuestion {
  questionId: string;
  type: string;
  question: string;
  options?: string[];
  number: number;
  total: number;
}

interface MultiplayerQuizProps {
  lobbyId: string;
  playerId: string;
  isHost: boolean;
}

const MultiplayerQuiz: React.FC<MultiplayerQuizProps> = ({ lobbyId, playerId, isHost }) => {
  const router = useRouter();
  const [question, setQuestion] = useState<MultiplayerQuestion | null>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState<string | boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isWaitingForNext, setIsWaitingForNext] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [playersAnswered, setPlayersAnswered] = useState({
    answered: 0,
    total: 0,
    allAnswered: false,
  });

  const socketRef = useRef<Socket | null>(null);

  // restore score from localStorage
  useEffect(() => {
    const storedScore = localStorage.getItem(`score_${lobbyId}_${playerId}`);
    if (storedScore) setScore(parseInt(storedScore, 10));
  }, [lobbyId, playerId]);

  useEffect(() => {
    localStorage.setItem(`score_${lobbyId}_${playerId}`, score.toString());
    setCorrectCount(Math.floor(score / 100));
  }, [score, lobbyId, playerId]);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001");
    socketRef.current = socket;
    socket.emit("join", { lobbyId, playerId });

    socket.on("state", (data) => {
      console.log("state", data);
      setQuestion({
        questionId: data.questionId,
        type: data.type,
        question: data.question,
        options: data.options,
        number: data.number,
        total: data.total,
      });
      setCurrentQuestionId(data.questionId);
      setScore(data.score);
      const isBool = data.type === "true-false";
      const playerAnswer =
        isBool && typeof data.playerAnswer === "string"
          ? data.playerAnswer.toLowerCase() === "true"
          : data.playerAnswer;
      const corrAnswer =
        isBool && typeof data.correctAnswer === "string"
          ? data.correctAnswer.toLowerCase() === "true"
          : data.correctAnswer;
      setSelectedAnswer(playerAnswer);
      setCorrectAnswer(data.playerAnswer !== null ? corrAnswer : null);
      setExplanation(data.playerAnswer !== null ? data.explanation : "");
      setShowExplanation(data.playerAnswer !== null);
      setIsAnswered(data.isCorrect !== null);
      setIsWaitingForNext(false);
      if (data.startTime) {
        const diff = Math.floor((Date.now() - new Date(data.startTime).getTime()) / 1000);
        setTimeLeft(Math.max(0, 30 - diff));
      } else {
        setTimeLeft(30);
      }
    });

    socket.on("newQuestion", (data) => {
      console.log("newQuestion", data);
      setQuestion({
        questionId: data.questionId,
        type: data.type,
        question: data.question,
        options: data.options,
        number: data.number,
        total: data.total,
      });
      setCurrentQuestionId(data.questionId);
      setSelectedAnswer(null);
      setCorrectAnswer(null);
      setExplanation("");
      setShowExplanation(false);
      setIsAnswered(false);
      setIsWaitingForNext(false);
      if (data.startTime) {
        setTimeLeft(30);
      }
    });

    socket.on("answerResult", (data) => {
      console.log("answerResult", data);
      const isBool = question?.type === "true-false";
      const corrAns =
        isBool && typeof data.correctAnswer === "string"
          ? data.correctAnswer.toLowerCase() === "true"
          : data.correctAnswer;
      setCorrectAnswer(corrAns);
      setExplanation(data.explanation);
      setIsAnswered(true);
      setShowExplanation(true);
      setIsProcessingAnswer(false); // Reset processing flag when server responds
    });

    socket.on("scoreUpdate", ({ playerId: pid, score: sc }) => {
      console.log("scoreUpdate", pid, sc);
      if (pid === playerId) {
        setScore(sc);
      }
    });

    socket.on("gameEnded", ({ results }) => {
      console.log("gameEnded", results);
      localStorage.setItem("lobbyResults", JSON.stringify(results));
      router.push("/results");
    });

    socket.on("playersAnswered", (data) => {
      console.log("playersAnswered", data);
      setPlayersAnswered({
        answered: data.answered,
        total: data.total,
        allAnswered: data.allAnswered,
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [lobbyId, playerId, question?.type, router]);
  useEffect(() => {
    if (timeLeft > 0 && !isAnswered && question) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered && question) {
      // Auto-submit empty answer when time runs out
      handleAnswerSelect(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isAnswered, question]);

  const handleAnswerSelect = (answer: string | boolean | null) => {
    if (isAnswered || !question || isProcessingAnswer) return;
    setIsProcessingAnswer(true);
    setSelectedAnswer(answer);
    socketRef.current?.emit("submitAnswer", {
      lobbyId,
      playerId,
      questionId: question.questionId,
      answer,
    });
    if (!isHost) {
      setIsWaitingForNext(true);
    }
    // Removed setIsProcessingAnswer(false) - now handled in answerResult callback
  };
  const handleNextQuestion = async () => {
    if (!isHost) return;
    setIsWaitingForNext(true);
    socketRef.current?.emit("nextQuestion", { lobbyId, playerId });
  };

  const getProgressPercentage = () => {
    if (!question) return 0;
    return (question.number / question.total) * 100;
  };

  const getScoreColor = () => {
    if (!question) return "text-german-black";
    const ratio = correctCount / question.number;
    if (ratio >= 0.8) return "text-green-600";
    if (ratio >= 0.5) return "text-yellow-600";
    return "text-red-600";
  };
  // Improved answer comparison function
  const isCorrectAnswer = (option: string | boolean): boolean => {
    if (correctAnswer === null || correctAnswer === undefined) return false;

    if (typeof option === "boolean" && typeof correctAnswer === "boolean") {
      return option === correctAnswer;
    }

    if (typeof option === "string" && typeof correctAnswer === "string") {
      return option.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    }

    return false;
  };

  const isSelectedAnswer = (option: string | boolean): boolean => {
    if (selectedAnswer === null || selectedAnswer === undefined) return false;

    if (typeof option === "boolean" && typeof selectedAnswer === "boolean") {
      return option === selectedAnswer;
    }

    if (typeof option === "string" && typeof selectedAnswer === "string") {
      return option.trim().toLowerCase() === selectedAnswer.trim().toLowerCase();
    }

    return false;
  };

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600 font-bold">{fetchError}</p>
          <button
            onClick={() => router.push("/play")}
            className="px-6 py-3 bg-gradient-to-r from-german-red to-german-gold text-white rounded-lg"
          >
            Zurück
          </button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Warte auf nächste Frage...</p>
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
              <h1 className="text-2xl font-bold text-german-black">Multiplayer Quiz</h1>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor()}`}>
                  <AnimatedNumber value={score} />
                </div>
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
              Frage {question.number} von {question.total}
            </span>
            <span>{getProgressPercentage().toFixed(0)}% abgeschlossen</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                Multiplayer
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                {question.type === "multiple-choice" ? "Multiple Choice" : "Wahr/Falsch"}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-german-black leading-relaxed">
              {question.question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-4">
            {question.type === "multiple-choice" ? (
              question.options?.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={isAnswered || isProcessingAnswer}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                    isAnswered
                      ? isCorrectAnswer(option)
                        ? "border-green-500 bg-green-50 text-green-800"
                        : isSelectedAnswer(option)
                          ? "border-red-500 bg-red-50 text-red-800"
                          : "border-gray-200 bg-gray-50 text-gray-600"
                      : isProcessingAnswer && selectedAnswer === option
                        ? "border-blue-500 bg-blue-50 text-blue-800"
                        : selectedAnswer === option
                          ? "border-german-red bg-german-red/10"
                          : "border-gray-200 hover:border-german-red/50 hover:bg-gray-50"
                  } ${!isAnswered && !isProcessingAnswer ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className="flex items-center">
                    <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold mr-4">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium">{option}</span>
                  </div>
                  {isAnswered && isCorrectAnswer(option) && (
                    <span className="ml-12 text-green-600 text-sm">✓ Richtige Antwort</span>
                  )}
                  {isAnswered && isSelectedAnswer(option) && !isCorrectAnswer(option) && (
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
                    disabled={isAnswered || isProcessingAnswer}
                    className={`p-6 rounded-lg border-2 font-bold text-lg transition-all duration-300 ${
                      isAnswered
                        ? isCorrectAnswer(option)
                          ? "border-green-500 bg-green-50 text-green-800"
                          : isSelectedAnswer(option)
                            ? "border-red-500 bg-red-50 text-red-800"
                            : "border-gray-200 bg-gray-50 text-gray-600"
                        : isProcessingAnswer && isSelectedAnswer(option)
                          ? "border-blue-500 bg-blue-50 text-blue-800"
                          : isSelectedAnswer(option)
                            ? "border-german-red bg-german-red/10"
                            : "border-gray-200 hover:border-german-red/50 hover:bg-gray-50"
                    } ${!isAnswered && !isProcessingAnswer ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {option ? "Wahr" : "Falsch"}
                    {isAnswered && isCorrectAnswer(option) && (
                      <div className="mt-2 text-green-600 text-sm">✓ Richtige Antwort</div>
                    )}
                    {isAnswered && isSelectedAnswer(option) && !isCorrectAnswer(option) && (
                      <div className="mt-2 text-red-600 text-sm">✗ Falsche Antwort</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Explanation */}
          {showExplanation && explanation && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
              <h3 className="font-bold text-blue-800 mb-2">Erklärung:</h3>
              <p className="text-blue-700">{explanation}</p>
            </div>
          )}

          {/* Waiting message for non-hosts */}
          {isAnswered && !isHost && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-center">
                Warte auf den Spielleiter für die nächste Frage...
              </p>
            </div>
          )}
        </div>

        {/* Next Button for Host */}
        {isAnswered && isHost && (
          <div className="text-center space-y-4">
            {/* Players Answered Indicator */}
            <div className="bg-white rounded-lg shadow-md p-4 max-w-sm mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Spieler geantwortet:</h3>
                <div className="flex items-center space-x-2">
                  {playersAnswered.allAnswered ? (
                    <div className="flex items-center text-green-600">
                      <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-semibold">Alle bereit!</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600">
                      <svg className="w-5 h-5 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-sm font-semibold">Warten...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      playersAnswered.allAnswered
                        ? "bg-green-500"
                        : "bg-gradient-to-r from-yellow-400 to-yellow-500"
                    }`}
                    style={{
                      width: `${(playersAnswered.answered / playersAnswered.total) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-600">
                  {playersAnswered.answered}/{playersAnswered.total}
                </span>
              </div>

              <div className="flex space-x-1">
                {Array.from({ length: playersAnswered.total }, (_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i < playersAnswered.answered ? "bg-green-500 scale-110" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={isWaitingForNext}
              className={`px-8 py-3 font-bold rounded-lg transition-all duration-200 btn-hover-lift disabled:opacity-50 ${
                playersAnswered.allAnswered
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg"
                  : "bg-gradient-to-r from-german-red to-german-gold text-white hover:opacity-90"
              }`}
            >
              {question.number < question.total ? "Nächste Frage" : "Quiz beenden"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiplayerQuiz;
