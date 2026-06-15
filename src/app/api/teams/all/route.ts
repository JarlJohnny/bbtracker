import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Lists every team with its owning coach, so league/tournament owners can
// add teams that belong to other coaches. Read-only; adding stays gated to
// the league/tournament creator on those routes.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teams = await prisma.team.findMany({
    include: { user: { select: { id: true, name: true } } },
    orderBy: [{ name: "asc" }],
  });

  return NextResponse.json(teams);
}
