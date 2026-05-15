"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Save, SkipForward, Skull } from "lucide-react";
import Link from "next/link";
import { calculateSppEarned, SPP_LEVELS } from "@/lib/bb-data";

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
}

const ALL_SKILLS = [
  "Block", "Dodge", "Pass", "Sure Hands", "Catch", "Tackle", "Strip Ball", "Guard", "Mighty Blow (+1)", "Mighty Blow (+2)",
  "Frenzy", "Jump Up", "Side Step", "Wrestle", "Dauntless", "Leap", "Sprint", "Sure Feet", "Accurate",
  "Dump-Off", "Nerves of Steel", "Running Pass", "Strong Arm", "Hail Mary Pass", "On the Ball",
  "Shadowing", "Fend", "Stand Firm", "Grab", "Pile On", "Tentacles", "Prehensile Tail",
  "Regeneration", "Thick Skull", "Bone-head", "Really Stupid", "Wild Animal", "Loner (4+)",
  "Right Stuff", "Stunty", "Always Hungry", "Horns", "Claws", "Disturbing Presence", "Foul Appearance",
  "Hypnotic Gaze", "Stab", "Secret Weapon", "Chainsaw", "Ball & Chain", "Dirty Player (+1)", "Very Long Legs",
  "Juggernaut", "Inspiring Presence", "Bloodlust (2+)", "Brawler", "Decay", "Plague Ridden", "Take Root",
  "Throw Team-mate", "No Hands", "Projectile Vomit", "Drunkard",
];

const INJURY_OPTIONS = [
  "Niggling Injury", "MA-1", "ST-1", "AG+1", "PA+1", "AV-1", "Head Injury", "Smashed Knee",
  "Broken Arm", "Neck Injury", "Smashed Hip", "Smashed Ankle", "Dead",
];

export default function PlayerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [player, setPlayer] = useState<Player | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [injuries, setInjuries] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newInjury, setNewInjury] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/players/${params.id}`)
      .then((r) => r.json())
      .then((p) => {
        setPlayer(p);
        setName(p.name);
        setSkills(JSON.parse(p.skills));
        setInjuries(JSON.parse(p.injuries));
      });
  }, [params.id]);

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
    const updated = await res.json();
    setPlayer(updated);
    setEditing(false);
  }

  async function setStatus(field: string, value: boolean) {
    const res = await fetch(`/api/players/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPlayer(updated);
    }
  }

  if (!player) return <div className="text-stone-400 text-sm">Loading...</div>;

  const sppLevel = SPP_LEVELS.find((l) => player.spp >= l.min && (player.spp <= l.max || l.max === Infinity));
  const nextLevel = SPP_LEVELS.find((l) => l.min > player.spp);
  const sppProgress = sppLevel && nextLevel
    ? ((player.spp - sppLevel.min) / (nextLevel.min - sppLevel.min)) * 100
    : 100;

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
          <button
            onClick={() => setEditing(!editing)}
            className="text-sm text-amber-400 hover:text-amber-300"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        )}
      </div>

      {error && <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-3 py-2">{error}</div>}

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
          </div>
          {nextLevel && (
            <span className="text-stone-500 text-xs">{nextLevel.min - player.spp} to next level</span>
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
          {skills.map((skill) => (
            <span key={skill} className="bg-stone-700 text-stone-200 text-xs px-2 py-1 rounded-full flex items-center gap-1">
              {skill}
              {editing && (
                <button onClick={() => setSkills(skills.filter((s) => s !== skill))} className="text-stone-400 hover:text-red-400 ml-1">×</button>
              )}
            </span>
          ))}
          {skills.length === 0 && <span className="text-stone-500 text-sm">No skills</span>}
        </div>
        {editing && (
          <div className="flex gap-2">
            <select
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 bg-stone-800 border border-stone-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Select skill to add...</option>
              {ALL_SKILLS.filter((s) => !skills.includes(s)).sort().map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={() => { if (newSkill) { setSkills([...skills, newSkill]); setNewSkill(""); } }}
              disabled={!newSkill}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-900 font-semibold px-3 py-1.5 rounded-lg text-sm"
            >
              Add
            </button>
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
              {INJURY_OPTIONS.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
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
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 bg-stone-800 border border-stone-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Player name"
            />
          </div>
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
        <div className="flex gap-2">
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
    </div>
  );
}
