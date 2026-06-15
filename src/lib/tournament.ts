export interface Pairing {
  round: number;
  homeTeamId: string;
  awayTeamId: string;
}

const BYE = "__BYE__";

/**
 * Round-robin pairings via the circle method.
 *
 * - With an odd number of teams a BYE sentinel is added and any pairing
 *   involving it is dropped (that team sits out the round).
 * - N teams → N-1 rounds (single) or 2N-2 rounds (double, with the mirror
 *   legs swapping home/away).
 * - Home/away alternates per round so no team is always at home.
 */
export function roundRobinPairings(teamIds: string[], doubleRound = false): Pairing[] {
  const ids = [...teamIds];
  if (ids.length < 2) return [];

  if (ids.length % 2 !== 0) ids.push(BYE);

  const n = ids.length;
  const roundsPerLeg = n - 1;
  const half = n / 2;
  const pairings: Pairing[] = [];

  // Fixed first slot; the rest rotate clockwise.
  let rotation = ids.slice();

  for (let r = 0; r < roundsPerLeg; r++) {
    for (let i = 0; i < half; i++) {
      const a = rotation[i];
      const b = rotation[n - 1 - i];
      if (a === BYE || b === BYE) continue;

      // Alternate home/away by round and by slot for fairness.
      const flip = (r + i) % 2 === 0;
      const home = flip ? a : b;
      const away = flip ? b : a;

      pairings.push({ round: r + 1, homeTeamId: home, awayTeamId: away });
      if (doubleRound) {
        pairings.push({ round: roundsPerLeg + r + 1, homeTeamId: away, awayTeamId: home });
      }
    }
    // Rotate: keep index 0 fixed, move the rest.
    rotation = [rotation[0], rotation[n - 1], ...rotation.slice(1, n - 1)];
  }

  return pairings;
}

export interface StandingLike {
  points: number;
  touchdownsFor: number;
  touchdownsAgainst: number;
  casualtiesFor: number;
}

/**
 * Standings comparator: points, then TD difference, then casualties inflicted.
 * Mirrors the league ordering used elsewhere.
 */
export function compareStandings(a: StandingLike, b: StandingLike): number {
  if (b.points !== a.points) return b.points - a.points;
  const diffA = a.touchdownsFor - a.touchdownsAgainst;
  const diffB = b.touchdownsFor - b.touchdownsAgainst;
  if (diffB !== diffA) return diffB - diffA;
  return b.casualtiesFor - a.casualtiesFor;
}
