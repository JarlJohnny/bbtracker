import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { RACES } from "@/lib/bb-data";

const addPlayerSchema = z.object({
  number: z.number().int().min(1).max(16),
  name: z.string().min(1),
  position: z.string(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const team = await prisma.team.findFirst({ where: { id, userId: session.user.id } });
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = addPlayerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const raceData = RACES[team.race];
  if (!raceData) return NextResponse.json({ error: "Invalid race" }, { status: 400 });

  const posData = raceData.positions.find((p) => p.position === parsed.data.position);
  if (!posData) return NextResponse.json({ error: "Invalid position" }, { status: 400 });

  if (team.treasury < posData.cost) {
    return NextResponse.json({ error: "Insufficient treasury" }, { status: 400 });
  }

  const [player] = await prisma.$transaction([
    prisma.player.create({
      data: {
        number: parsed.data.number,
        name: parsed.data.name,
        position: posData.position,
        race: team.race,
        ma: posData.ma,
        st: posData.st,
        ag: posData.ag,
        pa: posData.pa,
        av: posData.av,
        skills: JSON.stringify(posData.skills),
        injuries: JSON.stringify([]),
        cost: posData.cost,
        teamId: id,
      },
    }),
    prisma.team.update({
      where: { id },
      data: {
        treasury: { decrement: posData.cost },
        teamValue: { increment: posData.cost },
        currentTeamValue: { increment: posData.cost },
      },
    }),
  ]);

  return NextResponse.json(player, { status: 201 });
}
