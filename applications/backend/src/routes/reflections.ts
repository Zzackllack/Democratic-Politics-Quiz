import { Request, Response, Router } from "express";
import Joi from "joi";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

// Validation schema for reflection submission
const createReflectionSchema = Joi.object({
  content: Joi.string().min(10).max(10000).required(),
  gameMode: Joi.string()
    .valid("einfach", "mittel", "schwer", "lustig", "einbürgerungstest")
    .required(),
  score: Joi.number().integer().min(0).optional(),
  name: Joi.string().min(1).max(50).optional().allow(""),
  isShared: Joi.boolean().required(),
});

// POST /api/reflections - Submit a reflection
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { error, value } = createReflectionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { content, gameMode, score, name, isShared } = value;

    try {
      const reflection = await prisma.reflection.create({
        data: {
          content,
          gameMode,
          score,
          name: isShared && name ? name : null,
          isShared,
        },
      });

      res.status(201).json({
        id: reflection.id,
        success: true,
        message: isShared
          ? "Deine Reflexion wurde geteilt. Vielen Dank!"
          : "Deine Reflexion wurde gespeichert.",
      });
    } catch (error) {
      console.error("Error creating reflection:", error);
      res.status(500).json({ error: "Fehler beim Speichern der Reflexion" });
    }
  })
);

// GET /api/reflections/shared - Get shared reflections (public)
router.get(
  "/shared",
  asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const gameMode = req.query.gameMode as string;

    const skip = (page - 1) * limit;

    try {
      const where: any = { isShared: true };
      if (gameMode) {
        where.gameMode = gameMode;
      }

      const [reflections, total] = await Promise.all([
        prisma.reflection.findMany({
          where,
          select: {
            id: true,
            name: true,
            content: true,
            gameMode: true,
            score: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.reflection.count({ where }),
      ]);

      res.json({
        reflections,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching shared reflections:", error);
      res.status(500).json({ error: "Fehler beim Laden der Reflexionen" });
    }
  })
);

// GET /api/reflections/stats - Get reflection statistics
router.get(
  "/stats",
  asyncHandler(async (_req: Request, res: Response) => {
    try {
      const [totalReflections, sharedReflections, gameModeStats] = await Promise.all([
        prisma.reflection.count(),
        prisma.reflection.count({ where: { isShared: true } }),
        prisma.reflection.groupBy({
          by: ["gameMode"],
          where: { isShared: true },
          _count: { _all: true },
        }),
      ]);

      res.json({
        total: totalReflections,
        shared: sharedReflections,
        byGameMode: gameModeStats.reduce((acc: any, stat: any) => {
          acc[stat.gameMode] = stat._count._all;
          return acc;
        }, {}),
      });
    } catch (error) {
      console.error("Error fetching reflection stats:", error);
      res.status(500).json({ error: "Fehler beim Laden der Statistiken" });
    }
  })
);

export default router;
