import Quiz from "@/components/Quiz";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";

export default function QuizPage() {
  const router = useRouter();
  const diffParam = router.query.difficulty;
  const difficulty = typeof diffParam === "string" ? diffParam : "einfach";

  return (
    <Layout title="Quiz">
      <Quiz gameMode={difficulty} />
    </Layout>
  );
}
