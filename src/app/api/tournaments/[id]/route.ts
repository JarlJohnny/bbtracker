import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { compareStandings } from "@/lib/tournament";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  // Any signed-in user can view a tournament; editing stays creator-only.
  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, name: true, email: true } },
      entries: {
        include: { team: { include: { user: { select: { name: true } } } } },
      },
      matches: {
        include: {
          homeTeam: { select: { id: true, name: true, race: true } },
          awayTeam: { select: { id: true, name: true, race: true } },
        },
        orderBy: [{ round: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!tournament) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Sort standings in JS (libsql can't multi-order on computed diff anyway).
  tournament.entries.sort(compareStandings);

  return NextResponse.json({ ...tournament, isCreator: tournament.creatorId === session.user.id });
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
  const tournament = await prisma.tournament.findFirst({ where: { id, creatorId: session.user.id } });
  if (!tournament) return NextResponse.json({ error: "Not found or not admin" }, { status: 404 });

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.tournament.update({ where: { id }, data: parsed.data });
  return NextResponse.json(updated);
}
