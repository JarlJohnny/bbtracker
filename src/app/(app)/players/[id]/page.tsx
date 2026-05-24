"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, Save, SkipForward, Skull, TrendingUp, Star } from "lucide-react";
import Link from "next/link";
import {
  SPP_LEVELS,
  IMPROVEMENT_TV_COST,
  IMPROVEMENT_LABELS,
  SKILLS_BY_CATEGORY,
  getPositionData,
  pendingAdvancements,
  formatGold,
  type SkillCategory,
} from "@/lib/bb-data";
import { SkillBadge } from "@/components/skill-badge";

interface Improvement {
  id: string;
  type: string;
  value: string;
  sppSpent: number;
}

interface Player {
  id: string;
  number: number;
  name: string;
  position: string;
  race: string;
  ma: number;
  st: number;
  ag: number;
  pa: number;
  av: number;
  skills: string;
  injuries: string;
  spp: number;
  level: string;
  cost: number;
  isJourneyman: boolean;
  isMissingNextGame: boolean;
  isDead: boolean;
  isRetired: boolean;
  teamId: string;
  improvements: Improvement[];
}

const INJURY_OPTIONS = [
  "Niggling Injury", "MA-1", "ST-1", "AG+1", "PA+1", "AV-1",
  "Head Injury", "Smashed Knee", "Broken Arm", "Neck Injury",
  "Smashed Hip", "Smashed Ankle",
];

const STAT_TYPES = [
  { type: "stat_ma", label: "+1 MA" },
  { type: "stat_av", label: "+1 AV" },
  { type: "stat_pa", label: "-1 PA (improve)" },
  { type: "stat_ag", label: "-1 AG (improve)" },
  { type: "stat_st", label: "+1 ST" },
];

