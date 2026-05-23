import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const playerSelect = {
  id: true, number: true, name: true, position: true,
  ma: true, st: true, ag: true, pa: true, av: true,
  skills: true, injuries: true, spp: true, level: true,
  isMissingNextGame: true, isDead: true, isRetired: true,
  teamId: true,
};

async function getMatch(id: string, userId: string) {
  const match = await prisma.match.findFirst({
    where: { id },
    include: {
      homeTeam: { include: { players: { where: { isDead: false, isRetired: false }, orderBy: { number: "asc" }, select: playerSelect } } },
      awayTeam: { include: { players: { where: { isDead: false, isRetired: false }, orderBy: { number: "asc" }, select: playerSelect } } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!match) return null;
  if (match.homeTeam.userId !== userId && match.awayTeam.userId !== userId) return null;
  return match;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const match = await getMatch(id, session.user.id);
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(match);
}

const patchSchema = z.object({
  action: z.enum(["end_turn", "end_half"]),
  activeTeam: z.enum(["home", "away"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const current = await prisma.match.findFirst({ where: { id, status: "in_progress" } });
  if (!current) return NextResponse.json({ error: "Match not found or not in progress" }, { status: 404 });

  let data: { activeTeam?: string; turn?: number; half?: number };

  if (parsed.data.action === "end_turn") {
    if (current.activeTeam === "home") {
      data = { activeTeam: "away" };
    } else {
      if (current.turn < 8) {
        data = { activeTeam: "home", turn: current.turn + 1 };
      } else {
        data = { activeTeam: "home", turn: current.turn };
      }
    }
  } else {
    // end_half
    data = { half: 2, turn: 1, activeTeam: parsed.data.activeTeam ?? "home" };
  }

  const updated = await prisma.match.update({ where: { id }, data });
  return NextResponse.json(updated);
}
