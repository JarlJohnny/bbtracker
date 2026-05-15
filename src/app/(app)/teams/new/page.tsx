"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RACES, formatGold } from "@/lib/bb-data";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface DraftPlayer {
  id: string;
  number: number;
  name: string;
  position: string;
}

const RACE_NAMES = Object.keys(RACES).sort();

export default function NewTeamPage() {
  const router = useRouter();
  const [step, setStep] = useState<"info" | "roster">("info");
  const [name, setName] = useState("");
  const [race, setRace] = useState("");
  const [rerolls, setRerolls] = useState(0);
  const [assistantCoaches, setAssistantCoaches] = useState(0);
  const [cheerleaders, setCheerleaders] = useState(0);
  const [hasApothecary, setHasApothecary] = useState(false);
  const [dedicatedFans, setDedicatedFans] = useState(1);
  const [players, setPlayers] = useState<DraftPlayer[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const raceData = race ? RACES[race] : null;

  const budget = 1000000;
  const spent = useMemo(() => {
    if (!raceData) return 0;
    const rrCost = raceData.rerollCost * rerolls;
    const apoCost = hasApothecary && raceData.canHaveApothecary ? 50000 : 0;
    const coachCost = assistantCoaches * 10000;
    const cheerCost = cheerleaders * 10000;
    const playersCost = players.reduce((sum, p) => {
      const pos = raceData.positions.find((pos) => pos.position === p.position);
      return sum + (pos?.cost ?? 0);
    }, 0);
    return rrCost + apoCost + coachCost + cheerCost + playersCost;
  }, [raceData, rerolls, hasApothecary, assistantCoaches, cheerleaders, players]);

  const remaining = budget - spent;

  function addPlayer(position: string) {
    if (!raceData) return;
    const posData = raceData.positions.find((p) => p.position === position);
    if (!posData || remaining < posData.cost) return;
    const usedNums = new Set(players.map((p) => p.number));
    const num = Array.from({ length: 16 }, (_, i) => i + 1).find((n) => !usedNums.has(n)) ?? 1;
    setPlayers([...players, { id: crypto.randomUUID(), number: num, name: `Player ${players.length + 1}`, position }]);
  }

  function removePlayer(id: string) {
    setPlayers(players.filter((p) => p.id !== id));
  }

  function updatePlayer(id: string, field: "name" | "number", value: string | number) {
    setPlayers(players.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }

  async function handleSubmit() {
    if (!race || !name.trim()) return;
    setError("");
    setLoading(true);

    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        race,
        rerolls,
        assistantCoaches,
        cheerleaders,
        hasApothecary,
        dedicatedFans,
        players: players.map((p) => ({ number: p.number, name: p.name, position: p.position })),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Failed to create team");
      return;
    }

    const team = await res.json();
    router.push(`/teams/${team.id}`);
  }

  if (step === "info") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/teams" className="text-stone-400 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Create New Team</h1>
        </div>

        <div className="bg-stone-900 border border-stone-700 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Team Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              placeholder="e.g. The Mighty Orcs"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">Race</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RACE_NAMES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRace(r)}
                  className={`text-sm py-2 px-3 rounded-lg border transition-colors text-left ${
                    race === r
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-stone-700 text-stone-300 hover:border-stone-500"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {raceData && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1">
                    Rerolls ({formatGold(raceData.rerollCost)} each)
                  </label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setRerolls(Math.max(0, rerolls - 1))} className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded text-white text-lg flex items-center justify-center">-</button>
                    <span className="text-white font-bold w-6 text-center">{rerolls}</span>
                    <button onClick={() => setRerolls(Math.min(8, rerolls + 1))} className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded text-white text-lg flex items-center justify-center">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1">Dedicated Fans</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDedicatedFans(Math.max(1, dedicatedFans - 1))} className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded text-white flex items-center justify-center">-</button>
                    <span className="text-white font-bold w-6 text-center">{dedicatedFans}</span>
                    <button onClick={() => setDedicatedFans(Math.min(6, dedicatedFans + 1))} className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded text-white flex items-center justify-center">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1">Assistant Coaches (10k each)</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setAssistantCoaches(Math.max(0, assistantCoaches - 1))} className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded text-white flex items-center justify-center">-</button>
                    <span className="text-white font-bold w-6 text-center">{assistantCoaches}</span>
                    <button onClick={() => setAssistantCoaches(Math.min(6, assistantCoaches + 1))} className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded text-white flex items-center justify-center">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-300 mb-1">Cheerleaders (10k each)</label>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCheerleaders(Math.max(0, cheerleaders - 1))} className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded text-white flex items-center justify-center">-</button>
                    <span className="text-white font-bold w-6 text-center">{cheerleaders}</span>
                    <button onClick={() => setCheerleaders(Math.min(6, cheerleaders + 1))} className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded text-white flex items-center justify-center">+</button>
                  </div>
                </div>
              </div>

              {raceData.canHaveApothecary && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="apo"
                    checked={hasApothecary}
                    onChange={(e) => setHasApothecary(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="apo" className="text-sm text-stone-300">Apothecary (50,000 gp)</label>
                </div>
              )}

              <div className={`rounded-lg p-3 flex items-center justify-between ${remaining < 0 ? "bg-red-900/30 border border-red-700" : "bg-stone-800"}`}>
                <span className="text-sm text-stone-300">Budget remaining</span>
                <span className={`font-bold ${remaining < 0 ? "text-red-400" : "text-amber-400"}`}>
                  {formatGold(remaining)}
                </span>
              </div>
            </>
          )}

          <button
            onClick={() => setStep("roster")}
            disabled={!name.trim() || !race}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-900 font-semibold rounded-lg py-2 text-sm transition-colors"
          >
            Continue to Roster
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setStep("info")} className="text-stone-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{name} – Roster</h1>
          <p className="text-stone-400 text-sm">{race} · Budget: <span className={remaining < 0 ? "text-red-400" : "text-amber-400"}>{formatGold(remaining)}</span> remaining</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2">{error}</div>
      )}

      {/* Add players */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl p-4">
        <h2 className="font-medium text-white mb-3 text-sm">Available Positions</h2>
        <div className="space-y-2">
          {raceData!.positions.map((pos) => {
            const count = players.filter((p) => p.position === pos.position).length;
            const affordable = remaining >= pos.cost;
            const atMax = count >= pos.qty;
            return (
              <div key={pos.position} className="flex items-center gap-3 bg-stone-800 rounded-lg px-3 py-2">
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{pos.position}</div>
                  <div className="text-xs text-stone-400">
                    {formatGold(pos.cost)} · MA{pos.ma} ST{pos.st} AG{pos.ag}+ PA{pos.pa === -1 ? "-" : `${pos.pa}+`} AV{pos.av}+
                    · {count}/{pos.qty}
                  </div>
                  {pos.skills.length > 0 && (
                    <div className="text-xs text-amber-400/70 mt-0.5">{pos.skills.join(", ")}</div>
                  )}
                </div>
                <button
                  onClick={() => addPlayer(pos.position)}
                  disabled={atMax || !affordable}
                  className="flex items-center gap-1 text-xs bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-stone-900 font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drafted players */}
      {players.length > 0 && (
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-4">
          <h2 className="font-medium text-white mb-3 text-sm">Drafted Players ({players.length})</h2>
          <div className="space-y-2">
            {players.map((p) => (
              <div key={p.id} className="flex items-center gap-3 bg-stone-800 rounded-lg px-3 py-2">
                <input
                  type="number"
                  value={p.number}
                  onChange={(e) => updatePlayer(p.id, "number", parseInt(e.target.value))}
                  min={1}
                  max={16}
                  className="w-12 bg-stone-700 border border-stone-600 rounded px-1.5 py-1 text-white text-sm text-center"
                />
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => updatePlayer(p.id, "name", e.target.value)}
                  className="flex-1 bg-stone-700 border border-stone-600 rounded px-2 py-1 text-white text-sm"
                />
                <span className="text-xs text-stone-400 hidden sm:block">{p.position}</span>
                <span className="text-xs text-amber-400">
                  {formatGold(raceData!.positions.find((pos) => pos.position === p.position)?.cost ?? 0)}
                </span>
                <button onClick={() => removePlayer(p.id)} className="text-stone-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || players.length < 11 || remaining < 0}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-900 font-semibold rounded-lg py-2.5 text-sm transition-colors"
      >
        {loading ? "Creating..." : players.length < 11 ? `Add ${11 - players.length} more player(s) (min 11)` : "Create Team"}
      </button>
    </div>
  );
}
