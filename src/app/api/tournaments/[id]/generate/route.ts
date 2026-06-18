import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { roundRobinPairings } from "@/lib/tournament";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const tournament = await prisma.tournament.findFirst({
    where: { id, creatorId: session.user.id },
    include: { entries: true, _count: { select: { matches: true } } },
  });
  if (!tournament) return NextResponse.json({ error: "Not found or not admin" }, { status: 404 });
  if (tournament.status !== "setup") return NextResponse.json({ error: "Pairings already generated" }, { status: 400 });
  if (tournament._count.matches > 0) return NextResponse.json({ error: "Pairings already generated" }, { status: 400 });
  if (tournament.entries.length < 2) return NextResponse.json({ error: "Need at least 2 teams" }, { status: 400 });

  const pairings = roundRobinPairings(
    tournament.entries.map((e) => e.teamId),
    tournament.doubleRound,
  );

  // Batch (array) transaction rather than an interactive one: the libsql/Turso
  // adapter hangs on long interactive transactions.
  await prisma.$transaction([
    prisma.match.createMany({
      data: pairings.map((p) => ({
        homeTeamId: p.homeTeamId,
        awayTeamId: p.awayTeamId,
        tournamentId: id,
        round: p.round,
        status: "scheduled",
      })),
    }),
    prisma.tournament.update({ where: { id }, data: { status: "active" } }),
  ]);

  return NextResponse.json({ ok: true, matches: pairings.length });
}
