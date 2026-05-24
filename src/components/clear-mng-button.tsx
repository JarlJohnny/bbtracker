"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ClearMngButton({ playerId }: { playerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function clear() {
    setLoading(true);
    await fetch(`/api/players/${playerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isMissingNextGame: false }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={clear}
      disabled={loading}
      className="ml-1 text-xs text-yellow-600 hover:text-yellow-400 disabled:opacity-40 transition-colors"
      title="Clear Missing Next Game"
    >
      {loading ? "…" : "✓"}
    </button>
  );
}
