import { Request, Response, Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

const generateCode = async (): Promise<string> => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  const exists = await prisma.lobby.findUnique({ where: { code } });
  return exists ? generateCode() : code;
};

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, gameMode, hostName } = req.body as {
      name: string;
      gameMode: string;
      hostName: string;
    };
    if (!name || !gameMode || !hostName) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const host = await prisma.player.create({
      data: {
        name: hostName,
        isHost: true,
      },
    });
    const code = await generateCode();
    const lobby = await prisma.lobby.create({
      data: {
        name,
        code,
        gameMode,
        hostId: host.id,
        status: "WAITING",
      },
    });
    await prisma.player.update({
      where: { id: host.id },
      data: { lobbyId: lobby.id },
    });
    return res.status(201).json({
      lobbyId: lobby.id,
      code: lobby.code,
      hostId: host.id,
      name: lobby.name,
      gameMode: lobby.gameMode,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create lobby" });
  }
});

router.post("/join", async (req: Request, res: Response) => {
  try {
    const { code, playerName } = req.body as {
      code: string;
      playerName: string;
    };
    if (!code || !playerName) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const lobby = await prisma.lobby.findUnique({
      where: { code: code.toUpperCase() },
      include: { players: true },
    });
    if (!lobby || lobby.status !== "WAITING") {
      return res.status(404).json({ error: "Lobby not joinable" });
    }
    if (lobby.maxPlayers && lobby.players.length >= lobby.maxPlayers) {
      return res.status(400).json({ error: "Lobby full" });
    }
    const player = await prisma.player.create({
      data: {
        name: playerName,
        lobbyId: lobby.id,
        isHost: false,
      },
    });
    const players = await prisma.player.findMany({
      where: { lobbyId: lobby.id },
      select: { id: true, name: true, isHost: true },
    });
    return res.status(201).json({ lobbyId: lobby.id, playerId: player.id, players });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to join lobby" });
  }
});

router.get("/:lobbyId", async (req: Request, res: Response) => {
  const { lobbyId } = req.params;
  try {
    const lobby = await prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: {
        players: { select: { id: true, name: true, isHost: true } },
      },
    });
    if (!lobby) {
      return res.status(404).json({ error: "Lobby not found" });
    }
    return res.json({
      lobbyId: lobby.id,
      code: lobby.code,
      name: lobby.name,
      gameMode: lobby.gameMode,
      status: lobby.status,
      players: lobby.players,
      hostId: lobby.hostId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch lobby" });
  }
});

router.post("/:lobbyId/start", async (req: Request, res: Response) => {
  const { lobbyId } = req.params;
  const { playerId } = req.body as { playerId: string };
  try {
    const lobby = await prisma.lobby.findUnique({ where: { id: lobbyId } });
    if (!lobby) return res.status(404).json({ error: "Lobby not found" });
    if (lobby.hostId !== playerId) {
      return res.status(403).json({ error: "Only host can start" });
    }
    const questions = await prisma.question.findMany({
      where: { difficulty: lobby.gameMode },
      take: 5,
    });
    const gameState = await prisma.gameState.create({
      data: {
        lobbyId: lobby.id,
        totalQuestions: questions.length,
        questionIds: questions.map((q: { id: string }) => q.id),
        currentQuestion: 0,
        isActive: true,
      },
    });
    await prisma.lobby.update({
      where: { id: lobby.id },
      data: { status: "IN_PROGRESS" },
    });
    return res.json({ gameStateId: gameState.id, questionIds: gameState.questionIds });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to start" });
  }
});

// POST /:lobbyId/cleanup - Clean up lobby and move players to leaderboard
router.post("/:lobbyId/cleanup", async (req: Request, res: Response) => {
  const { lobbyId } = req.params;
  try {
    // Get all players in the lobby with their final scores from game answers
    const lobby = await prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: {
        players: true,
        gameState: {
          include: {
            gameAnswers: true,
          },
        },
      },
    });

    if (!lobby) {
      return res.status(404).json({ error: "Lobby not found" });
    }

    // Calculate final scores for each player
    const playerScores: Record<string, number> = {};

    if (lobby.gameState) {
      // Initialize scores
      lobby.players.forEach((player: { id: string }) => {
        playerScores[player.id] = 0;
      });

      // Calculate scores from correct answers
      lobby.gameState.gameAnswers.forEach((answer: { isCorrect: boolean; playerId: string }) => {
        if (answer.isCorrect) {
          playerScores[answer.playerId] = (playerScores[answer.playerId] || 0) + 100;
        }
      });
    }

    // Update players with final scores and remove lobby association
    await Promise.all(
      lobby.players.map(async (player: { id: string; score: number }) => {
        const finalScore = playerScores[player.id] || 0;

        await prisma.player.update({
          where: { id: player.id },
          data: {
            score: Math.max(player.score, finalScore), // Keep highest score
            lobbyId: null, // Remove from lobby
            isHost: false, // Reset host status
          },
        });
      })
    );

    // Mark lobby as finished
    await prisma.lobby.update({
      where: { id: lobbyId },
      data: { status: "FINISHED" },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cleanup lobby" });
  }
});

export default router;
