import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  IMPROVEMENT_TV_COST,
  SPP_THRESHOLDS,
  pendingAdvancements,
} from "@/lib/bb-data";

const schema = z.object({
  type: z.enum([
    "random_primary",
    "chosen_primary",
    "chosen_secondary",
    "stat_ma",
    "stat_av",
    "stat_pa",
    "stat_ag",
    "stat_st",
  ]),
  value: z.string().min(1), // skill name or stat label
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const player = await prisma.player.findFirst({
    where: { id },
    include: {
      team: { select: { userId: true, id: true, teamValue: true, currentTeamValue: true } },
      improvements: true,
    },
  });

  if (!player || player.team.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (player.isDead || player.isRetired) {
    return NextResponse.json({ error: "Player is dead or retired" }, { status: 400 });
  }

  const pending = pendingAdvancements(player.spp, player.improvements.length);
  if (pending <= 0) {
    return NextResponse.json({ error: "No pending advancements" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { type, value } = parsed.data;
  const tvCost = IMPROVEMENT_TV_COST[type];

  // Build player stat update
  const playerUpdate: Record<string, unknown> = {};
  if (type.startsWith("chosen_") || type === "random_primary") {
    const currentSkills: string[] = JSON.parse(player.skills);
    if (currentSkills.includes(value)) {
      return NextResponse.json({ error: "Player already has that skill" }, { status: 400 });
    }
    playerUpdate.skills = JSON.stringify([...currentSkills, value]);
  } else {
    // Stat improvement
    if (type === "stat_ma") playerUpdate.ma = Math.min(9, player.ma + 1);
    else if (type === "stat_av") playerUpdate.av = Math.min(11, player.av + 1);
    else if (type === "stat_pa") playerUpdate.pa = player.pa === -1 ? -1 : Math.max(2, player.pa - 1);
    else if (type === "stat_ag") playerUpdate.ag = Math.max(1, player.ag - 1);
    else if (type === "stat_st") playerUpdate.st = Math.min(10, player.st + 1);
  }

  const [updatedPlayer] = await prisma.$transaction([
    prisma.player.update({
      where: { id },
      data: playerUpdate,
      include: { improvements: true },
    }),
    prisma.playerImprovement.create({
      data: {
        playerId: id,
        type,
        value,
        sppSpent: SPP_THRESHOLDS[player.improvements.length] ?? 0,
      },
    }),
    prisma.team.update({
      where: { id: player.team.id },
      data: {
        teamValue: { increment: tvCost },
        currentTeamValue: { increment: tvCost },
      },
    }),
  ]);

  return NextResponse.json(updatedPlayer);
}
