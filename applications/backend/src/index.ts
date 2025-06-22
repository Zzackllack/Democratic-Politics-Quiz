import { PrismaClient, LobbyStatus } from "@prisma/client";
import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { gameModes, lobbies, players, questions } from "./mockData";

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

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
        lobbyId: p.lobbyId,
        isHost: p.isHost,
        score: p.score,
        joinedAt: new Date(p.joinedAt),
        browserSessionId: p.browserSessionId,
      })),
    });
  }
  const lCount = await prisma.lobby.count();
  if (lCount === 0) {
    await prisma.lobby.createMany({
      data: lobbies.map((l) => ({
        id: l.id,
        code: l.code,
        createdAt: new Date(l.createdAt),
        hostId: l.hostId,
        maxPlayers: l.maxPlayers,
        status: l.status as LobbyStatus,
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

io.on("connection", (socket) => {
  socket.on("joinRoom", (lobbyId: string) => {
    socket.join(lobbyId);
  });
});

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
  const { name, score, browserSessionId } = req.body as {
    name?: string;
    score?: number;
    browserSessionId?: string;
  };
  if (!name || typeof score !== "number" || !browserSessionId) {
    return res.status(400).json({ error: "Missing fields" });
  }
  try {
    const joinedAt = new Date();
    const player = await prisma.player.create({
      data: { name, score, joinedAt, browserSessionId },
    });
    res.json(player);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.get("/api/lobbies", async (_req, res) => {
  try {
    const data = await prisma.lobby.findMany({ include: { players: true, host: true } });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post("/api/lobby/create", async (req, res) => {
  const { name, maxPlayers, browserSessionId } = req.body as {
    name?: string;
    maxPlayers?: number;
    browserSessionId?: string;
  };
  if (!name || !maxPlayers || !browserSessionId) {
    return res.status(400).json({ error: "Missing fields" });
  }
  try {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const host = await prisma.player.create({
      data: {
        name,
        isHost: true,
        browserSessionId,
      },
    });
    const lobby = await prisma.lobby.create({
      data: {
        code,
        hostId: host.id,
        maxPlayers,
      },
      include: { players: true, host: true },
    });
    await prisma.player.update({
      where: { id: host.id },
      data: { lobbyId: lobby.id },
    });
    res.json(lobby);
    io.to(lobby.id).emit("lobby:update", lobby);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post("/api/lobby/join", async (req, res) => {
  const { code, name, browserSessionId } = req.body as {
    code?: string;
    name?: string;
    browserSessionId?: string;
  };
  if (!code || !name || !browserSessionId) {
    return res.status(400).json({ error: "Missing fields" });
  }
  try {
    const lobby = await prisma.lobby.findFirst({ where: { code }, include: { players: true } });
    if (!lobby || lobby.status !== "waiting" || lobby.players.length >= lobby.maxPlayers) {
      return res.status(400).json({ error: "Cannot join lobby" });
    }
    const existing = await prisma.player.findFirst({
      where: { browserSessionId, lobbyId: lobby.id },
    });
    if (existing) {
      return res.status(400).json({ error: "Already joined" });
    }
    const player = await prisma.player.create({
      data: {
        name,
        lobbyId: lobby.id,
        browserSessionId,
      },
    });
    const updated = await prisma.lobby.findUnique({
      where: { id: lobby.id },
      include: { players: true, host: true },
    });
    res.json(updated);
    io.to(lobby.id).emit("lobby:update", updated);
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
server.listen(Number(PORT), () => {
  console.log(`Backend listening on port ${PORT}`);
});
