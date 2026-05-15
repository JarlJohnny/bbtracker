"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewLeaguePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/leagues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Failed to create league");
      return;
    }

    const league = await res.json();
    router.push(`/leagues/${league.id}`);
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/leagues" className="text-stone-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Create League</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-700 rounded-xl p-6 space-y-4">
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">League Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={60}
            className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            placeholder="e.g. Oslo Blood Bowl League Season 3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm resize-none"
            placeholder="A short description of the league..."
          />
        </div>

        <div className="bg-stone-800 rounded-lg p-3 text-xs text-stone-400 space-y-1">
          <p>Standard Blood Bowl 2020 league rules:</p>
          <ul className="list-disc ml-4 space-y-0.5">
            <li>Win = 3 points, Draw = 1 point, Loss = 0 points</li>
            <li>SPP: TD=3, Completion=1, Interception=2, Casualty=2, MVP=4</li>
            <li>Level up at 6, 16, 31, 51, 76, 176 SPP</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-900 font-semibold rounded-lg py-2 text-sm transition-colors"
        >
          {loading ? "Creating..." : "Create League"}
        </button>
      </form>
    </div>
  );
}
