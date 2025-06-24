import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/Layout";

const difficulties = ["einfach", "mittel", "schwer", "lustig", "einbürgerungstest"];

export default function LobbyPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [hasName, setHasName] = useState(false);
  const [lobbyName, setLobbyName] = useState("");
  const [gameMode, setGameMode] = useState("einfach");
  const [lobbyInfo, setLobbyInfo] = useState<{ lobbyId: string; code: string } | null>(null);
  const [players, setPlayers] = useState<Array<{ id: string; name: string; isHost: boolean }>>([]);

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

  useEffect(() => {
    if (!lobbyInfo) return;
    const interval = setInterval(async () => {
      const res = await fetch(`http://localhost:3001/api/lobbies/${lobbyInfo.lobbyId}`);
      if (res.ok) {
        const data = await res.json();
        setPlayers(data.players);
        if (data.status === "IN_PROGRESS") {
          router.push("/play");
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [lobbyInfo, router]);

  const saveName = () => {
    localStorage.setItem("playerName", playerName);
    setHasName(true);
  };

  const createLobby = async () => {
    const res = await fetch("http://localhost:3001/api/lobbies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: lobbyName, gameMode, hostName: playerName }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("playerId", data.hostId);
      localStorage.setItem("lobbyId", data.lobbyId);
      localStorage.setItem("code", data.code);
      localStorage.setItem("isHost", "true");
      setLobbyInfo({ lobbyId: data.lobbyId, code: data.code });
    }
  };

  const startGame = async () => {
    if (!lobbyInfo) return;
    const playerId = localStorage.getItem("playerId");
    await fetch(`http://localhost:3001/api/lobbies/${lobbyInfo.lobbyId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId }),
    });
    router.push("/play");
  };

  if (!hasName) {
    return (
      <Layout title="Name">
        <div className="p-4">
          <h2 className="mb-2">Dein Anzeigename</h2>
          <input
            className="border p-2"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button className="ml-2 border px-4 py-2" onClick={saveName} disabled={!playerName}>
            Speichern
          </button>
        </div>
      </Layout>
    );
  }

  if (!lobbyInfo) {
    return (
      <Layout title="Lobby erstellen">
        <div className="p-4 space-y-4">
          <div>
            <label className="block mb-1">Lobby Name</label>
            <input
              className="border p-2 w-full"
              value={lobbyName}
              onChange={(e) => setLobbyName(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1">Schwierigkeitsgrad</label>
            <select
              className="border p-2"
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <button className="border px-4 py-2" disabled={!lobbyName} onClick={createLobby}>
            Lobby erstellen
          </button>
          <div>
            <Link className="text-blue-600 underline" href="/join">
              Lobby beitreten
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Lobby">
      <div className="p-4 space-y-2">
        <p>Code: {lobbyInfo.code}</p>
        <ul>
          {players.map((p) => (
            <li key={p.id}>
              {p.name}
              {p.isHost ? " (Host)" : ""}
            </li>
          ))}
        </ul>
        {localStorage.getItem("isHost") === "true" && (
          <button className="border px-4 py-2" onClick={startGame}>
            Spiel starten
          </button>
        )}
      </div>
    </Layout>
  );
}
