import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const difficulty = typeof req.query.difficulty === "string" ? req.query.difficulty : "einfach";

  try {
    const questions = await prisma.question.findMany({
      where: { difficulty },
      take: 10,
      orderBy: { id: "asc" },
    });
    res.status(200).json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load questions" });
  }
}
