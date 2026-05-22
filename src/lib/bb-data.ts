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
    rerollCost: 60000,
    canHaveApothecary: true,
    specialRules: ["Lustrian Superleague"],
    positions: [
      { position: "Eagle Warrior Linewomen", qty: 16, cost: 50000, ma: 6, st: 3, ag: 3, pa: 4, av: 8, skills: ["Dodge"], primary: ["G"], secondary: ["A", "S"] },
      { position: "Python Warrior Throwers", qty: 2, cost: 80000, ma: 6, st: 3, ag: 3, pa: 3, av: 8, skills: ["Dodge", "On The Ball", "Pass", "Safe Pass"], primary: ["G", "P"], secondary: ["A", "S"] },
      { position: "Piranha Warrior Blitzers", qty: 2, cost: 90000, ma: 7, st: 3, ag: 3, pa: 5, av: 8, skills: ["Dodge", "Hit and Run", "Jump Up"], primary: ["A", "G"], secondary: ["S"] },
      { position: "Jaguar Warrior Blockers", qty: 2, cost: 110000, ma: 6, st: 4, ag: 3, pa: 5, av: 9, skills: ["Defensive", "Dodge"], primary: ["G", "S"], secondary: ["A"] },
    ],
  },
  "Black Orc": {
    name: "Black Orc",
    rerollCost: 60000,
    canHaveApothecary: true,
    specialRules: ["Badlands Brawl", "Bribery and Corruption"],
    positions: [
      { position: "Goblin Bruiser", qty: 12, cost: 45000, ma: 6, st: 2, ag: 3, pa: 4, av: 8, skills: ["Dodge", "Right Stuff", "Stunty", "Thick Skull"], primary: ["A"], secondary: ["G", "P", "S"] },
      { position: "Black Orcs", qty: 6, cost: 90000, ma: 4, st: 4, ag: 4, pa: 5, av: 10, skills: ["Brawler", "Grab"], primary: ["G", "S"], secondary: ["A", "P"] },
      { position: "Trained Troll", qty: 1, cost: 115000, ma: 4, st: 5, ag: 5, pa: 5, av: 10, skills: ["Always Hungry", "Loner (3+)", "Mighty Blow (+1)", "Projectile Vomit", "Really Stupid", "Regeneration", "Throw Team Mate"], primary: ["S"], secondary: ["A", "G", "P"] },
    ],
  },
  "Chaos Chosen": {
    name: "Chaos Chosen",
    rerollCost: 60000,
    canHaveApothecary: true,
    specialRules: ["Favoured Of..."],
    positions: [
      { position: "Beastman", qty: 16, cost: 60000, ma: 6, st: 3, ag: 3, pa: 4, av: 9, skills: ["Horns"], primary: ["G", "M", "S"], secondary: ["A", "P"] },
      { position: "Chosen Blocker", qty: 4, cost: 100000, ma: 5, st: 4, ag: 3, pa: 5, av: 10, skills: [], primary: ["G", "M", "S"], secondary: ["A"] },
      { position: "Chaos Troll", qty: 1, cost: 115000, ma: 4, st: 5, ag: 5, pa: 5, av: 10, skills: ["Always Hungry", "Loner (4+)", "Mighty Blow (+1)", "Projectile Vomit", "Really Stupid", "Regeneration", "Throw Team Mate"], primary: ["M", "S"], secondary: ["A", "G"] },
      { position: "Chaos Ogre", qty: 1, cost: 140000, ma: 5, st: 5, ag: 4, pa: 5, av: 10, skills: ["Bone Head", "Loner (4+)", "Mighty Blow (+1)", "Thick Skull", "Throw Team Mate"], primary: ["M", "S"], secondary: ["A", "G"] },
      { position: "Minotaur", qty: 1, cost: 150000, ma: 5, st: 5, ag: 4, pa: -1, av: 9, skills: ["Loner (4+)", "Frenzy", "Horns", "Mighty Blow (+1)", "Thick Skull", "Unchannelled Fury"], primary: ["M", "S"], secondary: ["A", "G"] },
    ],
  },
  "Chaos Dwarf": {
    name: "Chaos Dwarf",
    rerollCost: 70000,
    canHaveApothecary: true,
    specialRules: ["Badlands Brawl", "Favoured Of...", "Worlds End Superleague"],
    positions: [
      { position: "Hobgoblin", qty: 16, cost: 40000, ma: 6, st: 3, ag: 3, pa: 4, av: 8, skills: [], primary: ["G"], secondary: ["A", "S"] },
      { position: "Chaos Dwarf", qty: 6, cost: 70000, ma: 4, st: 3, ag: 4, pa: 6, av: 10, skills: ["Block", "Tackle", "Thick Skull"], primary: ["G", "S"], secondary: ["A", "M"] },
      { position: "Bull Centaur", qty: 2, cost: 130000, ma: 6, st: 4, ag: 4, pa: 6, av: 10, skills: ["Sprint", "Sure Feet", "Thick Skull"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Enslaved Minotaur", qty: 1, cost: 150000, ma: 5, st: 5, ag: 4, pa: -1, av: 9, skills: ["Animal Savagery", "Frenzy", "Horns", "Loner (4+)", "Mighty Blow (+1)", "Thick Skull"], primary: ["S"], secondary: ["A", "G", "M"] },
    ],
  },
  "Dark Elf": {
    name: "Dark Elf",
    rerollCost: 50000,
    canHaveApothecary: true,
    specialRules: ["Elven Kingdoms League"],
    positions: [
      { position: "Dark Elf Lineman", qty: 12, cost: 70000, ma: 6, st: 3, ag: 2, pa: 4, av: 9, skills: [], primary: ["A", "G"], secondary: ["S"] },
      { position: "Dark Elf Runner", qty: 2, cost: 80000, ma: 7, st: 3, ag: 2, pa: 3, av: 8, skills: ["Dump-Off"], primary: ["A", "G", "P"], secondary: ["S"] },
      { position: "Dark Elf Blitzer", qty: 4, cost: 100000, ma: 7, st: 3, ag: 2, pa: 4, av: 9, skills: ["Block"], primary: ["A", "G"], secondary: ["P", "S"] },
      { position: "Dark Elf Assassin", qty: 2, cost: 85000, ma: 7, st: 3, ag: 2, pa: 5, av: 8, skills: ["Shadowing", "Stab"], primary: ["A", "G"], secondary: ["P", "S"] },
      { position: "Witch Elf", qty: 2, cost: 110000, ma: 7, st: 3, ag: 2, pa: 5, av: 8, skills: ["Dodge", "Frenzy", "Jump Up"], primary: ["A", "G"], secondary: ["P", "S"] },
    ],
  },
  Dwarf: {
    name: "Dwarf",
    rerollCost: 50000,
    canHaveApothecary: true,
    specialRules: ["Old World Classic", "Worlds Edge Superleague"],
    positions: [
      { position: "Dwarf Lineman", qty: 12, cost: 70000, ma: 4, st: 3, ag: 4, pa: 5, av: 10, skills: ["Block", "Tackle", "Thick Skull"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Dwarf Runner", qty: 2, cost: 85000, ma: 6, st: 3, ag: 3, pa: 4, av: 9, skills: ["Sure Hands", "Thick Skull"], primary: ["G", "P"], secondary: ["A", "S"] },
      { position: "Dwarf Blitzer", qty: 2, cost: 80000, ma: 5, st: 3, ag: 3, pa: 4, av: 10, skills: ["Block", "Thick Skull"], primary: ["G", "S"], secondary: ["A", "P"] },
      { position: "Troll Slayer", qty: 2, cost: 95000, ma: 5, st: 3, ag: 4, pa: -1, av: 9, skills: ["Block", "Dauntless", "Frenzy", "Thick Skull"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Deathroller", qty: 1, cost: 170000, ma: 4, st: 7, ag: 5, pa: -1, av: 11, skills: ["Break Tackle", "Dirty Player (+2)", "Juggernaut", "Loner (5+)", "Mighty Blow (+1)", "No Hands", "Secret Weapon", "Stand Firm"], primary: ["S"], secondary: ["A", "G"] },
    ],
  },
  "Elven Union": {
    name: "Elven Union",
    rerollCost: 50000,
    canHaveApothecary: true,
    specialRules: ["Elven Kingdoms League"],
    positions: [
      { position: "Elven Union Lineman", qty: 12, cost: 60000, ma: 6, st: 3, ag: 2, pa: 4, av: 8, skills: [], primary: ["A", "G"], secondary: ["S"] },
      { position: "Elven Union Thrower", qty: 2, cost: 75000, ma: 6, st: 3, ag: 2, pa: 2, av: 8, skills: ["Pass"], primary: ["A", "G", "P"], secondary: ["S"] },
      { position: "Elven Union Catcher", qty: 4, cost: 100000, ma: 8, st: 3, ag: 2, pa: 4, av: 8, skills: ["Catch", "Nerves of Steel"], primary: ["A", "G"], secondary: ["S"] },
      { position: "Elven Union Blitzer", qty: 2, cost: 115000, ma: 7, st: 3, ag: 2, pa: 3, av: 9, skills: ["Block", "Side Step"], primary: ["A", "G"], secondary: ["P", "S"] },
    ],
  },
  Goblin: {
    name: "Goblin",
    rerollCost: 60000,
    canHaveApothecary: true,
    specialRules: ["Badlands Brawl", "Bribery and Corruption", "Underworld Challenge"],
    positions: [
      { position: "Goblin", qty: 12, cost: 40000, ma: 6, st: 2, ag: 3, pa: 4, av: 8, skills: ["Dodge", "Right Stuff", "Stunty"], primary: ["A"], secondary: ["G", "P", "S"] },
      { position: "Bomma", qty: 1, cost: 45000, ma: 6, st: 2, ag: 3, pa: 4, av: 8, skills: ["Bombardier", "Dodge", "Secret Weapon", "Stunty"], primary: ["A"], secondary: ["G", "P", "S"] },
      { position: "Looney", qty: 1, cost: 40000, ma: 6, st: 2, ag: 3, pa: -1, av: 8, skills: ["Chainsaw", "Secret Weapon", "Stunty"], primary: ["A"], secondary: ["G", "S"] },
      { position: "Fanatic", qty: 1, cost: 70000, ma: 3, st: 7, ag: 3, pa: -1, av: 8, skills: ["Ball & Chain", "No Hands", "Secret Weapon", "Stunty"], primary: ["S"], secondary: ["A", "G"] },
      { position: "Pogoer", qty: 1, cost: 75000, ma: 7, st: 2, ag: 3, pa: 5, av: 8, skills: ["Dodge", "Pogo Stick", "Stunty"], primary: ["A"], secondary: ["G", "P", "S"] },
      { position: "'Ooligan", qty: 1, cost: 65000, ma: 6, st: 2, ag: 3, pa: 6, av: 8, skills: ["Dirty Player (+1)", "Disturbing Presence", "Dodge", "Right Stuff", "Stunty"], primary: ["A"], secondary: ["G", "P", "S"] },
      { position: "Doom Diver", qty: 1, cost: 60000, ma: 6, st: 2, ag: 3, pa: 6, av: 8, skills: ["Right Stuff", "Stunty", "Swoop"], primary: ["A"], secondary: ["G", "P", "S"] },
      { position: "Trained Troll", qty: 2, cost: 115000, ma: 4, st: 5, ag: 5, pa: 5, av: 10, skills: ["Always Hungry", "Loner (3+)", "Mighty Blow (+1)", "Projectile Vomit", "Really Stupid", "Regeneration", "Throw Team Mate"], primary: ["S"], secondary: ["A", "G", "P"] },
    ],
  },
  Halfling: {
    name: "Halfling",
    rerollCost: 60000,
    canHaveApothecary: true,
    specialRules: ["Halfling Thimble Cup", "Old World Classic"],
    positions: [
      { position: "Halfling Hopeful", qty: 16, cost: 30000, ma: 5, st: 2, ag: 3, pa: 4, av: 7, skills: ["Dodge", "Right Stuff", "Stunty"], primary: ["A"], secondary: ["G", "S"] },
      { position: "Halfling Hefty", qty: 2, cost: 50000, ma: 5, st: 2, ag: 3, pa: 3, av: 8, skills: ["Dodge", "Fend", "Stunty"], primary: ["A", "P"], secondary: ["G", "S"] },
      { position: "Halfling Catcher", qty: 2, cost: 55000, ma: 5, st: 2, ag: 3, pa: 5, av: 7, skills: ["Catch", "Dodge", "Right Stuff", "Sprint", "Stunty"], primary: ["A"], secondary: ["G", "S"] },
      { position: "Altern Forest Treeman", qty: 8, cost: 120000, ma: 2, st: 6, ag: 5, pa: 5, av: 11, skills: ["Mighty Blow (+1)", "Stand Firm", "Strong Arm", "Take Root", "Thick Skull", "Throw Team Mate", "Timmm-ber!"], primary: ["S"], secondary: ["A", "G", "P"] },
    ],
  },
  "High Elf": {
    name: "High Elf",
    rerollCost: 50000,
    canHaveApothecary: true,
    specialRules: ["Elven Kingdoms League"],
    positions: [
      { position: "High Elf Lineman", qty: 16, cost: 70000, ma: 6, st: 3, ag: 2, pa: 4, av: 9, skills: [], primary: ["A", "G"], secondary: ["P", "S"] },
      { position: "High Elf Thrower", qty: 2, cost: 100000, ma: 6, st: 3, ag: 2, pa: 2, av: 9, skills: ["Cloud Burster", "Pass", "Safe Pass"], primary: ["A", "G", "P"], secondary: ["S"] },
      { position: "High Elf Catcher", qty: 4, cost: 90000, ma: 8, st: 3, ag: 2, pa: 5, av: 8, skills: ["Catch"], primary: ["A", "G"], secondary: ["S"] },
      { position: "High Elf Blitzer", qty: 2, cost: 100000, ma: 7, st: 3, ag: 2, pa: 4, av: 9, skills: ["Block"], primary: ["A", "G"], secondary: ["P", "S"] },
    ],
  },
  Human: {
    name: "Human",
    rerollCost: 50000,
    canHaveApothecary: true,
    specialRules: ["Old World Classic"],
    positions: [
      { position: "Human Lineman", qty: 16, cost: 50000, ma: 6, st: 3, ag: 3, pa: 4, av: 9, skills: [], primary: ["G"], secondary: ["A", "S"] },
      { position: "Human Thrower", qty: 2, cost: 80000, ma: 6, st: 3, ag: 3, pa: 2, av: 9, skills: ["Pass", "Sure Hands"], primary: ["G", "P"], secondary: ["A", "S"] },
      { position: "Human Catcher", qty: 4, cost: 65000, ma: 8, st: 2, ag: 3, pa: 5, av: 8, skills: ["Catch", "Dodge"], primary: ["A", "G"], secondary: ["P", "S"] },
      { position: "Human Blitzer", qty: 4, cost: 85000, ma: 7, st: 3, ag: 3, pa: 4, av: 9, skills: ["Block"], primary: ["G", "S"], secondary: ["A", "P"] },
      { position: "Halfling Hopeful", qty: 3, cost: 30000, ma: 5, st: 2, ag: 3, pa: 4, av: 7, skills: ["Dodge", "Right Stuff", "Stunty"], primary: ["A"], secondary: ["G", "S"] },
      { position: "Ogre", qty: 1, cost: 140000, ma: 5, st: 5, ag: 4, pa: 5, av: 10, skills: ["Bone Head", "Loner (4+)", "Mighty Blow (+1)", "Thick Skull", "Throw Team Mate"], primary: ["S"], secondary: ["A", "G"] },
    ],
  },
  "Imperial Nobility": {
    name: "Imperial Nobility",
    rerollCost: 70000,
    canHaveApothecary: true,
    specialRules: ["Old World Classic"],
    positions: [
      { position: "Retainer Lineman", qty: 12, cost: 45000, ma: 6, st: 3, ag: 4, pa: 4, av: 8, skills: ["Fend"], primary: ["G"], secondary: ["A", "S"] },
      { position: "Imperial Thrower", qty: 2, cost: 75000, ma: 6, st: 3, ag: 3, pa: 3, av: 9, skills: ["Pass", "Running Pass"], primary: ["G", "P"], secondary: ["A", "S"] },
      { position: "Noble Blitzer", qty: 2, cost: 105000, ma: 7, st: 3, ag: 3, pa: 4, av: 9, skills: ["Block", "Catch"], primary: ["A", "G"], secondary: ["P", "S"] },
      { position: "Bodyguard", qty: 4, cost: 90000, ma: 6, st: 3, ag: 3, pa: 5, av: 9, skills: ["Stand Firm", "Wrestle"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Ogre", qty: 1, cost: 140000, ma: 5, st: 5, ag: 4, pa: 5, av: 10, skills: ["Bone Head", "Loner (4+)", "Mighty Blow (+1)", "Thick Skull", "Throw Team Mate"], primary: ["S"], secondary: ["A", "G"] },
    ],
  },
  Khorne: {
    name: "Khorne",
    rerollCost: 60000,
    canHaveApothecary: true,
    specialRules: ["Favoured of Khorne"],
    positions: [
      { position: "Bloodborn Marauder Lineman", qty: 16, cost: 50000, ma: 6, st: 3, ag: 3, pa: 4, av: 8, skills: ["Frenzy"], primary: ["G", "M"], secondary: ["A", "S"] },
      { position: "Khorngor", qty: 4, cost: 70000, ma: 6, st: 3, ag: 3, pa: 4, av: 9, skills: ["Horns", "Juggernaut"], primary: ["G", "M", "S"], secondary: ["A", "P"] },
      { position: "Bloodseeker", qty: 4, cost: 110000, ma: 5, st: 4, ag: 4, pa: 6, av: 10, skills: ["Frenzy"], primary: ["G", "M", "S"], secondary: ["A"] },
      { position: "Bloodspawn", qty: 1, cost: 160000, ma: 5, st: 5, ag: 4, pa: -1, av: 9, skills: ["Claws", "Frenzy", "Loner (4+)", "Mighty Blow (+1)", "Unchannelled Fury"], primary: ["M", "S"], secondary: ["A", "G"] },
    ],
  },
  Lizardmen: {
    name: "Lizardmen",
    rerollCost: 70000,
    canHaveApothecary: true,
    specialRules: ["Lustrian Superleague"],
    positions: [
      { position: "Skink", qty: 16, cost: 60000, ma: 8, st: 2, ag: 3, pa: 4, av: 8, skills: ["Dodge", "Stunty"], primary: ["A"], secondary: ["G", "P", "S"] },
      { position: "Chameleon Skink", qty: 2, cost: 70000, ma: 7, st: 2, ag: 3, pa: 3, av: 8, skills: ["Dodge", "On the Ball", "Shadowing", "Stunty"], primary: ["A"], secondary: ["G", "P", "S"] },
      { position: "Saurus", qty: 6, cost: 85000, ma: 6, st: 4, ag: 5, pa: 6, av: 10, skills: [], primary: ["G", "S"], secondary: ["A"] },
      { position: "Kroxigor", qty: 1, cost: 140000, ma: 6, st: 5, ag: 5, pa: -1, av: 10, skills: ["Bone Head", "Loner (4+)", "Mighty Blow (+1)", "Prehensile Tail", "Thick Skull"], primary: ["S"], secondary: ["A", "G"] },
    ],
  },
  "Necromantic Horror": {
    name: "Necromantic Horror",
    rerollCost: 70000,
    canHaveApothecary: false,
    specialRules: ["Masters of Undeath", "Sylvanian Spotlight"],
    positions: [
      { position: "Zombie", qty: 16, cost: 40000, ma: 4, st: 3, ag: 4, pa: -1, av: 9, skills: ["Regeneration"], primary: ["G"], secondary: ["A", "S"] },
      { position: "Ghoul Runner", qty: 2, cost: 75000, ma: 7, st: 3, ag: 3, pa: 4, av: 8, skills: ["Dodge"], primary: ["A", "G"], secondary: ["P", "S"] },
      { position: "Wraith", qty: 2, cost: 95000, ma: 6, st: 3, ag: 3, pa: -1, av: 9, skills: ["Block", "Foul Appearance", "No Hands", "Regeneration", "Side Step"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Werewolf", qty: 2, cost: 125000, ma: 8, st: 3, ag: 3, pa: 4, av: 9, skills: ["Claws", "Frenzy", "Regeneration"], primary: ["A", "G"], secondary: ["P", "S"] },
      { position: "Flesh Golem", qty: 2, cost: 115000, ma: 4, st: 4, ag: 4, pa: -1, av: 10, skills: ["Regeneration", "Stand Firm", "Thick Skull"], primary: ["G", "S"], secondary: ["A"] },
    ],
  },
  Norse: {
    name: "Norse",
    rerollCost: 60000,
    canHaveApothecary: true,
    specialRules: ["Favoured Of...", "Old World Classic"],
    positions: [
      { position: "Norse Raider Lineman", qty: 16, cost: 50000, ma: 6, st: 3, ag: 3, pa: 4, av: 8, skills: ["Block", "Drunkard", "Thick Skull"], primary: ["G"], secondary: ["A", "P", "S"] },
      { position: "Beer Boar", qty: 2, cost: 20000, ma: 5, st: 1, ag: 3, pa: -1, av: 6, skills: ["Dodge", "No Hands", "Pick-me-up", "Stunty", "Titchy"], primary: [], secondary: ["A"] },
      { position: "Norse Berserker", qty: 2, cost: 90000, ma: 6, st: 3, ag: 3, pa: 5, av: 8, skills: ["Block", "Frenzy", "Jump Up"], primary: ["G", "S"], secondary: ["A", "P"] },
      { position: "Valkyrie", qty: 2, cost: 95000, ma: 7, st: 3, ag: 3, pa: 3, av: 8, skills: ["Catch", "Dauntless", "Pass", "Strip Ball"], primary: ["A", "G", "P"], secondary: ["S"] },
      { position: "Ulfwerener", qty: 2, cost: 105000, ma: 6, st: 4, ag: 4, pa: -1, av: 9, skills: ["Frenzy"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Yhetee", qty: 1, cost: 140000, ma: 5, st: 5, ag: 4, pa: -1, av: 9, skills: ["Claws", "Disturbing Presence", "Frenzy", "Loner (4+)", "Unchannelled Fury"], primary: ["S"], secondary: ["A", "G"] },
    ],
  },
  Nurgle: {
    name: "Nurgle",
    rerollCost: 70000,
    canHaveApothecary: false,
    specialRules: ["Favoured of Nurgle"],
    positions: [
      { position: "Rotter", qty: 12, cost: 35000, ma: 5, st: 3, ag: 4, pa: 6, av: 9, skills: ["Decay", "Plague Ridden"], primary: ["G", "M"], secondary: ["A", "S"] },
      { position: "Pestigor", qty: 4, cost: 75000, ma: 6, st: 3, ag: 3, pa: 4, av: 9, skills: ["Horns", "Plague Ridden", "Regeneration"], primary: ["G", "M", "S"], secondary: ["A", "P"] },
      { position: "Bloater", qty: 4, cost: 115000, ma: 4, st: 4, ag: 4, pa: 6, av: 10, skills: ["Disturbing Presence", "Foul Appearance", "Plague Ridden", "Regeneration"], primary: ["G", "M", "S"], secondary: ["A"] },
      { position: "Rotspawn", qty: 1, cost: 140000, ma: 4, st: 5, ag: 5, pa: -1, av: 10, skills: ["Disturbing Presence", "Foul Appearance", "Loner (4+)", "Mighty Blow (+1)", "Plague Ridden", "Really Stupid", "Regeneration", "Tentacles"], primary: ["S"], secondary: ["A", "G", "M"] },
    ],
  },
  Orc: {
    name: "Orc",
    rerollCost: 60000,
    canHaveApothecary: true,
    specialRules: ["Badlands Brawl"],
    positions: [
      { position: "Orc Lineman", qty: 16, cost: 50000, ma: 5, st: 3, ag: 3, pa: 4, av: 10, skills: ["Animosity (Orc Linemen)"], primary: ["G"], secondary: ["A", "S"] },
      { position: "Orc Thrower", qty: 2, cost: 65000, ma: 5, st: 3, ag: 3, pa: 3, av: 9, skills: ["Animosity (all team-mates)", "Pass", "Sure Hands"], primary: ["G", "P"], secondary: ["A", "S"] },
      { position: "Orc Blitzer", qty: 4, cost: 80000, ma: 6, st: 3, ag: 3, pa: 4, av: 10, skills: ["Animosity (all team-mates)", "Block"], primary: ["G", "S"], secondary: ["A", "P"] },
      { position: "Big Un Blocker", qty: 4, cost: 90000, ma: 5, st: 4, ag: 4, pa: -1, av: 10, skills: ["Animosity (Big Uns)"], primary: ["G", "S"], secondary: ["A"] },
      { position: "Goblin", qty: 4, cost: 40000, ma: 6, st: 2, ag: 3, pa: 4, av: 8, skills: ["Dodge", "Right Stuff", "Stunty"], primary: ["A"], secondary: ["G", "S"] },
      { position: "Untrained Troll", qty: 1, cost: 115000, ma: 4, st: 5, ag: 5, pa: 5, av: 10, skills: ["Always Hungry", "Loner (4+)", "Mighty Blow (+1)", "Projectile Vomit", "Really Stupid", "Regeneration", "Throw Team Mate"], primary: ["S"], secondary: ["A", "G", "P"] },
    ],
  },
  "Shambling Undead": {
    name: "Shambling Undead",
    rerollCost: 70000,
    canHaveApothecary: false,
    specialRules: ["Masters of Undeath", "Sylvanian Spotlight"],
    positions: [
      { position: "Skeleton", qty: 12, cost: 40000, ma: 5, st: 3, ag: 4, pa: 6, av: 8, skills: ["Regeneration", "Thick Skull"], primary: ["G"], secondary: ["A", "S"] },
      { position: "Zombie", qty: 12, cost: 40000, ma: 4, st: 3, ag: 4, pa: -1, av: 9, skills: ["Regeneration"], primary: ["G"], secondary: ["A", "S"] },
      { position: "Ghoul", qty: 4, cost: 75000, ma: 7, st: 3, ag: 3, pa: 4, av: 8, skills: ["Dodge"], primary: ["A", "G"], secondary: ["P", "S"] },
      { position: "Wight", qty: 2, cost: 90000, ma: 6, st: 3, ag: 3, pa: 5, av: 9, skills: ["Block", "Regeneration"], primary: ["G", "S"], secondary: ["A", "P"] },
      { position: "Mummy", qty: 2, cost: 125000, ma: 3, st: 5, ag: 5, pa: -1, av: 10, skills: ["Mighty Blow (+1)", "Regeneration"], primary: ["S"], secondary: ["A", "G"] },
    ],
  },
  Skaven: {
    name: "Skaven",
    rerollCost: 50000,
    canHaveApothecary: true,
    specialRules: ["Underworld Challenge"],
    positions: [
      { position: "Skaven Lineman", qty: 16, cost: 50000, ma: 7, st: 3, ag: 3, pa: 4, av: 8, skills: [], primary: ["G"], secondary: ["A", "M", "S"] },
      { position: "Skaven Thrower", qty: 2, cost: 85000, ma: 7, st: 3, ag: 3, pa: 2, av: 8, skills: ["Pass", "Sure Hands"], primary: ["G", "P"], secondary: ["A", "M", "S"] },
      { position: "Gutter Runner", qty: 4, cost: 85000, ma: 9, st: 2, ag: 2, pa: 4, av: 8, skills: ["Dodge"], primary: ["A", "G"], secondary: ["M", "P", "S"] },
      { position: "Skaven Blitzer", qty: 2, cost: 90000, ma: 7, st: 3, ag: 3, pa: 5, av: 9, skills: ["Block"], primary: ["G", "S"], secondary: ["A", "M", "P"] },
      { position: "Rat Ogre", qty: 1, cost: 150000, ma: 6, st: 5, ag: 4, pa: -1, av: 9, skills: ["Animal Savagery", "Frenzy", "Loner (4+)", "Mighty Blow (+1)", "Prehensile Tail"], primary: ["S"], secondary: ["A", "G", "M"] },
    ],
  },
  "Underworld Denizens": {
    name: "Underworld Denizens",
    rerollCost: 70000,
    canHaveApothecary: true,
    specialRules: ["Bribery and Corruption", "Underworld Challenge"],
    positions: [
      { position: "Goblin", qty: 12, cost: 40000, ma: 6, st: 2, ag: 3, pa: 4, av: 8, skills: ["Dodge", "Right Stuff", "Stunty"], primary: ["A", "M"], secondary: ["G", "S"] },
      { position: "Snotling", qty: 6, cost: 15000, ma: 5, st: 1, ag: 3, pa: 5, av: 6, skills: ["Dodge", "Right Stuff", "Side Step", "Stunty", "Titchy"], primary: ["A", "M"], secondary: ["G"] },
      { position: "Skaven Clanrat", qty: 3, cost: 50000, ma: 7, st: 3, ag: 3, pa: 4, av: 8, skills: ["Animosity (Goblins)"], primary: ["G", "M"], secondary: ["A", "S"] },
      { position: "Skaven Thrower", qty: 1, cost: 85000, ma: 7, st: 3, ag: 3, pa: 2, av: 8, skills: ["Animosity (Goblins)", "Pass", "Sure Hands"], primary: ["G", "M", "P"], secondary: ["A", "S"] },
      { position: "Gutter Runner", qty: 1, cost: 85000, ma: 9, st: 2, ag: 2, pa: 4, av: 8, skills: ["Animosity (Goblins)", "Dodge"], primary: ["A", "G", "M"], secondary: ["P", "S"] },
      { position: "Skaven Blitzer", qty: 1, cost: 90000, ma: 7, st: 3, ag: 3, pa: 5, av: 9, skills: ["Animosity (Goblins)", "Block"], primary: ["G", "M", "S"], secondary: ["A", "P"] },
      { position: "Underworld Troll", qty: 1, cost: 115000, ma: 4, st: 5, ag: 5, pa: 5, av: 10, skills: ["Always Hungry", "Loner (4+)", "Mighty Blow (+1)", "Projectile Vomit", "Really Stupid", "Regeneration", "Throw Team Mate"], primary: ["M", "S"], secondary: ["A", "G", "P"] },
      { position: "Mutant Rat Ogre", qty: 1, cost: 150000, ma: 6, st: 5, ag: 4, pa: -1, av: 9, skills: ["Animal Savagery", "Frenzy", "Loner (4+)", "Mighty Blow (+1)", "Prehensile Tail"], primary: ["M", "S"], secondary: ["A", "G"] },
    ],
  },
  Vampire: {
    name: "Vampire",
    rerollCost: 70000,
    canHaveApothecary: true,
    specialRules: ["Sylvanian Spotlight"],
    positions: [
      { position: "Thrall Lineman", qty: 12, cost: 40000, ma: 6, st: 3, ag: 3, pa: 5, av: 8, skills: [], primary: ["G"], secondary: ["A", "S"] },
      { position: "Vampire", qty: 6, cost: 110000, ma: 6, st: 4, ag: 2, pa: 3, av: 9, skills: ["Animal Savagery", "Hypnotic Gaze", "Regeneration"], primary: ["A", "G", "S"], secondary: ["P"] },
    ],
  },
  "Wood Elf": {
    name: "Wood Elf",
    rerollCost: 50000,
    canHaveApothecary: true,
    specialRules: ["Elven Kingdoms League"],
    positions: [
      { position: "Wood Elf Lineman", qty: 12, cost: 70000, ma: 7, st: 3, ag: 2, pa: 4, av: 8, skills: [], primary: ["A", "G"], secondary: ["S"] },
      { position: "Wood Elf Thrower", qty: 2, cost: 95000, ma: 7, st: 3, ag: 2, pa: 2, av: 8, skills: ["Pass"], primary: ["A", "G", "P"], secondary: ["S"] },
      { position: "Wood Elf Catcher", qty: 4, cost: 90000, ma: 8, st: 2, ag: 2, pa: 4, av: 8, skills: ["Catch", "Dodge"], primary: ["A", "G"], secondary: ["P", "S"] },
      { position: "Wood Elf Wardancer", qty: 2, cost: 125000, ma: 8, st: 3, ag: 2, pa: 4, av: 8, skills: ["Block", "Dodge", "Leap"], primary: ["A", "G"], secondary: ["P", "S"] },
      { position: "Loren Forest Treeman", qty: 1, cost: 120000, ma: 2, st: 6, ag: 5, pa: 5, av: 11, skills: ["Loner (4+)", "Mighty Blow (+1)", "Stand Firm", "Strong Arm", "Take Root", "Thick Skull", "Throw Team Mate"], primary: ["S"], secondary: ["A", "G"] },
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

// SPP thresholds that grant an advancement (in order)
export const SPP_THRESHOLDS = [6, 16, 31, 51, 76, 176];

// How much each advancement type increases Team Value (BB2020 rulebook p.100)
export const IMPROVEMENT_TV_COST: Record<string, number> = {
  random_primary: 10000,
  chosen_primary: 20000,
  chosen_secondary: 30000,
  stat_ma: 10000,
  stat_av: 10000,
  stat_pa: 10000,
  stat_ag: 20000,
  stat_st: 30000,
};

export const IMPROVEMENT_LABELS: Record<string, string> = {
  random_primary: "Random Primary Skill",
  chosen_primary: "Chosen Primary Skill",
  chosen_secondary: "Chosen Secondary Skill",
  stat_ma: "+1 MA",
  stat_av: "+1 AV",
  stat_pa: "-1 PA (improve)",
  stat_ag: "-1 AG (improve)",
  stat_st: "+1 ST",
};

// Skills available per category (BB2020 Season 2)
export const SKILLS_BY_CATEGORY: Record<SkillCategory, string[]> = {
  G: [
    "Block", "Dauntless", "Defensive", "Dirty Player (+1)", "Fend", "Frenzy", "Hit and Run", "Jump Up",
    "Kick", "Pro", "Shadowing", "Strip Ball", "Sure Hands", "Tackle", "Wrestle",
  ],
  A: [
    "Catch", "Diving Catch", "Diving Tackle", "Dodge", "Leap", "On the Ball",
    "Pass Block", "Safe Pair of Hands", "Side Step", "Sneaky Git", "Sprint", "Sure Feet",
  ],
  P: [
    "Accurate", "Cloud Burster", "Dump-Off", "Hail Mary Pass", "Nerves of Steel", "Pass",
    "Running Pass", "Safe Pass", "Strong Arm",
  ],
  S: [
    "Arm Bar", "Brawler", "Break Tackle", "Grab", "Guard", "Juggernaut",
    "Mighty Blow (+1)", "Multiple Block", "Pile On", "Stand Firm", "Thick Skull",
  ],
  M: [
    "Big Hand", "Claws", "Disturbing Presence", "Extra Arms", "Foul Appearance",
    "Horns", "Iron Hard Skin", "Monstrous Mouth", "Prehensile Tail",
    "Tentacles", "Two Heads", "Very Long Legs",
  ],
};

export function getPositionData(race: string, position: string) {
  return RACES[race]?.positions.find((p) => p.position === position) ?? null;
}

export function pendingAdvancements(spp: number, improvementCount: number): number {
  const eligible = SPP_THRESHOLDS.filter((t) => spp >= t).length;
  return Math.max(0, eligible - improvementCount);
}

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
