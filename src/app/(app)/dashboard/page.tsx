import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Swords, Trophy, Plus, Shield } from "lucide-react";
import { RACE_COLORS, formatGold } from "@/lib/bb-data";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [teams, leagues] = await Promise.all([
    prisma.team.findMany({
      where: { userId },
      include: { _count: { select: { players: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.league.findMany({
      where: { OR: [{ creatorId: userId }, { members: { some: { userId } } }] },
      include: { _count: { select: { teams: true, matches: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {session!.user!.name}</h1>
        <p className="text-stone-400 mt-1 text-sm">Your Blood Bowl command centre</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teams */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-stone-200 flex items-center gap-2">
              <Swords className="w-4 h-4 text-amber-400" /> My Teams
            </h2>
            <Link href="/teams/new" className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300">
              <Plus className="w-3.5 h-3.5" /> New team
            </Link>
          </div>

          {teams.length === 0 ? (
            <div className="bg-stone-900 border border-stone-700 rounded-xl p-6 text-center">
              <Shield className="w-8 h-8 text-stone-600 mx-auto mb-2" />
              <p className="text-stone-400 text-sm">No teams yet</p>
              <Link href="/teams/new" className="mt-3 inline-block text-amber-400 text-sm hover:text-amber-300">
                Create your first team
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/teams/${team.id}`}
                  className="flex items-center gap-3 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-xl p-3 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-lg ${RACE_COLORS[team.race] ?? "bg-stone-600"} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                    {team.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate">{team.name}</div>
                    <div className="text-stone-400 text-xs">{team.race} · {team._count.players} players</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-amber-400 font-medium">{formatGold(team.teamValue)}</div>
                    <div className="text-xs text-stone-500">{team.wins}W {team.draws}D {team.losses}L</div>
                  </div>
                </Link>
              ))}
              {teams.length >= 5 && (
                <Link href="/teams" className="block text-center text-xs text-stone-500 hover:text-stone-300 pt-1">
                  View all teams
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Leagues */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-stone-200 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" /> Leagues
            </h2>
            <Link href="/leagues/new" className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300">
              <Plus className="w-3.5 h-3.5" /> New league
            </Link>
          </div>

          {leagues.length === 0 ? (
            <div className="bg-stone-900 border border-stone-700 rounded-xl p-6 text-center">
              <Trophy className="w-8 h-8 text-stone-600 mx-auto mb-2" />
              <p className="text-stone-400 text-sm">No leagues yet</p>
              <Link href="/leagues/new" className="mt-3 inline-block text-amber-400 text-sm hover:text-amber-300">
                Start a league
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {leagues.map((league) => (
                <Link
                  key={league.id}
                  href={`/leagues/${league.id}`}
                  className="flex items-center gap-3 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-xl p-3 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-600/20 border border-amber-600/40 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate">{league.name}</div>
                    <div className="text-stone-400 text-xs">{league._count.teams} teams · {league._count.matches} matches</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    league.status === "active" ? "bg-green-900/50 text-green-400" :
                    league.status === "finished" ? "bg-stone-700 text-stone-400" :
                    "bg-yellow-900/50 text-yellow-400"
                  }`}>
                    {league.status}
                  </span>
                </Link>
              ))}
              {leagues.length >= 5 && (
                <Link href="/leagues" className="block text-center text-xs text-stone-500 hover:text-stone-300 pt-1">
                  View all leagues
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
