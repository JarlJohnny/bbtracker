import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(1).max(60),
  description: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // All signed-in users can browse every league.
  const leagues = await prisma.league.findMany({
    include: {
      creator: { select: { name: true, email: true } },
      _count: { select: { teams: true, matches: true, members: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(leagues);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const league = await prisma.$transaction(async (tx) => {
    const league = await tx.league.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        creatorId: session.user!.id!,
      },
    });

    await tx.leagueMember.create({
      data: {
        userId: session.user!.id!,
        leagueId: league.id,
        role: "admin",
      },
    });

    return league;
  });

  return NextResponse.json(league, { status: 201 });
}
