import { PrismaClient } from "@prisma/client";
import cors from "cors";
import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
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

app.get("/api/questions", async (req, res) => {
  try {
    const difficulty = typeof req.query.difficulty === "string" ? req.query.difficulty : undefined;

    const data = await prisma.question.findMany(
      difficulty
        ? { where: { difficulty: { equals: difficulty, mode: "insensitive" } } }
        : undefined
    );
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

app.post("/api/lobbies", async (req, res) => {
  const { name, maxPlayers, gameMode } = req.body as {
    name?: string;
    maxPlayers?: number;
    gameMode?: string;
  };
  if (!name || typeof maxPlayers !== "number" || !gameMode) {
    return res.status(400).json({ error: "Invalid lobby data" });
  }
  try {
    const lobby = await prisma.lobby.create({
      data: {
        id: Date.now().toString(),
        name,
        players: [],
        maxPlayers,
        gameMode,
        isActive: true,
        createdAt: new Date(),
      },
    });
    io.emit("lobbyCreated", lobby);
    res.status(201).json(lobby);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post("/api/lobbies/:id/join", async (req, res) => {
  const lobbyId = req.params.id;
  const { playerId, playerName } = req.body as {
    playerId?: string;
    playerName?: string;
  };
  if (!playerId) {
    return res.status(400).json({ error: "Player ID required" });
  }
  try {
    let player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      player = await prisma.player.create({
        data: {
          id: playerId,
          name: playerName || `Spieler ${playerId}`,
          score: 0,
          joinedAt: new Date(),
        },
      });
    }
    const lobby = await prisma.lobby.findUnique({ where: { id: lobbyId } });
    if (!lobby) {
      return res.status(404).json({ error: "Lobby not found" });
    }
    const players = (lobby.players as unknown as string[]) || [];
    if (players.includes(playerId)) {
      return res.status(400).json({ error: "Player already joined" });
    }
    if (players.length >= lobby.maxPlayers) {
      return res.status(403).json({ error: "Lobby full" });
    }
    players.push(playerId);
    const updated = await prisma.lobby.update({
      where: { id: lobbyId },
      data: { players },
    });
    io.emit("playerJoined", { lobbyId, playerId });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get("/api/game-modes", async (_req, res) => {
  try {
    const rows = await prisma.gameMode.findMany();
    const data: Record<string, any> = {};
    rows.forEach(
      (r: { id: string; label: string; description: string; color: string; icon: string }) => {
        data[r.id] = {
          label: r.label,
          description: r.description,
          color: r.color,
          icon: r.icon,
        };
      }
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

const PORT = process.env.PORT || 3001;
const httpServer = http.createServer(app);
export const io = new SocketIOServer(httpServer, { cors: { origin: "*" } });

httpServer.listen(Number(PORT), () => {
  console.log(`Backend listening on port ${PORT}`);
});
