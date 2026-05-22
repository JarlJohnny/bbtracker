-- BB2020 Season 2 position renames
-- Matches the updated bb-data.ts sourced from bbtactics.com
-- Individual player stats are NOT touched; only the position name label is updated.
-- For positions with no direct Season 2 equivalent, players are remapped to the
-- closest surviving position on the same team (noted inline).

-- Amazon (all 4 old positions replaced with new named positions)
UPDATE "Player" SET "position" = 'Eagle Warrior Linewomen'  WHERE "race" = 'Amazon' AND "position" = 'Amazon Linewoman';
UPDATE "Player" SET "position" = 'Python Warrior Throwers'  WHERE "race" = 'Amazon' AND "position" = 'Amazon Thrower';
UPDATE "Player" SET "position" = 'Piranha Warrior Blitzers' WHERE "race" = 'Amazon' AND "position" = 'Amazon Blitzer';
-- Amazon Catcher has no Season 2 equivalent; remap to linewomen
UPDATE "Player" SET "position" = 'Eagle Warrior Linewomen'  WHERE "race" = 'Amazon' AND "position" = 'Amazon Catcher';

-- Black Orc
UPDATE "Player" SET "position" = 'Black Orcs' WHERE "race" = 'Black Orc' AND "position" = 'Black Orc Blocker';

-- Chaos Chosen
UPDATE "Player" SET "position" = 'Beastman'       WHERE "race" = 'Chaos Chosen' AND "position" = 'Chaos Beastman Runner';
UPDATE "Player" SET "position" = 'Chosen Blocker'  WHERE "race" = 'Chaos Chosen' AND "position" = 'Chaos Chosen Blocker';

-- Chaos Dwarf
UPDATE "Player" SET "position" = 'Chaos Dwarf'      WHERE "race" = 'Chaos Dwarf' AND "position" = 'Chaos Dwarf Blocker';
UPDATE "Player" SET "position" = 'Bull Centaur'      WHERE "race" = 'Chaos Dwarf' AND "position" = 'Bull Centaur Blitzer';
UPDATE "Player" SET "position" = 'Enslaved Minotaur' WHERE "race" = 'Chaos Dwarf' AND "position" = 'Minotaur';

-- Goblin
UPDATE "Player" SET "position" = 'Goblin' WHERE "race" = 'Goblin' AND "position" = 'Goblin Lineman';

-- Halfling (Ogre removed from Halfling roster; Altern Forest Treeman is the new big guy)
UPDATE "Player" SET "position" = 'Altern Forest Treeman' WHERE "race" = 'Halfling' AND "position" = 'Ogre';

-- Khorne (completely new roster)
UPDATE "Player" SET "position" = 'Bloodborn Marauder Lineman' WHERE "race" = 'Khorne' AND "position" = 'Khorne Marauder';
UPDATE "Player" SET "position" = 'Khorngor'                   WHERE "race" = 'Khorne' AND "position" = 'Khorne Warrior';
UPDATE "Player" SET "position" = 'Bloodseeker'                WHERE "race" = 'Khorne' AND "position" = 'Khorne Berserker';
UPDATE "Player" SET "position" = 'Bloodspawn'                 WHERE "race" = 'Khorne' AND "position" = 'Skull Crusher Blocker';
-- Bloodsecrator removed; remap to lineman
UPDATE "Player" SET "position" = 'Bloodborn Marauder Lineman' WHERE "race" = 'Khorne' AND "position" = 'Bloodsecrator';

-- Lizardmen
UPDATE "Player" SET "position" = 'Skink'  WHERE "race" = 'Lizardmen' AND "position" = 'Skink Runner';
UPDATE "Player" SET "position" = 'Saurus' WHERE "race" = 'Lizardmen' AND "position" = 'Saurus Blocker';

-- Necromantic Horror
UPDATE "Player" SET "position" = 'Zombie'    WHERE "race" = 'Necromantic Horror' AND "position" = 'Zombie Lineman';
-- Wight Blitzer removed; Werewolf is the closest surviving blitz-capable position
UPDATE "Player" SET "position" = 'Werewolf'  WHERE "race" = 'Necromantic Horror' AND "position" = 'Wight Blitzer';

-- Norse
UPDATE "Player" SET "position" = 'Norse Berserker' WHERE "race" = 'Norse' AND "position" = 'Berserker';
UPDATE "Player" SET "position" = 'Yhetee'           WHERE "race" = 'Norse' AND "position" = 'Snow Troll';
-- Thrower and Catcher removed; remap to lineman
UPDATE "Player" SET "position" = 'Norse Raider Lineman' WHERE "race" = 'Norse' AND "position" = 'Norse Thrower';
UPDATE "Player" SET "position" = 'Norse Raider Lineman' WHERE "race" = 'Norse' AND "position" = 'Norse Catcher';

-- Nurgle
UPDATE "Player" SET "position" = 'Rotter'   WHERE "race" = 'Nurgle' AND "position" = 'Rotter Lineman';
UPDATE "Player" SET "position" = 'Rotspawn' WHERE "race" = 'Nurgle' AND "position" = 'Beast of Nurgle';

-- Orc
UPDATE "Player" SET "position" = 'Untrained Troll' WHERE "race" = 'Orc' AND "position" = 'Troll';
UPDATE "Player" SET "position" = 'Big Un Blocker'  WHERE "race" = 'Orc' AND "position" = 'Orc Big Un Blocker';

-- Shambling Undead
UPDATE "Player" SET "position" = 'Skeleton' WHERE "race" = 'Shambling Undead' AND "position" = 'Skeleton Lineman';
UPDATE "Player" SET "position" = 'Zombie'   WHERE "race" = 'Shambling Undead' AND "position" = 'Zombie Lineman';
UPDATE "Player" SET "position" = 'Ghoul'    WHERE "race" = 'Shambling Undead' AND "position" = 'Ghoul Runner';
UPDATE "Player" SET "position" = 'Wight'    WHERE "race" = 'Shambling Undead' AND "position" = 'Wight Blitzer';

-- Skaven
UPDATE "Player" SET "position" = 'Skaven Blitzer' WHERE "race" = 'Skaven' AND "position" = 'Storm Vermin';

-- Underworld Denizens
UPDATE "Player" SET "position" = 'Goblin'       WHERE "race" = 'Underworld Denizens' AND "position" = 'Underworld Goblin Lineman';
UPDATE "Player" SET "position" = 'Skaven Clanrat' WHERE "race" = 'Underworld Denizens' AND "position" = 'Skaven Lineman';

-- Vampire (Thrower/Runner/Blitzer all merge into the single Vampire position)
UPDATE "Player" SET "position" = 'Vampire' WHERE "race" = 'Vampire' AND "position" IN ('Vampire Thrower', 'Vampire Runner', 'Vampire Blitzer');

-- Wood Elf
UPDATE "Player" SET "position" = 'Loren Forest Treeman' WHERE "race" = 'Wood Elf' AND "position" = 'Treeman';
