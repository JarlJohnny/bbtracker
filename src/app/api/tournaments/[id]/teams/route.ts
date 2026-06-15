import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const postSchema = z.object({ teamId: z.string() });
const deleteSchema = z.object({ teamId: z.string() });

async function requireSetupAdmin(id: string, userId: string) {
  const tournament = await prisma.tournament.findFirst({ where: { id, creatorId: userId } });
  if (!tournament) return { error: "Not found or not admin", status: 404 as const };
  if (tournament.status !== "setup") return { error: "Tournament already started", status: 400 as const };
  return { tournament };
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const guard = await requireSetupAdmin(id, session.user.id);
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const team = await prisma.team.findFirst({ where: { id: parsed.data.teamId } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  const existing = await prisma.tournamentEntry.findUnique({
    where: { tournamentId_teamId: { tournamentId: id, teamId: parsed.data.teamId } },
  });
  if (existing) return NextResponse.json({ error: "Team already entered" }, { status: 400 });

  const entry = await prisma.tournamentEntry.create({
    data: { tournamentId: id, teamId: parsed.data.teamId },
  });

  return NextResponse.json(entry, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const guard = await requireSetupAdmin(id, session.user.id);
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const parsed = deleteSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await prisma.tournamentEntry.deleteMany({
    where: { tournamentId: id, teamId: parsed.data.teamId },
  });

  return NextResponse.json({ ok: true });
}
