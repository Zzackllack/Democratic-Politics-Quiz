import { PrismaClient } from "@prisma/client";
import { questions, players, lobbies, gameModes } from "../src/mockData";

const prisma = new PrismaClient();

async function main() {
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
    skipDuplicates: true,
  });

  await prisma.player.createMany({
    data: players.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      joinedAt: new Date(p.joinedAt),
    })),
    skipDuplicates: true,
  });

  await prisma.lobby.createMany({
    data: lobbies.map((l) => ({
      id: l.id,
      name: l.name,
      players: l.players,
      maxPlayers: l.maxPlayers,
      gameMode: l.gameMode,
      isActive: l.isActive,
      createdAt: new Date(l.createdAt),
    })),
    skipDuplicates: true,
  });

  await prisma.gameMode.createMany({
    data: Object.entries(gameModes).map(([id, gm]) => ({
      id,
      label: gm.label,
      description: gm.description,
      color: gm.color,
      icon: gm.icon,
    })),
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
