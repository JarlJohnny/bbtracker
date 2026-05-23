"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Team { id: string; name: string; race: string; leagueId: string | null }
interface League { id: string; name: string }

function StartLiveMatchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preHomeId = searchParams.get("homeTeamId") ?? "";

  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [homeTeamId, setHomeTeamId] = useState(preHomeId);
  const [awayTeamId, setAwayTeamId] = useState("");
  const [leagueId, setLeagueId] = useState("");
  const [receiver, setReceiver] = useState<"home" | "away">("home");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/teams").then((r) => r.json()).then(setMyTeams);
    fetch("/api/leagues").then((r) => r.json()).then(setLeagues);
  }, []);

  useEffect(() => {
    if (!homeTeamId || !awayTeamId) return;
    const home = myTeams.find((t) => t.id === homeTeamId);
    const away = myTeams.find((t) => t.id === awayTeamId);
    if (home?.leagueId && home.leagueId === away?.leagueId) setLeagueId(home.leagueId);
  }, [homeTeamId, awayTeamId, myTeams]);

  const homeTeam = myTeams.find((t) => t.id === homeTeamId);
  const awayTeam = myTeams.find((t) => t.id === awayTeamId);

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!homeTeamId || !awayTeamId) return;
    setError("");
    setLoading(true);

    // receiver goes first (receives kick-off)
    const res = await fetch("/api/matches/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeTeamId,
        awayTeamId,
        leagueId: leagueId || undefined,
        activeTeam: receiver,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Failed to start match");
      return;
    }

    const match = await res.json();
    router.push(`/matches/${match.id}`);
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={homeTeamId ? `/teams/${homeTeamId}` : "/teams"} className="text-stone-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Start Live Match</h1>
      </div>

      <form onSubmit={handleStart} className="space-y-4">
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2">{error}</div>
        )}

        <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 space-y-4">
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
              {myTeams.filter((t) => t.id !== homeTeamId).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {leagues.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">League (optional)</label>
              <select
                value={leagueId}
                onChange={(e) => setLeagueId(e.target.value)}
                className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Friendly match</option>
                {leagues.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Kick-off */}
        {homeTeam && awayTeam && (
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-4">
            <label className="block text-sm font-medium text-stone-300 mb-3">Who receives the kick-off? (goes first)</label>
            <div className="flex gap-3">
              {(["home", "away"] as const).map((side) => {
                const team = side === "home" ? homeTeam : awayTeam;
                return (
                  <button
                    key={side}
                    type="button"
                    onClick={() => setReceiver(side)}
                    className={`flex-1 py-3 rounded-xl text-sm font-medium border transition-colors ${receiver === side ? "bg-amber-500 text-stone-900 border-amber-500" : "bg-stone-800 text-stone-300 border-stone-600 hover:border-stone-500"}`}
                  >
                    {team.name}
                    <div className={`text-xs mt-0.5 ${receiver === side ? "text-stone-700" : "text-stone-500"}`}>
                      {side} team
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !homeTeamId || !awayTeamId}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-900 font-semibold rounded-xl py-3 text-sm transition-colors"
        >
          {loading ? "Starting..." : "Kick Off!"}
        </button>
      </form>
    </div>
  );
}

export default function StartLiveMatchPage() {
  return (
    <Suspense fallback={<div className="text-stone-400">Loading...</div>}>
      <StartLiveMatchForm />
    </Suspense>
  );
}
