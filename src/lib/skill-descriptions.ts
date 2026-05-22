/**
 * Short descriptions for Blood Bowl skills and traits (BB2020 Season 2).
 * Keys must match the skill name strings used in bb-data.ts exactly.
 * Variant skills (Loner (4+), Mighty Blow (+1), Animosity …) are handled
 * by getSkillDescription() with a fallback prefix match.
 */
export const SKILL_DESCRIPTIONS: Record<string, string> = {
  // ── General ──────────────────────────────────────────────────────────────
  Block:
    "When this player is knocked down by a block, they may reroll the block dice once.",
  Dauntless:
    "Before blocking a player with higher Strength, roll a D6. On a result equal to or higher than the target's ST, this player's ST is raised to match for this block.",
  Defensive:
    "Opponents cannot use the Guard skill to assist blocks or blitzes against this player during the opposing team's turn.",
  "Dirty Player (+1)":
    "Add +1 to both the Armour roll and the Injury roll when this player makes a Foul action.",
  "Dirty Player (+2)":
    "Add +2 to both the Armour roll and the Injury roll when this player makes a Foul action.",
  Fend: "After being blocked, this player cannot be followed up by the active player.",
  Frenzy:
    "This player must always block or blitz the same target twice if the target is still standing after the first block. When Blitzing, this player must always move towards the target.",
  "Hit and Run":
    "After making a block, if this player has not used all their movement, they may move up to 2 extra squares ignoring tackle zones.",
  "Jump Up":
    "This player may stand up for free during their activation without spending 3 squares of movement.",
  Kick: "After the coin toss but before the kick-off, this player may choose to scatter the ball an extra D3 squares in any direction.",
  Pro: "Once per team turn, this player may reroll any one dice roll they make, as long as that roll has not already been rerolled.",
  Shadowing:
    "When an opposing player moves away from this player's tackle zone, both players roll a D6 and add their MA. If this player ties or wins, they may move into the vacated square.",
  "Strip Ball":
    "If this player pushes a ball-carrier, the ball scatters from the target's original square before the push. Cannot be countered by Sure Hands.",
  "Sure Hands":
    "This player may reroll a failed Pick Up roll. In addition, the Strip Ball skill cannot be used against this player.",
  Tackle:
    "Opposing players cannot use the Dodge skill reroll when dodging away from this player's tackle zones.",
  Wrestle:
    "This player may use this skill instead of rolling block dice. Both players are immediately placed prone — no Armour rolls are made and the ball is not dropped.",

  // ── Agility ──────────────────────────────────────────────────────────────
  Catch: "This player may reroll a failed Catch roll.",
  "Diving Catch":
    "This player may attempt to catch a ball that bounces into an adjacent square. They may also reroll a failed Catch roll on a Quick or Short pass aimed at them.",
  "Diving Tackle":
    "After an opposing player dodges out of this player's tackle zone, this player may be placed in the vacated square. The dodging player must immediately make another Dodge roll or be placed prone.",
  Dodge: "This player may reroll a failed Dodge roll once per turn. Opposing players also cannot use Tackle against their dodge rolls.",
  Leap: "This player may jump over a square occupied by any standing player by making an Agility test. Failure places them prone in the target square.",
  "On the Ball":
    "During kick-off, this player may move up to 6 squares before the kicking team sets up. This player may also attempt interceptions even if not the nearest player to the ball.",
  "Pass Block":
    "When an opposing player attempts a pass, this player may immediately move up to 4 squares and attempt an interception, even if not normally eligible.",
  "Safe Pair of Hands":
    "If this player is knocked down or placed prone while carrying the ball, they may choose which adjacent square the ball bounces to.",
  "Side Step":
    "When pushed, this player may choose which square they are pushed into rather than the active player deciding.",
  "Sneaky Git":
    "This player is not automatically sent off for a Foul if the Armour roll is a natural 2 (snake eyes), unless the referee spots the foul separately.",
  Sprint:
    "This player may attempt to move up to 3 extra squares when Going for It (instead of the normal 2).",
  "Sure Feet": "This player may reroll a failed Going for It roll.",

  // ── Passing ──────────────────────────────────────────────────────────────
  Accurate: "This player adds +1 to all Pass rolls they make.",
  "Cloud Burster":
    "This player may make a Hail Mary Pass with a -1 modifier, targeting a friendly player anywhere on the pitch. The ball must still be caught by a team-mate.",
  "Dump-Off":
    "When this player is targeted by a Blitz action, they may make an immediate Quick or Short pass before the block is made — even though it is not their team's turn.",
  "Hail Mary Pass":
    "This player may throw the ball to any square on the pitch regardless of range. The pass is always inaccurate — place the ball in the target square and scatter it three times.",
  "Nerves of Steel":
    "This player ignores any negative modifiers to Pass and Catch rolls caused by opposing players in their tackle zones.",
  Pass: "This player may reroll a failed Pass roll.",
  "Running Pass":
    "When making a Quick Pass, this player may move both before and after the throw, as long as their total movement does not exceed their MA.",
  "Safe Pass":
    "If this player fails a Pass roll and the ball scatters, they may reroll the scatter dice. The ball is then treated as an inaccurate pass.",
  "Strong Arm":
    "This player adds +1 to Pass rolls when making Short, Long, or Long Bomb passes.",

  // ── Strength ─────────────────────────────────────────────────────────────
  "Arm Bar":
    "If a block against an adjacent player results in Both Down and the opponent is placed prone, this player may make a free Injury roll against them.",
  Brawler:
    "This player may reroll a block dice result of Both Down once per block or blitz action.",
  "Break Tackle":
    "Once per team turn, this player may use their ST instead of their AG when making a Dodge roll.",
  Grab: "Instead of pushing the target into a random adjacent square, this player may choose which eligible square to push them into.",
  Guard:
    "This player may assist a block or foul even while in an opposing player's tackle zone.",
  Juggernaut:
    "When making a Blitz action, the opponent cannot use Fend, Stand Firm, or Wrestle against this player. Additionally, the player may treat a Both Down result as a Push.",
  "Mighty Blow (+1)":
    "Add +1 to either the Armour roll or the Injury roll (not both) when this player causes an opponent to be knocked down.",
  "Mighty Blow (+2)":
    "Add +2 to either the Armour roll or the Injury roll (not both) when this player causes an opponent to be knocked down.",
  "Multiple Block":
    "This player may block two adjacent opposing players simultaneously. Both dice are rolled, but the opposing coach may apply the best result to each player independently.",
  "Pile On":
    "When an adjacent opposing player is knocked down, this player may sacrifice their next action to make a free Injury roll with a +2 modifier, then is placed prone.",
  "Stand Firm":
    "This player does not have to be pushed back when a Push result is applied — they may choose to remain in their current square.",
  "Thick Skull":
    "When making an Injury roll against this player, a result of 7 is treated as Stunned rather than KO'd (effectively harder to knock out).",

  // ── Mutation ─────────────────────────────────────────────────────────────
  "Big Hand":
    "This player ignores negative modifiers from opposing tackle zones and Wet Weather when attempting to pick up the ball.",
  Claws:
    "When making an Armour roll against a player this player knocked down, a natural roll of 8+ breaks Armour regardless of the target's AV value.",
  "Disturbing Presence":
    "All opposing players within 3 squares suffer a -1 modifier to Pass, Catch, and Intercept rolls.",
  "Extra Arms":
    "This player gains +1 to Pick Up and Catch rolls.",
  "Foul Appearance":
    "Before a player blocks or fouls this player, they must roll a D6. On a 1, the action is wasted and the active player's turn ends.",
  Horns:
    "This player gains +1 Strength when making a Blitz action.",
  "Iron Hard Skin":
    "Opponents suffer a -1 modifier to Armour rolls when fouling this player.",
  "Monstrous Mouth":
    "This player gains +1 to Catch rolls and may reroll a failed Catch roll.",
  "Prehensile Tail":
    "Opposing players suffer a -1 modifier to Dodge rolls when leaving this player's tackle zone.",
  Tentacles:
    "When an adjacent opposing player attempts to move away, both players roll D6 + ST. If this player wins, the opponent is held and loses their action.",
  "Two Heads":
    "This player gains +1 to all Dodge rolls.",
  "Very Long Legs":
    "This player gains +1 to Jump Up rolls and may also attempt interceptions even if not the nearest player to the ball.",

  // ── Traits (not learnable) ────────────────────────────────────────────────
  "Always Hungry":
    "Before throwing a team-mate, roll a D6. On a 1 this player eats the team-mate instead — that player is immediately removed as a casualty.",
  "Animal Savagery":
    "At the start of each activation, roll a D6. On a 1, this player lashes out at a random adjacent team-mate instead of acting normally.",
  "Ball & Chain":
    "This player moves every activation in a direction determined by the Scatter template and cannot be given a Move action. They cannot carry the ball intentionally.",
  Bombardier:
    "Instead of blocking, this player may throw a bomb as a special Pass action. A bomb that lands can cause casualties to nearby players.",
  "Bone Head":
    "At the start of each activation, roll a D6. On a 1, this player loses their action for the turn but may still stand up and dodge away.",
  Chainsaw:
    "Instead of blocking, this player may attack with their chainsaw. The hit ignores Armour Value — the target must roll 2+ or suffer a Casualty result. On a 1, the chainsaw kicks back and injures the wielder.",
  Decay:
    "When this player suffers a Casualty result, roll a D6. On a 1, the Casualty result is one step worse on the Casualty table.",
  Drunkard:
    "At the start of each team turn, roll a D6. On a 1, this player suffers the Bone Head result and loses their action this turn.",
  "Hypnotic Gaze":
    "Once per team turn, this player may attempt to hypnotise an adjacent opposing player. On success, that player loses their tackle zones until end of the next opposing team turn.",
  Loner:
    "When this player uses a team reroll, first roll a D6. If the result is lower than the number in brackets, the reroll is wasted and cannot be used again this turn.",
  "No Hands":
    "This player cannot pick up or catch the ball. If the ball lands in their square, it bounces immediately.",
  "Pick-me-up":
    "When a friendly player adjacent to this player would be removed as a KO casualty, roll a D6. On a 4+, the result is ignored and the player stays on the pitch prone.",
  "Plague Ridden":
    "Once per game, if this player causes a Casualty result of Miss Next Game or worse, the injured player gains the Decay and Plague Ridden skills permanently.",
  "Pogo Stick":
    "This player may leap over occupied squares without making an Agility test, and treats all Leap rolls as if they had AG 2+.",
  "Projectile Vomit":
    "Instead of blocking, this player may vomit on an adjacent player. Both roll D6 + ST; if this player wins, the target is pushed back and must make an Armour roll.",
  "Really Stupid":
    "At the start of each activation, roll a D6. On a 1 or 2, this player loses their action for the turn and may only stand up.",
  Regeneration:
    "After this player is injured, roll a D6 at the end of the drive. On a 4+, the result is ignored and the player returns to the Reserves box.",
  "Right Stuff":
    "This player may be picked up and thrown by a team-mate with the Throw Team Mate skill.",
  "Secret Weapon":
    "At the end of any drive in which this player took part, they are automatically sent off for using an illegal weapon.",
  Stab: "Instead of blocking, this player may stab an adjacent player. Make an Armour roll — if broken, the target suffers a Casualty result with no Injury roll.",
  Stunty:
    "This player suffers a -1 modifier to Armour rolls when blocked. They may pass the ball to adjacent squares for free, but suffer -1 to all Dodge rolls.",
  Swoop:
    "When thrown using Throw Team Mate, this player may adjust their landing by up to 3 squares in any direction after the initial scatter.",
  "Take Root":
    "At the start of each activation, roll a D6. On a 1, this player cannot move this turn (but may still block and use skills).",
  "Throw Team Mate":
    "This player may pick up and throw a team-mate with the Right Stuff skill, following the standard Pass rules with some modifications.",
  "Throw Team-mate":
    "This player may pick up and throw a team-mate with the Right Stuff skill, following the standard Pass rules with some modifications.",
  "Timmm-ber!":
    "When this player is placed prone, all players in adjacent squares must pass a Dodge roll or be placed prone as well.",
  Titchy:
    "This player is so small they do not count for assists or crowd-surfing. Opposing players do not need to dodge to enter this player's tackle zone.",
  "Unchannelled Fury":
    "At the start of each activation, roll a D6. On a 1, this player lashes out at a random adjacent team-mate and loses their action this turn.",
  "Wild Animal":
    "At the start of each activation, roll a D6. On a 1 or 2, this player loses their action for the turn.",

  // ── Animosity (base key used for prefix matching) ─────────────────────────
  Animosity:
    "At the start of each activation, roll a D6. On a 1, this player refuses to act because of their dislike of certain team-mates — they lose their action for the turn.",

  // ── Other traits ─────────────────────────────────────────────────────────
  "Bribery and Corruption (Secret Weapon)":
    "Acts as a Secret Weapon — this player is sent off at the end of any drive they participate in, but the team may attempt a bribe to keep them on the pitch.",
  "On The Ball":
    "During kick-off, this player may move up to 6 squares before the kicking team sets up. They may also attempt interceptions even if not the nearest player.",
};

/**
 * Returns the description for a skill, handling variant suffixes and prefixes.
 * e.g. "Loner (4+)" → description for "Loner"
 *      "Animosity (Big Uns)" → description for "Animosity"
 *      "Dirty Player (+1)" → exact match
 */
export function getSkillDescription(skill: string): string | undefined {
  // Exact match first
  if (SKILL_DESCRIPTIONS[skill]) return SKILL_DESCRIPTIONS[skill];

  // Strip trailing parenthetical to find base key: "Loner (4+)" → "Loner"
  const base = skill.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (base !== skill && SKILL_DESCRIPTIONS[base]) return SKILL_DESCRIPTIONS[base];

  // Prefix match for keys like "Animosity" matching "Animosity (Orc Linemen)"
  const prefixKey = Object.keys(SKILL_DESCRIPTIONS).find(
    (k) => skill.startsWith(k + " (") || skill.startsWith(k + "(")
  );
  if (prefixKey) return SKILL_DESCRIPTIONS[prefixKey];

  return undefined;
}
