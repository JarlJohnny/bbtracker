export type SkillCategory = "G" | "A" | "P" | "S" | "M";

export interface PlayerPosition {
  position: string;
  qty: number;
  cost: number;
  ma: number;
  st: number;
  ag: number;
  pa: number; // -1 = no passing stat
  av: number;
  skills: string[];
  primary: SkillCategory[];
  secondary: SkillCategory[];
}

export interface RaceData {
  name: string;
  rerollCost: number;
  canHaveApothecary: boolean;
  specialRules: string[];
  positions: PlayerPosition[];
}

export const RACES: Record<string, RaceData> = {
  Amazon: {
    name: "Amazon",
    rerollCost: 50000,
    canHaveApothecary: true,
    specialRules: ["Amazonian Resilience"],
    positions: [
      { position: "Amazon Linewoman", qty: 12, cost: 50000, ma: 6, st: 3, ag: 3, pa: 4, av: 8, skills: ["Dodge"], primary: ["G", "A"], secondary: ["S"] },
      { position: "Amazon Thrower", qty: 2, cost: 70000, ma: 6, st: 3, ag: 3, pa: 2, av: 8, skills: ["Dodge", "Pass"], primary: ["G", "A"], secondary: ["S"] },
      { position: "Amazon Catcher", qty: 4, cost: 70000, ma: 8, st: 2, ag: 3, pa: 5, av: 7, skills: ["Catch", "Dodge"], primary: ["G", "A"], secondary: ["S"] },
      { position: "Amazon Blitzer", qty: 4, cost: 90000, ma: 7, st: 3, ag: 3, pa: 4, av: 8, skills: ["Block", "Dodge"], primary: ["G", "A"], secondary: ["S"] },
    ],
  },
  "Black Orc": {
    name: "Black Orc",
    rerollCost: 70000,
    canHaveApothecary: true,
    specialRules: ["Badlands Brawl", "Bribery and Corruption"],
    positions: [
      { position: "Goblin Bruiser", qty: 4, cost: 40000, ma: 6, st: 2, ag: 3, pa: 4, av: 8, skills: ["Dodge", "Right Stuff", "Stunty"], primary: ["A"], secondary: ["G", "S"] },
      { position: "Black Orc Blocker", qty: 6, cost: 90000, ma: 4, st: 4, ag: 4, pa: 5, av: 10, skills: ["Brawler", "Grab"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Trained Troll", qty: 1, cost: 115000, ma: 4, st: 5, ag: 5, pa: -1, av: 10, skills: ["Loner (4+)", "Always Hungry", "Mighty Blow (+1)", "Projectile Vomit", "Really Stupid", "Regeneration", "Throw Team-mate"], primary: ["S"], secondary: ["G"] },
    ],
  },
  "Chaos Chosen": {
    name: "Chaos Chosen",
    rerollCost: 60000,
    canHaveApothecary: false,
    specialRules: ["Favoured of Chaos", "Masters of Mutation"],
    positions: [
      { position: "Chaos Beastman Runner", qty: 4, cost: 60000, ma: 6, st: 3, ag: 3, pa: 4, av: 8, skills: ["Horns"], primary: ["G", "M"], secondary: ["A", "S"] },
      { position: "Chaos Chosen Blocker", qty: 4, cost: 100000, ma: 5, st: 4, ag: 3, pa: 5, av: 9, skills: [], primary: ["G", "M", "S"], secondary: ["A"] },
      { position: "Chaos Troll", qty: 1, cost: 115000, ma: 4, st: 5, ag: 5, pa: -1, av: 10, skills: ["Loner (4+)", "Always Hungry", "Mighty Blow (+1)", "Projectile Vomit", "Really Stupid", "Regeneration", "Throw Team-mate"], primary: ["M", "S"], secondary: ["G"] },
      { position: "Chaos Ogre", qty: 1, cost: 140000, ma: 5, st: 5, ag: 4, pa: 5, av: 9, skills: ["Bone-head", "Loner (4+)", "Mighty Blow (+1)", "Thick Skull", "Throw Team-mate"], primary: ["M", "S"], secondary: ["G"] },
    ],
  },
  "Chaos Dwarf": {
    name: "Chaos Dwarf",
    rerollCost: 70000,
    canHaveApothecary: false,
    specialRules: ["Badlands Brawl", "Bribery and Corruption", "Masters of Mutation"],
    positions: [
      { position: "Hobgoblin", qty: 6, cost: 40000, ma: 6, st: 3, ag: 3, pa: 4, av: 8, skills: [], primary: ["G"], secondary: ["A", "S"] },
      { position: "Chaos Dwarf Blocker", qty: 6, cost: 70000, ma: 4, st: 3, ag: 4, pa: 6, av: 10, skills: ["Block", "Tackle", "Thick Skull"], primary: ["G", "M", "S"], secondary: ["A"] },
      { position: "Bull Centaur Blitzer", qty: 2, cost: 130000, ma: 6, st: 4, ag: 4, pa: 6, av: 9, skills: ["Sprint", "Sure Feet", "Thick Skull"], primary: ["G", "S"], secondary: ["A", "M"] },
      { position: "Minotaur", qty: 1, cost: 150000, ma: 5, st: 5, ag: 4, pa: -1, av: 9, skills: ["Loner (4+)", "Frenzy", "Horns", "Mighty Blow (+1)", "Thick Skull", "Wild Animal"], primary: ["M", "S"], secondary: ["G"] },
    ],
  },
  "Dark Elf": {
    name: "Dark Elf",
    rerollCost: 70000,
    canHaveApothecary: true,
    specialRules: ["Elven Kingdoms League"],
    positions: [
      { position: "Dark Elf Lineman", qty: 12, cost: 70000, ma: 6, st: 3, ag: 4, pa: 4, av: 8, skills: [], primary: ["G", "A"], secondary: ["S"] },
      { position: "Dark Elf Runner", qty: 2, cost: 80000, ma: 7, st: 3, ag: 4, pa: 3, av: 8, skills: ["Dump-Off"], primary: ["G", "A"], secondary: ["S"] },
      { position: "Dark Elf Blitzer", qty: 4, cost: 100000, ma: 7, st: 3, ag: 4, pa: 4, av: 8, skills: ["Block"], primary: ["G", "A"], secondary: ["S"] },
      { position: "Dark Elf Assassin", qty: 2, cost: 85000, ma: 7, st: 3, ag: 4, pa: 5, av: 8, skills: ["Shadowing", "Stab"], primary: ["A"], secondary: ["G", "S"] },
      { position: "Witch Elf", qty: 2, cost: 110000, ma: 7, st: 3, ag: 4, pa: 5, av: 8, skills: ["Dodge", "Frenzy", "Jump Up"], primary: ["G", "A"], secondary: ["S"] },
    ],
  },
  Dwarf: {
    name: "Dwarf",
    rerollCost: 50000,
    canHaveApothecary: true,
    specialRules: ["Old World Classic"],
    positions: [
      { position: "Dwarf Lineman", qty: 12, cost: 70000, ma: 4, st: 3, ag: 4, pa: 5, av: 10, skills: ["Block", "Tackle", "Thick Skull"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Dwarf Runner", qty: 2, cost: 85000, ma: 6, st: 3, ag: 4, pa: 4, av: 9, skills: ["Sure Hands", "Thick Skull"], primary: ["G"], secondary: ["A", "S"] },
      { position: "Dwarf Blitzer", qty: 4, cost: 80000, ma: 5, st: 3, ag: 4, pa: 5, av: 10, skills: ["Block", "Mighty Blow (+1)", "Thick Skull"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Troll Slayer", qty: 2, cost: 95000, ma: 5, st: 3, ag: 4, pa: -1, av: 9, skills: ["Block", "Dauntless", "Frenzy", "Thick Skull"], primary: ["S"], secondary: ["G"] },
      { position: "Deathroller", qty: 1, cost: 160000, ma: 4, st: 7, ag: 6, pa: -1, av: 11, skills: ["Dirty Player (+1)", "Loner (4+)", "Juggernaut", "Mighty Blow (+2)", "No Hands", "Secret Weapon", "Stand Firm"], primary: ["S"], secondary: ["G"] },
    ],
  },
  "Elven Union": {
    name: "Elven Union",
    rerollCost: 50000,
    canHaveApothecary: true,
    specialRules: ["Elven Kingdoms League"],
    positions: [
      { position: "Elven Union Lineman", qty: 12, cost: 60000, ma: 6, st: 3, ag: 4, pa: 4, av: 8, skills: [], primary: ["G", "A"], secondary: ["S"] },
      { position: "Elven Union Thrower", qty: 2, cost: 75000, ma: 6, st: 3, ag: 4, pa: 2, av: 8, skills: ["Pass"], primary: ["G", "A", "P"], secondary: ["S"] },
      { position: "Elven Union Catcher", qty: 4, cost: 100000, ma: 8, st: 3, ag: 4, pa: 5, av: 8, skills: ["Catch", "Nerves of Steel"], primary: ["G", "A"], secondary: ["S"] },
      { position: "Elven Union Blitzer", qty: 4, cost: 115000, ma: 7, st: 3, ag: 4, pa: 4, av: 8, skills: ["Block", "Side Step"], primary: ["G", "A"], secondary: ["S"] },
    ],
  },
  Goblin: {
    name: "Goblin",
    rerollCost: 60000,
    canHaveApothecary: false,
    specialRules: ["Bribery and Corruption", "Low Cost Linemen"],
    positions: [
      { position: "Goblin Lineman", qty: 16, cost: 40000, ma: 6, st: 2, ag: 3, pa: 4, av: 8, skills: ["Dodge", "Right Stuff", "Stunty"], primary: ["A"], secondary: ["G", "S"] },
      { position: "Fanatic", qty: 1, cost: 70000, ma: 3, st: 7, ag: 4, pa: -1, av: 8, skills: ["Ball & Chain", "Loner (4+)", "No Hands", "Secret Weapon", "Stunty"], primary: ["S"], secondary: ["A"] },
      { position: "Looney", qty: 1, cost: 40000, ma: 6, st: 2, ag: 3, pa: -1, av: 8, skills: ["Chainsaw", "Loner (4+)", "Secret Weapon", "Stunty"], primary: ["A"], secondary: ["S"] },
      { position: "Pogoer", qty: 1, cost: 75000, ma: 7, st: 2, ag: 3, pa: -1, av: 8, skills: ["Dodge", "Leap", "Loner (4+)", "Secret Weapon", "Stunty", "Very Long Legs"], primary: ["A"], secondary: ["G", "S"] },
      { position: "Trained Troll", qty: 2, cost: 115000, ma: 4, st: 5, ag: 5, pa: -1, av: 10, skills: ["Loner (4+)", "Always Hungry", "Mighty Blow (+1)", "Projectile Vomit", "Really Stupid", "Regeneration", "Throw Team-mate"], primary: ["S"], secondary: ["G"] },
    ],
  },
  Halfling: {
    name: "Halfling",
    rerollCost: 60000,
    canHaveApothecary: true,
    specialRules: ["Old World Classic", "Low Cost Linemen"],
    positions: [
      { position: "Halfling Hopeful", qty: 16, cost: 30000, ma: 5, st: 2, ag: 3, pa: 4, av: 7, skills: ["Dodge", "Right Stuff", "Stunty"], primary: ["A"], secondary: ["G", "S"] },
      { position: "Halfling Catcher", qty: 2, cost: 60000, ma: 5, st: 2, ag: 4, pa: 4, av: 7, skills: ["Catch", "Dodge", "Right Stuff", "Sprint", "Stunty"], primary: ["A"], secondary: ["G", "S"] },
      { position: "Halfling Hefty", qty: 2, cost: 50000, ma: 5, st: 2, ag: 3, pa: 3, av: 8, skills: ["Dodge", "Fend", "Stunty"], primary: ["A", "P"], secondary: ["G", "S"] },
      { position: "Ogre", qty: 2, cost: 140000, ma: 5, st: 5, ag: 4, pa: 5, av: 9, skills: ["Bone-head", "Loner (4+)", "Mighty Blow (+1)", "Thick Skull", "Throw Team-mate"], primary: ["S"], secondary: ["G"] },
    ],
  },
  "High Elf": {
    name: "High Elf",
    rerollCost: 50000,
    canHaveApothecary: true,
    specialRules: ["Elven Kingdoms League"],
    positions: [
      { position: "High Elf Lineman", qty: 12, cost: 70000, ma: 6, st: 3, ag: 4, pa: 4, av: 8, skills: [], primary: ["G", "A"], secondary: ["S"] },
      { position: "High Elf Thrower", qty: 2, cost: 100000, ma: 6, st: 3, ag: 4, pa: 2, av: 8, skills: ["Pass", "Safe Pair of Hands"], primary: ["G", "A", "P"], secondary: ["S"] },
      { position: "High Elf Catcher", qty: 4, cost: 95000, ma: 8, st: 3, ag: 4, pa: 5, av: 8, skills: ["Catch"], primary: ["G", "A"], secondary: ["S"] },
      { position: "High Elf Blitzer", qty: 4, cost: 110000, ma: 7, st: 3, ag: 4, pa: 4, av: 8, skills: ["Block"], primary: ["G", "A"], secondary: ["S"] },
    ],
  },
  Human: {
    name: "Human",
    rerollCost: 50000,
    canHaveApothecary: true,
    specialRules: ["Old World Classic"],
    positions: [
      { position: "Human Lineman", qty: 12, cost: 50000, ma: 6, st: 3, ag: 3, pa: 4, av: 8, skills: [], primary: ["G"], secondary: ["A", "S"] },
      { position: "Human Thrower", qty: 2, cost: 80000, ma: 6, st: 3, ag: 3, pa: 2, av: 8, skills: ["Pass", "Sure Hands"], primary: ["G", "P"], secondary: ["A", "S"] },
      { position: "Human Catcher", qty: 4, cost: 65000, ma: 8, st: 2, ag: 3, pa: 5, av: 7, skills: ["Catch", "Dodge"], primary: ["G", "A"], secondary: ["S"] },
      { position: "Human Blitzer", qty: 4, cost: 85000, ma: 7, st: 3, ag: 3, pa: 4, av: 8, skills: ["Block"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Ogre", qty: 1, cost: 140000, ma: 5, st: 5, ag: 4, pa: 5, av: 9, skills: ["Bone-head", "Loner (4+)", "Mighty Blow (+1)", "Thick Skull", "Throw Team-mate"], primary: ["S"], secondary: ["G"] },
    ],
  },
  "Imperial Nobility": {
    name: "Imperial Nobility",
    rerollCost: 70000,
    canHaveApothecary: true,
    specialRules: ["Old World Classic"],
    positions: [
      { position: "Retainer Lineman", qty: 12, cost: 40000, ma: 6, st: 3, ag: 3, pa: 4, av: 8, skills: ["Bribery and Corruption (Secret Weapon)"], primary: ["G"], secondary: ["A", "S"] },
      { position: "Bodyguard", qty: 4, cost: 70000, ma: 6, st: 3, ag: 3, pa: 5, av: 9, skills: ["Stand Firm", "Thick Skull"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Imperial Thrower", qty: 2, cost: 75000, ma: 6, st: 3, ag: 3, pa: 2, av: 8, skills: ["Pass", "Running Pass"], primary: ["G", "P"], secondary: ["A", "S"] },
      { position: "Noble Blitzer", qty: 4, cost: 100000, ma: 8, st: 3, ag: 3, pa: 4, av: 8, skills: ["Block", "Dodge"], primary: ["G", "A"], secondary: ["S"] },
      { position: "Ogre", qty: 1, cost: 140000, ma: 5, st: 5, ag: 4, pa: 5, av: 9, skills: ["Bone-head", "Loner (4+)", "Mighty Blow (+1)", "Thick Skull", "Throw Team-mate"], primary: ["S"], secondary: ["G"] },
    ],
  },
  Khorne: {
    name: "Khorne",
    rerollCost: 70000,
    canHaveApothecary: false,
    specialRules: ["Favoured of Chaos"],
    positions: [
      { position: "Khorne Marauder", qty: 4, cost: 60000, ma: 6, st: 3, ag: 3, pa: 5, av: 8, skills: ["Frenzy"], primary: ["G", "M"], secondary: ["A", "S"] },
      { position: "Khorne Warrior", qty: 4, cost: 85000, ma: 5, st: 4, ag: 3, pa: 5, av: 9, skills: ["Frenzy"], primary: ["G", "M", "S"], secondary: ["A"] },
      { position: "Khorne Berserker", qty: 4, cost: 100000, ma: 6, st: 4, ag: 3, pa: 6, av: 8, skills: ["Frenzy", "Juggernaut"], primary: ["G", "M", "S"], secondary: ["A"] },
      { position: "Bloodsecrator", qty: 1, cost: 75000, ma: 6, st: 3, ag: 3, pa: 6, av: 8, skills: ["Frenzy", "Inspiring Presence"], primary: ["G", "M"], secondary: ["A", "S"] },
      { position: "Skull Crusher Blocker", qty: 2, cost: 115000, ma: 5, st: 5, ag: 4, pa: 6, av: 10, skills: ["Frenzy", "Loner (4+)", "Thick Skull"], primary: ["S"], secondary: ["G", "M"] },
    ],
  },
  Lizardmen: {
    name: "Lizardmen",
    rerollCost: 60000,
    canHaveApothecary: true,
    specialRules: ["Lustrian Superleague"],
    positions: [
      { position: "Skink Runner", qty: 6, cost: 60000, ma: 8, st: 2, ag: 3, pa: 4, av: 7, skills: ["Dodge", "Stunty"], primary: ["A"], secondary: ["G", "S"] },
      { position: "Saurus Blocker", qty: 6, cost: 80000, ma: 6, st: 4, ag: 5, pa: 6, av: 10, skills: [], primary: ["G", "S"], secondary: ["A"] },
      { position: "Chameleon Skink", qty: 2, cost: 65000, ma: 7, st: 2, ag: 4, pa: 4, av: 7, skills: ["Catch", "Dodge", "On the Ball", "Shadowing", "Stunty"], primary: ["A"], secondary: ["G", "S"] },
      { position: "Kroxigor", qty: 1, cost: 140000, ma: 6, st: 5, ag: 5, pa: -1, av: 10, skills: ["Bone-head", "Loner (4+)", "Mighty Blow (+1)", "Prehensile Tail", "Thick Skull"], primary: ["S"], secondary: ["G"] },
    ],
  },
  "Necromantic Horror": {
    name: "Necromantic Horror",
    rerollCost: 70000,
    canHaveApothecary: false,
    specialRules: ["Favoured of Nurgle", "Sylvanian Spotlight"],
    positions: [
      { position: "Zombie Lineman", qty: 12, cost: 40000, ma: 4, st: 3, ag: 5, pa: -1, av: 8, skills: ["Regeneration"], primary: ["G"], secondary: ["A", "S"] },
      { position: "Ghoul Runner", qty: 2, cost: 75000, ma: 7, st: 3, ag: 3, pa: 4, av: 8, skills: ["Dodge"], primary: ["G", "A"], secondary: ["S"] },
      { position: "Wraith", qty: 2, cost: 95000, ma: 6, st: 3, ag: 3, pa: -1, av: 8, skills: ["Block", "Dodge", "Foul Appearance", "No Hands", "Regeneration", "Side Step"], primary: ["G"], secondary: ["A", "S"] },
      { position: "Wight Blitzer", qty: 2, cost: 90000, ma: 6, st: 3, ag: 3, pa: 5, av: 9, skills: ["Block", "Regeneration"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Flesh Golem", qty: 2, cost: 115000, ma: 4, st: 4, ag: 4, pa: -1, av: 10, skills: ["Regeneration", "Stand Firm", "Thick Skull"], primary: ["G", "S"], secondary: ["A"] },
    ],
  },
  Norse: {
    name: "Norse",
    rerollCost: 60000,
    canHaveApothecary: true,
    specialRules: ["Favoured of Nuffle", "Badlands Brawl"],
    positions: [
      { position: "Norse Raider Lineman", qty: 12, cost: 50000, ma: 6, st: 3, ag: 3, pa: 4, av: 7, skills: ["Block", "Drunkard", "Thick Skull"], primary: ["G"], secondary: ["A", "S"] },
      { position: "Norse Thrower", qty: 2, cost: 70000, ma: 6, st: 3, ag: 3, pa: 2, av: 7, skills: ["Pass", "Sure Hands", "Thick Skull"], primary: ["G", "P"], secondary: ["A", "S"] },
      { position: "Norse Catcher", qty: 2, cost: 65000, ma: 7, st: 3, ag: 3, pa: 5, av: 7, skills: ["Catch", "Dauntless", "Dodge", "Thick Skull"], primary: ["G", "A"], secondary: ["S"] },
      { position: "Berserker", qty: 4, cost: 90000, ma: 6, st: 3, ag: 3, pa: 5, av: 8, skills: ["Block", "Frenzy", "Jump Up", "Thick Skull"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Valkyrie", qty: 2, cost: 95000, ma: 7, st: 3, ag: 3, pa: 3, av: 8, skills: ["Catch", "Dauntless", "Pass", "Strip Ball", "Thick Skull"], primary: ["G", "A", "P"], secondary: ["S"] },
      { position: "Ulfwerener", qty: 2, cost: 110000, ma: 6, st: 4, ag: 4, pa: -1, av: 8, skills: ["Frenzy", "Thick Skull"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Snow Troll", qty: 1, cost: 115000, ma: 5, st: 5, ag: 4, pa: -1, av: 9, skills: ["Claws", "Loner (4+)", "Mighty Blow (+1)", "Foul Appearance", "Regeneration", "Really Stupid"], primary: ["S"], secondary: ["G"] },
    ],
  },
  Nurgle: {
    name: "Nurgle",
    rerollCost: 70000,
    canHaveApothecary: false,
    specialRules: ["Favoured of Chaos", "Favoured of Nurgle"],
    positions: [
      { position: "Rotter Lineman", qty: 12, cost: 40000, ma: 5, st: 3, ag: 4, pa: 5, av: 9, skills: ["Decay", "Plague Ridden"], primary: ["G", "M"], secondary: ["A", "S"] },
      { position: "Pestigor", qty: 4, cost: 65000, ma: 6, st: 3, ag: 3, pa: 4, av: 9, skills: ["Horns", "Plague Ridden", "Regeneration"], primary: ["G", "M"], secondary: ["A", "S"] },
      { position: "Bloater", qty: 4, cost: 110000, ma: 4, st: 4, ag: 4, pa: 6, av: 10, skills: ["Disturbing Presence", "Foul Appearance", "Plague Ridden", "Regeneration"], primary: ["G", "M", "S"], secondary: ["A"] },
      { position: "Beast of Nurgle", qty: 1, cost: 140000, ma: 4, st: 5, ag: 4, pa: -1, av: 10, skills: ["Loner (4+)", "Always Hungry", "Disturbing Presence", "Foul Appearance", "Mighty Blow (+1)", "Plague Rinded", "Really Stupid", "Regeneration", "Tentacles", "Throw Team-mate"], primary: ["S"], secondary: ["G", "M"] },
    ],
  },
  Orc: {
    name: "Orc",
    rerollCost: 60000,
    canHaveApothecary: true,
    specialRules: ["Badlands Brawl"],
    positions: [
      { position: "Orc Lineman", qty: 12, cost: 50000, ma: 5, st: 3, ag: 4, pa: 5, av: 10, skills: [], primary: ["G"], secondary: ["A", "S"] },
      { position: "Orc Thrower", qty: 2, cost: 65000, ma: 5, st: 3, ag: 4, pa: 3, av: 10, skills: ["Pass", "Sure Hands"], primary: ["G", "P"], secondary: ["A", "S"] },
      { position: "Orc Blitzer", qty: 4, cost: 80000, ma: 6, st: 3, ag: 3, pa: 4, av: 10, skills: ["Block"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Goblin", qty: 2, cost: 40000, ma: 6, st: 2, ag: 3, pa: 4, av: 8, skills: ["Dodge", "Right Stuff", "Stunty"], primary: ["A"], secondary: ["G", "S"] },
      { position: "Troll", qty: 1, cost: 115000, ma: 4, st: 5, ag: 5, pa: -1, av: 10, skills: ["Loner (4+)", "Always Hungry", "Mighty Blow (+1)", "Projectile Vomit", "Really Stupid", "Regeneration", "Throw Team-mate"], primary: ["S"], secondary: ["G"] },
      { position: "Orc Big Un Blocker", qty: 4, cost: 90000, ma: 5, st: 4, ag: 4, pa: -1, av: 10, skills: ["Brawler"], primary: ["G", "S"], secondary: ["A"] },
    ],
  },
  "Shambling Undead": {
    name: "Shambling Undead",
    rerollCost: 70000,
    canHaveApothecary: false,
    specialRules: ["Sylvanian Spotlight"],
    positions: [
      { position: "Skeleton Lineman", qty: 12, cost: 40000, ma: 5, st: 3, ag: 4, pa: 6, av: 7, skills: ["Regeneration", "Thick Skull"], primary: ["G"], secondary: ["A", "S"] },
      { position: "Zombie Lineman", qty: 12, cost: 40000, ma: 4, st: 3, ag: 4, pa: -1, av: 8, skills: ["Regeneration"], primary: ["G"], secondary: ["A", "S"] },
      { position: "Ghoul Runner", qty: 2, cost: 75000, ma: 7, st: 3, ag: 3, pa: 4, av: 8, skills: ["Dodge"], primary: ["G", "A"], secondary: ["S"] },
      { position: "Wight Blitzer", qty: 2, cost: 90000, ma: 6, st: 3, ag: 3, pa: 5, av: 9, skills: ["Block", "Regeneration"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Mummy", qty: 2, cost: 125000, ma: 3, st: 5, ag: 5, pa: -1, av: 10, skills: ["Mighty Blow (+2)", "Regeneration"], primary: ["S"], secondary: ["G"] },
    ],
  },
  Skaven: {
    name: "Skaven",
    rerollCost: 60000,
    canHaveApothecary: true,
    specialRules: ["Under World Challenge"],
    positions: [
      { position: "Skaven Lineman", qty: 12, cost: 50000, ma: 7, st: 3, ag: 3, pa: 4, av: 7, skills: [], primary: ["G"], secondary: ["A", "S"] },
      { position: "Skaven Thrower", qty: 2, cost: 85000, ma: 7, st: 3, ag: 3, pa: 2, av: 7, skills: ["Pass", "Sure Hands"], primary: ["G", "P"], secondary: ["A", "S"] },
      { position: "Gutter Runner", qty: 4, cost: 85000, ma: 9, st: 2, ag: 4, pa: 5, av: 7, skills: ["Dodge"], primary: ["G", "A"], secondary: ["S"] },
      { position: "Storm Vermin", qty: 2, cost: 85000, ma: 7, st: 3, ag: 3, pa: 5, av: 8, skills: ["Block"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Rat Ogre", qty: 1, cost: 150000, ma: 6, st: 5, ag: 4, pa: -1, av: 9, skills: ["Bone-head", "Loner (4+)", "Mighty Blow (+1)", "Prehensile Tail", "Wild Animal"], primary: ["S"], secondary: ["G"] },
    ],
  },
  "Underworld Denizens": {
    name: "Underworld Denizens",
    rerollCost: 70000,
    canHaveApothecary: false,
    specialRules: ["Under World Challenge", "Bribery and Corruption"],
    positions: [
      { position: "Underworld Goblin Lineman", qty: 12, cost: 40000, ma: 6, st: 2, ag: 3, pa: 4, av: 8, skills: ["Dodge", "Right Stuff", "Stunty"], primary: ["A", "M"], secondary: ["G", "S"] },
      { position: "Skaven Lineman", qty: 2, cost: 50000, ma: 7, st: 3, ag: 3, pa: 4, av: 7, skills: [], primary: ["G", "M"], secondary: ["A", "S"] },
      { position: "Skaven Thrower", qty: 1, cost: 85000, ma: 7, st: 3, ag: 3, pa: 2, av: 7, skills: ["Pass", "Sure Hands"], primary: ["G", "M", "P"], secondary: ["A", "S"] },
      { position: "Gutter Runner", qty: 2, cost: 85000, ma: 9, st: 2, ag: 4, pa: 5, av: 7, skills: ["Dodge"], primary: ["G", "A", "M"], secondary: ["S"] },
      { position: "Underworld Troll", qty: 1, cost: 115000, ma: 4, st: 5, ag: 5, pa: -1, av: 10, skills: ["Loner (4+)", "Always Hungry", "Mighty Blow (+1)", "Projectile Vomit", "Really Stupid", "Regeneration", "Throw Team-mate"], primary: ["M", "S"], secondary: ["G"] },
    ],
  },
  Vampire: {
    name: "Vampire",
    rerollCost: 70000,
    canHaveApothecary: true,
    specialRules: ["Sylvanian Spotlight"],
    positions: [
      { position: "Thrall Lineman", qty: 12, cost: 40000, ma: 6, st: 3, ag: 3, pa: 4, av: 8, skills: [], primary: ["G"], secondary: ["A", "S"] },
      { position: "Vampire Thrower", qty: 2, cost: 110000, ma: 6, st: 4, ag: 4, pa: 3, av: 9, skills: ["Bloodlust (2+)", "Hypnotic Gaze", "Regeneration", "Pass"], primary: ["G", "A", "P"], secondary: ["S"] },
      { position: "Vampire Runner", qty: 2, cost: 130000, ma: 8, st: 4, ag: 4, pa: 5, av: 9, skills: ["Bloodlust (2+)", "Dodge", "Hypnotic Gaze", "Regeneration"], primary: ["G", "A"], secondary: ["S"] },
      { position: "Vampire Blitzer", qty: 4, cost: 130000, ma: 8, st: 4, ag: 4, pa: 5, av: 9, skills: ["Block", "Bloodlust (2+)", "Hypnotic Gaze", "Regeneration"], primary: ["G", "A", "S"], secondary: [] },
    ],
  },
  "Wood Elf": {
    name: "Wood Elf",
    rerollCost: 50000,
    canHaveApothecary: true,
    specialRules: ["Elven Kingdoms League"],
    positions: [
      { position: "Wood Elf Lineman", qty: 12, cost: 70000, ma: 7, st: 3, ag: 4, pa: 4, av: 7, skills: [], primary: ["G", "A"], secondary: ["S"] },
      { position: "Wood Elf Thrower", qty: 2, cost: 90000, ma: 7, st: 3, ag: 4, pa: 2, av: 7, skills: ["Pass"], primary: ["G", "A", "P"], secondary: ["S"] },
      { position: "Wood Elf Catcher", qty: 4, cost: 90000, ma: 8, st: 2, ag: 4, pa: 5, av: 7, skills: ["Catch", "Dodge"], primary: ["G", "A"], secondary: ["S"] },
      { position: "Wood Elf Wardancer", qty: 2, cost: 125000, ma: 8, st: 3, ag: 4, pa: 5, av: 7, skills: ["Block", "Dodge", "Leap"], primary: ["G", "A"], secondary: ["S"] },
      { position: "Treeman", qty: 2, cost: 120000, ma: 2, st: 6, ag: 5, pa: 4, av: 11, skills: ["Loner (4+)", "Mighty Blow (+1)", "Stand Firm", "Strong Arm", "Take Root", "Thick Skull", "Throw Team-mate"], primary: ["S"], secondary: ["G"] },
    ],
  },
};

export const SPP_LEVELS = [
  { name: "Rookie", min: 0, max: 5 },
  { name: "Experienced", min: 6, max: 15 },
  { name: "Veteran", min: 16, max: 30 },
  { name: "Emerging Star", min: 31, max: 50 },
  { name: "Star", min: 51, max: 75 },
  { name: "Super Star", min: 76, max: 175 },
  { name: "Legend", min: 176, max: Infinity },
];

export const SPP_ADVANCEMENT_COST: Record<string, number> = {
  Rookie: 6,
  Experienced: 16,
  Veteran: 31,
  "Emerging Star": 51,
  Star: 76,
  "Super Star": 176,
  Legend: 256,
};

export function calculateLevel(spp: number): string {
  for (const level of SPP_LEVELS) {
    if (spp >= level.min && spp <= level.max) return level.name;
  }
  return "Legend";
}

export function calculateSppEarned(stats: {
  touchdowns: number;
  completions: number;
  interceptions: number;
  casualties: number;
  mvp: boolean;
}): number {
  return (
    stats.touchdowns * 3 +
    stats.completions * 1 +
    stats.interceptions * 2 +
    stats.casualties * 2 +
    (stats.mvp ? 4 : 0)
  );
}

export function formatGold(gp: number): string {
  if (gp >= 1000000) return `${(gp / 1000000).toFixed(1)}M gp`;
  if (gp >= 1000) return `${(gp / 1000).toFixed(0)}k gp`;
  return `${gp} gp`;
}

export function formatStat(value: number, isStat = false): string {
  if (isStat && value === -1) return "-";
  return String(value);
}

export const RACE_COLORS: Record<string, string> = {
  Amazon: "bg-green-600",
  "Black Orc": "bg-gray-700",
  "Chaos Chosen": "bg-purple-700",
  "Chaos Dwarf": "bg-red-800",
  "Dark Elf": "bg-indigo-700",
  Dwarf: "bg-amber-700",
  "Elven Union": "bg-sky-500",
  Goblin: "bg-lime-600",
  Halfling: "bg-yellow-500",
  "High Elf": "bg-cyan-500",
  Human: "bg-blue-600",
  "Imperial Nobility": "bg-yellow-600",
  Khorne: "bg-red-700",
  Lizardmen: "bg-teal-600",
  "Necromantic Horror": "bg-violet-800",
  Norse: "bg-blue-400",
  Nurgle: "bg-green-800",
  Orc: "bg-green-700",
  "Shambling Undead": "bg-stone-600",
  Skaven: "bg-orange-600",
  "Underworld Denizens": "bg-purple-800",
  Vampire: "bg-rose-800",
  "Wood Elf": "bg-emerald-600",
};
