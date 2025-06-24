import Hero from "@/components/Hero";
import Layout from "@/components/Layout";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";

interface Question {
  questionId: string;
  question: string;
  options?: string[];
  number: number;
  total: number;
}

export default function PlayPage() {
  const router = useRouter();
  const [mp, setMp] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const lobbyId = typeof window !== "undefined" ? localStorage.getItem("lobbyId") : null;

  const fetchQuestion = useCallback(async () => {
    if (!lobbyId) return;
    const res = await fetch(`http://localhost:3001/api/games/${lobbyId}/question`);
    if (res.ok) {
      const data = await res.json();
      setQuestion(data);
    }
  }, [lobbyId]);

  useEffect(() => {
    if (lobbyId) {
      setMp(true);
      fetchQuestion();
      const interval = setInterval(fetchQuestion, 2000);
      return () => clearInterval(interval);
    }
  }, [lobbyId, fetchQuestion]);

  const submitAnswer = async (ans: string) => {
    if (!question || !lobbyId) return;
    setSelected(ans);
    await fetch(`http://localhost:3001/api/games/${lobbyId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: localStorage.getItem("playerId"),
        questionId: question.questionId,
        selectedAnswer: ans,
      }),
    });
  };

  const next = async () => {
    if (!lobbyId) return;
    const res = await fetch(`http://localhost:3001/api/games/${lobbyId}/next`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: localStorage.getItem("playerId") }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.finished) {
        router.push("/results");
      } else {
        setSelected(null);
        fetchQuestion();
      }
    }
  };

  if (!mp) {
    return (
      <Layout title="Quiz starten">
        <Hero />
      </Layout>
    );
  }

  if (!question) {
    return (
      <Layout title="Spiel">
        <p className="p-4">Warte auf Frage...</p>
      </Layout>
    );
  }

  return (
    <Layout title="Spiel">
      <div className="p-4 space-y-4">
        <div>
          Frage {question.number} / {question.total}
        </div>
        <div>{question.question}</div>
        {question.options?.map((o) => (
          <button
            key={o}
            className="block border px-2 py-1 my-1"
            onClick={() => submitAnswer(o)}
            disabled={!!selected}
          >
            {o}
          </button>
        ))}
        {localStorage.getItem("isHost") === "true" && (
          <button className="border px-4 py-2" onClick={next} disabled={!selected}>
            Weiter
          </button>
        )}
      </div>
    </Layout>
  );
}
