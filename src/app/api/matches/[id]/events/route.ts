import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  type: z.enum(["touchdown", "casualty", "completion", "interception"]),
  teamSide: z.enum(["home", "away"]),
  playerId: z.string().nullable().optional(),
  playerName: z.string().nullable().optional(),
  targetId: z.string().nullable().optional(),
  targetName: z.string().nullable().optional(),
  injuryResult: z.string().nullable().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { type, teamSide, playerId, playerName, targetId, targetName, injuryResult } = parsed.data;

  const event = await prisma.$transaction(async (tx) => {
    const match = await tx.match.findFirst({
      where: { id, status: "in_progress" },
      include: { homeTeam: true, awayTeam: true },
    });
    if (!match) throw new Error("Match not found");
    if (match.homeTeam.userId !== session.user!.id && match.awayTeam.userId !== session.user!.id) {
      throw new Error("Forbidden");
    }

    const evt = await tx.gameEvent.create({
      data: {
        matchId: id,
        type,
        teamSide,
        playerId: playerId ?? null,
        playerName: playerName ?? null,
        targetId: targetId ?? null,
        targetName: targetName ?? null,
        injuryResult: injuryResult ?? null,
        half: match.half,
        turn: match.turn,
      },
    });

    if (type === "touchdown") {
      await tx.match.update({
        where: { id },
        data: teamSide === "home" ? { homeScore: { increment: 1 } } : { awayScore: { increment: 1 } },
      });
    }

    return evt;
  });

  return NextResponse.json(event, { status: 201 });
}
