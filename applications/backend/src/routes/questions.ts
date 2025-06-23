import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { getQuestionsSchema } from "../validation/schemas";

const router = Router();

// GET /api/questions - Get questions with optional filtering
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate query parameters
    const { error, value } = getQuestionsSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { difficulty, limit = 10, type } = value;

    // Build where clause
    const where: any = {};
    if (difficulty) {
      where.difficulty = { equals: difficulty, mode: "insensitive" };
    }
    if (type) {
      where.type = type;
    }

    try {
      const questions = await prisma.question.findMany({
        where,
        take: parseInt(limit as string),
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          type: true,
          question: true,
          options: true,
          correctAnswer: true,
          difficulty: true,
          explanation: true,
        },
      });

      // Transform options from JSON to array for multiple-choice questions
      const transformedQuestions = questions.map((question: any) => ({
        ...question,
        options:
          question.type === "multiple-choice"
            ? (question.options as string[])
            : undefined,
      }));

      res.json(transformedQuestions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  })
);

// GET /api/questions/:id - Get a specific question
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const question = await prisma.question.findUnique({
        where: { id },
        select: {
          id: true,
          type: true,
          question: true,
          options: true,
          correctAnswer: true,
          difficulty: true,
          explanation: true,
        },
      });

      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }

      // Transform options from JSON to array for multiple-choice questions
      const transformedQuestion = {
        ...question,
        options: question.type === "multiple-choice" ? (question.options as string[]) : undefined,
      };

      res.json(transformedQuestion);
    } catch (error) {
      console.error("Error fetching question:", error);
      res.status(500).json({ error: "Failed to fetch question" });
    }
  })
);

// GET /api/questions/random - Get random questions for a quiz
router.get(
  "/random/:count",
  asyncHandler(async (req: Request, res: Response) => {
    const count = parseInt(req.params.count);
    const { difficulty } = req.query;

    if (isNaN(count) || count < 1 || count > 50) {
      return res.status(400).json({ error: "Count must be between 1 and 50" });
    }

    try {
      // Build where clause
      const where: any = {};
      if (difficulty) {
        where.difficulty = { equals: difficulty as string, mode: "insensitive" };
      }

      const allQuestions = await prisma.question.findMany({ where });
      const shuffled = allQuestions.sort(() => Math.random() - 0.5).slice(0, count);
      const transformedQuestions = shuffled.map((question: any) => ({
        ...question,
        options:
          question.type === "multiple-choice"
            ? (question.options as string[])
            : undefined,
      }));

      res.json(transformedQuestions);
    } catch (error) {
      console.error("Error fetching random questions:", error);
      res.status(500).json({ error: "Failed to fetch random questions" });
    }
  })
);

export default router;
