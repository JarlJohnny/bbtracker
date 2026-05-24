import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, eventId } = await params;
  const { injuryResult } = z.object({ injuryResult: z.string() }).parse(await req.json());

  const evt = await prisma.gameEvent.findFirst({
    where: { id: eventId, matchId: id },
    include: { match: { include: { homeTeam: true, awayTeam: true } } },
  });
  if (!evt) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = session.user.id;
  if (evt.match.homeTeam.userId !== userId && evt.match.awayTeam.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.gameEvent.update({ where: { id: eventId }, data: { injuryResult } });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; eventId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, eventId } = await params;

  await prisma.$transaction(async (tx) => {
    const evt = await tx.gameEvent.findFirst({
      where: { id: eventId, matchId: id },
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
    });
    if (!evt) throw new Error("Event not found");

    const userId = session.user!.id!;
    if (evt.match.homeTeam.userId !== userId && evt.match.awayTeam.userId !== userId) {
      throw new Error("Forbidden");
    }

    await tx.gameEvent.delete({ where: { id: eventId } });

    if (evt.type === "touchdown") {
      await tx.match.update({
        where: { id },
        data: evt.teamSide === "home"
          ? { homeScore: { decrement: 1 } }
          : { awayScore: { decrement: 1 } },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
