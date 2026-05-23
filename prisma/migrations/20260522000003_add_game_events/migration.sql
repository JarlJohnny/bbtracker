ALTER TABLE "Match" ADD COLUMN "half" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Match" ADD COLUMN "turn" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Match" ADD COLUMN "activeTeam" TEXT NOT NULL DEFAULT 'home';

CREATE TABLE "GameEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "matchId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "teamSide" TEXT NOT NULL,
    "playerId" TEXT,
    "playerName" TEXT,
    "targetId" TEXT,
    "targetName" TEXT,
    "injuryResult" TEXT,
    "half" INTEGER NOT NULL,
    "turn" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GameEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "GameEvent_matchId_idx" ON "GameEvent"("matchId");
