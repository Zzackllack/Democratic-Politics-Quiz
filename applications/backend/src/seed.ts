import { PrismaClient } from "@prisma/client";
import players from "./data/playersBackup";
import { gameModes, questions } from "./data/seedData";

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

  // Import lobbies from player backup (for foreign key integrity)
  if (Array.isArray(players)) {
    // First, import players without assigning lobbyId to satisfy hostId foreign key
    await prisma.player.createMany({
      data: players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        joinedAt: new Date(p.joinedAt),
        browserSessionId: p.browserSessionId,
        isHost: p.isHost,
        isOnline: p.isOnline,
      })),
      skipDuplicates: true,
    });

    // Get all unique lobbyIds from players that are not null
    const lobbyIds = [...new Set(players.map((p) => p.lobbyId).filter((id): id is string => !!id))];
    // Create minimal lobbies for those ids if they don't exist
    for (const lobbyId of lobbyIds) {
      // Check if lobby exists
      const exists = await prisma.lobby.findUnique({ where: { id: lobbyId } });
      if (!exists) {
        // Create a minimal lobby (fill required fields with dummy/default values)
        await prisma.lobby.create({
          data: {
            id: lobbyId,
            code: lobbyId.slice(-6), // Use last 6 chars as code (must be unique)
            name: `Restored Lobby ${lobbyId.slice(-4)}`,
            maxPlayers: 4,
            gameMode: "einfach",
            status: "WAITING",
            hostId:
              players.find((p) => p.lobbyId === lobbyId && p.isHost)?.id ||
              players.find((p) => p.lobbyId === lobbyId)?.id ||
              lobbyId,
          },
        });
      }
    }

    // Update players to set lobbyId after lobbies are created
    for (const p of players) {
      if (p.lobbyId) {
        await prisma.player.update({
          where: { id: p.id },
          data: { lobbyId: p.lobbyId },
        });
      }
    }
    console.log(`Imported ${players.length} players from backup and assigned to lobbies.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
