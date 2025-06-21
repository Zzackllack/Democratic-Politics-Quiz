import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const difficulty = typeof req.query.difficulty === "string" ? req.query.difficulty : null;

  if (!difficulty) {
    return res.status(400).json({ error: "Difficulty parameter required" });
  }

  try {
    const questions = await prisma.question.findMany({
      where: { difficulty },
      take: 10,
      orderBy: { id: "asc" },
    });

    if (questions.length === 0) {
      return res.status(404).json({ error: "No questions found" });
    }

    res.status(200).json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load questions" });
  }
}
