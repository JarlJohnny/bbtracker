import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateLevel } from "@/lib/bb-data";

const schema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  homeGold: z.number().int().min(0),
  awayGold: z.number().int().min(0),
  homeMvpPlayerId: z.string().optional(),
  awayMvpPlayerId: z.string().optional(),
  notes: z.string().optional(),
});

const SPP_FOR: Record<string, number> = {
  touchdown: 3, casualty: 2, completion: 1, interception: 2,
};

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { homeScore, awayScore, homeGold, awayGold, homeMvpPlayerId, awayMvpPlayerId, notes } = parsed.data;

  const match = await prisma.match.findFirst({
    where: { id, status: "in_progress" },
    include: { homeTeam: true, awayTeam: true, events: true },
  });
  if (!match) return NextResponse.json({ error: "Match not in progress" }, { status: 404 });

  const userId = session.user.id;
  if (match.homeTeam.userId !== userId && match.awayTeam.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Aggregate stats per player
  const spp: Record<string, number> = {};
  const tds: Record<string, number> = {};
  const cas: Record<string, number> = {};
  const comp: Record<string, number> = {};
  const intc: Record<string, number> = {};

  for (const evt of match.events) {
    if (!evt.playerId) continue;
    const gain = SPP_FOR[evt.type] ?? 0;
    spp[evt.playerId] = (spp[evt.playerId] ?? 0) + gain;
    if (evt.type === "touchdown") tds[evt.playerId] = (tds[evt.playerId] ?? 0) + 1;
    if (evt.type === "casualty") cas[evt.playerId] = (cas[evt.playerId] ?? 0) + 1;
    if (evt.type === "completion") comp[evt.playerId] = (comp[evt.playerId] ?? 0) + 1;
    if (evt.type === "interception") intc[evt.playerId] = (intc[evt.playerId] ?? 0) + 1;
  }
  if (homeMvpPlayerId) spp[homeMvpPlayerId] = (spp[homeMvpPlayerId] ?? 0) + 4;
  if (awayMvpPlayerId) spp[awayMvpPlayerId] = (spp[awayMvpPlayerId] ?? 0) + 4;

  const homeWin = homeScore > awayScore;
  const awayWin = awayScore > homeScore;
  const draw = homeScore === awayScore;
  const homeCas = match.events.filter((e) => e.type === "casualty" && e.teamSide === "home").length;
  const awayCas = match.events.filter((e) => e.type === "casualty" && e.teamSide === "away").length;

  await prisma.$transaction(async (tx) => {
    // Apply injuries from casualty events
    const injuries = match.events.filter(
      (e) => e.type === "casualty" && e.targetId && e.injuryResult && e.injuryResult !== "badly_hurt"
    );
    for (const evt of injuries) {
      const target = await tx.player.findUnique({ where: { id: evt.targetId! } });
      if (!target || target.isDead || target.isRetired) continue;

      const injs: string[] = JSON.parse(target.injuries);
      let update: Record<string, unknown> = {};

      switch (evt.injuryResult) {
        case "mng":    update = { isMissingNextGame: true }; break;
        case "dead":   update = { isDead: true }; break;
        case "niggling": injs.push("Niggling Injury"); update = { injuries: JSON.stringify(injs) }; break;
        case "-MA":    injs.push("-1 MA"); update = { ma: Math.max(1, target.ma - 1), injuries: JSON.stringify(injs) }; break;
        case "-ST":    injs.push("-1 ST"); update = { st: Math.max(1, target.st - 1), injuries: JSON.stringify(injs) }; break;
        case "-AG":    injs.push("-1 AG"); update = { ag: Math.min(6, target.ag + 1), injuries: JSON.stringify(injs) }; break;
        case "-PA":    if (target.pa !== -1) { injs.push("-1 PA"); update = { pa: Math.min(6, target.pa + 1), injuries: JSON.stringify(injs) }; } break;
        case "-AV":    injs.push("-1 AV"); update = { av: Math.max(3, target.av - 1), injuries: JSON.stringify(injs) }; break;
      }
      if (Object.keys(update).length) await tx.player.update({ where: { id: evt.targetId! }, data: update });
    }

    // Update player SPP + create stats
    for (const [playerId, earned] of Object.entries(spp)) {
      const player = await tx.player.findUnique({ where: { id: playerId } });
      if (!player || player.isDead || player.isRetired) continue;
      const newSpp = player.spp + earned;
      await tx.player.update({ where: { id: playerId }, data: { spp: newSpp, level: calculateLevel(newSpp) } });
      await tx.matchPlayerStat.upsert({
        where: { matchId_playerId: { matchId: id, playerId } },
        create: {
          matchId: id, playerId,
          touchdowns: tds[playerId] ?? 0,
          completions: comp[playerId] ?? 0,
          interceptions: intc[playerId] ?? 0,
          casualties: cas[playerId] ?? 0,
          mvp: playerId === homeMvpPlayerId || playerId === awayMvpPlayerId,
          sppEarned: earned,
        },
        update: {},
      });
    }

    // Update team records
    await tx.team.update({
      where: { id: match.homeTeamId },
      data: {
        wins: { increment: homeWin ? 1 : 0 },
        draws: { increment: draw ? 1 : 0 },
        losses: { increment: awayWin ? 1 : 0 },
        touchdownsFor: { increment: homeScore },
        touchdownsAgainst: { increment: awayScore },
        casualtiesFor: { increment: homeCas },
        leaguePoints: { increment: homeWin ? 3 : draw ? 1 : 0 },
        treasury: { increment: homeGold },
      },
    });
    await tx.team.update({
      where: { id: match.awayTeamId },
      data: {
        wins: { increment: awayWin ? 1 : 0 },
        draws: { increment: draw ? 1 : 0 },
        losses: { increment: homeWin ? 1 : 0 },
        touchdownsFor: { increment: awayScore },
        touchdownsAgainst: { increment: homeScore },
        casualtiesFor: { increment: awayCas },
        leaguePoints: { increment: awayWin ? 3 : draw ? 1 : 0 },
        treasury: { increment: awayGold },
      },
    });

    await tx.match.update({
      where: { id },
      data: { status: "completed", homeScore, awayScore, notes: notes ?? null, playedAt: new Date() },
    });
  });

  return NextResponse.json({ ok: true, homeTeamId: match.homeTeamId });
}
