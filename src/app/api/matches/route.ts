import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateSppEarned, calculateLevel } from "@/lib/bb-data";

const playerStatSchema = z.object({
  playerId: z.string(),
  touchdowns: z.number().int().min(0),
  completions: z.number().int().min(0),
  interceptions: z.number().int().min(0),
  casualties: z.number().int().min(0),
  mvp: z.boolean(),
});

const matchSchema = z.object({
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  homeGold: z.number().int().min(0).default(0),
  awayGold: z.number().int().min(0).default(0),
  leagueId: z.string().optional(),
  round: z.number().int().optional(),
  weather: z.string().optional(),
  notes: z.string().optional(),
  homePlayerStats: z.array(playerStatSchema),
  awayPlayerStats: z.array(playerStatSchema),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = matchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const {
    homeTeamId, awayTeamId, homeScore, awayScore,
    homeGold, awayGold,
    leagueId, round, weather, notes,
    homePlayerStats, awayPlayerStats,
  } = parsed.data;

  // Any signed-in coach can record a match, including one between two other
  // coaches' teams (the registrant may not be the home coach).
  const homeTeam = await prisma.team.findFirst({ where: { id: homeTeamId } });
  if (!homeTeam) return NextResponse.json({ error: "Home team not found" }, { status: 404 });

  const awayTeam = await prisma.team.findFirst({ where: { id: awayTeamId } });
  if (!awayTeam) return NextResponse.json({ error: "Away team not found" }, { status: 404 });

  const allStats = [...homePlayerStats, ...awayPlayerStats];

  const homeWin = homeScore > awayScore;
  const awayWin = awayScore > homeScore;
  const draw = homeScore === awayScore;
  const homeCasualties = homePlayerStats.reduce((s, p) => s + p.casualties, 0);
  const awayCasualties = awayPlayerStats.reduce((s, p) => s + p.casualties, 0);

  // Sequential writes (no interactive transaction): the libsql/Turso adapter
  // hangs on long interactive transactions, same as the finish route.
  try {
    const match = await prisma.match.create({
      data: {
        homeTeamId,
        awayTeamId,
        homeScore,
        awayScore,
        leagueId: leagueId || null,
        round: round || null,
        weather: weather || null,
        notes: notes || null,
        status: "completed",
        playedAt: new Date(),
      },
    });

    for (const stat of allStats) {
      const sppEarned = calculateSppEarned(stat);
      await prisma.matchPlayerStat.create({
        data: {
          matchId: match.id,
          playerId: stat.playerId,
          touchdowns: stat.touchdowns,
          completions: stat.completions,
          interceptions: stat.interceptions,
          casualties: stat.casualties,
          mvp: stat.mvp,
          sppEarned,
        },
      });

      const player = await prisma.player.findUnique({ where: { id: stat.playerId } });
      if (player && !player.isDead && !player.isRetired) {
        const newSpp = player.spp + sppEarned;
        await prisma.player.update({
          where: { id: stat.playerId },
          data: { spp: newSpp, level: calculateLevel(newSpp) },
        });
      }
    }

    await prisma.team.update({
      where: { id: homeTeamId },
      data: {
        wins: { increment: homeWin ? 1 : 0 },
        draws: { increment: draw ? 1 : 0 },
        losses: { increment: awayWin ? 1 : 0 },
        touchdownsFor: { increment: homeScore },
        touchdownsAgainst: { increment: awayScore },
        casualtiesFor: { increment: homeCasualties },
        leaguePoints: { increment: homeWin ? 3 : draw ? 1 : 0 },
        treasury: { increment: homeGold },
      },
    });

    await prisma.team.update({
      where: { id: awayTeamId },
      data: {
        wins: { increment: awayWin ? 1 : 0 },
        draws: { increment: draw ? 1 : 0 },
        losses: { increment: homeWin ? 1 : 0 },
        touchdownsFor: { increment: awayScore },
        touchdownsAgainst: { increment: homeScore },
        casualtiesFor: { increment: awayCasualties },
        leaguePoints: { increment: awayWin ? 3 : draw ? 1 : 0 },
        treasury: { increment: awayGold },
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (err) {
    console.error("record match error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
