import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Lock,
  Send,
  Share2,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface ReflectionQuestion {
  id: string;
  question: string;
  category: string;
  placeholder: string;
}

interface ReflectionProps {
  quizResults?: {
    score: number;
    totalQuestions: number;
    gameMode: string;
  };
}

const Reflection: React.FC<ReflectionProps> = ({ quizResults }) => {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [shareData, setShareData] = useState(false);
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Load stored quiz results if available
  useEffect(() => {
    if (!quizResults) {
      const storedResults = localStorage.getItem("lastQuizResults");
      if (storedResults) {
        try {
          // Set quiz results from localStorage if not provided as props
        } catch (error) {
          console.error("Error parsing stored results:", error);
        }
      }
    }
  }, [quizResults]);

  const reflectionQuestions: ReflectionQuestion[] = [
    {
      id: "learning",
      question: "Was hast du heute über Demokratie gelernt, das du vorher nicht wusstest?",
      category: "Lernerfahrung",
      placeholder:
        "Beschreibe neue Erkenntnisse oder überraschende Fakten, die du durch das Quiz entdeckt hast...",
    },
    {
      id: "importance",
      question:
        "Warum ist es deiner Meinung nach wichtig, dass alle Bürger über demokratische Prozesse Bescheid wissen?",
      category: "Bedeutung der Demokratie",
      placeholder: "Denke über die Rolle informierter Bürger in einer Demokratie nach...",
    },
    {
      id: "participation",
      question:
        "Wie könntest du dich aktiver an demokratischen Prozessen in deiner Gemeinde beteiligen?",
      category: "Bürgerbeteiligung",
      placeholder: "Überlege dir konkrete Schritte und Möglichkeiten zur Partizipation...",
    },
    {
      id: "challenges",
      question: "Welche Herausforderungen siehst du für die Demokratie in der heutigen Zeit?",
      category: "Aktuelle Herausforderungen",
      placeholder:
        "Beschreibe gesellschaftliche, technologische oder politische Herausforderungen...",
    },
    {
      id: "improvement",
      question: "Was würdest du am demokratischen System in Deutschland verbessern wollen?",
      category: "Verbesserungsvorschläge",
      placeholder: "Teile deine Ideen für eine stärkere oder gerechtere Demokratie...",
    },
    {
      id: "future",
      question:
        "Wie stellst du dir die Zukunft der Demokratie vor? Was sind deine Hoffnungen und Sorgen?",
      category: "Zukunftsperspektive",
      placeholder:
        "Reflektiere über deine Erwartungen und Befürchtungen für die demokratische Entwicklung...",
    },
  ];

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const handleNext = () => {
    if (currentQuestionIndex < reflectionQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Combine all responses into one reflection text
    const reflectionContent = reflectionQuestions
      .map((q) => {
        const response = responses[q.id];
        if (response && response.trim()) {
          return `${q.question}\n${response}\n`;
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");

    if (!reflectionContent.trim()) {
      setSubmitError("Bitte beantworte mindestens eine Frage.");
      setIsSubmitting(false);
      return;
    }

    try {
      const requestBody: any = {
        content: reflectionContent,
        gameMode: quizResults?.gameMode || "einfach",
        name: shareData ? userName : "",
        isShared: shareData,
      };

      // Only include score if it's a valid number
      if (quizResults?.score && typeof quizResults.score === "number") {
        requestBody.score = quizResults.score;
      }

      const response = await fetch("http://localhost:3001/api/reflections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || "Fehler beim Speichern der Reflexion");
      }
    } catch (error) {
      setSubmitError("Verbindungsfehler. Bitte versuche es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    return ((currentQuestionIndex + 1) / reflectionQuestions.length) * 100;
  };

  const getCompletedResponsesCount = () => {
    return Object.values(responses).filter((response) => response.trim().length > 0).length;
  };

  const currentQuestion = reflectionQuestions[currentQuestionIndex];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-german-red to-german-gold flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold text-german-black mb-4"
            >
              {shareData ? "Reflexion geteilt!" : "Reflexion gespeichert!"}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-gray-600 mb-6"
            >
              {shareData
                ? "Vielen Dank fürs Teilen! Deine Gedanken helfen anderen beim Lernen."
                : "Deine Reflexion wurde privat gespeichert. Vielen Dank für deine Teilnahme!"}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-50 rounded-lg p-6 mb-6"
            >
              <h3 className="text-lg font-bold text-german-black mb-4">Zusammenfassung:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-german-red">
                    {getCompletedResponsesCount()}
                  </div>
                  <div className="text-gray-600">Beantwortete Fragen</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-german-gold">
                    {shareData ? "Öffentlich" : "Privat"}
                  </div>
                  <div className="text-gray-600">Sichtbarkeit</div>
                </div>
              </div>
              {shareData && userName && (
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600">Geteilt als:</div>
                  <div className="font-semibold text-german-black">{userName}</div>
                </div>
              )}
            </motion.div>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = "/play")}
              className="px-8 py-3 bg-gradient-to-r from-german-red to-german-gold text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Neues Quiz starten
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-german-black mb-4">Reflexion</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nimm dir einen Moment Zeit, um über deine Lernerfahrung nachzudenken. Deine Gedanken
            helfen dabei, ein tieferes Verständnis für demokratische Werte zu entwickeln.
          </p>
        </motion.div>

        {/* Quiz Results Summary */}
        {quizResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-german-black mb-4">Dein Quiz-Ergebnis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-german-red">{quizResults.score}</div>
                <div className="text-sm text-gray-600">Richtige Antworten</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-german-gold">
                  {quizResults.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">Gesamte Fragen</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-german-black">
                  {((quizResults.score / quizResults.totalQuestions) * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">Erfolgsquote</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-german-black">Reflexions-Fortschritt</h2>
            <span className="text-sm text-gray-600">
              {currentQuestionIndex + 1} von {reflectionQuestions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <motion.div
              className="bg-gradient-to-r from-german-red to-german-gold h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-center text-sm text-gray-600">
            {getCompletedResponsesCount()} von {reflectionQuestions.length} Fragen beantwortet
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Category Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-sm font-semibold text-german-red bg-red-50 rounded-full">
                  {currentQuestion.category}
                </span>
              </div>

              {/* Question */}
              <h3 className="text-2xl font-bold text-german-black mb-6 leading-relaxed">
                {currentQuestion.question}
              </h3>

              {/* Text Area */}
              <textarea
                value={responses[currentQuestion.id] || ""}
                onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="w-full h-40 p-4 border-2 border-gray-200 rounded-lg focus:border-german-gold focus:outline-none resize-none transition-colors duration-200"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">
                  {(responses[currentQuestion.id] || "").length}/1000 Zeichen
                </span>
                {responses[currentQuestion.id] && responses[currentQuestion.id].trim() && (
                  <span className="text-sm text-green-600 font-semibold">✓ Beantwortet</span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-german-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Zurück</span>
            </button>

            {currentQuestionIndex < reflectionQuestions.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-german-red to-german-gold text-white font-semibold rounded-lg hover:opacity-90 transition-opacity duration-200"
              >
                <span>Weiter</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <span className="text-sm text-gray-600">Bereit zum Absenden ↓</span>
            )}
          </div>
        </motion.div>

        {/* Data Sharing Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <h3 className="text-xl font-bold text-german-black mb-4">Daten teilen (optional)</h3>
          <p className="text-gray-600 mb-6">
            Möchtest du deine Reflexion mit anderen teilen? Dies hilft anderen beim Lernen und trägt
            zu einer besseren Bildungsgemeinschaft bei.
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
            <div className="flex items-center space-x-3">
              {shareData ? (
                <Share2 className="w-5 h-5 text-green-600" />
              ) : (
                <Lock className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <div className="font-semibold text-german-black">
                  {shareData ? "Öffentlich teilen" : "Privat speichern"}
                </div>
                <div className="text-sm text-gray-600">
                  {shareData
                    ? "Deine Reflexion wird anonymisiert mit anderen geteilt"
                    : "Deine Reflexion bleibt privat und wird nicht geteilt"}
                </div>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShareData(!shareData)}
              className={`relative w-14 h-8 rounded-full transition-colors duration-200 ${
                shareData ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <motion.div
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: shareData ? 24 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </motion.button>
          </div>

          {/* Name Input (only if sharing) */}
          <AnimatePresence>
            {shareData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Dein Name (optional, für Anerkennung)
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="z.B. Max Mustermann"
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors duration-200"
                    maxLength={50}
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    Wenn du keinen Namen angibst, wird deine Reflexion als &quot;Anonym&quot;
                    geteilt.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Submit Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center justify-center space-x-2"
            >
              <AlertCircle className="w-5 h-5" />
              <span>{submitError}</span>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={isSubmitting || getCompletedResponsesCount() === 0}
            className="px-12 py-4 bg-gradient-to-r from-german-red to-german-gold text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Wird gespeichert...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>{shareData ? "Reflexion teilen" : "Reflexion speichern"}</span>
              </div>
            )}
          </motion.button>

          <p className="text-sm text-gray-600 mt-4">
            {getCompletedResponsesCount() > 0
              ? `${getCompletedResponsesCount()} von ${reflectionQuestions.length} Fragen beantwortet`
              : "Beantworte mindestens eine Frage, um deine Reflexion zu speichern"}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Reflection;
