import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PlayMode } from "./play-mode";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const match = await prisma.match.findFirst({
    where: { id },
    include: {
      homeTeam: {
        include: {
          players: { where: { isDead: false, isRetired: false }, orderBy: { number: "asc" } },
        },
      },
      awayTeam: {
        include: {
          players: { where: { isDead: false, isRetired: false }, orderBy: { number: "asc" } },
        },
      },
      events: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!match) notFound();

  const userId = session!.user!.id!;
  if (match.homeTeam.userId !== userId && match.awayTeam.userId !== userId) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <PlayMode match={match as any} />;
}