export default function PlayerPage() {
  const params = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [injuries, setInjuries] = useState<string[]>([]);
  const [newInjury, setNewInjury] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Level-up state
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [advType, setAdvType] = useState<string>("");
  const [advValue, setAdvValue] = useState<string>("");
  const [levelUpSaving, setLevelUpSaving] = useState(false);
  const [levelUpError, setLevelUpError] = useState("");

  function load() {
    fetch(`/api/players/${params.id}`)
      .then((r) => r.json())
      .then((p) => {
        setPlayer(p);
        setName(p.name);
        setSkills(JSON.parse(p.skills));
        setInjuries(JSON.parse(p.injuries));
      });
  }

  useEffect(() => { load(); }, [params.id]);

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch(`/api/players/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, skills, injuries }),
    });
    setSaving(false);
    if (!res.ok) { setError("Save failed"); return; }
    setEditing(false);
    load();
  }

  async function setStatus(field: string, value: boolean) {
    await fetch(`/api/players/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    load();
  }

  async function applyImprovement() {
    if (!advType || !advValue) return;
    setLevelUpSaving(true);
    setLevelUpError("");
    const res = await fetch(`/api/players/${params.id}/improvement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: advType, value: advValue }),
    });
    setLevelUpSaving(false);
    if (!res.ok) {
      const d = await res.json();
      setLevelUpError(typeof d.error === "string" ? d.error : "Failed to apply improvement");
      return;
    }
    setLevelUpOpen(false);
    setAdvType("");
    setAdvValue("");
    load();
  }

  if (!player) return <div className="text-stone-400 text-sm">Loading...</div>;

  const posData = getPositionData(player.race, player.position);
  const primaryCategories: SkillCategory[] = (posData?.primary ?? []) as SkillCategory[];
  const secondaryCategories: SkillCategory[] = (posData?.secondary ?? []) as SkillCategory[];

  const primarySkills = primaryCategories
    .flatMap((cat) => SKILLS_BY_CATEGORY[cat] ?? [])
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .filter((s) => !skills.includes(s))
    .sort();

  const secondarySkills = secondaryCategories
    .flatMap((cat) => SKILLS_BY_CATEGORY[cat] ?? [])
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .filter((s) => !skills.includes(s) && !primarySkills.includes(s))
    .sort();

  const allSkillsForRandom = [...primarySkills]; // random = pick from primary list

  const pending = pendingAdvancements(player.spp, player.improvements.length);

  const sppLevel = SPP_LEVELS.find((l) => player.spp >= l.min && (player.spp <= l.max || l.max === Infinity));
  const nextLevel = SPP_LEVELS.find((l) => l.min > player.spp);
  const sppProgress = sppLevel && nextLevel
    ? ((player.spp - sppLevel.min) / (nextLevel.min - sppLevel.min)) * 100
    : 100;

  const tvCost = advType ? IMPROVEMENT_TV_COST[advType] : 0;

  const skillOptionsForType: string[] =
    advType === "chosen_primary" ? primarySkills :
    advType === "chosen_secondary" ? secondarySkills :
    advType === "random_primary" ? allSkillsForRandom :
    [];

  const isStatType = advType.startsWith("stat_");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/teams/${player.teamId}`} className="text-stone-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            #{player.number} {player.name}
            {player.isDead && <Skull className="w-4 h-4 text-red-400" />}
          </h1>
          <p className="text-stone-400 text-sm">{player.position} · {player.race}</p>
        </div>
        {!player.isDead && !player.isRetired && (
          <button onClick={() => setEditing(!editing)} className="text-sm text-amber-400 hover:text-amber-300">
            {editing ? "Cancel" : "Edit"}
          </button>
        )}
      </div>

      {error && <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2">{error}</div>}

      {/* Pending advancement banner */}
      {pending > 0 && !player.isDead && !player.isRetired && (
        <button
          onClick={() => setLevelUpOpen(true)}
          className="w-full flex items-center gap-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 rounded-xl px-4 py-3 transition-colors text-left"
        >
          <Star className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <div className="text-amber-400 font-semibold text-sm">
              {pending} advancement{pending > 1 ? "s" : ""} available!
            </div>
            <div className="text-amber-400/60 text-xs">Click to apply a skill or stat improvement</div>
          </div>
          <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
        </button>
      )}

      {/* Level-up panel */}
      {levelUpOpen && (
        <div className="bg-stone-900 border border-amber-500/40 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" /> Level Up
            </h2>
            <button onClick={() => { setLevelUpOpen(false); setAdvType(""); setAdvValue(""); setLevelUpError(""); }} className="text-stone-500 hover:text-stone-300 text-sm">
              Cancel
            </button>
          </div>

          {levelUpError && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2">{levelUpError}</div>
          )}

          {/* Advancement type selection */}
          <div className="space-y-2">
            <div className="text-xs text-stone-400 mb-1">Choose advancement type</div>

            {/* Primary skills */}
            {primaryCategories.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-stone-500">Primary ({primaryCategories.join(", ")})</div>
                {["random_primary", "chosen_primary"].map((t) => (
                  <button
                    key={t}
                    onClick={() => { setAdvType(t); setAdvValue(""); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${
                      advType === t ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-stone-700 text-stone-300 hover:border-stone-500"
                    }`}
                  >
                    <span>{IMPROVEMENT_LABELS[t]}</span>
                    <span className={`text-xs font-medium ${advType === t ? "text-amber-400" : "text-stone-500"}`}>
                      +{formatGold(IMPROVEMENT_TV_COST[t])} TV
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Secondary skills */}
            {secondaryCategories.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-stone-500">Secondary ({secondaryCategories.join(", ")})</div>
                <button
                  onClick={() => { setAdvType("chosen_secondary"); setAdvValue(""); }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${
                    advType === "chosen_secondary" ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-stone-700 text-stone-300 hover:border-stone-500"
                  }`}
                >
                  <span>{IMPROVEMENT_LABELS["chosen_secondary"]}</span>
                  <span className={`text-xs font-medium ${advType === "chosen_secondary" ? "text-amber-400" : "text-stone-500"}`}>
                    +{formatGold(IMPROVEMENT_TV_COST["chosen_secondary"])} TV
                  </span>
                </button>
              </div>
            )}

            {/* Stat increases */}
            <div className="space-y-1">
              <div className="text-xs text-stone-500">Stat Increase</div>
              <div className="grid grid-cols-2 gap-1">
                {STAT_TYPES.map(({ type: t }) => (
                  <button
                    key={t}
                    onClick={() => { setAdvType(t); setAdvValue(t); }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${
                      advType === t ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-stone-700 text-stone-300 hover:border-stone-500"
                    }`}
                  >
                    <span>{IMPROVEMENT_LABELS[t]}</span>
                    <span className={`text-xs ${advType === t ? "text-amber-400" : "text-stone-500"}`}>
                      +{formatGold(IMPROVEMENT_TV_COST[t])} TV
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Skill picker (for skill-based advancements) */}
          {advType && !isStatType && (
            <div>
              <label className="block text-xs text-stone-400 mb-1">
                {advType === "random_primary" ? "Roll and pick skill" : "Choose skill"}
              </label>
              <select
                value={advValue}
                onChange={(e) => setAdvValue(e.target.value)}
                className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Select skill...</option>
                {skillOptionsForType.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* Confirm */}
          {advType && (advValue || isStatType) && (
            <div className="bg-stone-800 rounded-lg px-3 py-2 flex items-center justify-between text-sm">
              <span className="text-stone-300">
                {isStatType ? IMPROVEMENT_LABELS[advType] : advValue}
              </span>
              <span className="text-amber-400 font-medium">+{formatGold(tvCost)} TV</span>
            </div>
          )}

          <button
            onClick={applyImprovement}
            disabled={levelUpSaving || !advType || (!advValue && !isStatType)}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-900 font-semibold rounded-lg py-2 text-sm transition-colors"
          >
            {levelUpSaving ? "Applying..." : `Confirm (+${formatGold(tvCost)} TV)`}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl p-4">
        <div className="grid grid-cols-5 gap-3 text-center">
          {[
            { label: "MA", value: player.ma },
            { label: "ST", value: player.st },
            { label: "AG", value: `${player.ag}+` },
            { label: "PA", value: player.pa === -1 ? "-" : `${player.pa}+` },
            { label: "AV", value: `${player.av}+` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-stone-800 rounded-lg py-3">
              <div className="text-white font-bold text-xl">{value}</div>
              <div className="text-stone-500 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SPP Progress */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-white font-semibold">{player.level}</span>
            <span className="text-stone-400 text-sm ml-2">{player.spp} SPP</span>
            {player.improvements.length > 0 && (
              <span className="text-stone-500 text-xs ml-2">· {player.improvements.length} improvement{player.improvements.length !== 1 ? "s" : ""}</span>
            )}
          </div>
          {nextLevel && (
            <span className="text-stone-500 text-xs">{nextLevel.min - player.spp} to next</span>
          )}
        </div>
        <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all"
            style={{ width: `${Math.min(100, sppProgress)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-stone-500">
          {SPP_LEVELS.slice(0, 6).map((l) => (
            <span key={l.name} className={player.spp >= l.min ? "text-amber-400" : ""}>{l.min}</span>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-white">Skills</h2>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill) => {
            const isImproved = player.improvements.some((i) => i.value === skill);
            return (
              <SkillBadge
                key={skill}
                skill={skill}
                variant={isImproved ? "improved" : "default"}
                onRemove={editing ? () => setSkills(skills.filter((s) => s !== skill)) : undefined}
              />
            );
          })}
          {skills.length === 0 && <span className="text-stone-500 text-sm">No skills</span>}
        </div>

        {/* Improvement history */}
        {player.improvements.length > 0 && (
          <div className="border-t border-stone-700/50 pt-2 space-y-1">
            <div className="text-xs text-stone-500">Improvement history</div>
            {player.improvements.map((imp, i) => (
              <div key={imp.id} className="flex items-center gap-2 text-xs">
                <span className="text-stone-500">#{i + 1}</span>
                <span className="text-stone-300">{IMPROVEMENT_LABELS[imp.type] ?? imp.type}</span>
                {imp.value && imp.value !== imp.type && <span className="text-amber-400">→ {imp.value}</span>}
                <span className="text-stone-600 ml-auto">+{formatGold(IMPROVEMENT_TV_COST[imp.type] ?? 0)} TV</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Injuries */}
      <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 space-y-3">
        <h2 className="font-semibold text-white">Injuries & Niggles</h2>
        <div className="flex flex-wrap gap-1.5">
          {injuries.map((inj) => (
            <span key={inj} className="bg-red-900/40 text-red-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              {inj}
              {editing && (
                <button onClick={() => setInjuries(injuries.filter((i) => i !== inj))} className="hover:text-red-200 ml-1">×</button>
              )}
            </span>
          ))}
          {injuries.length === 0 && <span className="text-stone-500 text-sm">No injuries</span>}
        </div>
        {editing && (
          <div className="flex gap-2">
            <select
              value={newInjury}
              onChange={(e) => setNewInjury(e.target.value)}
              className="flex-1 bg-stone-800 border border-stone-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Select injury...</option>
              {INJURY_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
            <button
              onClick={() => { if (newInjury) { setInjuries([...injuries, newInjury]); setNewInjury(""); } }}
              disabled={!newInjury}
              className="bg-red-800 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg text-sm"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {editing && (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Player name"
          />
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-lg py-2 text-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Status actions */}
      {!player.isDead && !player.isRetired && !editing && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatus("isMissingNextGame", !player.isMissingNextGame)}
            className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border transition-colors ${
              player.isMissingNextGame
                ? "border-yellow-600 bg-yellow-600/10 text-yellow-400"
                : "border-stone-700 text-stone-400 hover:border-stone-500"
            }`}
          >
            <SkipForward className="w-4 h-4" />
            {player.isMissingNextGame ? "Unmark Missing" : "Missing Next Game"}
          </button>
          <button
            onClick={() => { if (confirm("Mark player as dead?")) setStatus("isDead", true); }}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-stone-700 text-stone-400 hover:border-red-700 hover:text-red-400 transition-colors"
          >
            <Skull className="w-4 h-4" />
            Dead
          </button>
          <button
            onClick={() => { if (confirm("Retire this player?")) setStatus("isRetired", true); }}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-stone-700 text-stone-400 hover:border-stone-500 transition-colors"
          >
            Retire
          </button>
        </div>
      )}

      {/* Revive / un-retire actions */}
      {(player.isDead || player.isRetired) && !editing && (
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 space-y-3">
          <div className="text-stone-500 text-xs">
            {player.isDead ? "This player is dead." : "This player is retired."}
          </div>
          <div className="flex gap-2 flex-wrap">
            {player.isDead && (
              <button
                onClick={() => { if (confirm("Revive this player? (correction only)")) setStatus("isDead", false); }}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-stone-700 text-stone-400 hover:border-green-700 hover:text-green-400 transition-colors"
              >
                <Skull className="w-4 h-4" />
                Revive (correction)
              </button>
            )}
            {player.isRetired && (
              <button
                onClick={() => { if (confirm("Un-retire this player?")) setStatus("isRetired", false); }}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-stone-700 text-stone-400 hover:border-stone-500 transition-colors"
              >
                Un-retire
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
