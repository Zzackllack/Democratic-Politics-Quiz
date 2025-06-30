import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Player } from "../data/gamemodes";
import { getActiveRanks, getPlayerRank, getRankStats } from "../data/ranks";

interface LeaderboardProps {
  currentPlayer?: Player;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentPlayer }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showRankDistribution, setShowRankDistribution] = useState(true);
  const [showTopPlayers, setShowTopPlayers] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${apiUrl}/api/players`);
        const data: Player[] = await res.json();

        // Convert joinedAt to Date objects
        const playersWithDates = data.map((p) => ({ ...p, joinedAt: new Date(p.joinedAt as any) }));

        // Filter by date range
        const now = new Date();
        const filteredPlayers = playersWithDates.filter((player) => {
          switch (filter) {
            case "today":
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              return player.joinedAt >= today;
            case "week":
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return player.joinedAt >= weekAgo;
            case "month":
              const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
              return player.joinedAt >= monthAgo;
            case "all":
            default:
              return true;
          }
        });

        const sortedPlayers = filteredPlayers.sort((a, b) => b.score - a.score);
        setPlayers(sortedPlayers);
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    };

    fetchLeaderboard();
  }, [filter]);

  const getRankIcon = (position: number, score: number) => {
    const rank = getPlayerRank(position, score, players.length);
    return rank.icon;
  };

  const getRankColor = (position: number, score: number) => {
    const rank = getPlayerRank(position, score, players.length);
    return `${rank.color} ${rank.bgColor} ${rank.borderColor}`;
  };

  const getRankInfo = (position: number, score: number) => {
    const rank = getPlayerRank(position, score, players.length);
    return {
      name: rank.name,
      description: rank.description,
      color: `${rank.color} ${rank.bgColor}`,
    };
  };

  // Calculate rank statistics
  const rankStats = getRankStats(players);
  const activeRanks = getActiveRanks(players);

  const formatJoinDate = (date: Date) => {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Bestenliste wird geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-german-black mb-4">Bestenliste</h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hier siehst du die besten Spieler unseres Demokratie Quiz. Kämpfe um einen Platz unter
            den Top-Experten!
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          {[
            { key: "all", label: "Alle Zeit" },
            { key: "today", label: "Heute" },
            { key: "week", label: "Diese Woche" },
            { key: "month", label: "Dieser Monat" },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setFilter(option.key as any)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                filter === option.key
                  ? "bg-gradient-to-r from-german-red to-german-gold text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-german-red/50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <div className="w-16 h-16 bg-german-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">👥</span>
            </div>
            <h3 className="text-2xl font-bold text-german-black mb-2">{rankStats.totalPlayers}</h3>
            <p className="text-gray-600">Registrierte Spieler</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <div className="w-16 h-16 bg-german-red rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-german-black mb-2">{rankStats.averageScore}</h3>
            <p className="text-gray-600">Durchschnittsscore</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 text-center"
          >
            <div className="w-16 h-16 bg-german-black rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">⭐</span>
            </div>
            <h3 className="text-2xl font-bold text-german-black mb-2">{rankStats.topScore}</h3>
            <p className="text-gray-600">Höchstscore</p>
          </motion.div>
        </motion.div>

        {/* Rank Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <button
            onClick={() => setShowRankDistribution(!showRankDistribution)}
            className="flex items-center justify-center w-full text-2xl font-bold text-german-black mb-8 hover:text-german-red transition-colors duration-200"
          >
            🎖️ Rang-Verteilung
            <motion.div
              animate={{ rotate: showRankDistribution ? 0 : -90 }}
              transition={{ duration: 0.3 }}
              className="ml-2"
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showRankDistribution && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap justify-center gap-4 max-w-6xl mx-auto">
                  {activeRanks.slice(0, 6).map((rank, index) => {
                    const count = rankStats.rankDistribution[rank.id] || 0;
                    const percentage =
                      rankStats.totalPlayers > 0
                        ? ((count / rankStats.totalPlayers) * 100).toFixed(1)
                        : 0;

                    return (
                      <motion.div
                        key={rank.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className={`${rank.bgColor} ${rank.borderColor} border-2 rounded-lg p-4 text-center min-w-[160px]`}
                      >
                        <div className="text-3xl mb-2">{rank.icon}</div>
                        <h3 className={`font-bold text-sm ${rank.color} mb-1`}>{rank.name}</h3>
                        <div className="text-2xl font-bold text-gray-800 mb-1">{count}</div>
                        <p className="text-xs text-gray-600">{percentage}% der Spieler</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <button
            onClick={() => setShowTopPlayers(!showTopPlayers)}
            className="flex items-center justify-center w-full text-2xl font-bold text-german-black mb-8 hover:text-german-red transition-colors duration-200"
          >
            🏆 Top 3 Demokratie-Champions
            <motion.div
              animate={{ rotate: showTopPlayers ? 0 : -90 }}
              transition={{ duration: 0.3 }}
              className="ml-2"
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showTopPlayers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto pt-8 pb-6">
                  {players.slice(0, 3).map((player, index) => {
                    const position = index + 1;
                    const rankInfo = getRankInfo(position, player.score);

                    return (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.2 }}
                        className={`relative bg-white rounded-xl shadow-lg p-6 pt-10 text-center transform hover:scale-105 transition-all duration-300 ${
                          position === 1 ? "md:scale-110" : ""
                        }`}
                      >
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${getRankColor(
                              position,
                              player.score
                            )} border-2`}
                          >
                            {getRankIcon(position, player.score)}
                          </div>
                        </div>

                        <div className="mt-2">
                          <div className="w-20 h-20 bg-gradient-to-r from-german-red to-german-gold rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl text-white font-bold">
                              {player.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>

                          <h3 className="text-xl font-bold text-german-black mb-2">
                            {player.name}
                          </h3>
                          <div className="text-3xl font-bold text-german-red mb-2">
                            {player.score}
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${rankInfo.color}`}
                          >
                            {rankInfo.name}
                          </span>

                          <p className="text-gray-500 text-sm mt-2">{rankInfo.description}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            Beigetreten: {formatJoinDate(player.joinedAt)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Full Leaderboard */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-german-black to-german-red text-white p-6">
            <h2 className="text-2xl font-bold">Komplette Rangliste</h2>
            <p className="text-gray-200">Alle Spieler nach Punktzahl sortiert</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Rang
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Spieler
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Punkte
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Beigetreten
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {players.map((player, index) => {
                  const position = index + 1;
                  const rankInfo = getRankInfo(position, player.score);
                  const isCurrentPlayer = currentPlayer?.id === player.id;

                  return (
                    <tr
                      key={player.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isCurrentPlayer ? "bg-german-gold/10 border-german-gold border-l-4" : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${getRankColor(
                            position,
                            player.score
                          )} border`}
                        >
                          {getRankIcon(position, player.score)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-german-red to-german-gold rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-sm">
                              {player.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {player.name}
                              {isCurrentPlayer && (
                                <span className="ml-2 px-2 py-1 bg-german-gold text-white text-xs rounded-full">
                                  Du
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg font-bold text-german-black">{player.score}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${rankInfo.color}`}
                        >
                          {rankInfo.name}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatJoinDate(player.joinedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-german-red to-german-gold rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Bereit für die Herausforderung?</h3>
            <p className="text-lg mb-6">
              Steige in der Rangliste auf und werde zum Demokratie-Experten!
            </p>
            <button
              onClick={() => (window.location.href = "/quiz")}
              className="px-8 py-3 bg-white text-german-red font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Quiz starten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
