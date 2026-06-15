"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Medal, Plus, Swords, Shuffle, CheckCircle, Trash2 } from "lucide-react";
import { RACE_COLORS } from "@/lib/bb-data";

interface TeamRef {
  id: string;
  name: string;
  race: string;
}

interface Entry {
  id: string;
  teamId: string;
  wins: number;
  draws: number;
  losses: number;
  touchdownsFor: number;
  touchdownsAgainst: number;
  casualtiesFor: number;
  points: number;
  team: TeamRef & { user: { name: string } };
}

interface TMatch {
  id: string;
  round: number | null;
  status: string;
  homeScore: number;
  awayScore: number;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
}

interface Tournament {
  id: string;
  name: string;
  description: string | null;
  status: string;
  doubleRound: boolean;
  isCreator: boolean;
  creator: { name: string };
  entries: Entry[];
  matches: TMatch[];
}

interface MyTeam {
  id: string;
  name: string;
  race: string;
  user: { id: string; name: string };
}

export default function TournamentPage() {
  const params = useParams<{ id: string }>();
  const [t, setT] = useState<Tournament | null>(null);
  const [myTeams, setMyTeams] = useState<MyTeam[]>([]);
  const [addingTeam, setAddingTeam] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    fetch(`/api/tournaments/${params.id}`).then((r) => r.json()).then(setT);
    fetch("/api/teams/all").then((r) => r.json()).then(setMyTeams);
  }

  useEffect(() => { load(); }, [params.id]);

  async function addTeam() {
    if (!selectedTeamId) return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/tournaments/${params.id}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: selectedTeamId }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json();
      setError(typeof d.error === "string" ? d.error : "Failed to add team");
      return;
    }
    setAddingTeam(false);
    setSelectedTeamId("");
    load();
  }

  async function removeTeam(teamId: string) {
    await fetch(`/api/tournaments/${params.id}/teams`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });
    load();
  }

  async function generate() {
    setBusy(true);
    setError("");
    const res = await fetch(`/api/tournaments/${params.id}/generate`, { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json();
      setError(typeof d.error === "string" ? d.error : "Failed to generate pairings");
      return;
    }
    load();
  }

  async function setStatus(status: string) {
    await fetch(`/api/tournaments/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  if (!t) return <div className="text-stone-400 text-sm">Loading...</div>;

  const enteredTeamIds = new Set(t.entries.map((e) => e.teamId));
  const teamsAvailable = myTeams.filter((mt) => !enteredTeamIds.has(mt.id));

  // Group matches by round
  const rounds = new Map<number, TMatch[]>();
  for (const m of t.matches) {
    const r = m.round ?? 0;
    if (!rounds.has(r)) rounds.set(r, []);
    rounds.get(r)!.push(m);
  }
  const sortedRounds = [...rounds.keys()].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/tournaments" className="text-stone-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white truncate">{t.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
              t.status === "active" ? "bg-green-900/50 text-green-400" :
              t.status === "finished" ? "bg-stone-700 text-stone-400" :
              "bg-yellow-900/50 text-yellow-400"
            }`}>
              {t.status}
            </span>
          </div>
          <p className="text-stone-400 text-sm">
            {t.doubleRound ? "Double" : "Single"} round-robin · by {t.creator.name}
          </p>
        </div>

        {t.isCreator && (
          <div className="flex gap-2 shrink-0">
            {t.status === "setup" && (
              <button
                onClick={generate}
                disabled={busy || t.entries.length < 2}
                className="flex items-center gap-1.5 text-sm bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-900 font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Shuffle className="w-3.5 h-3.5" /> Generate pairings
              </button>
            )}
            {t.status === "active" && (
              <button onClick={() => setStatus("finished")} className="flex items-center gap-1.5 text-sm bg-stone-700 hover:bg-stone-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                <CheckCircle className="w-3.5 h-3.5" /> Finish
              </button>
            )}
          </div>
        )}
      </div>

      {t.description && <p className="text-stone-400 text-sm">{t.description}</p>}

      {error && <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2">{error}</div>}

      {/* Standings */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-700">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Medal className="w-4 h-4 text-amber-400" /> Standings
          </h2>
          {t.isCreator && t.status === "setup" && (
            <button
              onClick={() => setAddingTeam(!addingTeam)}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300"
            >
              <Plus className="w-3.5 h-3.5" /> Add team
            </button>
          )}
        </div>

        {addingTeam && (
          <div className="px-4 py-3 border-b border-stone-700 bg-stone-800/50 flex items-center gap-2">
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="flex-1 bg-stone-700 border border-stone-600 rounded-lg px-3 py-1.5 text-white text-sm"
            >
              <option value="">Select a team...</option>
              {teamsAvailable.map((mt) => (
                <option key={mt.id} value={mt.id}>{mt.name} ({mt.race}) — {mt.user.name}</option>
              ))}
            </select>
            <button
              onClick={addTeam}
              disabled={!selectedTeamId || busy}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-900 font-semibold px-3 py-1.5 rounded-lg text-sm"
            >
              {busy ? "..." : "Add"}
            </button>
            <button onClick={() => setAddingTeam(false)} className="text-stone-500 hover:text-stone-300 text-sm">Cancel</button>
          </div>
        )}

        {t.entries.length === 0 ? (
          <div className="px-4 py-8 text-center text-stone-500 text-sm">No teams entered yet</div>
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
                  <th className="text-center px-2 py-2 text-stone-400 font-medium text-xs">Cas</th>
                  <th className="text-left px-2 py-2 text-stone-400 font-medium text-xs">Coach</th>
                  {t.isCreator && t.status === "setup" && <th className="px-2 py-2"></th>}
                </tr>
              </thead>
              <tbody>
                {t.entries.map((e, i) => (
                  <tr key={e.id} className="border-b border-stone-800 hover:bg-stone-800/50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-500 text-xs w-4">{i + 1}</span>
                        <div className={`w-5 h-5 rounded ${RACE_COLORS[e.team.race] ?? "bg-stone-600"} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                          {e.team.name[0]}
                        </div>
                        <Link href={`/teams/${e.team.id}`} className="text-white hover:text-amber-400 transition-colors font-medium">
                          {e.team.name}
                        </Link>
                        <span className="text-stone-500 text-xs hidden sm:block">{e.team.race}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center font-bold text-amber-400">{e.points}</td>
                    <td className="px-2 py-2.5 text-center text-green-400">{e.wins}</td>
                    <td className="px-2 py-2.5 text-center text-yellow-400">{e.draws}</td>
                    <td className="px-2 py-2.5 text-center text-red-400">{e.losses}</td>
                    <td className="px-2 py-2.5 text-center text-white">{e.touchdownsFor}</td>
                    <td className="px-2 py-2.5 text-center text-stone-400">{e.touchdownsAgainst}</td>
                    <td className="px-2 py-2.5 text-center text-stone-400">{e.casualtiesFor}</td>
                    <td className="px-2 py-2.5 text-stone-400 text-xs">{e.team.user.name}</td>
                    {t.isCreator && t.status === "setup" && (
                      <td className="px-2 py-2.5 text-center">
                        <button onClick={() => removeTeam(e.teamId)} className="text-stone-600 hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pairings by round */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-700">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Swords className="w-4 h-4 text-amber-400" /> Pairings
          </h2>
        </div>
        {t.matches.length === 0 ? (
          <div className="px-4 py-6 text-center text-stone-500 text-sm">
            {t.status === "setup" ? "Add teams and generate pairings to schedule rounds" : "No matches"}
          </div>
        ) : (
          <div className="divide-y divide-stone-800">
            {sortedRounds.map((r) => (
              <div key={r} className="px-4 py-3">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Round {r}</div>
                <div className="space-y-2">
                  {rounds.get(r)!.map((m) => (
                    <PairingRow
                      key={m.id}
                      match={m}
                      tournamentId={t.id}
                      canRecord={t.isCreator && t.status !== "setup"}
                      onRecorded={load}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PairingRow({
  match, tournamentId, canRecord, onRecorded,
}: {
  match: TMatch;
  tournamentId: string;
  canRecord: boolean;
  onRecorded: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeCas, setHomeCas] = useState(0);
  const [awayCas, setAwayCas] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const done = match.status === "completed";

  async function save() {
    setSaving(true);
    setErr("");
    const res = await fetch(`/api/tournaments/${tournamentId}/matches/${match.id}/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ homeScore, awayScore, homeCasualties: homeCas, awayCasualties: awayCas }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setErr(typeof d.error === "string" ? d.error : "Failed to record result");
      return;
    }
    setEditing(false);
    onRecorded();
  }

  return (
    <div className="bg-stone-800/50 rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="text-stone-300 font-medium text-sm flex-1 text-right truncate">{match.homeTeam.name}</span>
        {done ? (
          <span className="text-white font-bold font-mono px-3 py-1 bg-stone-900 rounded text-sm">
            {match.homeScore} – {match.awayScore}
          </span>
        ) : (
          <span className="text-stone-600 font-mono px-3 py-1 text-sm">vs</span>
        )}
        <span className="text-stone-300 font-medium text-sm flex-1 truncate">{match.awayTeam.name}</span>
        {canRecord && !done && (
          <button
            onClick={() => setEditing(!editing)}
            className="text-xs text-amber-400 hover:text-amber-300 shrink-0"
          >
            {editing ? "Cancel" : "Record"}
          </button>
        )}
      </div>

      {editing && !done && (
        <div className="mt-2 pt-2 border-t border-stone-700/50 space-y-2">
          {err && <div className="text-red-400 text-xs">{err}</div>}
          <div className="grid grid-cols-2 gap-3">
            <ScoreField label={`${match.homeTeam.name} TD`} value={homeScore} onChange={setHomeScore} />
            <ScoreField label={`${match.awayTeam.name} TD`} value={awayScore} onChange={setAwayScore} />
            <ScoreField label="Cas" value={homeCas} onChange={setHomeCas} />
            <ScoreField label="Cas" value={awayCas} onChange={setAwayCas} />
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-900 font-semibold rounded-lg py-1.5 text-sm transition-colors"
          >
            {saving ? "Saving..." : "Save result"}
          </button>
        </div>
      )}
    </div>
  );
}

function ScoreField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="text-center">
      <div className="text-stone-500 text-xs mb-1 truncate">{label}</div>
      <div className="flex items-center gap-1 justify-center">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="w-6 h-6 bg-stone-700 hover:bg-stone-600 rounded text-white text-sm flex items-center justify-center">-</button>
        <span className="text-white font-bold w-5 text-center text-sm">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="w-6 h-6 bg-stone-700 hover:bg-stone-600 rounded text-white text-sm flex items-center justify-center">+</button>
      </div>
    </div>
  );
}
