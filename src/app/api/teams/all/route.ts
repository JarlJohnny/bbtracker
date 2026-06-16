import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Lists every team with its owning coach (and active roster), so any coach
// can add other coaches' teams to a league/tournament or record a match for
// them. Read-only; the add/record actions enforce their own permissions.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teams = await prisma.team.findMany({
    include: {
      user: { select: { id: true, name: true } },
      players: { where: { isDead: false, isRetired: false }, orderBy: { number: "asc" } },
    },
    orderBy: [{ name: "asc" }],
  });

  return NextResponse.json(teams);
}
