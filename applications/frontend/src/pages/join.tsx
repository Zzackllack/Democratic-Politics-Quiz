import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";

export default function JoinPage() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("playerName");
    if (stored) setPlayerName(stored);
  }, []);

  const join = async () => {
    localStorage.setItem("playerName", playerName);
    const res = await fetch("/api/lobbies/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, playerName }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("playerId", data.playerId);
      localStorage.setItem("lobbyId", data.lobbyId);
      localStorage.setItem("isHost", "false");
      localStorage.setItem("code", code.toUpperCase());
      router.push("/lobby");
    }
  };

  return (
    <Layout title="Lobby beitreten">
      <div className="p-4 space-y-4">
        <div>
          <label className="block mb-1">Dein Name</label>
          <input
            className="border p-2"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1">Code</label>
          <input className="border p-2" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <button className="border px-4 py-2" onClick={join} disabled={!playerName || !code}>
          Beitreten
        </button>
      </div>
    </Layout>
  );
}
