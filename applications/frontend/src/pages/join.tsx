import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { ArrowLeft, LogIn, User, Users } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function JoinPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("playerName");
    if (stored) setPlayerName(stored);

    // Check for code parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get("code");
    if (codeParam) {
      setCode(codeParam.toUpperCase());
    }
  }, []);

  const join = async () => {
    if (!playerName.trim() || !code.trim()) {
      setError("Bitte fülle alle Felder aus");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      localStorage.setItem("playerName", playerName);
      const res = await fetch("http://localhost:3001/api/lobbies/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.toUpperCase(), playerName }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("playerId", data.playerId);
        localStorage.setItem("lobbyId", data.lobbyId);
        localStorage.setItem("isHost", "false");
        localStorage.setItem("code", code.toUpperCase());
        router.push("/lobby");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Fehler beim Beitreten zur Lobby");
      }
    } catch (err) {
      setError("Verbindungsfehler. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      join();
    }
  };

  return (
    <Layout title="Lobby beitreten">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-black/5 to-transparent"></div>
          <div className="absolute top-1/3 left-0 w-full h-1/3 bg-gradient-to-b from-red-600/5 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-yellow-400/10 to-transparent"></div>

          <div className="absolute top-20 right-20 w-32 h-24 rounded-lg blur-xl bg-gradient-to-b from-black via-red-600 to-yellow-400 opacity-20"></div>
          <div className="absolute bottom-32 left-20 w-20 h-15 rounded-lg blur-xl bg-gradient-to-b from-black via-red-600 to-yellow-400 opacity-15"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen">
          {/* Back button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => router.push("/play")}
            className="absolute top-8 left-8 flex items-center space-x-2 text-gray-600 hover:text-german-black transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zurück</span>
          </motion.button>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-german-black mb-4">
              Lobby beitreten
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gib deinen Namen und den Lobby-Code ein, um einem Mehrspieler-Quiz beizutreten
            </p>
          </motion.div>

          {/* Join Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
              {/* Player Name Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Dein Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Gib deinen Namen ein..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none transition-colors duration-200 text-gray-800 placeholder-gray-400"
                  maxLength={20}
                />
              </div>

              {/* Lobby Code Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <LogIn className="w-4 h-4 inline mr-2" />
                  Lobby-Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  placeholder="Z.B. ABCD"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-yellow-500 focus:outline-none transition-colors duration-200 text-gray-800 placeholder-gray-400 uppercase tracking-widest text-center font-mono text-lg"
                  maxLength={6}
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Join Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={join}
                disabled={!playerName.trim() || !code.trim() || isLoading}
                className="w-full py-3 px-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Beitritt läuft...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Lobby beitreten</span>
                  </div>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-500 text-sm">
              Hast du noch keinen Code? Bitte einen Freund, eine Lobby zu erstellen!
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
