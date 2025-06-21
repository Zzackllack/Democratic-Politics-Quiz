import React, { useEffect, useState } from "react";
import type { Lobby, Player } from "../data/mockData";
import { gameModes, mockLobbies } from "../data/mockData";

interface LobbyProps {
  onStartGame?: (lobby: Lobby) => void;
  onJoinLobby?: (lobbyId: string) => void;
}

const LobbyComponent: React.FC<LobbyProps> = ({
  onStartGame = () => {},
  onJoinLobby = () => {},
}) => {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLobbyName, setNewLobbyName] = useState("");
  const [selectedGameMode, setSelectedGameMode] = useState("einfach");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [currentPlayer] = useState<Player>({
    id: "current",
    name: "Du",
    score: 0,
    joinedAt: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading lobbies
    const loadLobbies = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLobbies(mockLobbies);
      setIsLoading(false);
    };

    loadLobbies();
  }, []);

  const handleCreateLobby = () => {
    if (!newLobbyName.trim()) return;

    const newLobby: Lobby = {
      id: `lobby_${Date.now()}`,
      name: newLobbyName,
      players: [currentPlayer],
      maxPlayers,
      gameMode: selectedGameMode,
      isActive: true,
      createdAt: new Date(),
    };

    setLobbies([newLobby, ...lobbies]);
    setShowCreateForm(false);
    setNewLobbyName("");
  };

  const handleJoinLobby = (lobbyId: string) => {
    setLobbies(
      lobbies.map((lobby) => {
        if (lobby.id === lobbyId && lobby.players.length < lobby.maxPlayers) {
          return {
            ...lobby,
            players: [...lobby.players, currentPlayer],
          };
        }
        return lobby;
      })
    );
    onJoinLobby(lobbyId);
  };

  const getGameModeInfo = (gameMode: string) => {
    return gameModes[gameMode as keyof typeof gameModes] || gameModes.einfach;
  };

  const formatCreatedTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Gerade erstellt";
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    return `vor ${Math.floor(diffMins / 60)} Std.`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Lobbies werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-4 h-16 bg-german-black mr-1 rounded-l"></div>
            <div className="w-4 h-16 bg-german-red"></div>
            <div className="w-4 h-16 bg-german-gold mr-1 rounded-r"></div>
            <span className="ml-4 text-3xl">🏠</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-german-black mb-4">
            Mehrspieler Lobbies
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Erstelle eine neue Lobby oder tritt einer bestehenden bei, um mit anderen Spielern dein
            Demokratie-Wissen zu testen.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-8 py-4 bg-gradient-to-r from-german-red to-german-gold text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            ➕ Neue Lobby erstellen
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-white border-2 border-german-gold text-german-gold font-bold rounded-xl hover:bg-german-gold hover:text-white transition-colors"
          >
            🔄 Aktualisieren
          </button>
        </div>

        {/* Create Lobby Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 animate-slide-up">
            <h2 className="text-2xl font-bold text-german-black mb-6">Neue Lobby erstellen</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lobby Name</label>
                <input
                  type="text"
                  value={newLobbyName}
                  onChange={(e) => setNewLobbyName(e.target.value)}
                  placeholder="z.B. Demokratie-Profis"
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-german-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximale Spielerzahl
                </label>
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-german-red focus:outline-none"
                >
                  <option value={2}>2 Spieler</option>
                  <option value={4}>4 Spieler</option>
                  <option value={6}>6 Spieler</option>
                  <option value={8}>8 Spieler</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schwierigkeitsgrad
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(gameModes).map(([key, mode]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedGameMode(key)}
                    className={`p-3 rounded-lg border-2 text-center transition-all duration-300 ${
                      selectedGameMode === key
                        ? "border-german-red bg-german-red/10"
                        : "border-gray-200 hover:border-german-red/50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full ${mode.color} flex items-center justify-center mx-auto mb-2`}
                    >
                      <span className="text-white text-sm">{mode.icon}</span>
                    </div>
                    <div className="text-sm font-medium">{mode.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleCreateLobby}
                disabled={!newLobbyName.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-german-red to-german-gold text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Lobby erstellen
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-german-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🏠</span>
            </div>
            <h3 className="text-2xl font-bold text-german-black mb-2">{lobbies.length}</h3>
            <p className="text-gray-600">Aktive Lobbies</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-german-red rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">👥</span>
            </div>
            <h3 className="text-2xl font-bold text-german-black mb-2">
              {lobbies.reduce((sum, lobby) => sum + lobby.players.length, 0)}
            </h3>
            <p className="text-gray-600">Spieler online</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-german-black rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">⚡</span>
            </div>
            <h3 className="text-2xl font-bold text-german-black mb-2">
              {lobbies.filter((lobby) => lobby.players.length < lobby.maxPlayers).length}
            </h3>
            <p className="text-gray-600">Freie Plätze</p>
          </div>
        </div>

        {/* Lobbies List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-german-black">Verfügbare Lobbies</h2>

          {lobbies.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-gray-400">🏠</span>
              </div>
              <h3 className="text-xl font-bold text-gray-600 mb-4">Keine Lobbies gefunden</h3>
              <p className="text-gray-500 mb-6">
                Erstelle die erste Lobby und lade andere Spieler ein!
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-german-red to-german-gold text-white font-bold rounded-lg"
              >
                Lobby erstellen
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {lobbies.map((lobby) => {
                const gameMode = getGameModeInfo(lobby.gameMode);
                const canJoin =
                  lobby.players.length < lobby.maxPlayers &&
                  !lobby.players.some((p) => p.id === currentPlayer.id);

                return (
                  <div
                    key={lobby.id}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-german-black mb-2">{lobby.name}</h3>
                        <div className="flex items-center space-x-3 mb-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${gameMode.color
                              .replace("bg-", "bg-")
                              .replace("500", "100")} ${gameMode.color
                              .replace("bg-", "text-")
                              .replace("500", "600")}`}
                          >
                            {gameMode.icon} {gameMode.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatCreatedTime(lobby.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-german-black">
                          {lobby.players.length}/{lobby.maxPlayers}
                        </div>
                        <div className="text-sm text-gray-500">Spieler</div>
                      </div>
                    </div>

                    {/* Players */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Spieler:</h4>
                      <div className="flex flex-wrap gap-2">
                        {lobby.players.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center space-x-2 bg-gray-50 rounded-full px-3 py-1"
                          >
                            <div className="w-6 h-6 bg-gradient-to-r from-german-red to-german-gold rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">{player.name[0]}</span>
                            </div>
                            <span className="text-sm text-gray-700">{player.name}</span>
                          </div>
                        ))}

                        {/* Empty slots */}
                        {Array.from({
                          length: lobby.maxPlayers - lobby.players.length,
                        }).map((_, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center"
                          >
                            <span className="text-gray-400 text-xs">?</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => (canJoin ? handleJoinLobby(lobby.id) : onStartGame(lobby))}
                      disabled={!canJoin && !lobby.players.some((p) => p.id === currentPlayer.id)}
                      className={`w-full py-3 font-bold rounded-lg transition-all duration-300 ${
                        canJoin
                          ? "bg-gradient-to-r from-german-red to-german-gold text-white hover:opacity-90"
                          : lobby.players.some((p) => p.id === currentPlayer.id)
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {canJoin
                        ? "Beitreten"
                        : lobby.players.some((p) => p.id === currentPlayer.id)
                          ? "Spiel starten"
                          : "Lobby voll"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LobbyComponent;
