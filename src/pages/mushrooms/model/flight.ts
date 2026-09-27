/**
 * Where an insect flies next, and when. Every leg is a pure function of the
 * insect's seed and how many legs it has flown, so a replay of the same
 * actions flies the same butterflies; nothing here knows where a perch
 * stands on screen. An insect is never lost for want of a perch: with none
 * open it roams the open air until one is, and it leaves only when sent
 * away (`flightAway`).
 */

import type { WithId } from '@/shared/typings';

import type { InsectKind, InsectSeed } from './insect-genes';
import type { Plot } from './pollen';
import {
  between,
  mulberry32,
  nextSeed,
  pick,
  type Random,
  weighted,
} from './random';

export const SIDES = ['left', 'right'] as const;
export type Side = (typeof SIDES)[number];

const PERCH_KINDS = ['flower', 'cap', 'air', 'away'] as const;
export type PerchKind = (typeof PERCH_KINDS)[number];

/** What each kind of perch carries beside its kind. */
type PerchFields = {
  flower: WithId;
  cap: WithId;
  air: WithId;
  away: { side: Side };
};

/**
 * Where an insect wants to be: a flower or a cap by id, a spot in the open
 * air by id, which it only passes through, or `away`, off screen past that
 * side's edge.
 */
export type Perch = {
  [Kind in PerchKind]: { kind: Kind } & PerchFields[Kind];
}[PerchKind];

/**
 * What the scene sees of the perches, which only the screen can say: the
 * flowers in sight, by id, the only ones an insect is sent to; the spots in
 * the open air an insect with nowhere to sit roams between, by id; and the
 * pairs of perches standing too close for an insect on each, so a perch
 * crowded by a taken one counts as taken. With them, where a bee could plant
 * a flower (`Plot`).
 */
export type Sight = Plot & {
  flowers: readonly string[];
  air: readonly string[];
  crowded: ReadonlyArray<readonly [Perch, Perch]>;
};

/**
 * The perches the meadow offers: every standing mushroom's cap, the spotted
 * ones among them by id again, and what the scene sees.
 */
export type Perches = Sight & {
  caps: readonly string[];
  spotted: readonly string[];
};

/** A moment on the scene's clock, in ms. */
export type Timed = { now: number };

/** When a leg's flight takes off and lands, in ms on the scene's clock. */
export type Span = { departs: number; arrives: number };

/**
 * One flight and the stay after it: from `from` to `to` over `departs` to
 * `arrives`, then sitting there until `leaves`, when the next leg is due. A
 * leg to the air leaves as it arrives, onward at once; an `away` leg too,
 * and the insect is gone.
 */
export type Leg = Span & { from: Perch; to: Perch; leaves: number };

/** An insect's current leg, and how many legs it has flown, that one included. */
export type Flight = { leg: Leg; legs: number };

/**
 * How one kind flies: how long a flight takes, a stay at a flower, and a
 * rest on a cap, in ms, `resting` being `undefined` for a kind that never
 * sits on a cap; how often, with both open, it goes to a flower rather than
 * a cap; how many times as often it picks a spotted cap as any other; and
 * whether, with nowhere else open, it settles again where it sat rather
 * than roaming.
 */
export type Habits = {
  flying: readonly [number, number];
  drinking: readonly [number, number];
  resting: readonly [number, number] | undefined;
  flowerShare: number;
  spottedPull: number;
  settles: boolean;
};

/**
 * Every kind's habits. A butterfly drinks at a flower three times in five and
 * rests long; a fly darts, on a cap four times in five and to a fly agaric
 * three times as often as to any other cap; a bee goes only to flowers,
 * roaming the air while none is open — and never settling back on the flower
 * it is leaving, so bees as many as the flowers still take turns at them and
 * carry pollen between them.
 */
export const FLIGHT_HABITS = {
  butterfly: {
    flying: [2400, 3900],
    drinking: [3000, 6000],
    resting: [4000, 9000],
    flowerShare: 0.6,
    spottedPull: 1,
    settles: true,
  },
  fly: {
    flying: [600, 1100],
    drinking: [1500, 4000],
    resting: [1500, 4000],
    flowerShare: 0.2,
    spottedPull: 3,
    settles: true,
  },
  bee: {
    flying: [1100, 1800],
    drinking: [2000, 3500],
    resting: undefined,
    flowerShare: 1,
    spottedPull: 1,
    settles: false,
  },
} as const satisfies Record<InsectKind, Habits>;

/** Keeps a leg's stream apart from the genes grown off the same seed. */
const LEG_SALT = 0x5b_d1_e9_95;

function legRandom(seed: number, legs: number): Random {
  return mulberry32(nextSeed(mulberry32(((seed ^ LEG_SALT) + legs) >>> 0)));
}

/** A perch an insect sits on. */
type Seat = Extract<Perch, { kind: 'flower' | 'cap' }>;

function isSamePerch(a: Perch, b: Perch): boolean {
  return a.kind === 'away' || b.kind === 'away'
    ? false
    : a.kind === b.kind && a.id === b.id;
}

/** Whether `perch` is `other`, or stands too close to it for an insect on each. */
function isCrowdedBy(
  perch: Perch,
  other: Perch,
  crowded: Sight['crowded'],
): boolean {
  return (
    isSamePerch(perch, other) ||
    crowded.some(
      ([a, b]) =>
        (isSamePerch(a, perch) && isSamePerch(b, other)) ||
        (isSamePerch(b, perch) && isSamePerch(a, other)),
    )
  );
}

