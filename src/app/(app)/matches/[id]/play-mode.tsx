"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Trophy, Swords, Target, Shield,
  ArrowRight, RotateCcw, Flag, CheckCircle, Zap,
} from "lucide-react";

interface Player {
  id: string; number: number; name: string; position: string;
  ma: number; st: number; ag: number; pa: number; av: number;
  skills: string; injuries: string; spp: number; level: string;
  isMissingNextGame: boolean;
}
interface Team { id: string; name: string; race: string; userId: string; players: Player[] }
interface GameEvent {
  id: string; type: string; teamSide: string;
  playerId: string | null; playerName: string | null;
  targetId: string | null; targetName: string | null;
  injuryResult: string | null; half: number; turn: number;
}
interface MatchData {
  id: string; status: string;
  homeScore: number; awayScore: number;
  half: number; turn: number; activeTeam: string;
  homeTeam: Team; awayTeam: Team; events: GameEvent[];
}

const INJURY_OPTIONS = [
  { value: "badly_hurt", label: "Badly Hurt" },
  { value: "mng", label: "Miss Next Game" },
  { value: "dead", label: "Dead!" },
  { value: "niggling", label: "Niggling Inj." },
  { value: "-MA", label: "-1 MA" },
  { value: "-ST", label: "-1 ST" },
  { value: "-AG", label: "-1 AG" },
  { value: "-PA", label: "-1 PA" },
  { value: "-AV", label: "-1 AV" },
];

const SPP_FOR: Record<string, number> = { touchdown: 3, casualty: 2, completion: 1, interception: 2 };

function formatEvent(evt: GameEvent, match: MatchData): string {
  const team = evt.teamSide === "home" ? match.homeTeam.name : match.awayTeam.name;
  const actor = evt.playerName ?? "Unknown";
  switch (evt.type) {
    case "touchdown":    return `${actor} (${team}) scored a Touchdown`;
    case "completion":   return `${actor} (${team}) made a Completion`;
    case "interception": return `${actor} (${team}) made an Interception`;
    case "casualty": {
      const inj = evt.injuryResult === "badly_hurt" ? "Badly Hurt"
        : evt.injuryResult === "mng" ? "MNG"
        : evt.injuryResult === "dead" ? "Dead!"
        : evt.injuryResult ?? "Badly Hurt";
      const target = evt.targetName ?? "opponent";
      return `${actor} (${team}) caused casualty on ${target} [${inj}]`;
    }
    case "ko": {
      const target = evt.targetName ?? "player";
      return `${target} (${team}) was Knocked Out`;
    }
    default: return evt.type;
  }
}

type EventType = "touchdown" | "casualty" | "completion" | "interception" | "ko";
type Phase = "play" | "halfEnd" | "review";

const INJURY_COLORS: Record<string, string> = {
  badly_hurt: "bg-yellow-900/40 text-yellow-300 border-yellow-700/50",
  mng:        "bg-orange-900/40 text-orange-300 border-orange-700/50",
  dead:       "bg-red-900/60 text-red-300 border-red-700/60",
  niggling:   "bg-amber-900/40 text-amber-300 border-amber-700/50",
  "-MA":      "bg-amber-900/40 text-amber-300 border-amber-700/50",
  "-ST":      "bg-amber-900/40 text-amber-300 border-amber-700/50",
  "-AG":      "bg-amber-900/40 text-amber-300 border-amber-700/50",
  "-PA":      "bg-amber-900/40 text-amber-300 border-amber-700/50",
  "-AV":      "bg-amber-900/40 text-amber-300 border-amber-700/50",
};

