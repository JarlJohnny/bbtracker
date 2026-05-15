import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Swords } from "lucide-react";
import { RACE_COLORS, formatGold } from "@/lib/bb-data";

export default async function TeamsPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const teams = await prisma.team.findMany({
    where: { userId },
    include: {
      players: { where: { isDead: false, isRetired: false } },
      league: { select: { name: true, id: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Teams</h1>
          <p className="text-stone-400 text-sm mt-1">{teams.length} team{teams.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/teams/new"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> New Team
        </Link>
      </div>

      {teams.length === 0 ? (
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-12 text-center">
          <Swords className="w-10 h-10 text-stone-600 mx-auto mb-3" />
          <h2 className="text-white font-semibold mb-1">No teams yet</h2>
          <p className="text-stone-400 text-sm mb-4">Create your first Blood Bowl team</p>
          <Link href="/teams/new" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
            <Plus className="w-4 h-4" /> Create Team
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-xl p-4 transition-colors group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg ${RACE_COLORS[team.race] ?? "bg-stone-600"} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                  {team.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white group-hover:text-amber-400 transition-colors truncate">{team.name}</div>
                  <div className="text-stone-400 text-xs">{team.race}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-stone-800 rounded-lg py-2">
                  <div className="text-white font-bold text-lg">{team.wins}</div>
                  <div className="text-stone-500 text-xs">Wins</div>
                </div>
                <div className="bg-stone-800 rounded-lg py-2">
                  <div className="text-white font-bold text-lg">{team.draws}</div>
                  <div className="text-stone-500 text-xs">Draws</div>
                </div>
                <div className="bg-stone-800 rounded-lg py-2">
                  <div className="text-white font-bold text-lg">{team.losses}</div>
                  <div className="text-stone-500 text-xs">Losses</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">{team.players.length} players</span>
                <span className="text-amber-400 font-medium">{formatGold(team.teamValue)}</span>
              </div>

              {team.league && (
                <div className="mt-2 text-xs text-stone-500 truncate">League: {team.league.name}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
