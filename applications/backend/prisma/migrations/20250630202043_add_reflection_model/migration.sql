-- CreateTable
CREATE TABLE "Reflection" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "content" TEXT NOT NULL,
    "gameMode" TEXT NOT NULL,
    "score" INTEGER,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reflection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reflection_isShared_idx" ON "Reflection"("isShared");

-- CreateIndex
CREATE INDEX "Reflection_gameMode_idx" ON "Reflection"("gameMode");
