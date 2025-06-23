import { Request, Response, Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { createLobbySchema } from "../validation/schemas";

const router = Router();

// Helper function to generate lobby code
const generateLobbyCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// GET /api/lobbies - Get all lobbies
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const lobbies = await prisma.lobby.findMany({
        include: {
          players: {
            select: {
              id: true,
              name: true,
              score: true,
              isHost: true,
              isOnline: true,
            },
          },
          host: {
            select: {
              id: true,
              name: true,
            },
          },
          gameState: {
            select: {
              id: true,
              isActive: true,
              currentQuestion: true,
              totalQuestions: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json(lobbies);
    } catch (error) {
      console.error("Error fetching lobbies:", error);
      res.status(500).json({ error: "Failed to fetch lobbies" });
    }
  })
);

// GET /api/lobbies/:id - Get specific lobby
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const lobby = await prisma.lobby.findUnique({
        where: { id },
        include: {
          players: {
            select: {
              id: true,
              name: true,
              score: true,
              isHost: true,
              isOnline: true,
            },
          },
          host: {
            select: {
              id: true,
              name: true,
            },
          },
          gameState: {
            select: {
              id: true,
              isActive: true,
              currentQuestion: true,
              totalQuestions: true,
              questionIds: true,
            },
          },
        },
      });

      if (!lobby) {
        return res.status(404).json({ error: "Lobby not found" });
      }

      res.json(lobby);
    } catch (error) {
      console.error("Error fetching lobby:", error);
      res.status(500).json({ error: "Failed to fetch lobby" });
    }
  })
);

// POST /api/lobbies - Create new lobby
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const { error, value } = createLobbySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, maxPlayers, gameMode, hostId } = value;

    try {
      // Verify host exists
      const host = await prisma.player.findUnique({
        where: { id: hostId },
      });

      if (!host) {
        return res.status(400).json({ error: "Host player not found" });
      }

      // Generate unique lobby code
      let code: string;
      let isUnique = false;
      let attempts = 0;

      while (!isUnique && attempts < 10) {
        code = generateLobbyCode();
        const existing = await prisma.lobby.findUnique({
          where: { code },
        });
        if (!existing) {
          isUnique = true;
        }
        attempts++;
      }

      if (!isUnique) {
        return res.status(500).json({ error: "Failed to generate unique lobby code" });
      }

      // Create lobby
      const lobby = await prisma.lobby.create({
        data: {
          name,
          code: code!,
          maxPlayers,
          gameMode,
          hostId,
          status: "WAITING",
        },
        include: {
          players: {
            select: {
              id: true,
              name: true,
              score: true,
              isHost: true,
              isOnline: true,
            },
          },
          host: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Update host player to be in this lobby
      await prisma.player.update({
        where: { id: hostId },
        data: {
          lobbyId: lobby.id,
          isHost: true,
        },
      });

      res.status(201).json(lobby);
    } catch (error) {
      console.error("Error creating lobby:", error);
      res.status(500).json({ error: "Failed to create lobby" });
    }
  })
);

// POST /api/lobbies/:id/join - Join a lobby
router.post(
  "/:id/join",
  asyncHandler(async (req: Request, res: Response) => {
    const { id: lobbyId } = req.params;
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: "Player ID is required" });
    }

    try {
      // Check if lobby exists and has space
      const lobby = await prisma.lobby.findUnique({
        where: { id: lobbyId },
        include: {
          players: true,
        },
      });

      if (!lobby) {
        return res.status(404).json({ error: "Lobby not found" });
      }

      if (lobby.status !== "WAITING") {
        return res.status(400).json({ error: "Lobby is not accepting new players" });
      }

      if (lobby.players.length >= lobby.maxPlayers) {
        return res.status(400).json({ error: "Lobby is full" });
      }

      // Check if player is already in lobby
      let isAlreadyInLobby = false;
      for (const player of lobby.players) {
        if (player.id === playerId) {
          isAlreadyInLobby = true;
          break;
        }
      }
      if (isAlreadyInLobby) {
        return res.status(400).json({ error: "Player is already in this lobby" });
      }

      // Add player to lobby
      await prisma.player.update({
        where: { id: playerId },
        data: {
          lobbyId,
          isHost: false,
        },
      });

      // Get updated lobby
      const updatedLobby = await prisma.lobby.findUnique({
        where: { id: lobbyId },
        include: {
          players: {
            select: {
              id: true,
              name: true,
              score: true,
              isHost: true,
              isOnline: true,
            },
          },
          host: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json(updatedLobby);
    } catch (error) {
      console.error("Error joining lobby:", error);
      res.status(500).json({ error: "Failed to join lobby" });
    }
  })
);

