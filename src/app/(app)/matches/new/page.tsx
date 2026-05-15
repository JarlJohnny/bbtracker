"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { calculateSppEarned } from "@/lib/bb-data";

interface Team {
  id: string;
  name: string;
  race: string;
  players: Player[];
}

interface Player {
  id: string;
  number: number;
  name: string;
  position: string;
  isMissingNextGame: boolean;
  isDead: boolean;
  isRetired: boolean;
}

interface PlayerStat {
  playerId: string;
  touchdowns: number;
  completions: number;
  interceptions: number;
  casualties: number;
  mvp: boolean;
}

function defaultStat(playerId: string): PlayerStat {
  return { playerId, touchdowns: 0, completions: 0, interceptions: 0, casualties: 0, mvp: false };
}

function StatInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="text-center">
      <div className="text-stone-500 text-xs mb-1">{label}</div>
      <div className="flex items-center gap-1 justify-center">
        <button onClick={() => onChange(Math.max(0, value - 1))} className="w-6 h-6 bg-stone-700 hover:bg-stone-600 rounded text-white text-sm flex items-center justify-center">-</button>
        <span className="text-white font-bold w-5 text-center text-sm">{value}</span>
        <button onClick={() => onChange(value + 1)} className="w-6 h-6 bg-stone-700 hover:bg-stone-600 rounded text-white text-sm flex items-center justify-center">+</button>
      </div>
    </div>
  );
}

function NewMatchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preHomeId = searchParams.get("homeTeamId") ?? "";

  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [homeTeamId, setHomeTeamId] = useState(preHomeId);
  const [awayTeamId, setAwayTeamId] = useState("");
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeStats, setHomeStats] = useState<PlayerStat[]>([]);
  const [awayStats, setAwayStats] = useState<PlayerStat[]>([]);
  const [awayTeamNameInput, setAwayTeamNameInput] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/teams").then((r) => r.json()).then((teams) => {
      setMyTeams(teams);
      setAllTeams(teams);
    });
  }, []);

  useEffect(() => {
    if (homeTeamId) {
      const team = myTeams.find((t) => t.id === homeTeamId);
      if (team) {
        setHomeStats(
          team.players
            .filter((p) => !p.isDead && !p.isRetired)
            .map((p) => defaultStat(p.id))
        );
      }
    }
  }, [homeTeamId, myTeams]);

  useEffect(() => {
    if (awayTeamId) {
      const team = allTeams.find((t) => t.id === awayTeamId);
      if (team) {
        setAwayStats(
          team.players
            .filter((p) => !p.isDead && !p.isRetired)
            .map((p) => defaultStat(p.id))
        );
      }
    }
  }, [awayTeamId, allTeams]);

  function updateStat(isHome: boolean, playerId: string, field: keyof PlayerStat, value: number | boolean) {
    const setter = isHome ? setHomeStats : setAwayStats;
    setter((prev) =>
      prev.map((s) => (s.playerId === playerId ? { ...s, [field]: value } : s))
    );
  }

  function setMvp(isHome: boolean, playerId: string) {
    const setter = isHome ? setHomeStats : setAwayStats;
    setter((prev) =>
      prev.map((s) => ({ ...s, mvp: s.playerId === playerId }))
    );
  }

  const homeTeam = myTeams.find((t) => t.id === homeTeamId);
  const awayTeam = allTeams.find((t) => t.id === awayTeamId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!homeTeamId || !awayTeamId) return;
    setError("");
    setLoading(true);

    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeTeamId,
        awayTeamId,
        homeScore,
        awayScore,
        notes,
        homePlayerStats: homeStats,
        awayPlayerStats: awayStats,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Failed to record match");
      return;
    }

    router.push(`/teams/${homeTeamId}`);
  }

  function PlayerStatRow({ player, stat, isHome }: { player: Player; stat: PlayerStat; isHome: boolean }) {
    const spp = calculateSppEarned(stat);
    return (
      <div className={`grid grid-cols-12 gap-1 items-center py-2 border-b border-stone-800 last:border-0 ${stat.mvp ? "bg-amber-500/5" : ""}`}>
        <div className="col-span-3 text-sm text-stone-300 truncate px-1">
          <span className="text-stone-500 text-xs mr-1">#{player.number}</span>
          {player.name}
        </div>
        <div className="col-span-2">
          <StatInput label="TD" value={stat.touchdowns} onChange={(v) => updateStat(isHome, player.id, "touchdowns", v)} />
        </div>
        <div className="col-span-2">
          <StatInput label="Comp" value={stat.completions} onChange={(v) => updateStat(isHome, player.id, "completions", v)} />
        </div>
        <div className="col-span-2">
          <StatInput label="Int" value={stat.interceptions} onChange={(v) => updateStat(isHome, player.id, "interceptions", v)} />
        </div>
        <div className="col-span-2">
          <StatInput label="Cas" value={stat.casualties} onChange={(v) => updateStat(isHome, player.id, "casualties", v)} />
        </div>
        <div className="col-span-1 text-center">
          <div className="text-stone-500 text-xs mb-1">MVP</div>
          <input
            type="radio"
            name={isHome ? "home-mvp" : "away-mvp"}
            checked={stat.mvp}
            onChange={() => setMvp(isHome, player.id)}
            className="w-4 h-4 accent-amber-500"
          />
          {spp > 0 && <div className="text-amber-400 text-xs mt-0.5">+{spp}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={homeTeamId ? `/teams/${homeTeamId}` : "/teams"} className="text-stone-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Record Match</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2">{error}</div>}

        {/* Teams + score */}
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Home Team (yours)</label>
              <select
                value={homeTeamId}
                onChange={(e) => setHomeTeamId(e.target.value)}
                required
                className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select team...</option>
                {myTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Away Team</label>
              <select
                value={awayTeamId}
                onChange={(e) => setAwayTeamId(e.target.value)}
                required
                className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select team...</option>
                {allTeams.filter((t) => t.id !== homeTeamId).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center">
            <div className="text-center">
              <label className="block text-xs text-stone-400 mb-1">{homeTeam?.name ?? "Home"}</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setHomeScore(Math.max(0, homeScore - 1))} className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded-lg text-white text-xl flex items-center justify-center">-</button>
                <span className="text-white font-bold text-3xl w-10 text-center">{homeScore}</span>
                <button type="button" onClick={() => setHomeScore(homeScore + 1)} className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded-lg text-white text-xl flex items-center justify-center">+</button>
              </div>
            </div>
            <span className="text-stone-600 font-bold text-xl">–</span>
            <div className="text-center">
              <label className="block text-xs text-stone-400 mb-1">{awayTeam?.name ?? "Away"}</label>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setAwayScore(Math.max(0, awayScore - 1))} className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded-lg text-white text-xl flex items-center justify-center">-</button>
                <span className="text-white font-bold text-3xl w-10 text-center">{awayScore}</span>
                <button type="button" onClick={() => setAwayScore(awayScore + 1)} className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded-lg text-white text-xl flex items-center justify-center">+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Home player stats */}
        {homeTeam && homeStats.length > 0 && (
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-4">
            <h2 className="font-semibold text-white mb-3">{homeTeam.name} – Player Stats</h2>
            <div className="overflow-x-auto">
              {homeTeam.players
                .filter((p) => !p.isDead && !p.isRetired)
                .map((p) => {
                  const stat = homeStats.find((s) => s.playerId === p.id)!;
                  return stat ? <PlayerStatRow key={p.id} player={p} stat={stat} isHome={true} /> : null;
                })}
            </div>
          </div>
        )}

        {/* Away player stats */}
        {awayTeam && awayStats.length > 0 && (
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-4">
            <h2 className="font-semibold text-white mb-3">{awayTeam.name} – Player Stats</h2>
            <div className="overflow-x-auto">
              {awayTeam.players
                .filter((p) => !p.isDead && !p.isRetired)
                .map((p) => {
                  const stat = awayStats.find((s) => s.playerId === p.id)!;
                  return stat ? <PlayerStatRow key={p.id} player={p} stat={stat} isHome={false} /> : null;
                })}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Any notes about the match..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !homeTeamId || !awayTeamId}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-900 font-semibold rounded-lg py-2.5 text-sm transition-colors"
        >
          {loading ? "Recording..." : "Record Match & Update SPP"}
        </button>
      </form>
    </div>
  );
}

export default function NewMatchPage() {
  return (
    <Suspense fallback={<div className="text-stone-400">Loading...</div>}>
      <NewMatchForm />
    </Suspense>
  );
}
