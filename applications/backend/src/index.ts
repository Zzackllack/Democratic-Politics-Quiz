import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import { gameModes, lobbies, players, questions } from "./mockData";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors());

async function initDb() {
  const qCount = await prisma.question.count();
  if (qCount === 0) {
    await prisma.question.createMany({
      data: questions.map((q) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        options: q.options ?? [],
        correctAnswer: String(q.correctAnswer),
        difficulty: q.difficulty,
        explanation: q.explanation,
      })),
    });
  }
  const pCount = await prisma.player.count();
  if (pCount === 0) {
    await prisma.player.createMany({
      data: players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        joinedAt: new Date(p.joinedAt),
      })),
    });
  }
  const lCount = await prisma.lobby.count();
  if (lCount === 0) {
    await prisma.lobby.createMany({
      data: lobbies.map((l) => ({
        id: l.id,
        name: l.name,
        players: l.players,
        maxPlayers: l.maxPlayers,
        gameMode: l.gameMode,
        isActive: l.isActive,
        createdAt: new Date(l.createdAt),
      })),
    });
  }
  const gmCount = await prisma.gameMode.count();
  if (gmCount === 0) {
    await prisma.gameMode.createMany({
      data: Object.entries(gameModes).map(([id, gm]) => ({
        id,
        label: gm.label,
        description: gm.description,
        color: gm.color,
        icon: gm.icon,
      })),
    });
  }
}

initDb().catch((err) => console.error(err));

app.get("/api/questions", async (_req, res) => {
  try {
    const data = await prisma.question.findMany();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get("/api/players", async (_req, res) => {
  try {
    const data = await prisma.player.findMany();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post("/api/players", async (req, res) => {
  const { name, score } = req.body as { name?: string; score?: number };
  if (!name || typeof score !== "number") {
    return res.status(400).json({ error: "Name and score required" });
  }
  try {
    const id = Date.now().toString();
    const joinedAt = new Date();
    const player = await prisma.player.create({
      data: { id, name, score, joinedAt },
    });
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get("/api/lobbies", async (_req, res) => {
  try {
    const data = await prisma.lobby.findMany();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get("/api/game-modes", async (_req, res) => {
  try {
    const rows = await prisma.gameMode.findMany();
    const data: Record<string, any> = {};
    rows.forEach((r) => {
      data[r.id] = {
        label: r.label,
        description: r.description,
        color: r.color,
        icon: r.icon,
      };
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(Number(PORT), () => {
  console.log(`Backend listening on port ${PORT}`);
});
