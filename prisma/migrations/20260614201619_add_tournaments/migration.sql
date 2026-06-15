-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'setup',
    "format" TEXT NOT NULL DEFAULT 'round_robin',
    "doubleRound" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "creatorId" TEXT NOT NULL,
    CONSTRAINT "Tournament_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TournamentEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "touchdownsFor" INTEGER NOT NULL DEFAULT 0,
    "touchdownsAgainst" INTEGER NOT NULL DEFAULT 0,
    "casualtiesFor" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "tournamentId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    CONSTRAINT "TournamentEntry_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TournamentEntry_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Match" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "round" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "homeScore" INTEGER NOT NULL DEFAULT 0,
    "awayScore" INTEGER NOT NULL DEFAULT 0,
    "half" INTEGER NOT NULL DEFAULT 1,
    "turn" INTEGER NOT NULL DEFAULT 1,
    "activeTeam" TEXT NOT NULL DEFAULT 'home',
    "weather" TEXT,
    "notes" TEXT,
    "playedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "leagueId" TEXT,
    "tournamentId" TEXT,
    CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Match" ("activeTeam", "awayScore", "awayTeamId", "createdAt", "half", "homeScore", "homeTeamId", "id", "leagueId", "notes", "playedAt", "round", "status", "turn", "updatedAt", "weather") SELECT "activeTeam", "awayScore", "awayTeamId", "createdAt", "half", "homeScore", "homeTeamId", "id", "leagueId", "notes", "playedAt", "round", "status", "turn", "updatedAt", "weather" FROM "Match";
DROP TABLE "Match";
ALTER TABLE "new_Match" RENAME TO "Match";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TournamentEntry_tournamentId_teamId_key" ON "TournamentEntry"("tournamentId", "teamId");
