import { Request, Response, Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/:lobbyId/question", async (req: Request, res: Response) => {
  const { lobbyId } = req.params;
  try {
    const gameState = await prisma.gameState.findUnique({ where: { lobbyId } });
    if (!gameState || !gameState.isActive) {
      return res.status(404).json({ error: "Game not active" });
    }
    const ids = gameState.questionIds as string[];
    const questionId = ids[gameState.currentQuestion];
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        type: true,
        question: true,
        options: true,
      },
    });
    if (!question) return res.status(404).json({ error: "Question not found" });
    return res.json({
      questionId: question.id,
      type: question.type,
      question: question.question,
      options: question.options,
      number: gameState.currentQuestion + 1,
      total: gameState.totalQuestions,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to get question" });
  }
});

router.post("/:lobbyId/answer", async (req: Request, res: Response) => {
  const { lobbyId } = req.params;
  const { playerId, questionId, selectedAnswer } = req.body as {
    playerId: string;
    questionId: string;
    selectedAnswer: string;
  };
  try {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        correctAnswer: true,
        explanation: true,
      },
    });
    if (!question) return res.status(404).json({ error: "Question not found" });

    const isCorrect = question.correctAnswer === selectedAnswer;
    const gameState = await prisma.gameState.findUnique({ where: { lobbyId } });
    if (!gameState) return res.status(404).json({ error: "Game not found" });

    await prisma.gameAnswer.create({
      data: {
        questionId,
        selectedAnswer,
        isCorrect,
        playerId,
        gameStateId: gameState.id,
      },
    });

    return res.json({
      correct: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to submit answer" });
  }
});

router.post("/:lobbyId/next", async (req: Request, res: Response) => {
  const { lobbyId } = req.params;
  const { playerId } = req.body as { playerId: string };
  try {
    const lobby = await prisma.lobby.findUnique({ where: { id: lobbyId } });
    if (!lobby) return res.status(404).json({ error: "Lobby not found" });
    if (lobby.hostId !== playerId) return res.status(403).json({ error: "Only host" });
    const gameState = await prisma.gameState.findUnique({ where: { lobbyId } });
    if (!gameState) return res.status(404).json({ error: "Game not found" });
    const next = gameState.currentQuestion + 1;
    if (next >= gameState.totalQuestions) {
      await prisma.gameState.update({
        where: { id: gameState.id },
        data: { isActive: false, isCompleted: true },
      });
      await prisma.lobby.update({ where: { id: lobbyId }, data: { status: "FINISHED" } });
      return res.json({ finished: true });
    }
    const updated = await prisma.gameState.update({
      where: { id: gameState.id },
      data: { currentQuestion: next },
    });
    return res.json({ currentQuestion: updated.currentQuestion });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to advance" });
  }
});

router.get("/:lobbyId/results", async (req: Request, res: Response) => {
  const { lobbyId } = req.params;
  try {
    const gameState = await prisma.gameState.findUnique({
      where: { lobbyId },
      include: { gameAnswers: true, lobby: { include: { players: true } } },
    });
    if (!gameState) return res.status(404).json({ error: "Game not found" });
    const scores: Record<string, number> = {};
    for (const p of gameState.lobby.players) {
      scores[p.id] = 0;
    }
    for (const a of gameState.gameAnswers) {
      if (a.isCorrect) scores[a.playerId] += 1;
    }
    const results = gameState.lobby.players.map((p: { id: string; name: string }) => ({
      playerId: p.id,
      name: p.name,
      score: scores[p.id] || 0,
    }));
    results.sort((a: { score: number }, b: { score: number }) => b.score - a.score);
    return res.json({ results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to get results" });
  }
});

export default router;
