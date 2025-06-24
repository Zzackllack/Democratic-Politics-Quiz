import AnimatedNumber from "@/components/AnimatedNumber";
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";

interface Result {
  playerId: string;
  name: string;
  score: number;
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const lobbyId = localStorage.getItem("lobbyId");
    if (!lobbyId) {
      setError("Keine Lobby-Daten gefunden");
      setIsLoading(false);
      return;
    }

    fetch(`http://localhost:3001/api/games/${lobbyId}/results`)
      .then((r) => {
        if (r.ok) {
          return r.json();
        }
        throw new Error("Fehler beim Laden der Ergebnisse");
      })
      .then((d) => {
        setResults(d.results || []);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Fehler beim Laden der Ergebnisse");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleNewGame = () => {
    // Clear all localStorage and redirect to play page
    localStorage.removeItem("lobbyId");
    localStorage.removeItem("playerId");
    localStorage.removeItem("code");
    localStorage.removeItem("isHost");
    window.location.href = "/play";
  };

  useEffect(() => {
    if (!isLoading) {
      localStorage.removeItem("lobbyId");
      localStorage.removeItem("playerId");
      localStorage.removeItem("code");
      localStorage.removeItem("isHost");
    }
  }, [isLoading]);

  const handleViewLeaderboard = () => {
    window.location.href = "/leaderboard";
  };

  if (isLoading) {
    return (
      <Layout title="Ergebnisse werden geladen">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Ergebnisse werden geladen...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Fehler">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-red-600 font-bold">{error}</p>
            <button
              onClick={handleNewGame}
              className="px-6 py-3 bg-gradient-to-r from-german-red to-german-gold text-white rounded-lg"
            >
              Neues Spiel starten
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const sortedResults = [...results].sort((a, b) => b.score - a.score);

  return (
    <Layout title="Spiel-Ergebnisse">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-german-red to-german-gold flex items-center justify-center">
              <span className="text-3xl text-white">🏆</span>
            </div>
            <h1 className="text-4xl font-bold text-german-black mb-4">Spiel beendet!</h1>
            <p className="text-xl text-gray-600">Hier sind die finalen Ergebnisse:</p>
          </div>

          {/* Results List */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-german-black mb-6 text-center">Endstand</h2>

            {sortedResults.length === 0 ? (
              <p className="text-center text-gray-600">Keine Ergebnisse verfügbar.</p>
            ) : (
              <div className="space-y-4">
                {sortedResults.map((result, index) => {
                  let badgeColor = "bg-gray-100 text-gray-600";
                  let badgeText = `${index + 1}.`;

                  if (index === 0) {
                    badgeColor = "bg-yellow-100 text-yellow-800";
                    badgeText = "🥇";
                  } else if (index === 1) {
                    badgeColor = "bg-gray-100 text-gray-600";
                    badgeText = "🥈";
                  } else if (index === 2) {
                    badgeColor = "bg-orange-100 text-orange-600";
                    badgeText = "🥉";
                  }

                  return (
                    <div
                      key={result.playerId}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-300 ${
                        index === 0
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-12 h-12 rounded-full ${badgeColor} flex items-center justify-center font-bold text-lg`}
                        >
                          {badgeText}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-german-black">{result.name}</h3>
                          <p className="text-sm text-gray-600">
                            {index === 0 ? "Sieger!" : `Platz ${index + 1}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-german-black">
                          <AnimatedNumber value={result.score} />
                        </div>
                        <div className="text-sm text-gray-600">Punkte</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <button
              onClick={handleNewGame}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-german-red to-german-gold text-white font-bold rounded-lg hover:opacity-90 transition-opacity mr-0 md:mr-4 mb-4 md:mb-0"
            >
              Neues Spiel starten
            </button>
            <button
              onClick={handleViewLeaderboard}
              className="w-full md:w-auto px-8 py-3 bg-white border-2 border-german-gold text-german-gold font-bold rounded-lg hover:bg-german-gold hover:text-white transition-colors"
            >
              Bestenliste ansehen
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
