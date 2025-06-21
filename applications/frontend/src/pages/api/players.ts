import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const players = await prisma.player.findMany({ orderBy: { score: "desc" } });
      res.status(200).json(players);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to load players" });
    }
  } else if (req.method === "POST") {
    const { name, score } = req.body as { name?: string; score?: number };
    if (!name || typeof score !== "number") {
      return res.status(400).json({ error: "Name and score required" });
    }
    try {
      const player = await prisma.player.create({
        data: {
          id: Date.now().toString(),
          name,
          score,
          joinedAt: new Date(),
        },
      });
      res.status(200).json(player);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to save player" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
