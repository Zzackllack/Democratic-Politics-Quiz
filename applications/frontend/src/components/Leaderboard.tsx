import React, { useEffect, useState } from "react";
import type { Player } from "../data/mockData";

interface LeaderboardProps {
  currentPlayer?: Player;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentPlayer }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const res = await fetch(`${apiUrl}/api/players`);
        const data: Player[] = await res.json();
        const sortedPlayers = [...data]
          .sort((a, b) => b.score - a.score)
          .map((p) => ({ ...p, joinedAt: new Date(p.joinedAt as any) }));
        setPlayers(sortedPlayers);
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    };

    fetchLeaderboard();
  }, [filter]);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${position}`;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case 2:
        return "text-gray-600 bg-gray-50 border-gray-200";
      case 3:
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-white border-gray-200";
    }
  };

  const getScoreCategory = (score: number) => {
    if (score >= 800)
      return {
        label: "Demokratie-Experte",
        color: "text-german-gold bg-german-gold/10",
      };
    if (score >= 600)
      return {
        label: "Verfassungskenner",
        color: "text-german-red bg-german-red/10",
      };
    if (score >= 400)
      return {
        label: "Politikinteressiert",
        color: "text-blue-600 bg-blue-50",
      };
    if (score >= 200) return { label: "Einsteiger", color: "text-green-600 bg-green-50" };
    return { label: "Anfänger", color: "text-gray-600 bg-gray-50" };
  };

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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-german-black mb-4">Bestenliste</h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hier siehst du die besten Spieler unseres Demokratie Quiz. Kämpfe um einen Platz unter
            den Top-Experten!
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
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
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-german-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">👥</span>
            </div>
            <h3 className="text-2xl font-bold text-german-black mb-2">{players.length}</h3>
            <p className="text-gray-600">Aktive Spieler</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-german-red rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-german-black mb-2">
              {Math.round(players.reduce((sum, p) => sum + p.score, 0) / players.length)}
            </h3>
            <p className="text-gray-600">Durchschnittsscore</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-german-black rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">⭐</span>
            </div>
            <h3 className="text-2xl font-bold text-german-black mb-2">
              {Math.max(...players.map((p) => p.score))}
            </h3>
            <p className="text-gray-600">Höchstscore</p>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-german-black mb-8">
            🏆 Top 3 Demokratie-Champions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {players.slice(0, 3).map((player, index) => {
              const position = index + 1;
              const category = getScoreCategory(player.score);

              return (
                <div
                  key={player.id}
                  className={`relative bg-white rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300 ${
                    position === 1 ? "md:scale-110 md:-mt-4" : ""
                  }`}
                >
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${getRankColor(
                        position
                      )} border-2`}
                    >
                      {getRankIcon(position)}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-german-red to-german-gold rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-white font-bold">
                        {player.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-german-black mb-2">{player.name}</h3>
                    <div className="text-3xl font-bold text-german-red mb-2">{player.score}</div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}
                    >
                      {category.label}
                    </span>

                    <p className="text-gray-500 text-sm mt-2">
                      Beigetreten: {formatJoinDate(player.joinedAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
                  const category = getScoreCategory(player.score);
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
                            position
                          )} border`}
                        >
                          {getRankIcon(position)}
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
                          className={`px-3 py-1 rounded-full text-sm font-medium ${category.color}`}
                        >
                          {category.label}
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
