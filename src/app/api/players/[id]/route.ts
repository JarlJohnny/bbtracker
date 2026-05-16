import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateLevel } from "@/lib/bb-data";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const player = await prisma.player.findFirst({
    where: { id },
    include: {
      team: { select: { userId: true } },
      improvements: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!player || player.team.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(player);
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  isMissingNextGame: z.boolean().optional(),
  isDead: z.boolean().optional(),
  isRetired: z.boolean().optional(),
  skills: z.array(z.string()).optional(),
  injuries: z.array(z.string()).optional(),
  spp: z.number().int().min(0).optional(),
  ma: z.number().int().min(1).max(9).optional(),
  st: z.number().int().min(1).max(10).optional(),
  ag: z.number().int().min(1).max(6).optional(),
  pa: z.number().int().min(1).max(6).optional(),
  av: z.number().int().min(1).max(11).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const player = await prisma.player.findFirst({
    where: { id },
    include: { team: { select: { userId: true } } },
  });

  if (!player || player.team.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.isMissingNextGame !== undefined) data.isMissingNextGame = parsed.data.isMissingNextGame;
  if (parsed.data.isDead !== undefined) data.isDead = parsed.data.isDead;
  if (parsed.data.isRetired !== undefined) data.isRetired = parsed.data.isRetired;
  if (parsed.data.skills !== undefined) data.skills = JSON.stringify(parsed.data.skills);
  if (parsed.data.injuries !== undefined) data.injuries = JSON.stringify(parsed.data.injuries);
  if (parsed.data.spp !== undefined) {
    data.spp = parsed.data.spp;
    data.level = calculateLevel(parsed.data.spp);
  }
  if (parsed.data.ma !== undefined) data.ma = parsed.data.ma;
  if (parsed.data.st !== undefined) data.st = parsed.data.st;
  if (parsed.data.ag !== undefined) data.ag = parsed.data.ag;
  if (parsed.data.pa !== undefined) data.pa = parsed.data.pa;
  if (parsed.data.av !== undefined) data.av = parsed.data.av;

  const updated = await prisma.player.update({ where: { id }, data });
  return NextResponse.json(updated);
}
