import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";

interface JoinPayload {
  lobbyId: string;
  playerId: string;
}

interface AnswerPayload {
  lobbyId: string;
  playerId: string;
  questionId: string;
  answer: string | boolean | null;
}

interface NextPayload {
  lobbyId: string;
  playerId: string;
}

/**
 * Helper to compute results at the end of the game
 */
async function computeResults(lobbyId: string) {
  const gameState = await prisma.gameState.findUnique({
    where: { lobbyId },
    include: {
      lobby: { include: { players: true } },
      gameAnswers: true,
    },
  });
  if (!gameState) return [];
  const scores: Record<string, number> = {};
  for (const p of gameState.lobby.players as { id: string; name: string }[]) {
    scores[p.id] = 0;
  }
  for (const ans of gameState.gameAnswers as { isCorrect: boolean; playerId: string }[]) {
    if (ans.isCorrect) scores[ans.playerId] += 100;
  }
  return (gameState.lobby.players as { id: string; name: string }[])
    .map((pl: { id: string; name: string }) => ({
      playerId: pl.id,
      name: pl.name,
      score: scores[pl.id] || 0,
    }))
    .sort((a: { score: number }, b: { score: number }) => b.score - a.score);
}

export function setupSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("Socket connected", socket.id);

    socket.on("join", async ({ lobbyId, playerId }: JoinPayload) => {
      console.log("join", lobbyId, playerId);
      socket.join(lobbyId);
      try {
        await prisma.session.upsert({
          where: { id: playerId },
          create: { playerId, socketId: socket.id },
          update: { socketId: socket.id, isActive: true, lastSeen: new Date() },
        });

        const gameState = await prisma.gameState.findUnique({ where: { lobbyId } });
        if (!gameState) {
          socket.emit("error", { message: "Game not found" });
          return;
        }
        const qIds = gameState.questionIds as string[];
        const qId = qIds[gameState.currentQuestion];
        const question = await prisma.question.findUnique({ where: { id: qId } });
        const answers = await prisma.gameAnswer.findMany({
          where: { playerId, gameStateId: gameState.id },
        });
        const score =
          (answers as { isCorrect: boolean }[]).filter((ans) => ans.isCorrect).length * 100;
        const playerAnswer = (
          answers as { questionId: string; selectedAnswer: string | null; isCorrect: boolean }[]
        ).find((ans) => ans.questionId === qId);

        socket.emit("state", {
          questionId: question?.id,
          question: question?.question,
          options: question?.options,
          type: question?.type,
          number: gameState.currentQuestion + 1,
          total: gameState.totalQuestions,
          startTime: gameState.questionStartTime,
          score,
          playerAnswer: playerAnswer?.selectedAnswer ?? null,
          isCorrect: playerAnswer?.isCorrect ?? null,
          correctAnswer: playerAnswer ? question?.correctAnswer : undefined,
          explanation: playerAnswer ? question?.explanation : undefined,
        });

        // Send current answered players count
        const lobby = await prisma.lobby.findUnique({
          where: { id: lobbyId },
          include: { players: true },
        });
        if (lobby && question) {
          const currentQuestionAnswers = await prisma.gameAnswer.findMany({
            where: {
              gameStateId: gameState.id,
              questionId: question.id,
            },
          });

          const totalPlayers = lobby.players.length;
          const answeredPlayers = currentQuestionAnswers.length;

          socket.emit("playersAnswered", {
            answered: answeredPlayers,
            total: totalPlayers,
            allAnswered: answeredPlayers >= totalPlayers,
          });
        }
      } catch (err) {
        console.error(err);
        socket.emit("error", { message: "Join failed" });
      }
    });

    socket.on("submitAnswer", async (payload: AnswerPayload) => {
      const { lobbyId, playerId, questionId, answer } = payload;
      console.log("submitAnswer", payload);
      try {
        const question = await prisma.question.findUnique({
          where: { id: questionId },
          select: { correctAnswer: true, explanation: true },
        });
        if (!question) return;
        const isCorrect = String(answer) === question.correctAnswer;
        const gameState = await prisma.gameState.findUnique({ where: { lobbyId } });
        if (!gameState) return;
        await prisma.gameAnswer.create({
          data: {
            questionId,
            selectedAnswer: answer === null ? null : String(answer),
            isCorrect,
            playerId,
            gameStateId: gameState.id,
          },
        });
        const answers = await prisma.gameAnswer.findMany({
          where: { playerId, gameStateId: gameState.id },
        });
        const score =
          (answers as { isCorrect: boolean }[]).filter((ans) => ans.isCorrect).length * 100;
        socket.emit("answerResult", {
          correct: isCorrect,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
        });
        io.to(lobbyId).emit("scoreUpdate", { playerId, score });

        // Check if all players have answered the current question
        const lobby = await prisma.lobby.findUnique({
          where: { id: lobbyId },
          include: { players: true },
        });
        if (lobby) {
          const currentQuestionAnswers = await prisma.gameAnswer.findMany({
            where: {
              gameStateId: gameState.id,
              questionId,
            },
          });

          const totalPlayers = lobby.players.length;
          const answeredPlayers = currentQuestionAnswers.length;

          // Emit to all players in the lobby how many have answered
          io.to(lobbyId).emit("playersAnswered", {
            answered: answeredPlayers,
            total: totalPlayers,
            allAnswered: answeredPlayers >= totalPlayers,
          });
        }
      } catch (err) {
        console.error(err);
        socket.emit("error", { message: "Answer failed" });
      }
    });

    socket.on("nextQuestion", async ({ lobbyId, playerId }: NextPayload) => {
      console.log("nextQuestion", lobbyId, playerId);
      try {
        const lobby = await prisma.lobby.findUnique({ where: { id: lobbyId } });
        if (!lobby || lobby.hostId !== playerId) {
          socket.emit("error", { message: "Only host can advance" });
          return;
        }
        const gameState = await prisma.gameState.findUnique({ where: { lobbyId } });
        if (!gameState) return;
        let next = gameState.currentQuestion + 1;
        if (next >= gameState.totalQuestions) {
          await prisma.gameState.update({
            where: { id: gameState.id },
            data: { isActive: false, isCompleted: true },
          });
          await prisma.lobby.update({ where: { id: lobbyId }, data: { status: "FINISHED" } });
          const results = await computeResults(lobbyId);
          io.to(lobbyId).emit("gameEnded", { results });
          return;
        }
        await prisma.gameState.update({
          where: { id: gameState.id },
          data: { currentQuestion: next, questionStartTime: new Date() },
        });
        const qIds = gameState.questionIds as string[];
        const qId = qIds[next];
        const question = await prisma.question.findUnique({ where: { id: qId } });
        io.to(lobbyId).emit("newQuestion", {
          questionId: question?.id,
          question: question?.question,
          options: question?.options,
          type: question?.type,
          number: next + 1,
          total: gameState.totalQuestions,
          startTime: new Date(),
        });

        // Reset players answered count for new question
        const lobbyWithPlayers = await prisma.lobby.findUnique({
          where: { id: lobbyId },
          include: { players: true },
        });
        if (lobbyWithPlayers) {
          io.to(lobbyId).emit("playersAnswered", {
            answered: 0,
            total: lobbyWithPlayers.players.length,
            allAnswered: false,
          });
        }
      } catch (err) {
        console.error(err);
        socket.emit("error", { message: "Failed to advance" });
      }
    });

    socket.on("disconnect", async () => {
      console.log("disconnect", socket.id);
      await prisma.session.updateMany({
        where: { socketId: socket.id },
        data: { isActive: false },
      });
    });
  });
}
