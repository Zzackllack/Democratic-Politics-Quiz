import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

interface Player {
  id: string;
  name: string;
  isHost?: boolean;
  score?: number;
  isOnline?: boolean;
}

interface Lobby {
  id: string;
  name: string;
  code: string;
  maxPlayers: number;
  players: Player[];
  gameMode: string;
  status: string;
}

const JoinPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure a player exists for this browser session
  useEffect(() => {
    const stored = localStorage.getItem("dq-player");
    if (stored) {
      setPlayer(JSON.parse(stored));
      return;
    }
    const create = async () => {
      const randomName = `Spieler_${Math.floor(Math.random() * 1000)}`;
      const res = await fetch(`${apiUrl}/api/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: randomName, score: 0 }),
      });
      const data = await res.json();
      localStorage.setItem("dq-player", JSON.stringify(data));
      setPlayer(data);
    };
    create();
  }, [apiUrl]);

  useEffect(() => {
    if (!id) return;
    const fetchLobby = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/lobbies/${id}`);
        if (res.ok) {
          const data = await res.json();
          setLobby(data);
        } else {
          setError("Lobby nicht gefunden");
        }
      } catch (err) {
        setError("Fehler beim Laden der Lobby");
      }
      setLoading(false);
    };
    fetchLobby();
  }, [apiUrl, id]);

  const joinLobby = async () => {
    if (!player || !id) return;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/lobbies/${id}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: player.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setLobby(data);
      } else {
        setError("Beitritt fehlgeschlagen");
      }
    } catch (err) {
      setError("Beitritt fehlgeschlagen");
    }
    setLoading(false);
  };

  if (!id) {
    return (
      <Layout title="Lobby">
        {" "}
        <p className="p-4">Keine Lobby-ID angegeben.</p>{" "}
      </Layout>
    );
  }

  return (
    <Layout title="Lobby">
      <div className="p-4 max-w-lg mx-auto">
        {loading && <p>Wird geladen...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {lobby && (
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{lobby.name}</h1>
            <p className="text-sm text-gray-600">Code: {lobby.code}</p>
            <p>
              Spieler {lobby.players.length} / {lobby.maxPlayers}
            </p>
            <ul className="list-disc list-inside">
              {lobby.players.map((p) => (
                <li key={p.id} className={p.id === player?.id ? "font-bold" : ""}>
                  {p.name}
                  {p.isHost ? " (Host)" : ""}
                </li>
              ))}
            </ul>
            {!lobby.players.some((p) => p.id === player?.id) && (
              <button onClick={joinLobby} className="px-4 py-2 bg-german-red text-white rounded">
                Lobby beitreten
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default JoinPage;
