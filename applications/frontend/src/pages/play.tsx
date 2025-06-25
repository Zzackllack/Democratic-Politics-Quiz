import Layout from "@/components/Layout";
import MultiplayerQuiz from "@/components/MultiplayerQuiz";
import Quiz from "@/components/Quiz";
import { gameModes } from "@/data/gamemodes";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Play, Trophy, User } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PlayPage() {
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGameMode, setSelectedGameMode] = useState<string>("");
  const [showDifficultySelection, setShowDifficultySelection] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLobbyId = localStorage.getItem("lobbyId");
      const storedPlayerId = localStorage.getItem("playerId");
      const storedIsHost = localStorage.getItem("isHost") === "true";

      if (storedLobbyId && storedPlayerId) {
        // Verify the lobby is still active
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lobbies/${storedLobbyId}`)
          .then((res) => {
            if (res.ok) {
              return res.json();
            } else {
              throw new Error("Lobby not found");
            }
          })
          .then((data) => {
            if (data.status === "IN_PROGRESS") {
              setLobbyId(storedLobbyId);
              setPlayerId(storedPlayerId);
              setIsHost(storedIsHost);
              setIsMultiplayer(true);
            } else if (data.status === "WAITING") {
              // Redirect back to lobby if still waiting
              window.location.href = "/lobby";
              return;
            } else {
              // Lobby is finished or in other state, clear localStorage
              localStorage.removeItem("lobbyId");
              localStorage.removeItem("playerId");
              localStorage.removeItem("code");
              localStorage.removeItem("isHost");
            }
            setIsLoading(false);
          })
          .catch(() => {
            // Lobby doesn't exist, clear localStorage
            localStorage.removeItem("lobbyId");
            localStorage.removeItem("playerId");
            localStorage.removeItem("code");
            localStorage.removeItem("isHost");
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    }

    // Add cleanup on page unload
    const handleBeforeUnload = () => {
      // Don't clear localStorage on page reload, only on actual navigation away
      const lobbyId = localStorage.getItem("lobbyId");
      const playerId = localStorage.getItem("playerId");

      if (lobbyId && playerId) {
        // Mark player as offline
        fetch(`http://localhost:3001/api/players/${playerId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isOnline: false }),
          keepalive: true,
        }).catch(() => {
          // Ignore errors on unload
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const handleStartQuiz = async () => {
    if (!selectedGameMode) return;

    setIsAnimating(true);

    // Animate out the difficulty selection
    await new Promise((resolve) => setTimeout(resolve, 300));

    setShowDifficultySelection(false);
    setQuizStarted(true);
    setIsAnimating(false);
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  const handleQuizComplete = (_score: number, _answers: any[]) => {
    // Quiz completion is handled within the Quiz component
  };

  if (isLoading) {
    return (
      <Layout title="Quiz wird geladen">
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Quiz wird geladen...</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  if (isMultiplayer && lobbyId && playerId) {
    return (
      <Layout title="Multiplayer Quiz">
        <MultiplayerQuiz lobbyId={lobbyId} playerId={playerId} isHost={isHost} />
      </Layout>
    );
  }

  if (quizStarted && selectedGameMode) {
    return (
      <Layout title="Einzelspieler Quiz">
        <Quiz gameMode={selectedGameMode} onQuizComplete={handleQuizComplete} />
      </Layout>
    );
  }

  return (
    <Layout title="Einzelspieler Quiz">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-black/5 to-transparent"></div>
          <div className="absolute top-1/3 left-0 w-full h-1/3 bg-gradient-to-b from-red-600/5 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-yellow-400/10 to-transparent"></div>

          <motion.div
            className="absolute top-20 right-20 w-32 h-24 rounded-lg blur-xl bg-gradient-to-b from-black via-red-600 to-yellow-400"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.2, scale: 1 }}
            transition={{ duration: 1.5 }}
          />
          <motion.div
            className="absolute bottom-32 left-20 w-20 h-15 rounded-lg blur-xl bg-gradient-to-b from-black via-red-600 to-yellow-400"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-white/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Zurück</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-700">Einzelspieler</span>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <AnimatePresence mode="wait">
              {showDifficultySelection && (
                <motion.div
                  key="difficulty-selection"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isAnimating ? 0 : 1, y: isAnimating ? -20 : 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-6xl"
                >
                  {/* Title */}
                  <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <h1 className="text-5xl md:text-6xl font-bold text-black mb-4 tracking-tight">
                      Wähle deinen
                      <br />
                      <span className=" text-4xl bg-gradient-to-r from-red-600 to-yellow-400 bg-clip-text text-transparent">
                        Schwierigkeitsgrad
                      </span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Teste dein Wissen über deutsche Demokratie und Politik in verschiedenen
                      Schwierigkeitsstufen
                    </p>
                  </motion.div>

                  {/* Difficulty Cards */}
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    {Object.entries(gameModes).map(([key, mode], index) => (
                      <motion.div
                        key={key}
                        onClick={() => setSelectedGameMode(key)}
                        className={`p-6 cursor-pointer transition-all duration-300 rounded-xl shadow-lg transform hover:scale-105 hover:-translate-y-2 ${
                          selectedGameMode === key
                            ? "border-2 border-blue-500 bg-blue-50 shadow-xl scale-105"
                            : "border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-xl"
                        }`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * index }}
                        whileHover={{ y: -8 }}
                        whileTap={{ scale: 0.95 }}
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
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Start Button */}
                  <AnimatePresence>
                    {selectedGameMode && (
                      <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                      >
                        <motion.button
                          onClick={handleStartQuiz}
                          className="px-12 py-6 bg-gradient-to-r from-red-600 to-yellow-500 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform group"
                          whileHover={{ scale: 1.05, y: -4 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Play className="w-5 h-5 inline-block mr-2" />
                          Quiz starten
                          <motion.svg
                            className="ml-2 h-5 w-5 inline-block"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </motion.svg>
                        </motion.button>

                        <motion.div
                          className="mt-6 flex items-center justify-center gap-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.4 }}
                        >
                          <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                            Einzelspieler
                          </span>
                          <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                            {gameModes[selectedGameMode as keyof typeof gameModes].label}
                          </span>
                        </motion.div>

                        {/* Quick Stats */}
                        <motion.div
                          className="mt-8 p-6 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl max-w-md mx-auto"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.4 }}
                        >
                          <h4 className="text-lg font-bold text-black mb-3 flex items-center justify-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Was dich erwartet
                          </h4>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-red-600">10</div>
                              <div className="text-xs text-gray-600">Fragen</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-yellow-600">30s</div>
                              <div className="text-xs text-gray-600">pro Frage</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-600">100</div>
                              <div className="text-xs text-gray-600">Punkte pro Frage</div>
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}