/**
 * The perch the next leg goes to: a flower `flowerShare` of the time and a
 * cap otherwise, the other kind when the one drawn has none open — never a
 * cap for a kind that does not rest on one — a spotted cap `spottedPull`
 * times as likely as any other. Open means
 * offered by `perches`, not the one it is leaving, and neither in `taken`,
 * where the other fliers sit or are heading, nor crowded by one there. With
 * none open it flutters up and settles again where it was, while that is
 * still a perch offered, and roams to an open spot in the air otherwise,
 * where it looks again — to one only crowded, not taken, where a small
 * screen's air has none uncrowded. It flies away only when the air has no
 * spot untaken either, which the scene never lets happen.
 */
function nextPerch(
  random: Random,
  habits: Habits,
  from: Perch,
  perches: Perches,
  taken: readonly Perch[],
): Perch {
  const open = (kind: 'flower' | 'cap' | 'air', ids: readonly string[]) =>
    ids
      .map((id): Perch => ({ kind, id }))
      .filter(
        (perch) =>
          !isSamePerch(perch, from) &&
          !taken.some((each) => isCrowdedBy(perch, each, perches.crowded)),
      );
  const flowers = open('flower', perches.flowers);
  const caps = habits.resting === undefined ? [] : open('cap', perches.caps);
  const drawn =
    random() < habits.flowerShare ? [flowers, caps] : [caps, flowers];
  const [first, ...rest] = drawn.find((each) => each.length > 0) ?? [];
  const pull = (perch: Perch) =>
    perch.kind === 'cap' && perches.spotted.includes(perch.id)
      ? habits.spottedPull
      : 1;
  if (first !== undefined) return weighted(random, [first, ...rest], pull);
  if (habits.settles && isSeat(from) && isOffered(from, perches)) return from;
  // Where every open spot is crowded, a spot merely no one has taken, so
  // no flier is lost for want of room in the air.
  const spaced = open('air', perches.air);
  const [spot, ...spots] =
    spaced.length > 0
      ? spaced
      : perches.air
          .map((id): Perch => ({ kind: 'air', id }))
          .filter(
            (perch) =>
              !isSamePerch(perch, from) &&
              !taken.some((each) => isSamePerch(perch, each)),
          );
  return spot === undefined
    ? awayPerch(random)
    : pick(random, [spot, ...spots]);
}

/** Whether `perch` is one an insect sits on, rather than the air or away. */
export function isSeat(perch: Perch): perch is Seat {
  return perch.kind === 'flower' || perch.kind === 'cap';
}

function awayPerch(random: Random): Perch {
  return { kind: 'away', side: pick(random, SIDES) };
}

function stayAt(random: Random, habits: Habits, to: Perch): number {
  switch (to.kind) {
    case 'flower': {
      return between(random, ...habits.drinking);
    }
    case 'cap': {
      // `nextPerch` offers a cap only to a kind that rests on one.
      if (habits.resting === undefined) {
        throw new Error('A leg to a cap for a kind that never rests on one');
      }
      return between(random, ...habits.resting);
    }
    case 'air':
    case 'away': {
      return 0;
    }
    default: {
      return to satisfies never;
    }
  }
}

function legTo(
  random: Random,
  habits: Habits,
  { from, to }: Pick<Leg, 'from' | 'to'>,
  now: number,
): Leg {
  const arrives = now + between(random, ...habits.flying);
  return {
    from,
    to,
    departs: now,
    arrives,
    leaves: arrives + stayAt(random, habits, to),
  };
}

/**
 * A new insect's first flight, in from off screen on a side its seed picks
 * to an open perch (`nextPerch`), departing `now`.
 */
export function firstFlight(
  { seed, kind }: InsectSeed,
  perches: Perches,
  now: number,
  taken: readonly Perch[] = [],
): Flight {
  const random = legRandom(seed, 0);
  const habits = FLIGHT_HABITS[kind];
  const from = awayPerch(random);
  const to = nextPerch(random, habits, from, perches, taken);
  return { leg: legTo(random, habits, { from, to }, now), legs: 1 };
}

/** The leg after the current one, from its perch to the one `choose` draws first off the leg's stream. */
function onward(
  { seed, kind, leg, legs }: InsectSeed & Flight,
  now: number,
  choose: (random: Random, habits: Habits) => Perch,
): Flight {
  const random = legRandom(seed, legs);
  const habits = FLIGHT_HABITS[kind];
  const to = choose(random, habits);
  return {
    leg: legTo(random, habits, { from: leg.to, to }, now),
    legs: legs + 1,
  };
}

/**
 * The flight after `insect`'s current one, departing `now` from the perch
 * that one went to, to an open perch (`nextPerch`).
 */
export function nextFlight(
  insect: InsectSeed & Flight,
  perches: Perches,
  now: number,
  taken: readonly Perch[] = [],
): Flight {
  return onward(insect, now, (random, habits) =>
    nextPerch(random, habits, insect.leg.to, perches, taken),
  );
}

/** `insect` flying off screen from `now`, past a side its seed picks, and gone. */
export function flightAway(insect: InsectSeed & Flight, now: number): Flight {
  return onward(insect, now, awayPerch);
}

/** Whether `perches` still offers `perch`; `away` always is. */
export function isOffered(
  perch: Perch,
  { caps, flowers, air }: Perches,
): boolean {
  switch (perch.kind) {
    case 'cap': {
      return caps.includes(perch.id);
    }
    case 'flower': {
      return flowers.includes(perch.id);
    }
    case 'air': {
      return air.includes(perch.id);
    }
    case 'away': {
      return true;
    }
    default: {
      return perch satisfies never;
    }
  }
}

export function isLeaving({ leg }: Flight): boolean {
  return leg.to.kind === 'away';
}

export function isAloft({ leg }: Flight, now: number): boolean {
  return now >= leg.departs && now < leg.arrives;
}
