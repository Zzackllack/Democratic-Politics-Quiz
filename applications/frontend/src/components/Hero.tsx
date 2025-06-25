import { AnimatePresence, motion } from "framer-motion";
import { User, Users } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { gameModes } from "../data/gamemodes";

interface HeroProps {
  onStartQuiz?: (gameType: "singleplayer" | "multiplayer", gameMode: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onStartQuiz = () => {} }) => {
  const [selectedGameType, setSelectedGameType] = useState<"singleplayer" | "multiplayer" | "">("");
  const [selectedGameMode, setSelectedGameMode] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Add ref for difficulty section
  const difficultyRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // Scroll to difficulty when game type is selected
  useEffect(() => {
    if (selectedGameType && difficultyRef.current) {
      difficultyRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedGameType]);

  const router = useRouter();

  const handleStartQuiz = () => {
    if (selectedGameType && selectedGameMode) {
      onStartQuiz(selectedGameType, selectedGameMode);
      if (selectedGameType === "singleplayer") {
        router.push(`/quiz?difficulty=${selectedGameMode}`);
      } else {
        router.push(`/lobby?difficulty=${selectedGameMode}`);
      }
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      <style jsx>{`
        @keyframes wave-1 {
          0%,
          100% {
            transform: translateY(0px);
          }
          25% {
            transform: translateY(2px);
          }
          50% {
            transform: translateY(0px);
          }
          75% {
            transform: translateY(-2px);
          }
        }

        @keyframes wave-2 {
          0%,
          100% {
            transform: translateY(0px);
          }
          25% {
            transform: translateY(-2px);
          }
          50% {
            transform: translateY(0px);
          }
          75% {
            transform: translateY(2px);
          }
        }

        @keyframes wave-3 {
          0%,
          100% {
            transform: translateY(0px);
          }
          25% {
            transform: translateY(2px);
          }
          50% {
            transform: translateY(0px);
          }
          75% {
            transform: translateY(-2px);
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .scale-in {
          animation: scaleIn 0.8s ease-out forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-black/5 to-transparent"></div>
        <div className="absolute top-1/3 left-0 w-full h-1/3 bg-gradient-to-b from-red-600/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-yellow-400/10 to-transparent"></div>

        <div
          className={`absolute top-20 right-20 w-32 h-24 rounded-lg blur-xl bg-gradient-to-b from-black via-red-600 to-yellow-400 transition-all duration-1500 ${
            isLoaded ? "opacity-20 scale-100" : "opacity-0 scale-75"
          }`}
        ></div>
        <div
          className={`absolute bottom-32 left-20 w-20 h-15 rounded-lg blur-xl bg-gradient-to-b from-black via-red-600 to-yellow-400 transition-all duration-1500 delay-300 ${
            isLoaded ? "opacity-15 scale-100" : "opacity-0 scale-75"
          }`}
        ></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        {/* Header with proper German flag */}
        <div className="text-center mb-16">
          <h1
            className={`text-5xl md:text-7xl font-bold text-black mb-6 tracking-tight fade-in-up delay-100 ${
              isLoaded ? "" : "opacity-0"
            }`}
          >
            Willkommen zum
            <br />
            <span className="bg-gradient-to-r from-red-600 to-yellow-400 bg-clip-text text-transparent">
              Demokratie Quiz
            </span>
          </h1>

          <p
            className={`text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed fade-in-up delay-200 ${
              isLoaded ? "" : "opacity-0"
            }`}
          >
            Stärke dein Verständnis für demokratische Werte und Prozesse durch interaktive
            Quizfragen. Teste dein Wissen über das deutsche politische System und demokratische
            Grundprinzipien.
          </p>
        </div>

        {/* Game Type Selection */}
        <div
          className={`w-full max-w-4xl mb-12 fade-in-up delay-300 ${isLoaded ? "" : "opacity-0"}`}
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-black">Spielmodus wählen</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div
              onClick={() => setSelectedGameType("singleplayer")}
              className={`p-8 cursor-pointer transition-all duration-300 rounded-xl shadow-lg transform hover:scale-105 hover:-translate-y-1 ${
                selectedGameType === "singleplayer"
                  ? "border-2 border-red-600 bg-red-50 shadow-xl scale-105"
                  : "border-2 border-gray-200 bg-white hover:border-red-300 hover:shadow-xl"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center mb-4 shadow-md">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Einzelspieler</h3>
                <p className="text-gray-600 text-center">
                  Teste dein Wissen alleine und verbessere deine Kenntnisse in deinem eigenen Tempo.
                </p>
              </div>
            </div>

            <div
              onClick={() => setSelectedGameType("multiplayer")}
              className={`p-8 cursor-pointer transition-all duration-300 rounded-xl shadow-lg transform hover:scale-105 hover:-translate-y-1 ${
                selectedGameType === "multiplayer"
                  ? "border-2 border-yellow-500 bg-yellow-50 shadow-xl scale-105"
                  : "border-2 border-gray-200 bg-white hover:border-yellow-300 hover:shadow-xl"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center mb-4 shadow-md">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">Mehrspieler</h3>
                <p className="text-gray-600 text-center">
                  Erstelle eine Lobby oder tritt einer bei und spiele mit Freunden oder anderen
                  Teilnehmern.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Difficulty Selection */}
        <AnimatePresence>
          {selectedGameType && (
            <motion.div
              key="difficulty"
              ref={difficultyRef}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-6xl mb-12"
            >
              <h2 className="text-3xl font-bold text-center mb-8 text-black">
                Schwierigkeitsgrad wählen
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(gameModes).map(([key, mode], index) => (
                  <div
                    key={key}
                    onClick={() => setSelectedGameMode(key)}
                    className={`p-6 cursor-pointer transition-all duration-300 rounded-xl shadow-lg transform hover:scale-105 hover:-translate-y-1 ${
                      selectedGameMode === key
                        ? "border-2 border-blue-500 bg-blue-50 shadow-xl scale-105"
                        : "border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-xl"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-12 h-12 rounded-full ${mode.color} flex items-center justify-center mb-3 shadow-md`}
                      >
                        <span className="text-xl text-white">{mode.icon}</span>
                      </div>
                      <h3 className="text-lg font-bold text-black mb-2">{mode.label}</h3>
                      <p className="text-sm text-gray-600 leading-tight">{mode.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Start Button - Only show for singleplayer */}
        {selectedGameType === "singleplayer" && selectedGameMode && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              onClick={handleStartQuiz}
              whileHover={{ scale: 1.05, y: -4 }}
              className="px-12 py-6 bg-gradient-to-r from-red-600 to-yellow-500 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform group"
            >
              Quiz starten
              <svg
                className="ml-2 h-5 w-5 inline-block transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </motion.button>

            <motion.div
              className="mt-6 flex items-center justify-center gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <motion.span
                className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                Einzelspieler
              </motion.span>
              <motion.span
                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {gameModes[selectedGameMode as keyof typeof gameModes].label}
              </motion.span>
            </motion.div>
          </motion.div>
        )}

        {/* Call to Action for Multiplayer */}
        {selectedGameType === "multiplayer" && (
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="p-6 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl shadow-lg max-w-md mx-auto">
              <h3 className="text-lg font-bold text-black mb-3 text-center">
                Mehrspieler-Optionen
              </h3>
              <div className="h-px bg-gray-200 my-3"></div>
              <div className="space-y-3">
                <button
                  onClick={() => (window.location.href = "/lobby")}
                  disabled={!selectedGameMode}
                  className={`w-full py-3 px-6 bg-red-600 text-white rounded-lg transition-colors font-medium ${
                    selectedGameMode ? "hover:bg-red-700" : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  Neue Lobby erstellen
                </button>
                <button
                  onClick={() => (window.location.href = "/lobby")}
                  disabled={!selectedGameMode}
                  className={`w-full py-3 px-6 border-2 border-yellow-500 text-yellow-600 rounded-lg transition-colors font-medium ${
                    selectedGameMode ? "hover:bg-yellow-50" : "opacity-50 cursor-not-allowed"
                  }`}
                >
                  Bestehender Lobby beitreten
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Hero;
