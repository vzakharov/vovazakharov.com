/**
 * Where an insect flies next, and when. Every leg is a pure function of the
 * insect's seed and how many legs it has flown, so a replay of the same
 * actions flies the same butterflies; nothing here knows where a perch
 * stands on screen.
 */

import type { WithId } from '@/shared/typings';

import {
  between,
  mulberry32,
  nextSeed,
  pick,
  type Random,
  type Seeded,
} from './random';

export const SIDES = ['left', 'right'] as const;
export type Side = (typeof SIDES)[number];

export const PERCH_KINDS = ['flower', 'cap', 'away'] as const;
export type PerchKind = (typeof PERCH_KINDS)[number];

/** What each kind of perch carries beside its kind. */
type PerchFields = {
  flower: { pick: number };
  cap: WithId;
  away: { side: Side };
};

/**
 * Where an insect wants to be. A flower's `pick` in `[0, 1)` is mapped by
 * the scene onto whatever flowers the screen has (`flowerIndex`), so a resize
 * never strands a perch; `away` is off screen past that side's edge.
 */
export type Perch = {
  [Kind in PerchKind]: { kind: Kind } & PerchFields[Kind];
}[PerchKind];

/** A moment on the scene's clock, in ms. */
export type Timed = { now: number };

/** When a leg's flight takes off and lands, in ms on the scene's clock. */
export type Span = { departs: number; arrives: number };

/**
 * One flight and the stay after it: from `from` to `to` over `departs` to
 * `arrives`, then sitting there until `leaves`, when the next leg is due. An
 * `away` leg leaves as it arrives, and the insect is gone.
 */
export type Leg = Span & { from: Perch; to: Perch; leaves: number };

/** An insect's current leg, and how many legs it has flown, that one included. */
export type Flight = { leg: Leg; legs: number };

/** How many butterflies the meadow holds; a release past it sends the oldest away. */
export const BUTTERFLY_LIMIT = 4;

/** How long a flight takes, a drink at a flower, and a rest on a cap, in ms. */
export const FLYING = [2400, 3900] as const;
export const DRINKING = [3000, 6000] as const;
export const RESTING = [4000, 9000] as const;
/** How often a butterfly with a cap to go to goes to a flower instead. */
const FLOWER_SHARE = 0.6;
/**
 * How far round a flower-to-flower hop moves `pick`: never less than a fifth
 * of the way, so on a screen of five or more flowers it never lands on the
 * one it left.
 */
const FLOWER_HOP = [0.2, 0.8] as const;

/** Keeps a leg's stream apart from the genes grown off the same seed. */
const LEG_SALT = 0x5b_d1_e9_95;

function legRandom(seed: number, legs: number): Random {
  return mulberry32(nextSeed(mulberry32(((seed ^ LEG_SALT) + legs) >>> 0)));
}

/** Which of `count` flowers a flower perch's `pick` lands on. */
export function flowerIndex(at: number, count: number): number {
  return Math.min(count - 1, Math.max(0, Math.floor(at * count)));
}

function nextPerch(
  random: Random,
  from: Perch,
  caps: readonly string[],
): Perch {
  const open = caps.filter((id) => from.kind !== 'cap' || id !== from.id);
  const [first, ...rest] = open;
  const toFlower = random() < FLOWER_SHARE;
  const hop = between(random, FLOWER_HOP[0], FLOWER_HOP[1]);
  if (!toFlower && first !== undefined) {
    return { kind: 'cap', id: pick(random, [first, ...rest]) };
  }
  const flowerPick = from.kind === 'flower' ? (from.pick + hop) % 1 : random();
  return { kind: 'flower', pick: flowerPick };
}

function awayPerch(random: Random): Perch {
  return { kind: 'away', side: pick(random, SIDES) };
}

function stayAt(random: Random, to: Perch): number {
  switch (to.kind) {
    case 'flower': {
      return between(random, DRINKING[0], DRINKING[1]);
    }
    case 'cap': {
      return between(random, RESTING[0], RESTING[1]);
    }
    case 'away': {
      return 0;
    }
    default: {
      return to satisfies never;
    }
  }
}

function legTo(random: Random, from: Perch, to: Perch, now: number): Leg {
  const arrives = now + between(random, FLYING[0], FLYING[1]);
  return {
    from,
    to,
    departs: now,
    arrives,
    leaves: arrives + stayAt(random, to),
  };
}

/**
 * A new insect's first flight, in from off screen on a side its seed picks
 * to a perch among `caps` (mushroom ids) and the flowers, departing `now`.
 */
export function firstFlight(
  { seed }: Seeded,
  caps: readonly string[],
  now: number,
): Flight {
  const random = legRandom(seed, 0);
  const from = awayPerch(random);
  return {
    leg: legTo(random, from, nextPerch(random, from, caps), now),
    legs: 1,
  };
}

/** The leg after the current one, from its perch to the one `choose` draws first off the leg's stream. */
function onward(
  { seed, leg, legs }: Seeded & Flight,
  now: number,
  choose: (random: Random) => Perch,
): Flight {
  const random = legRandom(seed, legs);
  return { leg: legTo(random, leg.to, choose(random), now), legs: legs + 1 };
}

/**
 * The flight after `insect`'s current one, departing `now` from the perch
 * that one went to: a flower about three times in five and a cap otherwise,
 * a flower whenever `caps` offers none, never the perch it is leaving.
 */
export function nextFlight(
  insect: Seeded & Flight,
  caps: readonly string[],
  now: number,
): Flight {
  return onward(insect, now, (random) =>
    nextPerch(random, insect.leg.to, caps),
  );
}

/** `insect` flying off screen from `now`, past a side its seed picks, and gone. */
export function flightAway(insect: Seeded & Flight, now: number): Flight {
  return onward(insect, now, awayPerch);
}

export function isLeaving({ leg }: Flight): boolean {
  return leg.to.kind === 'away';
}

export function isAloft({ leg }: Flight, now: number): boolean {
  return now >= leg.departs && now < leg.arrives;
}
