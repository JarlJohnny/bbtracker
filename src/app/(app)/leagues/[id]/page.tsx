"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Trophy, Plus, Users, Swords, Play, CheckCircle } from "lucide-react";
import { RACE_COLORS, formatGold } from "@/lib/bb-data";

interface League {
  id: string;
  name: string;
  description: string | null;
  status: string;
  season: number;
  creator: { name: string; email: string };
  members: { id: string; role: string; user: { id: string; name: string; email: string } }[];
  teams: {
    id: string; name: string; race: string; wins: number; draws: number; losses: number;
    touchdownsFor: number; touchdownsAgainst: number; casualtiesFor: number; leaguePoints: number;
    user: { name: string }; _count: { players: number };
  }[];
  matches: {
    id: string; homeScore: number; awayScore: number; status: string;
    homeTeam: { id: string; name: string }; awayTeam: { id: string; name: string };
    playedAt: string | null;
  }[];
}

interface MyTeam {
  id: string;
  name: string;
  race: string;
  leagueId: string | null;
}

export default function LeaguePage() {
  const params = useParams<{ id: string }>();
  const [league, setLeague] = useState<League | null>(null);
  const [myTeams, setMyTeams] = useState<MyTeam[]>([]);
  const [addingTeam, setAddingTeam] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    fetch(`/api/leagues/${params.id}`).then((r) => r.json()).then(setLeague);
    fetch("/api/teams").then((r) => r.json()).then(setMyTeams);
  }

  useEffect(() => { load(); }, [params.id]);

  async function addTeam() {
    if (!selectedTeamId) return;
    setSaving(true);
    setError("");
    const res = await fetch(`/api/leagues/${params.id}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: selectedTeamId }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setError(typeof d.error === "string" ? d.error : "Failed to add team");
      return;
    }
    setAddingTeam(false);
    setSelectedTeamId("");
    load();
  }

  async function setStatus(status: string) {
    await fetch(`/api/leagues/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (!league) return <div className="text-stone-400 text-sm">Loading...</div>;

  const teamsNotInLeague = myTeams.filter((t) => !t.leagueId || t.leagueId !== params.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/leagues" className="text-stone-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white truncate">{league.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
              league.status === "active" ? "bg-green-900/50 text-green-400" :
              league.status === "finished" ? "bg-stone-700 text-stone-400" :
              "bg-yellow-900/50 text-yellow-400"
            }`}>
              {league.status}
            </span>
          </div>
          <p className="text-stone-400 text-sm">Season {league.season} · by {league.creator.name}</p>
        </div>

        <div className="flex gap-2 shrink-0">
          {league.status === "setup" && (
            <button onClick={() => setStatus("active")} className="flex items-center gap-1.5 text-sm bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors">
              <Play className="w-3.5 h-3.5" /> Start
            </button>
          )}
          {league.status === "active" && (
            <button onClick={() => setStatus("finished")} className="flex items-center gap-1.5 text-sm bg-stone-700 hover:bg-stone-600 text-white px-3 py-1.5 rounded-lg transition-colors">
              <CheckCircle className="w-3.5 h-3.5" /> Finish
            </button>
          )}
          {league.status !== "finished" && (
            <Link
              href={`/matches/new`}
              className="flex items-center gap-1.5 text-sm bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Match
            </Link>
          )}
        </div>
      </div>

      {league.description && (
        <p className="text-stone-400 text-sm">{league.description}</p>
      )}

      {error && <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2">{error}</div>}

      {/* Standings table */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-700">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Standings
          </h2>
          <button
            onClick={() => setAddingTeam(!addingTeam)}
            className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
          >
            <Plus className="w-3.5 h-3.5" /> Add team
          </button>
        </div>

        {addingTeam && (
          <div className="px-4 py-3 border-b border-stone-700 bg-stone-800/50 flex items-center gap-2">
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="flex-1 bg-stone-700 border border-stone-600 rounded-lg px-3 py-1.5 text-white text-sm"
            >
              <option value="">Select a team...</option>
              {teamsNotInLeague.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.race})</option>
              ))}
            </select>
            <button
              onClick={addTeam}
              disabled={!selectedTeamId || saving}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-900 font-semibold px-3 py-1.5 rounded-lg text-sm"
            >
              {saving ? "..." : "Add"}
            </button>
            <button onClick={() => setAddingTeam(false)} className="text-stone-500 hover:text-stone-300 text-sm">Cancel</button>
          </div>
        )}

        {league.teams.length === 0 ? (
          <div className="px-4 py-8 text-center text-stone-500 text-sm">No teams in this league yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-700/50">
                  <th className="text-left px-4 py-2 text-stone-400 font-medium text-xs">Team</th>
                  <th className="text-center px-2 py-2 text-stone-400 font-medium text-xs">Pts</th>
                  <th className="text-center px-2 py-2 text-stone-400 font-medium text-xs">W</th>
                  <th className="text-center px-2 py-2 text-stone-400 font-medium text-xs">D</th>
                  <th className="text-center px-2 py-2 text-stone-400 font-medium text-xs">L</th>
                  <th className="text-center px-2 py-2 text-stone-400 font-medium text-xs">TF</th>
                  <th className="text-center px-2 py-2 text-stone-400 font-medium text-xs">TA</th>
                  <th className="text-left px-2 py-2 text-stone-400 font-medium text-xs hidden sm:table-cell">Coach</th>
                </tr>
              </thead>
              <tbody>
                {league.teams.map((team, i) => (
                  <tr key={team.id} className="border-b border-stone-800 hover:bg-stone-800/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-500 text-xs w-4">{i + 1}</span>
                        <div className={`w-5 h-5 rounded ${RACE_COLORS[team.race] ?? "bg-stone-600"} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {team.name[0]}
                        </div>
                        <Link href={`/teams/${team.id}`} className="text-white hover:text-amber-400 transition-colors font-medium">
                          {team.name}
                        </Link>
                        <span className="text-stone-500 text-xs hidden sm:block">{team.race}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center font-bold text-amber-400">{team.leaguePoints}</td>
                    <td className="px-2 py-2.5 text-center text-green-400">{team.wins}</td>
                    <td className="px-2 py-2.5 text-center text-yellow-400">{team.draws}</td>
                    <td className="px-2 py-2.5 text-center text-red-400">{team.losses}</td>
                    <td className="px-2 py-2.5 text-center text-white">{team.touchdownsFor}</td>
                    <td className="px-2 py-2.5 text-center text-stone-400">{team.touchdownsAgainst}</td>
                    <td className="px-2 py-2.5 text-stone-400 text-xs hidden sm:table-cell">{team.user.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Match results */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-700">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-400" /> Match Results
          </h2>
        </div>
        {league.matches.length === 0 ? (
          <div className="px-4 py-6 text-center text-stone-500 text-sm">No matches played yet</div>
        ) : (
          <div className="divide-y divide-stone-800">
            {league.matches.map((m) => (
              <div key={m.id} className="px-4 py-3 flex items-center gap-2">
                <span className="text-stone-300 font-medium text-sm flex-1 text-right truncate">{m.homeTeam.name}</span>
                <span className="text-white font-bold font-mono px-3 py-1 bg-stone-800 rounded text-sm">
                  {m.homeScore} – {m.awayScore}
                </span>
                <span className="text-stone-300 font-medium text-sm flex-1 truncate">{m.awayTeam.name}</span>
                {m.playedAt && (
                  <span className="text-stone-500 text-xs shrink-0 hidden sm:block">
                    {new Date(m.playedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
