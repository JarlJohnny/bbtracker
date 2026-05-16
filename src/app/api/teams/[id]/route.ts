import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RACES } from "@/lib/bb-data";

const purchaseSchema = z.object({
  action: z.enum([
    "buy_reroll", "sell_reroll",
    "buy_fan", "sell_fan",
    "buy_coach", "sell_coach",
    "buy_cheerleader", "sell_cheerleader",
    "buy_apothecary",
  ]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const team = await prisma.team.findFirst({ where: { id, userId: session.user.id } });
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = purchaseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { action } = parsed.data;
  const raceData = RACES[team.race];
  // Rerolls cost double during a season (BB2020 p.35)
  const rerollCost = (raceData?.rerollCost ?? 60000) * 2;
  const update: Record<string, unknown> = {};

  switch (action) {
    case "buy_reroll":
      if (team.rerolls >= 8) return NextResponse.json({ error: "Maximum 8 rerolls" }, { status: 400 });
      if (team.treasury < rerollCost) return NextResponse.json({ error: "Insufficient treasury" }, { status: 400 });
      update.rerolls = team.rerolls + 1;
      update.treasury = team.treasury - rerollCost;
      update.teamValue = team.teamValue + (raceData?.rerollCost ?? 60000);
      update.currentTeamValue = team.currentTeamValue + (raceData?.rerollCost ?? 60000);
      break;
    case "sell_reroll":
      if (team.rerolls <= 0) return NextResponse.json({ error: "No rerolls to sell" }, { status: 400 });
      update.rerolls = team.rerolls - 1;
      // Sold for half the original cost (house rule commonly used)
      update.treasury = team.treasury + Math.floor((raceData?.rerollCost ?? 60000) / 2);
      update.teamValue = team.teamValue - (raceData?.rerollCost ?? 60000);
      update.currentTeamValue = team.currentTeamValue - (raceData?.rerollCost ?? 60000);
      break;
    case "buy_fan":
      if (team.dedicatedFans >= 6) return NextResponse.json({ error: "Maximum 6 dedicated fans" }, { status: 400 });
      if (team.treasury < 10000) return NextResponse.json({ error: "Insufficient treasury" }, { status: 400 });
      update.dedicatedFans = team.dedicatedFans + 1;
      update.treasury = team.treasury - 10000;
      break;
    case "sell_fan":
      if (team.dedicatedFans <= 1) return NextResponse.json({ error: "Minimum 1 dedicated fan" }, { status: 400 });
      update.dedicatedFans = team.dedicatedFans - 1;
      update.treasury = team.treasury + 5000;
      break;
    case "buy_coach":
      if (team.assistantCoaches >= 6) return NextResponse.json({ error: "Maximum 6 assistant coaches" }, { status: 400 });
      if (team.treasury < 10000) return NextResponse.json({ error: "Insufficient treasury" }, { status: 400 });
      update.assistantCoaches = team.assistantCoaches + 1;
      update.treasury = team.treasury - 10000;
      break;
    case "sell_coach":
      if (team.assistantCoaches <= 0) return NextResponse.json({ error: "No assistant coaches to sell" }, { status: 400 });
      update.assistantCoaches = team.assistantCoaches - 1;
      update.treasury = team.treasury + 5000;
      break;
    case "buy_cheerleader":
      if (team.cheerleaders >= 6) return NextResponse.json({ error: "Maximum 6 cheerleaders" }, { status: 400 });
      if (team.treasury < 10000) return NextResponse.json({ error: "Insufficient treasury" }, { status: 400 });
      update.cheerleaders = team.cheerleaders + 1;
      update.treasury = team.treasury - 10000;
      break;
    case "sell_cheerleader":
      if (team.cheerleaders <= 0) return NextResponse.json({ error: "No cheerleaders to sell" }, { status: 400 });
      update.cheerleaders = team.cheerleaders - 1;
      update.treasury = team.treasury + 5000;
      break;
    case "buy_apothecary":
      if (!raceData?.canHaveApothecary) return NextResponse.json({ error: "This race cannot have an apothecary" }, { status: 400 });
      if (team.hasApothecary) return NextResponse.json({ error: "Already has an apothecary" }, { status: 400 });
      if (team.treasury < 50000) return NextResponse.json({ error: "Insufficient treasury" }, { status: 400 });
      update.hasApothecary = true;
      update.treasury = team.treasury - 50000;
      break;
  }

  const updated = await prisma.team.update({ where: { id }, data: update });
  return NextResponse.json(updated);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const team = await prisma.team.findFirst({
    where: { id, userId: session.user.id },
    include: {
      players: { orderBy: [{ isDead: "asc" }, { isRetired: "asc" }, { number: "asc" }] },
      homeMatches: {
        include: { awayTeam: true, playerStats: { include: { player: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      awayMatches: {
        include: { homeTeam: true, playerStats: { include: { player: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(team);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const team = await prisma.team.findFirst({ where: { id, userId: session.user.id } });
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.team.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
