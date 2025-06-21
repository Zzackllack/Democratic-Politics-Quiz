import React from "react";
import Quiz from "@/components/Quiz";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";

export default function QuizPage() {
  const router = useRouter();
  const diffParam = router.query.difficulty;
  const difficulty = typeof diffParam === "string" ? diffParam : null;

  React.useEffect(() => {
    if (router.isReady && !difficulty) {
      router.replace("/play");
    }
  }, [router, difficulty]);

  return <Layout title="Quiz">{difficulty ? <Quiz gameMode={difficulty} /> : null}</Layout>;
}
