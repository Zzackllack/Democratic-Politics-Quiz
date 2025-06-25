import Hero from "@/components/Hero";
import Layout from "@/components/Layout";
import MultiplayerQuiz from "@/components/MultiplayerQuiz";
import { useEffect, useState } from "react";

export default function PlayPage() {
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedLobbyId = localStorage.getItem("lobbyId");
      const storedPlayerId = localStorage.getItem("playerId");
      const storedIsHost = localStorage.getItem("isHost") === "true";

      if (storedLobbyId && storedPlayerId) {
        // Verify the lobby is still active
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/lobbies/${storedLobbyId}`)
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

  if (isLoading) {
    return (
      <Layout title="Quiz wird geladen">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Quiz wird geladen...</p>
          </div>
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

  return (
    <Layout title="Quiz starten">
      <Hero />
    </Layout>
  );
}
