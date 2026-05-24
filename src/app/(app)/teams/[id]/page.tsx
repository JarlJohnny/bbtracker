import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatGold, RACE_COLORS, SPP_LEVELS } from "@/lib/bb-data";
import Link from "next/link";
import { ChevronLeft, Plus, Skull, AlertTriangle, Star, Play } from "lucide-react";
import { TeamManagement } from "@/components/team-management";
import { SkillBadge } from "@/components/skill-badge";
import { ClearMngButton } from "@/components/clear-mng-button";

function statDisplay(val: number, isPa = false) {
  if (isPa && val === -1) return "-";
  if (isPa) return `${val}+`;
  return String(val);
}

function levelBadge(level: string) {
  const colors: Record<string, string> = {
    Rookie: "bg-stone-700 text-stone-300",
    Experienced: "bg-blue-900/50 text-blue-300",
    Veteran: "bg-purple-900/50 text-purple-300",
    "Emerging Star": "bg-amber-900/50 text-amber-300",
    Star: "bg-amber-500/20 text-amber-400",
    "Super Star": "bg-yellow-400/20 text-yellow-400",
    Legend: "bg-orange-400/20 text-orange-400",
  };
  return colors[level] ?? "bg-stone-700 text-stone-300";
}

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  const team = await prisma.team.findFirst({
    where: { id, userId: session!.user!.id! },
    include: {
      players: {
        orderBy: [{ isDead: "asc" }, { isRetired: "asc" }, { number: "asc" }],
      },
      homeMatches: {
        include: { awayTeam: { select: { name: true, race: true } } },
        where: { status: "completed" },
        orderBy: { playedAt: "desc" },
        take: 10,
      },
      awayMatches: {
        include: { homeTeam: { select: { name: true, race: true } } },
        where: { status: "completed" },
        orderBy: { playedAt: "desc" },
        take: 10,
      },
      league: { select: { id: true, name: true } },
    },
  });

  if (!team) notFound();

  const activePlayers = team.players.filter((p) => !p.isDead && !p.isRetired);
  const deadOrRetired = team.players.filter((p) => p.isDead || p.isRetired);

  const allMatches = [
    ...team.homeMatches.map((m) => ({
      id: m.id,
      opponent: m.awayTeam.name,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      isHome: true,
      date: m.playedAt,
    })),
    ...team.awayMatches.map((m) => ({
      id: m.id,
      opponent: m.homeTeam.name,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      isHome: false,
      date: m.playedAt,
    })),
  ].sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)).slice(0, 10);

  const nextLevelSpp: Record<string, number> = {
    Rookie: 6, Experienced: 16, Veteran: 31, "Emerging Star": 51, Star: 76, "Super Star": 176,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/teams" className="text-stone-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-lg ${RACE_COLORS[team.race] ?? "bg-stone-600"} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
            {team.name[0]}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{team.name}</h1>
            <p className="text-stone-400 text-sm">{team.race}{team.league ? ` · ${team.league.name}` : ""}</p>
          </div>
        </div>
        <Link
          href={`/matches/new/live?homeTeamId=${team.id}`}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-3 py-1.5 rounded-lg text-sm transition-colors shrink-0"
        >
          <Play className="w-4 h-4" /> Play Match
        </Link>
        <Link
          href={`/matches/new?homeTeamId=${team.id}`}
          className="flex items-center gap-1.5 bg-stone-700 hover:bg-stone-600 text-stone-200 font-semibold px-3 py-1.5 rounded-lg text-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Record
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Team Value", value: formatGold(team.teamValue), highlight: true },
          { label: "Treasury", value: formatGold(team.treasury) },
          { label: "Record", value: `${team.wins}W ${team.draws}D ${team.losses}L` },
          { label: "TDs For", value: String(team.touchdownsFor) },
          { label: "Rerolls", value: String(team.rerolls) },
          { label: "Fans", value: String(team.dedicatedFans) },
        ].map(({ label, value, highlight }) => (
          <div key={label} className="bg-stone-900 border border-stone-700 rounded-xl p-3 text-center">
            <div className={`font-bold text-base ${highlight ? "text-amber-400" : "text-white"}`}>{value}</div>
            <div className="text-stone-500 text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Team Management */}
      <TeamManagement
        teamId={team.id}
        race={team.race}
        treasury={team.treasury}
        rerolls={team.rerolls}
        dedicatedFans={team.dedicatedFans}
        assistantCoaches={team.assistantCoaches}
        cheerleaders={team.cheerleaders}
        hasApothecary={team.hasApothecary}
      />

      {/* Roster */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-700">
          <h2 className="font-semibold text-white">Roster ({activePlayers.length})</h2>
          <Link
            href={`/teams/${id}/add-player`}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
          >
            <Plus className="w-3.5 h-3.5" /> Add player
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-700/50">
                <th className="text-left px-4 py-2 text-stone-400 font-medium text-xs">#</th>
                <th className="text-left px-4 py-2 text-stone-400 font-medium text-xs">Name</th>
                <th className="text-left px-4 py-2 text-stone-400 font-medium text-xs hidden sm:table-cell">Position</th>
                <th className="text-center px-2 py-2 text-stone-400 font-medium text-xs">MA</th>
                <th className="text-center px-2 py-2 text-stone-400 font-medium text-xs">ST</th>
                <th className="text-center px-2 py-2 text-stone-400 font-medium text-xs">AG</th>
                <th className="text-center px-2 py-2 text-stone-400 font-medium text-xs">PA</th>
                <th className="text-center px-2 py-2 text-stone-400 font-medium text-xs">AV</th>
                <th className="text-left px-2 py-2 text-stone-400 font-medium text-xs hidden lg:table-cell">Skills</th>
                <th className="text-center px-2 py-2 text-stone-400 font-medium text-xs">SPP</th>
                <th className="text-left px-2 py-2 text-stone-400 font-medium text-xs hidden md:table-cell">Level</th>
                <th className="text-center px-2 py-2 text-stone-400 font-medium text-xs">Status</th>
              </tr>
            </thead>
            <tbody>
              {activePlayers.map((player) => {
                const skills: string[] = JSON.parse(player.skills);
                const injuries: string[] = JSON.parse(player.injuries);
                const nextSpp = nextLevelSpp[player.level];
                return (
                  <tr key={player.id} className="border-b border-stone-800 hover:bg-stone-800/50 transition-colors">
                    <td className="px-4 py-2.5 text-stone-400 text-xs">{player.number}</td>
                    <td className="px-4 py-2.5">
                      <Link href={`/players/${player.id}`} className="text-white hover:text-amber-400 transition-colors font-medium">
                        {player.name}
                      </Link>
                      {player.isJourneyman && <span className="ml-1 text-xs text-stone-500">(JM)</span>}
                    </td>
                    <td className="px-4 py-2.5 text-stone-400 text-xs hidden sm:table-cell">{player.position}</td>
                    <td className="px-2 py-2.5 text-center text-white">{player.ma}</td>
                    <td className="px-2 py-2.5 text-center text-white">{player.st}</td>
                    <td className="px-2 py-2.5 text-center text-white">{player.ag}+</td>
                    <td className="px-2 py-2.5 text-center text-white">{statDisplay(player.pa, true)}</td>
                    <td className="px-2 py-2.5 text-center text-white">{player.av}+</td>
                    <td className="px-2 py-2.5 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {skills.slice(0, 4).map((s) => (
                          <SkillBadge key={s} skill={s} size="sm" />
                        ))}
                        {skills.length > 4 && <span className="text-stone-500 text-xs">+{skills.length - 4}</span>}
                        {injuries.map((inj) => (
                          <SkillBadge key={inj} skill={inj} size="sm" variant="injury" />
                        ))}
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <div className="text-white text-xs">{player.spp}</div>
                      {nextSpp && (
                        <div className="text-stone-500 text-xs">/{nextSpp}</div>
                      )}
                    </td>
                    <td className="px-2 py-2.5 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${levelBadge(player.level)}`}>
                        {player.level}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      {player.isMissingNextGame ? (
                        <span className="inline-flex items-center">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" aria-label="Missing next game" />
                          <ClearMngButton playerId={player.id} />
                        </span>
                      ) : player.isJourneyman ? (
                        <span className="text-xs text-stone-500">JM</span>
                      ) : (
                        <span className="text-green-400 text-xs">OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {activePlayers.length === 0 && (
            <div className="text-center py-8 text-stone-500 text-sm">No active players</div>
          )}
        </div>

        {deadOrRetired.length > 0 && (
          <details className="border-t border-stone-700">
            <summary className="px-4 py-2 text-stone-500 text-xs cursor-pointer hover:text-stone-400 flex items-center gap-1">
              <Skull className="w-3.5 h-3.5" /> {deadOrRetired.length} dead/retired player(s)
            </summary>
            <div className="px-4 pb-3 space-y-1">
              {deadOrRetired.map((p) => (
                <div key={p.id} className="text-xs text-stone-600 flex items-center gap-2">
                  <span className="text-stone-500">#{p.number}</span>
                  <span className="line-through">{p.name}</span>
                  <span>{p.isDead ? "Dead" : "Retired"}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Recent matches */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-700">
          <h2 className="font-semibold text-white">Recent Matches</h2>
        </div>
        {allMatches.length === 0 ? (
          <div className="px-4 py-6 text-center text-stone-500 text-sm">No matches recorded yet</div>
        ) : (
          <div className="divide-y divide-stone-800">
            {allMatches.map((m) => {
              const teamScore = m.isHome ? m.homeScore : m.awayScore;
              const oppScore = m.isHome ? m.awayScore : m.homeScore;
              const result = teamScore > oppScore ? "W" : teamScore < oppScore ? "L" : "D";
              const resultColor = result === "W" ? "text-green-400" : result === "L" ? "text-red-400" : "text-yellow-400";
              return (
                <div key={m.id} className="px-4 py-3 flex items-center gap-3">
                  <span className={`font-bold text-sm w-4 ${resultColor}`}>{result}</span>
                  <span className="text-white font-medium text-sm flex-1 truncate">vs {m.opponent}</span>
                  <span className="text-stone-300 text-sm font-mono">{teamScore} – {oppScore}</span>
                  {m.date && (
                    <span className="text-stone-500 text-xs hidden sm:block">
                      {new Date(m.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
