import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const league = await prisma.league.findFirst({
    where: {
      id,
      OR: [
        { creatorId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      creator: { select: { name: true, email: true } },
      members: { include: { user: { select: { id: true, name: true, email: true } } } },
      teams: {
        include: { user: { select: { name: true } }, _count: { select: { players: true } } },
        orderBy: [{ leaguePoints: "desc" }, { wins: "desc" }],
      },
      matches: {
        include: { homeTeam: true, awayTeam: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!league) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(league);
}

const updateSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  description: z.string().optional(),
  status: z.enum(["setup", "active", "finished"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const league = await prisma.league.findFirst({ where: { id, creatorId: session.user.id } });
  if (!league) return NextResponse.json({ error: "Not found or not admin" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.league.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}
