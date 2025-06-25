import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { gameModes } from "@/data/gamemodes";
import Quiz from "./Quiz";

interface SinglePlayerQuizProps {
  initialGameMode?: string;
}

const SinglePlayerQuiz: React.FC<SinglePlayerQuizProps> = ({ initialGameMode }) => {
  const [selectedGameMode, setSelectedGameMode] = useState<string>(initialGameMode || "");
  const [showQuiz, setShowQuiz] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const handleGameModeSelect = (gameMode: string) => {
    setSelectedGameMode(gameMode);
    // Add a small delay for animation
    setTimeout(() => {
      setShowQuiz(true);
    }, 300);
  };

  const handleBackToSelection = () => {
    setShowQuiz(false);
    setSelectedGameMode("");
  };

  if (showQuiz && selectedGameMode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Quiz
          gameMode={selectedGameMode}
          onQuizComplete={(score, answers) => {
            // Handle quiz completion - could navigate to results or show modal
            console.log("Quiz completed:", { score, answers });
          }}
        />
      </motion.div>
    );
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-hidden">
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(1deg);
          }
          66% {
            transform: translateY(-5px) rotate(-1deg);
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
          }
        }

        .float-animation {
          animation: float 6s ease-in-out infinite;
        }

        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .glass-morphism {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10"></div>

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg opacity-20 float-animation"
          animate={{
            x: [0, 30, -15, 0],
            y: [0, -20, 10, 0],
            rotate: [0, 90, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute top-40 right-32 w-12 h-12 bg-gradient-to-r from-pink-400 to-red-400 rounded-full opacity-20"
          animate={{
            x: [0, -25, 15, 0],
            y: [0, 15, -10, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />

        <motion.div
          className="absolute bottom-32 left-1/4 w-20 h-20 bg-gradient-to-r from-green-400 to-blue-400 transform rotate-45 opacity-15"
          animate={{
            rotate: [45, 135, 225, 315, 45],
            scale: [1, 1.1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : -50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 tracking-tight"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            Einzelspieler
            <br />
            <span className="text-gray-800">Quiz</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Wähle deinen Schwierigkeitsgrad und teste dein Wissen über die deutsche Demokratie.
            Sammle Punkte und verbessere dein Verständnis!
          </motion.p>
        </motion.div>

        {/* Game Mode Selection */}
        <motion.div
          className="w-full max-w-6xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.h2
            className="text-3xl font-bold text-center mb-12 text-gray-800"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Schwierigkeitsgrad wählen
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(gameModes).map(([key, mode], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{
                  opacity: isLoaded ? 1 : 0,
                  y: isLoaded ? 0 : 50,
                  scale: isLoaded ? 1 : 0.9,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.8 + index * 0.1,
                  ease: "easeOut",
                }}
                whileHover={{
                  scale: 1.05,
                  y: -8,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.95 }}
                className={`relative cursor-pointer group`}
                onClick={() => handleGameModeSelect(key)}
              >
                <div
                  className={`
                  relative p-8 rounded-2xl shadow-lg transition-all duration-300
                  bg-gradient-to-br from-white to-gray-50
                  border-2 border-gray-200
                  hover:border-transparent hover:shadow-2xl
                  group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-blue-50
                  overflow-hidden
                `}
                >
                  {/* Animated background glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-4">
                      <motion.div
                        className={`w-16 h-16 rounded-full ${mode.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <span className="text-3xl">{mode.icon}</span>
                      </motion.div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-3 text-center group-hover:text-blue-600 transition-colors">
                      {mode.label}
                    </h3>

                    <p className="text-gray-600 text-center leading-relaxed group-hover:text-gray-700 transition-colors">
                      {mode.description}
                    </p>

                    <motion.div
                      className="mt-6 text-center"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Quiz starten
                        <motion.svg
                          className="ml-2 w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          whileHover={{ x: 3 }}
                          transition={{ duration: 0.2 }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </motion.svg>
                      </span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Back to Home Button */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <motion.button
            onClick={() => router.push("/")}
            className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="flex items-center">
              <motion.svg
                className="mr-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                whileHover={{ x: -3 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </motion.svg>
              Zurück zur Startseite
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default SinglePlayerQuiz;
