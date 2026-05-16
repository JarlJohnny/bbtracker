"use client";

import { useState } from "react";
import { formatGold, RACES } from "@/lib/bb-data";
import { useRouter } from "next/navigation";
import { ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  teamId: string;
  race: string;
  treasury: number;
  rerolls: number;
  dedicatedFans: number;
  assistantCoaches: number;
  cheerleaders: number;
  hasApothecary: boolean;
}

type Action =
  | "buy_reroll" | "sell_reroll"
  | "buy_fan" | "sell_fan"
  | "buy_coach" | "sell_coach"
  | "buy_cheerleader" | "sell_cheerleader"
  | "buy_apothecary";

export function TeamManagement({ teamId, race, treasury, rerolls, dedicatedFans, assistantCoaches, cheerleaders, hasApothecary }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<Action | null>(null);
  const [error, setError] = useState("");

  const raceData = RACES[race];
  const rerollCost = (raceData?.rerollCost ?? 60000) * 2;

  async function act(action: Action) {
    setError("");
    setLoading(action);
    const res = await fetch(`/api/teams/${teamId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(null);
    if (!res.ok) {
      const d = await res.json();
      setError(typeof d.error === "string" ? d.error : "Failed");
      return;
    }
    router.refresh();
  }

  function Row({
    label,
    value,
    cost,
    sellValue,
    buyAction,
    sellAction,
    canBuy,
    canSell,
    maxReached,
  }: {
    label: string;
    value: string | number;
    cost: number;
    sellValue?: number;
    buyAction: Action;
    sellAction?: Action;
    canBuy: boolean;
    canSell?: boolean;
    maxReached?: boolean;
  }) {
    const buying = loading === buyAction;
    const selling = sellAction ? loading === sellAction : false;
    return (
      <div className="flex items-center justify-between py-2.5 border-b border-stone-800 last:border-0">
        <div>
          <span className="text-white text-sm">{label}</span>
          <span className="text-stone-400 text-sm ml-2 font-medium">{value}</span>
        </div>
        <div className="flex items-center gap-2">
          {sellAction && canSell && (
            <button
              onClick={() => act(sellAction)}
              disabled={!!loading || !canSell}
              className="text-xs text-stone-500 hover:text-stone-300 border border-stone-700 hover:border-stone-500 px-2 py-1 rounded transition-colors disabled:opacity-40"
            >
              {selling ? "..." : `Sell (+${formatGold(sellValue ?? 0)})`}
            </button>
          )}
          <button
            onClick={() => act(buyAction)}
            disabled={!!loading || !canBuy || maxReached || treasury < cost}
            className="text-xs bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-900 font-semibold px-2.5 py-1 rounded transition-colors"
          >
            {buying ? "..." : `Buy (${formatGold(cost)})`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 border border-stone-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-stone-800 transition-colors"
      >
        <h2 className="font-semibold text-white flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-amber-400" />
          Team Management
          <span className="text-stone-500 text-xs font-normal">Treasury: {formatGold(treasury)}</span>
        </h2>
        {open ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4">
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-xs rounded-lg px-3 py-2 mb-3">{error}</div>
          )}

          <p className="text-stone-500 text-xs mb-3">
            Rerolls cost double ({formatGold(rerollCost)}) when bought mid-season. Staff sold for half price.
          </p>

          <Row
            label="Rerolls"
            value={rerolls}
            cost={rerollCost}
            sellValue={Math.floor((raceData?.rerollCost ?? 60000) / 2)}
            buyAction="buy_reroll"
            sellAction="sell_reroll"
            canBuy={treasury >= rerollCost && rerolls < 8}
            canSell={rerolls > 0}
            maxReached={rerolls >= 8}
          />
          <Row
            label="Dedicated Fans"
            value={dedicatedFans}
            cost={10000}
            sellValue={5000}
            buyAction="buy_fan"
            sellAction="sell_fan"
            canBuy={treasury >= 10000 && dedicatedFans < 6}
            canSell={dedicatedFans > 1}
            maxReached={dedicatedFans >= 6}
          />
          <Row
            label="Assistant Coaches"
            value={assistantCoaches}
            cost={10000}
            sellValue={5000}
            buyAction="buy_coach"
            sellAction="sell_coach"
            canBuy={treasury >= 10000 && assistantCoaches < 6}
            canSell={assistantCoaches > 0}
            maxReached={assistantCoaches >= 6}
          />
          <Row
            label="Cheerleaders"
            value={cheerleaders}
            cost={10000}
            sellValue={5000}
            buyAction="buy_cheerleader"
            sellAction="sell_cheerleader"
            canBuy={treasury >= 10000 && cheerleaders < 6}
            canSell={cheerleaders > 0}
            maxReached={cheerleaders >= 6}
          />
          {raceData?.canHaveApothecary && (
            <Row
              label="Apothecary"
              value={hasApothecary ? "Yes" : "No"}
              cost={50000}
              buyAction="buy_apothecary"
              canBuy={!hasApothecary && treasury >= 50000}
              maxReached={hasApothecary}
            />
          )}
        </div>
      )}
    </div>
  );
}
