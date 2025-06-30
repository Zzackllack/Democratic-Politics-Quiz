import Layout from "@/components/Layout";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Clock,
  Copy,
  Crown,
  LogOut,
  Play,
  Settings,
  Share2,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const difficulties = ["einfach", "mittel", "schwer", "lustig", "einbürgerungstest"];

const difficultyConfig = {
  einfach: {
    icon: "🌱",
    color: "bg-green-500",
    label: "Einfach",
    description: "Grundlegende Fragen zur Demokratie",
  },
  mittel: {
    icon: "🎯",
    color: "bg-yellow-500",
    label: "Mittel",
    description: "Erweiterte Kenntnisse erforderlich",
  },
  schwer: {
    icon: "🔥",
    color: "bg-red-500",
    label: "Schwer",
    description: "Für echte Demokratie-Experten",
  },
  lustig: {
    icon: "😄",
    color: "bg-purple-500",
    label: "Lustig",
    description: "Demokratie mit einem Augenzwinkern",
  },
  einbürgerungstest: {
    icon: "🏛️",
    color: "bg-blue-500",
    label: "Einbürgerungstest",
    description: "Offizielle Fragen zur deutschen Staatsbürgerschaft",
  },
};

export default function LobbyPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [hasName, setHasName] = useState(false);
  const [lobbyName, setLobbyName] = useState("");
  const [gameMode, setGameMode] = useState("einfach");
  const [lobbyInfo, setLobbyInfo] = useState<{ lobbyId: string; code: string } | null>(null);
  const [players, setPlayers] = useState<Array<{ id: string; name: string; isHost: boolean }>>([]);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(4);

  useEffect(() => {
    const storedName = localStorage.getItem("playerName");
    if (storedName) {
      setPlayerName(storedName);
      setHasName(true);
    }
    const lobbyId = localStorage.getItem("lobbyId");
    const code = localStorage.getItem("code");
    if (lobbyId && code) {
      setLobbyInfo({ lobbyId, code });
    }
  }, []);

  // Initial fetch to sync game mode when lobby info is available
  useEffect(() => {
    if (!lobbyInfo) return;

    const fetchInitialLobbyData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/lobbies/${lobbyInfo.lobbyId}`
        );
        if (res.ok) {
          const data = await res.json();
          setPlayers(data.players);
          // Set the game mode from the lobby data
          if (data.gameMode) {
            setGameMode(data.gameMode);
          }
        }
      } catch (error) {
        console.error("Error fetching initial lobby data:", error);
      }
    };

    fetchInitialLobbyData();
  }, [lobbyInfo]);

  useEffect(() => {
    if (!lobbyInfo) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/lobbies/${lobbyInfo.lobbyId}`
        );
        if (res.ok) {
          const data = await res.json();
          setPlayers(data.players);
          // Update game mode to match the lobby's actual game mode
          if (data.gameMode && data.gameMode !== gameMode) {
            setGameMode(data.gameMode);
          }
          if (data.status === "IN_PROGRESS") {
            router.push("/play");
          } else if (data.status === "FINISHED") {
            // Lobby is finished, clear localStorage
            localStorage.removeItem("lobbyId");
            localStorage.removeItem("playerId");
            localStorage.removeItem("code");
            localStorage.removeItem("isHost");
            router.push("/play");
          }
        } else {
          // Lobby not found, clear localStorage
          localStorage.removeItem("lobbyId");
          localStorage.removeItem("playerId");
          localStorage.removeItem("code");
          localStorage.removeItem("isHost");
          router.push("/play");
        }
      } catch (error) {
        console.error("Error fetching lobby status:", error);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [lobbyInfo, router, gameMode]);

  const saveName = () => {
    if (!playerName.trim()) return;
    localStorage.setItem("playerName", playerName);
    setHasName(true);
  };

  const createLobby = async () => {
    if (!lobbyName.trim()) return;

    // Clear any existing lobby data
    localStorage.removeItem("lobbyId");
    localStorage.removeItem("playerId");
    localStorage.removeItem("code");
    localStorage.removeItem("isHost");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lobbies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: lobbyName, gameMode, hostName: playerName, maxPlayers }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("playerId", data.hostId);
        localStorage.setItem("lobbyId", data.lobbyId);
        localStorage.setItem("code", data.code);
        localStorage.setItem("isHost", "true");
        setLobbyInfo({ lobbyId: data.lobbyId, code: data.code });
      }
    } catch (error) {
      console.error("Error creating lobby:", error);
    }
  };

  const startGame = async () => {
    if (!lobbyInfo) return;
    setIsStarting(true);
    try {
      const playerId = localStorage.getItem("playerId");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lobbies/${lobbyInfo.lobbyId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      router.push("/play");
    } catch (error) {
      console.error("Error starting game:", error);
      setIsStarting(false);
    }
  };

  const leaveLobby = () => {
    localStorage.removeItem("lobbyId");
    localStorage.removeItem("playerId");
    localStorage.removeItem("code");
    localStorage.removeItem("isHost");
    router.push("/play");
  };

  const copyCode = async () => {
    if (lobbyInfo?.code) {
      try {
        await navigator.clipboard.writeText(lobbyInfo.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy code:", err);
      }
    }
  };

  const shareLink = async () => {
    if (lobbyInfo?.code) {
      const shareUrl = `${window.location.origin}/join?code=${lobbyInfo.code}`;

      try {
        if (navigator.share) {
          // Use native Web Share API if available
          await navigator.share({
            title: "Demokratie Quiz - Lobby beitreten",
            text: `Tritt meiner Lobby bei! Code: ${lobbyInfo.code}`,
            url: shareUrl,
          });
        } else {
          // Fallback: copy the URL to clipboard
          await navigator.clipboard.writeText(shareUrl);
          setShared(true);
          setTimeout(() => setShared(false), 2000);
        }
      } catch (err) {
        console.error("Failed to share link:", err);
        // Fallback: copy the URL to clipboard
        try {
          await navigator.clipboard.writeText(shareUrl);
          setShared(true);
          setTimeout(() => setShared(false), 2000);
        } catch (clipboardErr) {
          console.error("Failed to copy to clipboard:", clipboardErr);
        }
      }
    }
  };

  const getPlayerInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!hasName) {
    return (
      <Layout title="Name eingeben">
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

          <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-md"
            >
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-600 to-yellow-500 flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
                >
                  <User className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-5xl font-bold text-black mb-4 tracking-tight">
                  Willkommen zum
                  <br />
                  <span className="bg-gradient-to-r from-red-600 to-yellow-400 bg-clip-text text-transparent">
                    Mehrspieler Quiz
                  </span>
                </h1>
                <p className="text-xl text-gray-600">Wie sollen dich andere Spieler nennen?</p>
              </motion.div>

              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dein Anzeigename
                    </label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && saveName()}
                      placeholder="Z.B. Max Mustermann"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors duration-200 text-gray-800 placeholder-gray-400"
                      maxLength={20}
                      autoFocus
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={saveName}
                    disabled={!playerName.trim()}
                    className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-yellow-500 text-white text-lg font-bold rounded-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
                  >
                    Weiter
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
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!lobbyInfo) {
    return (
      <Layout title="Lobby erstellen">
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

          <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-lg"
            >
              <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.div
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-600 to-yellow-500 flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
                >
                  <Settings className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-5xl font-bold text-black mb-4 tracking-tight">
                  Lobby
                  <br />
                  <span className="bg-gradient-to-r from-red-600 to-yellow-400 bg-clip-text text-transparent">
                    erstellen
                  </span>
                </h1>
                <p className="text-xl text-gray-600">Konfiguriere dein Mehrspieler-Quiz</p>
              </motion.div>

              <motion.div
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-6 border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lobby Name
                  </label>
                  <input
                    type="text"
                    value={lobbyName}
                    onChange={(e) => setLobbyName(e.target.value)}
                    placeholder="Z.B. Quiz mit Freunden"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors duration-200 text-gray-800 placeholder-gray-400"
                    maxLength={30}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Schwierigkeitsgrad
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {difficulties.map((difficulty, index) => {
                      const config = difficultyConfig[difficulty as keyof typeof difficultyConfig];
                      return (
                        <motion.div
                          key={difficulty}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 * index }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setGameMode(difficulty)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 shadow-lg ${
                            gameMode === difficulty
                              ? "border-red-500 bg-red-50 shadow-xl scale-105"
                              : "border-gray-200 bg-white hover:border-red-300 hover:shadow-xl"
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-12 h-12 rounded-full ${config.color} flex items-center justify-center text-white shadow-md`}
                            >
                              <span className="text-xl">{config.icon}</span>
                            </div>
                            <div>
                              <div className="font-bold text-gray-800">{config.label}</div>
                              <div className="text-sm text-gray-600">{config.description}</div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max. Spieler (4-100)
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={100}
                    value={maxPlayers}
                    onChange={(e) =>
                      setMaxPlayers(Math.max(4, Math.min(100, Number(e.target.value))))
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:outline-none transition-colors duration-200 text-gray-800 placeholder-gray-400"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={createLobby}
                  disabled={!lobbyName.trim()}
                  className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-yellow-500 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Lobby erstellen</span>
                    <motion.svg
                      className="ml-2 h-5 w-5"
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
                  </div>
                </motion.button>

                <motion.div
                  className="text-center pt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                >
                  <Link
                    href="/join"
                    className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
                  >
                    Oder einer Lobby beitreten
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Layout>
    );
  }

  const isHost = localStorage.getItem("isHost") === "true";
  const currentDifficulty =
    difficultyConfig[gameMode as keyof typeof difficultyConfig] || difficultyConfig.einfach;

  return (
    <Layout title="Lobby">
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-red-600 to-yellow-500 flex items-center justify-center shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            >
              <Users className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold text-black mb-4 tracking-tight">
              Lobby:{" "}
              <span className="bg-gradient-to-r from-red-600 to-yellow-400 bg-clip-text text-transparent">
                {lobbyInfo.code}
              </span>
            </h1>
            <p className="text-xl text-gray-600">Warte auf andere Spieler oder starte das Quiz</p>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lobby Info Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="lg:col-span-1"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-red-600" />
                    Lobby Info
                  </h2>

                  <div className="space-y-4">
                    <motion.div
                      className="p-4 bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl border border-red-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Lobby Code:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-2xl font-bold text-black tracking-widest px-3 py-1 bg-white rounded-lg shadow-sm">
                            {lobbyInfo.code}
                          </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={copyCode}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-200"
                            title="Code kopieren"
                          >
                            {copied ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={shareLink}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-200"
                            title="Einladungslink teilen"
                          >
                            {shared ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <Share2 className="w-5 h-5" />
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="text-center text-sm text-gray-500"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                    >
                      <p className="mb-1">
                        <Copy className="w-4 h-4 inline mr-1" />
                        Kopiert den Code zum manuellen Eingeben
                      </p>
                      <p>
                        <Share2 className="w-4 h-4 inline mr-1" />
                        Teilt den direkten Einladungslink
                      </p>
                    </motion.div>

                    <motion.div
                      className="p-4 bg-gradient-to-r from-yellow-50 to-red-50 rounded-xl border border-yellow-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Schwierigkeit:</span>
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full ${currentDifficulty.color} flex items-center justify-center text-white shadow-md`}
                          >
                            <span className="text-lg">{currentDifficulty.icon}</span>
                          </div>
                          <span className="font-bold text-gray-800">{currentDifficulty.label}</span>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="p-4 bg-gradient-to-r from-black/5 to-gray-100 rounded-xl border border-gray-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Spieler online:</span>
                        <span className="font-bold text-2xl text-black">{players.length}</span>
                      </div>
                    </motion.div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={leaveLobby}
                    className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 shadow-md"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Lobby verlassen</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Players List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Spieler ({players.length})
                  </h2>

                  {players.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <Clock className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">Warte auf Spieler...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <AnimatePresence>
                        {players.map((player, index) => (
                          <motion.div
                            key={player.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                              player.isHost
                                ? "border-yellow-400 bg-yellow-50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-12 h-12 rounded-full ${
                                  player.isHost ? "bg-yellow-500" : "bg-blue-500"
                                } flex items-center justify-center text-white font-bold shadow-md`}
                              >
                                {player.isHost ? (
                                  <Crown className="w-6 h-6" />
                                ) : (
                                  <span className="text-sm">{getPlayerInitials(player.name)}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-gray-800">{player.name}</h3>
                                <p className="text-sm text-gray-600">
                                  {player.isHost ? "Host" : "Spieler"}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Start Game Button */}
                  {isHost && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="mt-6 pt-6 border-t border-gray-200"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={startGame}
                        disabled={players.length === 0 || isStarting}
                        className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        {isStarting ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Spiel wird gestartet...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <Play className="w-5 h-5" />
                            <span>Spiel starten</span>
                          </div>
                        )}
                      </motion.button>

                      {players.length === 0 && (
                        <p className="text-center text-gray-500 text-sm mt-2">
                          Mindestens ein Spieler wird benötigt
                        </p>
                      )}
                    </motion.div>
                  )}

                  {!isHost && (
                    <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                      <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <Clock className="w-5 h-5" />
                        <span>Warte auf den Host...</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
