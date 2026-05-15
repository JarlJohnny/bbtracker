import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
