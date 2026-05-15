import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({ teamId: z.string() });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const league = await prisma.league.findFirst({
    where: { id, OR: [{ creatorId: session.user.id }, { members: { some: { userId: session.user.id, role: "admin" } } }] },
  });
  if (!league) return NextResponse.json({ error: "Not found or not admin" }, { status: 404 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const team = await prisma.team.findFirst({ where: { id: parsed.data.teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  // Add team member if not already
  await prisma.leagueMember.upsert({
    where: { userId_leagueId: { userId: team.userId, leagueId: id } },
    create: { userId: team.userId, leagueId: id, role: "coach" },
    update: {},
  });

  const updated = await prisma.team.update({
    where: { id: parsed.data.teamId },
    data: { leagueId: id },
  });

  return NextResponse.json(updated);
}