export function PlayMode({ match: initial }: { match: MatchData }) {
  const router = useRouter();
  const [match, setMatch] = useState<MatchData>(initial);
  const [phase, setPhase] = useState<Phase>("play");
  const [loading, setLoading] = useState(false);

  // Dugout inline edit state
  const [editEventId, setEditEventId] = useState<string | null>(null);

  // Event modal state
  const [modal, setModal] = useState<EventType | null>(null);
  const [evtTeam, setEvtTeam] = useState<"home" | "away">("home");
  const [evtPlayerId, setEvtPlayerId] = useState("");
  const [evtTargetTeam, setEvtTargetTeam] = useState<"home" | "away">("away");
  const [evtTargetId, setEvtTargetId] = useState("");
  const [evtInjury, setEvtInjury] = useState("badly_hurt");

  // Review state
  const [finalHome, setFinalHome] = useState(initial.homeScore);
  const [finalAway, setFinalAway] = useState(initial.awayScore);
  const [homeMvpId, setHomeMvpId] = useState("");
  const [awayMvpId, setAwayMvpId] = useState("");
  const [homeD3, setHomeD3] = useState(1);
  const [awayD3, setAwayD3] = useState(1);
  const [reviewNotes, setReviewNotes] = useState("");
  const [finishError, setFinishError] = useState("");

  const refreshMatch = useCallback(async () => {
    const res = await fetch(`/api/matches/${match.id}`);
    if (res.ok) {
      const data = await res.json();
      setMatch(data);
      setFinalHome(data.homeScore);
      setFinalAway(data.awayScore);
    }
  }, [match.id]);

  const patch = useCallback((body: object) => {
    fetch(`/api/matches/${match.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }, [match.id]);

  function updateInjuryResult(eventId: string, injuryResult: string) {
    setMatch((prev) => ({
      ...prev,
      events: prev.events.map((e) => e.id === eventId ? { ...e, injuryResult } : e),
    }));
    setEditEventId(null);
    fetch(`/api/matches/${match.id}/events/${eventId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ injuryResult }),
    });
  }

  // Compute running SPP from events
  const sppByPlayer: Record<string, number> = {};
  for (const evt of match.events) {
    if (evt.playerId && SPP_FOR[evt.type]) {
      sppByPlayer[evt.playerId] = (sppByPlayer[evt.playerId] ?? 0) + SPP_FOR[evt.type];
    }
  }

  const allPlayers = [...match.homeTeam.players, ...match.awayTeam.players];
  const playersWithSpp = allPlayers.filter((p) => sppByPlayer[p.id]);

  async function logEvent() {
    if (!modal) return;
    const type = modal;
    const players = evtTeam === "home" ? match.homeTeam.players : match.awayTeam.players;
    const player = players.find((p) => p.id === evtPlayerId);
    const targetPlayers = evtTargetTeam === "home" ? match.homeTeam.players : match.awayTeam.players;
    const target = targetPlayers.find((p) => p.id === evtTargetId);
    const side = evtTeam;
    const injury = evtInjury;

    const body = type === "ko" ? {
      type: "ko",
      teamSide: evtTargetTeam,
      playerId: null,
      playerName: null,
      targetId: target?.id ?? null,
      targetName: target ? `#${target.number} ${target.name}` : null,
      injuryResult: null,
    } : {
      type,
      teamSide: side,
      playerId: player?.id ?? null,
      playerName: player ? `#${player.number} ${player.name}` : null,
      targetId: type === "casualty" ? (target?.id ?? null) : null,
      targetName: type === "casualty" ? (target ? `#${target.number} ${target.name}` : null) : null,
      injuryResult: type === "casualty" ? injury : null,
    };

    // Optimistic update — close modal and update state immediately
    const tempId = `temp-${Date.now()}`;
    setMatch((prev) => ({
      ...prev,
      events: [...prev.events, { id: tempId, half: prev.half, turn: prev.turn, ...body }],
      homeScore: type === "touchdown" && side === "home" ? prev.homeScore + 1 : prev.homeScore,
      awayScore: type === "touchdown" && side === "away" ? prev.awayScore + 1 : prev.awayScore,
    }));
    setModal(null);
    setEvtPlayerId("");
    setEvtTargetId("");
    setEvtInjury("badly_hurt");

    // Sync in background — replace temp with real event (has a real ID for undo)
    const res = await fetch(`/api/matches/${match.id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const real = await res.json();
      setMatch((prev) => ({ ...prev, events: prev.events.map((e) => (e.id === tempId ? real : e)) }));
    } else {
      // Revert on failure
      setMatch((prev) => ({
        ...prev,
        events: prev.events.filter((e) => e.id !== tempId),
        homeScore: type === "touchdown" && side === "home" ? prev.homeScore - 1 : prev.homeScore,
        awayScore: type === "touchdown" && side === "away" ? prev.awayScore - 1 : prev.awayScore,
      }));
    }
  }

  function undoEvent(eventId: string) {
    const evt = match.events.find((e) => e.id === eventId);
    if (!evt) return;
    setMatch((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== eventId),
      homeScore: evt.type === "touchdown" && evt.teamSide === "home" ? prev.homeScore - 1 : prev.homeScore,
      awayScore: evt.type === "touchdown" && evt.teamSide === "away" ? prev.awayScore - 1 : prev.awayScore,
    }));
    fetch(`/api/matches/${match.id}/events/${eventId}`, { method: "DELETE" });
  }

  function endTurn() {
    const isLastTurnAway = match.turn === 8 && match.activeTeam === "away";
    if (isLastTurnAway) {
      if (match.half === 2) { setPhase("review"); return; }
      setPhase("halfEnd"); return;
    }
    const newActive = match.activeTeam === "home" ? "away" : "home";
    const newTurn   = match.activeTeam === "away" && match.turn < 8 ? match.turn + 1 : match.turn;
    setMatch((prev) => ({ ...prev, activeTeam: newActive, turn: newTurn }));
    patch({ action: "end_turn" });
  }

  function startSecondHalf(receiver: "home" | "away") {
    setMatch((prev) => ({ ...prev, half: 2, turn: 1, activeTeam: receiver }));
    setPhase("play");
    patch({ action: "end_half", activeTeam: receiver });
  }

  async function finishMatch() {
    setFinishError("");
    setLoading(true);
    const homeWin = finalHome > finalAway;
    const awayWin = finalAway > finalHome;
    const homeGold = (homeD3 + (homeWin ? 1 : 0)) * 10000;
    const awayGold = (awayD3 + (awayWin ? 1 : 0)) * 10000;

    try {
      const res = await fetch(`/api/matches/${match.id}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeScore: finalHome, awayScore: finalAway,
          homeGold, awayGold,
          homeMvpPlayerId: homeMvpId || undefined,
          awayMvpPlayerId: awayMvpId || undefined,
          notes: reviewNotes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFinishError(typeof data.error === "string" ? data.error : JSON.stringify(data.error));
        setLoading(false);
        return;
      }
      router.push(`/teams/${data.homeTeamId}`);
    } catch (err) {
      setFinishError(err instanceof Error ? err.message : "Network error");
      setLoading(false);
    }
  }

  function openModal(type: EventType) {
    const active = match.activeTeam as "home" | "away";
    const opponent = active === "home" ? "away" : "home";
    setEvtTeam(active);
    setEvtTargetTeam(type === "ko" ? opponent : opponent);
    setEvtPlayerId("");
    setEvtTargetId("");
    setEvtInjury("badly_hurt");
    setModal(type);
  }

  const activeName = match.activeTeam === "home" ? match.homeTeam.name : match.awayTeam.name;
  const isLastTurnAway = match.turn === 8 && match.activeTeam === "away";
  const reversedEvents = [...match.events].reverse();

  // Dugout: split into KO'd and injured
  const koEvents = match.events.filter((e) => e.type === "ko" && e.targetId);
  const injuredEvents = match.events.filter((e) => e.type === "casualty" && e.targetId);

  // ── Half-end modal ─────────────────────────────────────────────────────────
  if (phase === "halfEnd") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-8 max-w-sm w-full space-y-6 text-center">
          <div>
            <div className="text-amber-400 font-bold text-lg">Half Time!</div>
            <div className="text-stone-400 text-sm mt-1">
              {match.homeTeam.name} {match.homeScore} – {match.awayScore} {match.awayTeam.name}
            </div>
          </div>
          <div>
            <div className="text-stone-300 text-sm mb-3">Who kicks off in the 2nd half?</div>
            <div className="flex gap-3">
              {(["home", "away"] as const).map((side) => (
                <button
                  key={side}
                  onClick={() => startSecondHalf(side === "home" ? "away" : "home")}
                  className="flex-1 bg-stone-800 hover:bg-stone-700 border border-stone-600 text-white rounded-xl py-3 text-sm font-medium transition-colors"
                >
                  {side === "home" ? match.homeTeam.name : match.awayTeam.name}
                  <div className="text-stone-500 text-xs mt-0.5">kicks off</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Review screen ──────────────────────────────────────────────────────────
  if (phase === "review") {
    const homeWin = finalHome > finalAway;
    const awayWin = finalAway > finalHome;
    const homeGold = (homeD3 + (homeWin ? 1 : 0)) * 10000;
    const awayGold = (awayD3 + (awayWin ? 1 : 0)) * 10000;

    const casualtiesWithInjury = match.events.filter(
      (e) => e.type === "casualty" && e.injuryResult && e.injuryResult !== "badly_hurt"
    );

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setPhase("play")} className="text-stone-400 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Review & Finish</h1>
        </div>

        {/* Final score */}
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-5">
          <div className="text-stone-400 text-xs font-medium mb-4">Final Score</div>
          <div className="flex items-center gap-4 justify-center">
            {[
              { label: match.homeTeam.name, val: finalHome, set: setFinalHome },
              { label: match.awayTeam.name, val: finalAway, set: setFinalAway },
            ].map(({ label, val, set }, i) => (
              <div key={i} className="text-center flex-1">
                <div className="text-stone-400 text-xs truncate mb-2">{label}</div>
                <div className="flex items-center gap-2 justify-center">
                  <button onClick={() => set(Math.max(0, val - 1))} className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded-lg text-white flex items-center justify-center">−</button>
                  <span className="text-white font-bold text-3xl w-10 text-center">{val}</span>
                  <button onClick={() => set(val + 1)} className="w-8 h-8 bg-stone-700 hover:bg-stone-600 rounded-lg text-white flex items-center justify-center">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SPP + MVP */}
        {(playersWithSpp.length > 0 || true) && (
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-5">
            <div className="text-stone-400 text-xs font-medium mb-4">SPP Earned & MVP</div>
            {(["home", "away"] as const).map((side) => {
              const team = side === "home" ? match.homeTeam : match.awayTeam;
              const mvpId = side === "home" ? homeMvpId : awayMvpId;
              const setMvp = side === "home" ? setHomeMvpId : setAwayMvpId;
              return (
                <div key={side} className="mb-4 last:mb-0">
                  <div className="text-stone-500 text-xs mb-2">{team.name}</div>
                  <div className="space-y-1">
                    {team.players.map((p) => {
                      const earned = (sppByPlayer[p.id] ?? 0) + (p.id === mvpId ? 4 : 0);
                      const isMvp = p.id === mvpId;
                      return (
                        <div key={p.id} className={`flex items-center gap-3 py-1.5 px-2 rounded-lg text-sm ${isMvp ? "bg-amber-500/10" : ""}`}>
                          <span className="text-stone-500 text-xs w-6">#{p.number}</span>
                          <span className="text-stone-300 flex-1">{p.name}</span>
                          {earned > 0 && <span className="text-amber-400 font-bold text-xs">+{earned} SPP</span>}
                          <button
                            onClick={() => setMvp(isMvp ? "" : p.id)}
                            className={`text-xs px-2 py-0.5 rounded border transition-colors ${isMvp ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "border-stone-700 text-stone-600 hover:border-stone-500 hover:text-stone-400"}`}
                          >
                            MVP
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Injuries to apply */}
        {casualtiesWithInjury.length > 0 && (
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-5">
            <div className="text-stone-400 text-xs font-medium mb-3">Injuries to Apply</div>
            <div className="space-y-1.5">
              {casualtiesWithInjury.map((evt) => (
                <div key={evt.id} className="flex items-center gap-3 text-sm">
                  <span className="text-red-400 text-xs font-medium w-24 shrink-0">{evt.injuryResult}</span>
                  <span className="text-stone-400">{evt.targetName ?? "Unknown player"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Winnings */}
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-5">
          <div className="text-stone-400 text-xs font-medium mb-3">Post-Match Winnings (D3)</div>
          <div className="grid grid-cols-2 gap-4">
            {([
              { side: "home", label: match.homeTeam.name, d3: homeD3, setD3: setHomeD3, isWinner: homeWin, gold: homeGold },
              { side: "away", label: match.awayTeam.name, d3: awayD3, setD3: setAwayD3, isWinner: awayWin, gold: awayGold },
            ] as const).map(({ label, d3, setD3, isWinner, gold }, i) => (
              <div key={i} className="bg-stone-800 rounded-lg p-3 space-y-2">
                <div className="text-xs text-stone-400 truncate">{label}</div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3].map((n) => (
                    <button key={n} onClick={() => setD3(n)}
                      className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${d3 === n ? "bg-amber-500 text-stone-900" : "bg-stone-700 text-stone-300 hover:bg-stone-600"}`}>
                      {n}
                    </button>
                  ))}
                  {isWinner && <span className="text-xs text-green-400 ml-1">+1</span>}
                </div>
                <div className="text-amber-400 font-semibold text-sm">{(gold / 1000).toFixed(0)}k gp</div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-1">Notes (optional)</label>
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={2}
            className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Any notes about the match..."
          />
        </div>

        {finishError && (
          <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2 break-all">
            {finishError}
          </div>
        )}

        <button
          onClick={finishMatch}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-900 font-semibold rounded-xl py-3 text-sm transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          {loading ? "Saving..." : "Finish Match & Update Records"}
        </button>
      </div>
    );
  }

  // ── Play screen ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/teams/${match.homeTeam.id}`} className="text-stone-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="text-stone-300 text-sm font-medium">
            Half {match.half} · Turn {match.turn}
          </div>
          <div className="text-amber-400 text-xs truncate">{activeName}&apos;s turn</div>
        </div>
        <button
          onClick={() => setPhase("review")}
          className="flex items-center gap-1 text-xs text-stone-400 hover:text-white border border-stone-600 hover:border-stone-500 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <Flag className="w-3.5 h-3.5" /> End Game
        </button>
      </div>

      {/* Scoreboard */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl p-5">
        <div className="flex items-center">
          <div className="flex-1 text-center">
            <div className="text-stone-400 text-xs truncate mb-1">{match.homeTeam.name}</div>
            <div className="text-white font-bold text-5xl">{match.homeScore}</div>
          </div>
          <div className="text-stone-600 text-2xl font-bold px-3">–</div>
          <div className="flex-1 text-center">
            <div className="text-stone-400 text-xs truncate mb-1">{match.awayTeam.name}</div>
            <div className="text-white font-bold text-5xl">{match.awayScore}</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        {([
          { type: "touchdown" as const, label: "Touchdown", icon: <Trophy className="w-6 h-6 text-amber-400" />, border: "hover:border-amber-500/50" },
          { type: "casualty" as const, label: "Casualty", icon: <Swords className="w-6 h-6 text-red-400" />, border: "hover:border-red-500/50" },
          { type: "completion" as const, label: "Completion", icon: <Target className="w-6 h-6 text-blue-400" />, border: "hover:border-blue-500/50" },
          { type: "interception" as const, label: "Interception", icon: <Shield className="w-6 h-6 text-purple-400" />, border: "hover:border-purple-500/50" },
        ]).map(({ type, label, icon, border }) => (
          <button
            key={type}
            onClick={() => openModal(type)}
            className={`bg-stone-900 border border-stone-700 ${border} rounded-xl p-4 flex flex-col items-center gap-2 transition-colors`}
          >
            {icon}
            <span className="text-white text-sm font-medium">{label}</span>
            <span className="text-stone-500 text-xs">+{SPP_FOR[type]} SPP</span>
          </button>
        ))}
      </div>
      <button
        onClick={() => openModal("ko")}
        className="w-full bg-stone-900 border border-stone-700 hover:border-yellow-500/50 rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
      >
        <Zap className="w-4 h-4 text-yellow-400" />
        <span className="text-white text-sm font-medium">Knocked Out</span>
      </button>

      {/* Turn controls */}
      <div className="flex gap-3">
        <button
          onClick={endTurn}
          className="flex-1 bg-stone-800 hover:bg-stone-700 border border-stone-600 text-white rounded-xl py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          {isLastTurnAway
            ? (match.half === 2 ? "End Game" : "End Half")
            : "End Turn"}
        </button>
      </div>

      {/* Live SPP */}
      {playersWithSpp.length > 0 && (
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-4">
          <div className="text-stone-500 text-xs font-medium mb-2">SPP This Game</div>
          <div className="space-y-1">
            {playersWithSpp.map((p) => {
              const side = match.homeTeam.players.some((hp) => hp.id === p.id)
                ? match.homeTeam.name : match.awayTeam.name;
              return (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-stone-300 truncate">
                    <span className="text-stone-500 text-xs mr-1">#{p.number}</span>
                    {p.name}
                    <span className="text-stone-600 text-xs ml-1">({side})</span>
                  </span>
                  <span className="text-amber-400 font-bold ml-2 shrink-0">+{sppByPlayer[p.id]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dugout */}
      {(koEvents.length > 0 || injuredEvents.length > 0) && (
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 space-y-3">
          <div className="text-stone-500 text-xs font-medium">Dugout</div>

          {/* KO'd players */}
          {koEvents.length > 0 && (
            <div>
              <div className="text-yellow-500/70 text-xs mb-1.5">Knocked Out</div>
              <div className="space-y-1.5">
                {koEvents.map((evt) => {
                  const teamName = evt.teamSide === "home" ? match.homeTeam.name : match.awayTeam.name;
                  return (
                    <div key={evt.id} className="flex items-center gap-2 text-xs">
                      <span className="text-stone-500 shrink-0">H{evt.half}T{evt.turn}</span>
                      <span className="text-stone-400 flex-1 truncate">
                        {evt.targetName ?? "?"}
                        <span className="text-stone-600 ml-1">({teamName})</span>
                      </span>
                      <span className="bg-yellow-900/40 text-yellow-300 border border-yellow-700/50 px-2 py-0.5 rounded font-medium">KO</span>
                      <button
                        onClick={() => undoEvent(evt.id)}
                        className="text-xs text-stone-500 hover:text-green-400 px-2 py-0.5 rounded border border-stone-700 hover:border-green-700/50 transition-colors"
                      >
                        Recovered
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Injured players */}
          {injuredEvents.length > 0 && (
            <div>
              {koEvents.length > 0 && <div className="text-red-500/70 text-xs mb-1.5">Injured</div>}
              <div className="space-y-1.5">
                {injuredEvents.map((evt) => {
                  const injLabel = INJURY_OPTIONS.find((o) => o.value === evt.injuryResult)?.label ?? evt.injuryResult ?? "Badly Hurt";
                  const injColor = INJURY_COLORS[evt.injuryResult ?? "badly_hurt"] ?? INJURY_COLORS.badly_hurt;
                  const teamName = evt.teamSide === "home" ? match.homeTeam.name : match.awayTeam.name;
                  return (
                    <div key={evt.id} className="flex items-center gap-2 text-xs">
                      <span className="text-stone-500 shrink-0">H{evt.half}T{evt.turn}</span>
                      <span className="text-stone-400 flex-1 truncate">
                        {evt.targetName ?? "?"}
                        <span className="text-stone-600 ml-1">({teamName})</span>
                      </span>
                      {editEventId === evt.id ? (
                        <select
                          autoFocus
                          defaultValue={evt.injuryResult ?? "badly_hurt"}
                          onChange={(e) => updateInjuryResult(evt.id, e.target.value)}
                          onBlur={() => setEditEventId(null)}
                          className="bg-stone-800 border border-stone-600 rounded px-1 py-0.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          {INJURY_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditEventId(evt.id)}
                          className={`px-2 py-0.5 rounded border text-xs font-medium transition-colors hover:opacity-80 ${injColor}`}
                        >
                          {injLabel}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event log */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-700 flex items-center justify-between">
          <span className="text-white text-sm font-medium">Events ({match.events.length})</span>
        </div>
        {match.events.length === 0 ? (
          <div className="px-4 py-6 text-center text-stone-500 text-sm">No events logged yet</div>
        ) : (
          <div className="divide-y divide-stone-800 max-h-64 overflow-y-auto">
            {reversedEvents.map((evt, i) => (
              <div key={evt.id} className="px-4 py-2.5 flex items-center gap-3">
                <span className="text-stone-600 text-xs shrink-0">H{evt.half}T{evt.turn}</span>
                <span className="flex-1 text-xs text-stone-300 leading-snug">{formatEvent(evt, match)}</span>
                {i === 0 && (
                  <button onClick={() => undoEvent(evt.id)} className="text-stone-600 hover:text-red-400 shrink-0">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event modal */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/60 z-40 flex items-end sm:items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}
        >
          <div className="bg-stone-900 border border-stone-700 rounded-xl w-full max-w-md p-5 space-y-4">
            <h2 className="text-white font-semibold">
              {modal === "ko" ? "Knocked Out" : modal.charAt(0).toUpperCase() + modal.slice(1)}
            </h2>

            {/* KO modal: just pick the KO'd player */}
            {modal === "ko" && (
              <>
                <div>
                  <label className="block text-stone-400 text-xs mb-1.5">Team</label>
                  <div className="flex gap-2">
                    {(["home", "away"] as const).map((side) => (
                      <button
                        key={side}
                        onClick={() => { setEvtTargetTeam(side); setEvtTargetId(""); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${evtTargetTeam === side ? "bg-yellow-900/40 text-yellow-300 border-yellow-700/50" : "bg-stone-800 text-stone-300 border-stone-600 hover:border-stone-500"}`}
                      >
                        {side === "home" ? match.homeTeam.name : match.awayTeam.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-stone-400 text-xs mb-1.5">Player knocked out (optional)</label>
                  <select
                    value={evtTargetId}
                    onChange={(e) => setEvtTargetId(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Not tracked</option>
                    {(evtTargetTeam === "home" ? match.homeTeam.players : match.awayTeam.players).map((p) => (
                      <option key={p.id} value={p.id}>#{p.number} {p.name} — {p.position}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Non-KO: team + player selectors */}
            {modal !== "ko" && (
              <>
                <div>
                  <label className="block text-stone-400 text-xs mb-1.5">
                    {modal === "casualty" ? "Caused by" : "Team"}
                  </label>
                  <div className="flex gap-2">
                    {(["home", "away"] as const).map((side) => (
                      <button
                        key={side}
                        onClick={() => { setEvtTeam(side); setEvtPlayerId(""); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${evtTeam === side ? "bg-amber-500 text-stone-900 border-amber-500" : "bg-stone-800 text-stone-300 border-stone-600 hover:border-stone-500"}`}
                      >
                        {side === "home" ? match.homeTeam.name : match.awayTeam.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-stone-400 text-xs mb-1.5">Player (optional)</label>
                  <select
                    value={evtPlayerId}
                    onChange={(e) => setEvtPlayerId(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Not tracked</option>
                    {(evtTeam === "home" ? match.homeTeam.players : match.awayTeam.players).map((p) => (
                      <option key={p.id} value={p.id}>#{p.number} {p.name} — {p.position}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Casualty: target */}
            {modal === "casualty" && (
              <>
                <div>
                  <label className="block text-stone-400 text-xs mb-1.5">Player hurt (team)</label>
                  <div className="flex gap-2">
                    {(["home", "away"] as const).map((side) => (
                      <button
                        key={side}
                        onClick={() => { setEvtTargetTeam(side); setEvtTargetId(""); }}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${evtTargetTeam === side ? "bg-red-900/40 text-red-300 border-red-700/50" : "bg-stone-800 text-stone-300 border-stone-600 hover:border-stone-500"}`}
                      >
                        {side === "home" ? match.homeTeam.name : match.awayTeam.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-stone-400 text-xs mb-1.5">Player hurt (optional)</label>
                  <select
                    value={evtTargetId}
                    onChange={(e) => setEvtTargetId(e.target.value)}
                    className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Not tracked</option>
                    {(evtTargetTeam === "home" ? match.homeTeam.players : match.awayTeam.players).map((p) => (
                      <option key={p.id} value={p.id}>#{p.number} {p.name} — {p.position}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-stone-400 text-xs mb-1.5">Injury result</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {INJURY_OPTIONS.map((inj) => (
                      <button
                        key={inj.value}
                        onClick={() => setEvtInjury(inj.value)}
                        className={`py-1.5 px-1 rounded-lg text-xs font-medium border transition-colors text-center leading-tight ${evtInjury === inj.value
                          ? inj.value === "dead" ? "bg-red-600 text-white border-red-600"
                          : inj.value === "mng" ? "bg-orange-500/20 text-orange-300 border-orange-500/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-stone-800 text-stone-400 border-stone-700 hover:border-stone-500"}`}
                      >
                        {inj.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-1">
              <button onClick={() => setModal(null)} className="flex-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg py-2.5 text-sm font-medium">
                Cancel
              </button>
              <button onClick={logEvent} className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-900 rounded-lg py-2.5 text-sm font-bold transition-colors">
                {modal === "ko" ? "Log KO" : `Log ${modal.charAt(0).toUpperCase() + modal.slice(1)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
