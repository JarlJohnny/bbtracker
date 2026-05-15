import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RACES, calculateLevel } from "@/lib/bb-data";

const createSchema = z.object({
  name: z.string().min(1).max(50),
  race: z.string(),
  rerolls: z.number().int().min(0).max(8),
  assistantCoaches: z.number().int().min(0).max(6),
  cheerleaders: z.number().int().min(0).max(6),
  hasApothecary: z.boolean(),
  dedicatedFans: z.number().int().min(1).max(6),
  players: z.array(z.object({
    number: z.number().int().min(1).max(16),
    name: z.string().min(1),
    position: z.string(),
  })),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teams = await prisma.team.findMany({
    where: { userId: session.user.id },
    include: {
      players: { where: { isDead: false, isRetired: false } },
      _count: { select: { players: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(teams);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { name, race, rerolls, assistantCoaches, cheerleaders, hasApothecary, dedicatedFans, players } = parsed.data;

  const raceData = RACES[race];
  if (!raceData) return NextResponse.json({ error: "Invalid race" }, { status: 400 });

  const rerollCost = raceData.rerollCost * rerolls;
  const apothecary = hasApothecary && raceData.canHaveApothecary ? 50000 : 0;
  const coachesCost = assistantCoaches * 10000;
  const cheersCost = cheerleaders * 10000;

  let playersCost = 0;
  const playerData = players.map((p) => {
    const posData = raceData.positions.find((pos) => pos.position === p.position);
    if (!posData) throw new Error(`Invalid position: ${p.position}`);
    playersCost += posData.cost;
    return {
      number: p.number,
      name: p.name,
      position: posData.position,
      race,
      ma: posData.ma,
      st: posData.st,
      ag: posData.ag,
      pa: posData.pa,
      av: posData.av,
      skills: JSON.stringify(posData.skills),
      injuries: JSON.stringify([]),
      spp: 0,
      level: "Rookie",
      cost: posData.cost,
    };
  });

  const spent = rerollCost + apothecary + coachesCost + cheersCost + playersCost;
  const treasury = 1000000 - spent;

  if (treasury < 0) {
    return NextResponse.json({ error: "Not enough gold (1,000,000 gp budget)" }, { status: 400 });
  }

  const teamValue = spent;

  const team = await prisma.team.create({
    data: {
      name,
      race,
      treasury,
      rerolls,
      assistantCoaches,
      cheerleaders,
      hasApothecary: hasApothecary && raceData.canHaveApothecary,
      dedicatedFans,
      teamValue,
      currentTeamValue: teamValue,
      userId: session.user.id,
      players: { create: playerData },
    },
    include: { players: true },
  });

  return NextResponse.json(team, { status: 201 });
}
