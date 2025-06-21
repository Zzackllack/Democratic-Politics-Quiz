import React, { useState } from "react";

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

  const handleSubmit = () => {
    // Here you would typically send the responses to a backend
    console.log("Reflection responses:", responses);
    setIsSubmitted(true);
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
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-german-red to-german-gold flex items-center justify-center">
              <span className="text-3xl text-white">🌟</span>
            </div>

            <h2 className="text-3xl font-bold text-german-black mb-4">
              Vielen Dank für deine Reflexion!
            </h2>

            <p className="text-xl text-gray-600 mb-6">
              Deine Gedanken zur Demokratie sind wertvoll und tragen zu einem besseren Verständnis
              bei.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-german-black mb-4">Deine Beiträge:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-german-red">
                    {getCompletedResponsesCount()}
                  </div>
                  <div className="text-gray-600">Beantwortete Fragen</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-german-gold">
                    {Object.values(responses).join(" ").split(" ").length}
                  </div>
                  <div className="text-gray-600">Geschriebene Wörter</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => (window.location.href = "/quiz")}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-german-black mb-4">Reflexion</h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nimm dir einen Moment Zeit, um über deine Lernerfahrung nachzudenken. Deine Gedanken
            helfen dabei, ein tieferes Verständnis für demokratische Werte zu entwickeln.
          </p>
        </div>

        {/* Quiz Results Summary */}
        {quizResults && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
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
          </div>
        )}

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-german-black">Reflexions-Fortschritt</h2>
            <span className="text-sm text-gray-600">
              {currentQuestionIndex + 1} von {reflectionQuestions.length}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-german-red to-german-gold h-3 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>{getCompletedResponsesCount()} Antworten</span>
            <span>{getProgressPercentage().toFixed(0)}% abgeschlossen</span>
          </div>
        </div>

        {/* Current Question */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <span className="px-3 py-1 bg-german-gold/20 text-german-gold-dark rounded-full text-sm font-medium">
              {currentQuestion.category}
            </span>

            <h2 className="text-2xl font-bold text-german-black mt-4 mb-6 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          <textarea
            value={responses[currentQuestion.id] || ""}
            onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
            placeholder={currentQuestion.placeholder}
            className="w-full h-48 p-4 border-2 border-gray-200 rounded-lg resize-none focus:border-german-red focus:outline-none transition-colors"
          />

          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <span>{responses[currentQuestion.id]?.length || 0} Zeichen</span>
            <span>Nimm dir die Zeit, die du brauchst</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              currentQuestionIndex === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border border-gray-300 text-gray-700 hover:border-german-red/50"
            }`}
          >
            ← Zurück
          </button>

          <div className="flex items-center space-x-4">
            {reflectionQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentQuestionIndex
                    ? "bg-german-red scale-150"
                    : responses[reflectionQuestions[index].id]
                      ? "bg-german-gold"
                      : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {currentQuestionIndex === reflectionQuestions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-gradient-to-r from-german-red to-german-gold text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Reflexion abschließen
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-gradient-to-r from-german-red to-german-gold text-white font-bold rounded-lg hover:opacity-90 transition-opacity"
            >
              Weiter →
            </button>
          )}
        </div>

        {/* Tips */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-3">💡 Reflexions-Tipps</h3>
          <ul className="text-blue-700 space-y-2 text-sm">
            <li>• Sei ehrlich und authentisch in deinen Antworten</li>
            <li>• Denke an konkrete Beispiele aus deinem Leben</li>
            <li>• Es gibt keine "richtigen" oder "falschen" Antworten</li>
            <li>• Nimm dir die Zeit, die du brauchst</li>
            <li>• Deine Gedanken können anderen beim Lernen helfen</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Reflection;
