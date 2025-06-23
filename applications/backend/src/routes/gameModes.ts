import { Request, Response, Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { createGameModeSchema } from "../validation/schemas";

const router = Router();

// GET /api/game-modes - Get all game modes
router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    try {
      const gameModes = await prisma.gameMode.findMany({
        where: { isActive: true },
        orderBy: { id: "asc" },
      });

      // Transform to object format expected by frontend
      const gameModesObject: Record<string, any> = {};
      for (const mode of gameModes) {
        gameModesObject[mode.id] = {
          label: mode.label,
          description: mode.description,
          color: mode.color,
          icon: mode.icon,
        };
      }

      res.json(gameModesObject);
    } catch (error) {
      console.error("Error fetching game modes:", error);
      res.status(500).json({ error: "Failed to fetch game modes" });
    }
  })
);

// GET /api/game-modes/list - Get game modes as array
router.get(
  "/list",
  asyncHandler(async (_req: Request, res: Response) => {
    try {
      const gameModes = await prisma.gameMode.findMany({
        where: { isActive: true },
        orderBy: { id: "asc" },
      });

      res.json(gameModes);
    } catch (error) {
      console.error("Error fetching game modes:", error);
      res.status(500).json({ error: "Failed to fetch game modes" });
    }
  })
);

// GET /api/game-modes/:id - Get specific game mode
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const gameMode = await prisma.gameMode.findUnique({
        where: { id },
      });

      if (!gameMode) {
        return res.status(404).json({ error: "Game mode not found" });
      }

      res.json(gameMode);
    } catch (error) {
      console.error("Error fetching game mode:", error);
      res.status(500).json({ error: "Failed to fetch game mode" });
    }
  })
);

// POST /api/game-modes - Create new game mode
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate input
    const { error, value } = createGameModeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    try {
      const gameMode = await prisma.gameMode.create({
        data: value,
      });

      res.status(201).json(gameMode);
    } catch (error) {
      console.error("Error creating game mode:", error);
      res.status(500).json({ error: "Failed to create game mode" });
    }
  })
);

// PUT /api/game-modes/:id - Update game mode
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    try {
      const gameMode = await prisma.gameMode.update({
        where: { id },
        data: updates,
      });

      res.json(gameMode);
    } catch (error) {
      console.error("Error updating game mode:", error);
      res.status(500).json({ error: "Failed to update game mode" });
    }
  })
);

// DELETE /api/game-modes/:id - Delete game mode (soft delete by setting isActive to false)
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await prisma.gameMode.update({
        where: { id },
        data: { isActive: false },
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting game mode:", error);
      res.status(500).json({ error: "Failed to delete game mode" });
    }
  })
);

export default router;
