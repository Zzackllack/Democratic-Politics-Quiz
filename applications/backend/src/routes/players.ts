import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { createPlayerSchema } from "../validation/schemas";

const router = Router();

// GET /api/players - Get all players (leaderboard)
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const players = await prisma.player.findMany({
        orderBy: { score: "desc" },
        select: {
          id: true,
          name: true,
          score: true,
          joinedAt: true,
          isOnline: true,
        },
      });

      res.json(players);
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ error: "Failed to fetch players" });
    }
  })
);

// GET /api/players/:id - Get specific player
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const player = await prisma.player.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          score: true,
          joinedAt: true,
          isOnline: true,
          lobbyId: true,
          isHost: true,
        },
      });

      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      res.json(player);
    } catch (error) {
      console.error("Error fetching player:", error);
      res.status(500).json({ error: "Failed to fetch player" });
    }
  })
);

// POST /api/players - Create new player or update score
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const { error, value } = createPlayerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, score, browserSessionId } = value;

    try {
      // Check if player with same name exists (for leaderboard updates)
      const existingPlayer = await prisma.player.findFirst({
        where: { name, browserSessionId },
      });

      let player;
      if (existingPlayer) {
        // Update existing player if new score is higher
        if (score > existingPlayer.score) {
          player = await prisma.player.update({
            where: { id: existingPlayer.id },
            data: { score },
            select: {
              id: true,
              name: true,
              score: true,
              joinedAt: true,
              isOnline: true,
            },
          });
        } else {
          player = existingPlayer;
        }
      } else {
        // Create new player
        player = await prisma.player.create({
          data: {
            name,
            score,
            browserSessionId,
            isOnline: true,
          },
          select: {
            id: true,
            name: true,
            score: true,
            joinedAt: true,
            isOnline: true,
          },
        });
      }

      res.json(player);
    } catch (error) {
      console.error("Error creating/updating player:", error);
      res.status(500).json({ error: "Failed to create/update player" });
    }
  })
);

// PUT /api/players/:id - Update player
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    try {
      const player = await prisma.player.update({
        where: { id },
        data: updates,
        select: {
          id: true,
          name: true,
          score: true,
          joinedAt: true,
          isOnline: true,
          lobbyId: true,
          isHost: true,
        },
      });

      res.json(player);
    } catch (error) {
      console.error("Error updating player:", error);
      res.status(500).json({ error: "Failed to update player" });
    }
  })
);

// DELETE /api/players/:id - Delete player
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await prisma.player.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting player:", error);
      res.status(500).json({ error: "Failed to delete player" });
    }
  })
);

// GET /api/players/session/:sessionId - Get player by session ID
router.get(
  "/session/:sessionId",
  asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.params;

    try {
      const player = await prisma.player.findFirst({
        where: { browserSessionId: sessionId },
        select: {
          id: true,
          name: true,
          score: true,
          joinedAt: true,
          isOnline: true,
          lobbyId: true,
          isHost: true,
        },
      });

      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }

      res.json(player);
    } catch (error) {
      console.error("Error fetching player by session:", error);
      res.status(500).json({ error: "Failed to fetch player" });
    }
  })
);

export default router;
