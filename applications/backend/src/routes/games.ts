import { Request, Response, Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/errorHandler";
import { submitAnswerSchema } from "../validation/schemas";

const router = Router();

// GET /api/games/:lobbyId - Get game state for lobby
router.get(
  "/:lobbyId",
  asyncHandler(async (req: Request, res: Response) => {
    const { lobbyId } = req.params;

    try {
      const gameState = await prisma.gameState.findUnique({
        where: { lobbyId },
        include: {
          lobby: {
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
            },
          },
          gameAnswers: {
            include: {
              player: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!gameState) {
        return res.status(404).json({ error: "Game not found" });
      }

      res.json(gameState);
    } catch (error) {
      console.error("Error fetching game state:", error);
      res.status(500).json({ error: "Failed to fetch game state" });
    }
  })
);

// GET /api/games/:lobbyId/question - Get current question for game
router.get(
  "/:lobbyId/question",
  asyncHandler(async (req: Request, res: Response) => {
    const { lobbyId } = req.params;

    try {
      const gameState = await prisma.gameState.findUnique({
        where: { lobbyId },
      });

      if (!gameState) {
        return res.status(404).json({ error: "Game not found" });
      }

      if (!gameState.isActive) {
        return res.status(400).json({ error: "Game is not active" });
      }

      const questionIds = gameState.questionIds as string[];
      const currentQuestionId = questionIds[gameState.currentQuestion];

      if (!currentQuestionId) {
        return res.status(400).json({ error: "No current question" });
      }

      const question = await prisma.question.findUnique({
        where: { id: currentQuestionId },
        select: {
          id: true,
          type: true,
          question: true,
          options: true,
          difficulty: true,
          // Don't include correct answer and explanation in response
        },
      });

      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }

      // Transform options for multiple choice questions
      const transformedQuestion = {
        ...question,
        options: question.type === "multiple-choice" ? (question.options as string[]) : undefined,
        questionNumber: gameState.currentQuestion + 1,
        totalQuestions: gameState.totalQuestions,
        timeLimit: 30, // 30 seconds per question
      };

      res.json(transformedQuestion);
    } catch (error) {
      console.error("Error fetching current question:", error);
      res.status(500).json({ error: "Failed to fetch current question" });
    }
  })
);

// POST /api/games/:lobbyId/answer - Submit answer to current question
router.post(
  "/:lobbyId/answer",
  asyncHandler(async (req: Request, res: Response) => {
    const { lobbyId } = req.params;

    // Validate input
    const { error, value } = submitAnswerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { questionId, selectedAnswer, timeSpent } = value;
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: "Player ID is required" });
    }

    try {
      const gameState = await prisma.gameState.findUnique({
        where: { lobbyId },
      });

      if (!gameState) {
        return res.status(404).json({ error: "Game not found" });
      }

      if (!gameState.isActive) {
        return res.status(400).json({ error: "Game is not active" });
      }

      // Verify player is in this lobby
      const player = await prisma.player.findFirst({
        where: {
          id: playerId,
          lobbyId,
        },
      });

      if (!player) {
        return res.status(403).json({ error: "Player not in this lobby" });
      }

      // Get the question to check correct answer
      const question = await prisma.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }

      // Check if answer is correct
      const isCorrect = selectedAnswer === question.correctAnswer;

      // Save the answer
      const gameAnswer = await prisma.gameAnswer.create({
        data: {
          questionId,
          selectedAnswer,
          isCorrect,
          timeSpent,
          playerId,
          gameStateId: gameState.id,
        },
      });

      res.json({
        answerId: gameAnswer.id,
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
      res.status(500).json({ error: "Failed to submit answer" });
    }
  })
);

// POST /api/games/:lobbyId/next-question - Move to next question (host only)
router.post(
  "/:lobbyId/next-question",
  asyncHandler(async (req: Request, res: Response) => {
    const { lobbyId } = req.params;
    const { hostId } = req.body;

    try {
      const gameState = await prisma.gameState.findUnique({
        where: { lobbyId },
        include: {
          lobby: true,
        },
      });

      if (!gameState) {
        return res.status(404).json({ error: "Game not found" });
      }

      // Verify host permissions
      if (gameState.lobby.hostId !== hostId) {
        return res.status(403).json({ error: "Only host can advance questions" });
      }

      const nextQuestionIndex = gameState.currentQuestion + 1;

      if (nextQuestionIndex >= gameState.totalQuestions) {
        // Game is finished
        await prisma.gameState.update({
          where: { id: gameState.id },
          data: {
            isActive: false,
            isCompleted: true,
          },
        });

        await prisma.lobby.update({
          where: { id: lobbyId },
          data: { status: "FINISHED" },
        });

        return res.json({ gameCompleted: true });
      }

      // Move to next question
      const updatedGameState = await prisma.gameState.update({
        where: { id: gameState.id },
        data: {
          currentQuestion: nextQuestionIndex,
          questionStartTime: new Date(),
        },
      });

      res.json({ gameState: updatedGameState });
    } catch (error) {
      console.error("Error advancing to next question:", error);
      res.status(500).json({ error: "Failed to advance to next question" });
    }
  })
);

// GET /api/games/:lobbyId/results - Get game results
router.get(
  "/:lobbyId/results",
  asyncHandler(async (req: Request, res: Response) => {
    const { lobbyId } = req.params;

    try {
      const gameState = await prisma.gameState.findUnique({
        where: { lobbyId },
        include: {
          lobby: {
            include: {
              players: true,
            },
          },
          gameAnswers: {
            include: {
              player: {
                select: {
                  id: true,
                  name: true,
                },
              },
              question: {
                select: {
                  id: true,
                  question: true,
                  correctAnswer: true,
                  explanation: true,
                },
              },
            },
          },
        },
      });

      if (!gameState) {
        return res.status(404).json({ error: "Game not found" });
      }

      // Calculate player scores
      const playerScores: Record<string, any> = {};

      gameState.lobby.players.forEach((player) => {
        playerScores[player.id] = {
          playerId: player.id,
          playerName: player.name,
          correctAnswers: 0,
          totalAnswers: 0,
          score: 0,
          answers: [],
        };
      });

      gameState.gameAnswers.forEach((answer) => {
        const playerScore = playerScores[answer.playerId];
        if (playerScore) {
          playerScore.totalAnswers++;
          if (answer.isCorrect) {
            playerScore.correctAnswers++;
            // Simple scoring: 100 points per correct answer, bonus for speed
            const speedBonus = Math.max(0, 30 - answer.timeSpent) * 2;
            playerScore.score += 100 + speedBonus;
          }
          playerScore.answers.push({
            questionId: answer.questionId,
            question: answer.question.question,
            selectedAnswer: answer.selectedAnswer,
            correctAnswer: answer.question.correctAnswer,
            isCorrect: answer.isCorrect,
            timeSpent: answer.timeSpent,
            explanation: answer.question.explanation,
          });
        }
      });

      // Sort players by score
      const sortedResults = Object.values(playerScores).sort((a: any, b: any) => b.score - a.score);

      res.json({
        gameState: {
          isCompleted: gameState.isCompleted,
          totalQuestions: gameState.totalQuestions,
          lobbyName: gameState.lobby.name,
          gameMode: gameState.lobby.gameMode,
        },
        results: sortedResults,
      });
    } catch (error) {
      console.error("Error fetching game results:", error);
      res.status(500).json({ error: "Failed to fetch game results" });
    }
  })
);

export default router;
