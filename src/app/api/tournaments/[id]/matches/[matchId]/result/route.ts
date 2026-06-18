import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  homeCasualties: z.number().int().min(0).default(0),
  awayCasualties: z.number().int().min(0).default(0),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; matchId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, matchId } = await params;

  const tournament = await prisma.tournament.findFirst({ where: { id, creatorId: session.user.id } });
  if (!tournament) return NextResponse.json({ error: "Not found or not admin" }, { status: 404 });

  const match = await prisma.match.findFirst({ where: { id: matchId, tournamentId: id } });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  if (match.status === "completed") return NextResponse.json({ error: "Result already recorded" }, { status: 400 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { homeScore, awayScore, homeCasualties, awayCasualties } = parsed.data;
  const homeWin = homeScore > awayScore;
  const awayWin = awayScore > homeScore;
  const draw = homeScore === awayScore;

  // Batch (array) transaction rather than an interactive one: the libsql/Turso
  // adapter hangs on long interactive transactions.
  await prisma.$transaction([
    prisma.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore, status: "completed", playedAt: new Date() },
    }),
    prisma.tournamentEntry.update({
      where: { tournamentId_teamId: { tournamentId: id, teamId: match.homeTeamId } },
      data: {
        wins: { increment: homeWin ? 1 : 0 },
        draws: { increment: draw ? 1 : 0 },
        losses: { increment: awayWin ? 1 : 0 },
        touchdownsFor: { increment: homeScore },
        touchdownsAgainst: { increment: awayScore },
        casualtiesFor: { increment: homeCasualties },
        points: { increment: homeWin ? 3 : draw ? 1 : 0 },
      },
    }),
    prisma.tournamentEntry.update({
      where: { tournamentId_teamId: { tournamentId: id, teamId: match.awayTeamId } },
      data: {
        wins: { increment: awayWin ? 1 : 0 },
        draws: { increment: draw ? 1 : 0 },
        losses: { increment: homeWin ? 1 : 0 },
        touchdownsFor: { increment: awayScore },
        touchdownsAgainst: { increment: homeScore },
        casualtiesFor: { increment: awayCasualties },
        points: { increment: awayWin ? 3 : draw ? 1 : 0 },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
