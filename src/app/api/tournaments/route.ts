import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(1).max(60),
  description: z.string().optional(),
  doubleRound: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tournaments = await prisma.tournament.findMany({
    where: {
      OR: [
        { creatorId: session.user.id },
        { entries: { some: { team: { userId: session.user.id } } } },
      ],
    },
    include: {
      creator: { select: { name: true, email: true } },
      _count: { select: { entries: true, matches: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tournaments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const tournament = await prisma.tournament.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      doubleRound: parsed.data.doubleRound ?? false,
      creatorId: session.user.id,
    },
  });

  return NextResponse.json(tournament, { status: 201 });
}
