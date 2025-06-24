import { useEffect, useState } from "react";
import Layout from "@/components/Layout";

interface Result {
  playerId: string;
  name: string;
  score: number;
}

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    const lobbyId = localStorage.getItem("lobbyId");
    if (!lobbyId) return;
    fetch(`/api/games/${lobbyId}/results`)
      .then((r) => r.json())
      .then((d) => setResults(d.results || []));
  }, []);

  return (
    <Layout title="Ergebnisse">
      <div className="p-4">
        <h2 className="mb-2">Ergebnisse</h2>
        <ul>
          {results.map((r) => (
            <li key={r.playerId}>
              {r.name}: {r.score}
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