// POST /api/lobbies/:id/leave - Leave a lobby
router.post(
  "/:id/leave",
  asyncHandler(async (req: Request, res: Response) => {
    const { id: lobbyId } = req.params;
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: "Player ID is required" });
    }

    try {
      const lobby = await prisma.lobby.findUnique({
        where: { id: lobbyId },
        include: { players: true },
      });

      if (!lobby) {
        return res.status(404).json({ error: "Lobby not found" });
      }

      // Remove player from lobby
      await prisma.player.update({
        where: { id: playerId },
        data: {
          lobbyId: null,
          isHost: false,
        },
      });

      // If the host left, either assign new host or delete lobby
      if (lobby.hostId === playerId) {
        const remainingPlayers = lobby.players.filter((player: { id: string }) => player.id !== playerId);

        if (remainingPlayers.length > 0) {
          // Assign first remaining player as new host
          const newHost = remainingPlayers[0];
          await prisma.lobby.update({
            where: { id: lobbyId },
            data: { hostId: newHost.id },
          });
          await prisma.player.update({
            where: { id: newHost.id },
            data: { isHost: true },
          });
        } else {
          // Delete empty lobby
          await prisma.lobby.delete({
            where: { id: lobbyId },
          });
          return res.status(204).send();
        }
      }

      // Get updated lobby
      const updatedLobby = await prisma.lobby.findUnique({
        where: { id: lobbyId },
        include: {
          players: {
            select: {
              id: true,
              name: true,
              score: true,
              isHost: true,
              isOnline: true,
            },
          },
          host: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.json(updatedLobby);
    } catch (error) {
      console.error("Error leaving lobby:", error);
      res.status(500).json({ error: "Failed to leave lobby" });
    }
  })
);

// POST /api/lobbies/:id/start - Start game in lobby
router.post(
  "/:id/start",
  asyncHandler(async (req: Request, res: Response) => {
    const { id: lobbyId } = req.params;
    const { hostId } = req.body;

    try {
      const lobby = await prisma.lobby.findUnique({
        where: { id: lobbyId },
        include: { players: true },
      });

      if (!lobby) {
        return res.status(404).json({ error: "Lobby not found" });
      }

      // Verify host permissions
      if (lobby.hostId !== hostId) {
        return res.status(403).json({ error: "Only host can start the game" });
      }

      if (lobby.players.length < 2) {
        return res.status(400).json({ error: "Need at least 2 players to start" });
      }

      // Get questions for the game
      const questions = await prisma.question.findMany({
        where: { difficulty: lobby.gameMode },
        take: 10,
        orderBy: { createdAt: "asc" },
      });

      if (questions.length < 5) {
        return res.status(400).json({ error: "Not enough questions for this difficulty" });
      }

      // Create game state
      const gameState = await prisma.gameState.create({
        data: {
          lobbyId,
          totalQuestions: Math.min(questions.length, 10),
          questionIds: questions.slice(0, 10).map((question: { id: string }) => question.id),
          isActive: true,
          questionStartTime: new Date(),
        },
      });

      // Update lobby status
      await prisma.lobby.update({
        where: { id: lobbyId },
        data: { status: "IN_PROGRESS" },
      });

      res.json({ gameState, lobby });
    } catch (error) {
      console.error("Error starting game:", error);
      res.status(500).json({ error: "Failed to start game" });
    }
  })
);

// GET /api/lobbies/code/:code - Find lobby by code
router.get(
  "/code/:code",
  asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params;

    try {
      const lobby = await prisma.lobby.findUnique({
        where: { code: code.toUpperCase() },
        include: {
          players: {
            select: {
              id: true,
              name: true,
              score: true,
              isHost: true,
              isOnline: true,
            },
          },
          host: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!lobby) {
        return res.status(404).json({ error: "Lobby not found" });
      }

      res.json(lobby);
    } catch (error) {
      console.error("Error finding lobby by code:", error);
      res.status(500).json({ error: "Failed to find lobby" });
    }
  })
);

export default router;
