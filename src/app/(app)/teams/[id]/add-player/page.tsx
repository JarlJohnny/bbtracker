"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RACES, formatGold } from "@/lib/bb-data";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function AddPlayerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [team, setTeam] = useState<{ name: string; race: string; treasury: number } | null>(null);
  const [number, setNumber] = useState(1);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/teams/${params.id}`)
      .then((r) => r.json())
      .then((t) => {
        setTeam(t);
        const usedNums = new Set<number>(t.players?.map((p: { number: number }) => p.number) ?? []);
        const next = Array.from({ length: 16 }, (_, i) => i + 1).find((n) => !usedNums.has(n));
        if (next) setNumber(next);
      });
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!position) return;
    setError("");
    setLoading(true);

    const res = await fetch(`/api/teams/${params.id}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number, name, position }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Failed to add player");
      return;
    }
    router.push(`/teams/${params.id}`);
  }

  if (!team) return <div className="text-stone-400 text-sm">Loading...</div>;

  const raceData = RACES[team.race];
  const selectedPos = raceData?.positions.find((p) => p.position === position);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/teams/${params.id}`} className="text-stone-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold text-white">Add Player to {team.name}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-700 rounded-xl p-6 space-y-4">
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2">{error}</div>
        )}

        <div className="text-sm text-stone-400">
          Treasury: <span className="text-amber-400 font-medium">{formatGold(team.treasury)}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">Position</label>
          <div className="space-y-2">
            {raceData?.positions.map((pos) => (
              <button
                type="button"
                key={pos.position}
                onClick={() => setPosition(pos.position)}
                disabled={team.treasury < pos.cost}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                  position === pos.position
                    ? "border-amber-500 bg-amber-500/10"
                    : team.treasury < pos.cost
                    ? "border-stone-700 opacity-40 cursor-not-allowed"
                    : "border-stone-700 hover:border-stone-500"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium text-sm">{pos.position}</span>
                  <span className="text-amber-400 text-xs">{formatGold(pos.cost)}</span>
                </div>
                <div className="text-xs text-stone-400 mt-0.5">
                  MA{pos.ma} ST{pos.st} AG{pos.ag}+ PA{pos.pa === -1 ? "-" : `${pos.pa}+`} AV{pos.av}+
                  {pos.skills.length > 0 && ` · ${pos.skills.join(", ")}`}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Shirt Number</label>
            <input
              type="number"
              value={number}
              onChange={(e) => setNumber(parseInt(e.target.value))}
              min={1}
              max={16}
              required
              className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-1">Player Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Name"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !position || !name}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-900 font-semibold rounded-lg py-2 text-sm transition-colors"
        >
          {loading ? "Adding..." : selectedPos ? `Add Player (${formatGold(selectedPos.cost)})` : "Add Player"}
        </button>
      </form>
    </div>
  );
}
