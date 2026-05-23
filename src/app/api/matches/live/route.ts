import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  homeTeamId: z.string(),
  awayTeamId: z.string(),
  leagueId: z.string().optional(),
  activeTeam: z.enum(["home", "away"]).default("home"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { homeTeamId, awayTeamId, leagueId, activeTeam } = parsed.data;

  const homeTeam = await prisma.team.findFirst({ where: { id: homeTeamId, userId: session.user.id } });
  if (!homeTeam) return NextResponse.json({ error: "Home team not found or not yours" }, { status: 403 });

  const match = await prisma.match.create({
    data: {
      homeTeamId,
      awayTeamId,
      leagueId: leagueId || null,
      status: "in_progress",
      activeTeam,
      half: 1,
      turn: 1,
    },
  });

  return NextResponse.json(match, { status: 201 });
}
