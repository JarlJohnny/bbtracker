import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Medal } from "lucide-react";

export default async function TournamentsPage() {
  await auth();

  // All signed-in users can browse every tournament.
  const tournaments = await prisma.tournament.findMany({
    include: {
      creator: { select: { name: true } },
      _count: { select: { entries: true, matches: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tournaments</h1>
          <p className="text-stone-400 text-sm mt-1">{tournaments.length} tournament{tournaments.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/tournaments/new"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> New Tournament
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-12 text-center">
          <Medal className="w-10 h-10 text-stone-600 mx-auto mb-3" />
          <h2 className="text-white font-semibold mb-1">No tournaments yet</h2>
          <p className="text-stone-400 text-sm mb-4">Run a round-robin tournament with auto-generated pairings</p>
          <Link href="/tournaments/new" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold px-4 py-2 rounded-lg text-sm">
            <Plus className="w-4 h-4" /> Create Tournament
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tournaments.map((t) => (
            <Link
              key={t.id}
              href={`/tournaments/${t.id}`}
              className="bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-xl p-4 transition-colors group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-600/20 border border-amber-600/30 flex items-center justify-center shrink-0">
                  <Medal className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white group-hover:text-amber-400 transition-colors truncate">{t.name}</div>
                  <div className="text-stone-400 text-xs">by {t.creator.name}</div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                  t.status === "active" ? "bg-green-900/50 text-green-400" :
                  t.status === "finished" ? "bg-stone-700 text-stone-400" :
                  "bg-yellow-900/50 text-yellow-400"
                }`}>
                  {t.status}
                </span>
              </div>

              {t.description && (
                <p className="text-stone-400 text-xs mb-3 line-clamp-2">{t.description}</p>
              )}

              <div className="flex items-center gap-4 text-xs text-stone-500">
                <span>{t._count.entries} teams</span>
                <span>{t._count.matches} matches</span>
                <span>{t.doubleRound ? "Double" : "Single"} round-robin</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
