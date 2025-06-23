import { PrismaClient } from "@prisma/client";
import { questions, gameModes } from "./data/mockData";

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
