/*
  Warnings:

  - Added the required column `questionIds` to the `GameState` table without a default value. This is not possible if the table is not empty.
  - Made the column `hostId` on table `Lobby` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_lobbyId_fkey";

-- DropIndex
DROP INDEX "Player_browserSessionId_lobbyId_key";

-- AlterTable
ALTER TABLE "GameMode" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "GameState" ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "questionIds" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Lobby" ALTER COLUMN "hostId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "browserSessionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "options" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "socketId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_playerId_idx" ON "Session"("playerId");

-- CreateIndex
CREATE INDEX "Session_socketId_idx" ON "Session"("socketId");

-- CreateIndex
CREATE INDEX "GameAnswer_gameStateId_idx" ON "GameAnswer"("gameStateId");

-- CreateIndex
CREATE INDEX "GameState_isActive_idx" ON "GameState"("isActive");

-- CreateIndex
CREATE INDEX "Lobby_status_idx" ON "Lobby"("status");

-- CreateIndex
CREATE INDEX "Player_score_idx" ON "Player"("score");

-- CreateIndex
CREATE INDEX "Player_browserSessionId_idx" ON "Player"("browserSessionId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_lobbyId_fkey" FOREIGN KEY ("lobbyId") REFERENCES "Lobby"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lobby" ADD CONSTRAINT "Lobby_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameAnswer" ADD CONSTRAINT "GameAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
