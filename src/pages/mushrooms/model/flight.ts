/**
 * Where an insect flies next, and when. Every leg is a pure function of the
 * insect's seed and how many legs it has flown, so a replay of the same
 * actions flies the same butterflies; nothing here knows where a perch
 * stands on screen. An insect is never lost for want of a perch: with none
 * open it roams the open air until one is, and it leaves only when sent
 * away (`flightAway`).
 */

import type { WithId } from '@/shared/typings';

import { FLIGHT_HABITS, type Habits } from './flight-habits';
import { enteringSide, type Onscreen, shownOf } from './flight-in';
import type { Point } from './geometry';
import type { InsectKind, InsectSeed, Kinded } from './insect-genes';
import {
  blockedFor,
  flowersFor,
  type Held,
  isSamePerch,
  isSeat,
  keptForBees,
  perchName,
} from './perch-room';
import type { Plot } from './pollen';
import {
  between,
  mulberry32,
  nextSeed,
  pick,
  type Random,
  weighted,
} from './random';

export { FLIGHT_HABITS } from './flight-habits';
export {
  flowerFreed,
  givesWay,
  type Held,
  isSeat,
  perchName,
} from './perch-room';

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
 * Two kinds of insect, the first on the first perch of a `Crowding` and the
 * second on the second.
 */
export type Pairing = readonly [InsectKind, InsectKind];

/**
 * Two perches standing too close for an insect on each, and for which kinds
 * on them: the wider two insects' wings, the farther apart they must sit.
 */
export type Crowding = readonly [Perch, Perch, readonly Pairing[]];

/**
 * Where each perch stands, by its name (`perchName`), in units of a
 * butterfly's size, so a distance between two reads the same on every
 * screen; `away` by its side, just past the screen's edge.
 */
export type Places = Readonly<Record<string, Point>>;

/**
 * What the scene sees of the perches, which only the screen can say: the
 * flowers in sight, by id, the only ones an insect is sent to, and where the
 * scene gives them the more a bee's narrower wings see (`flowersFor`); the spots in
 * the open air an insect with nowhere to sit roams between, by id; the pairs
 * of perches standing too close for an insect on each (`Crowding`), so a
 * perch crowded by a taken one counts as taken; and, where the scene gives
 * them, the `places` of the perches, so a long flight takes longer than a
 * short one (`Habits`). With them, where a bee could plant a flower
 * (`Plot`).
 */
export type Sight = Plot & {
  flowers: readonly string[];
  beeFlowers?: readonly string[];
  air: readonly string[];
  crowded: readonly Crowding[];
  places?: Places;
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

/**
 * How a flight farther than its kind flies at its own pace gets there: it
 * dashes `way` of the way in the first `time` of its flight, both shares, and
 * flies the rest at its pace.
 */
type Dash = { time: number; way: number };

/**
 * When a leg's flight takes off and lands, in ms on the scene's clock, and
 * how it dashes, if it does.
 */
export type Span = { departs: number; arrives: number; dash?: Dash };

/**
 * One flight and the stay after it: from `from` to `to` over `departs` to
 * `arrives`, then sitting there until `leaves`, when the next leg is due. A
 * leg to the air hovers there a while (`hovering`); an `away` leg leaves as
 * it arrives, and the insect is gone.
 */
export type Leg = Span & { from: Perch; to: Perch; leaves: number };

/** An insect's current leg, and how many legs it has flown, that one included. */
export type Flight = { leg: Leg; legs: number };

/** Keeps a leg's stream apart from the genes grown off the same seed. */
const LEG_SALT = 0x5b_d1_e9_95;

function legRandom(seed: number, legs: number): Random {
  return mulberry32(nextSeed(mulberry32(((seed ^ LEG_SALT) + legs) >>> 0)));
}

/** What `nextPerch` weighs a choice by: where the insect is, what it cannot take, and the kind and habits choosing. */
type Choosing = Kinded &
  Pick<Leg, 'from'> & {
    habits: Habits;
    perches: Perches;
    taken: readonly Held[];
    blocked: ReadonlySet<string>;
  };

/** How far apart `places` puts two perches, `undefined` where it places either nowhere. */
function apartIn(
  places: Places | undefined,
  a: Perch,
  b: Perch,
): number | undefined {
  const [here, there] = [places?.[perchName(a)], places?.[perchName(b)]];
  return here && there
    ? Math.hypot(there.x - here.x, there.y - here.y)
    : undefined;
}

/**
 * A spot in the air for a flier with no perch open, the nearer the likelier
 * by its `stride`: one uncrowded, else one merely no one has taken, so no
 * flier is lost for want of room in the air — and where every other spot is
 * crowded or taken, hovering on where it is, while that is a spot in the air
 * it may hold. `undefined` only from a perch, with every spot taken.
 */
function roamFrom(
  random: Random,
  { kind, habits, from, perches, taken, blocked }: Choosing,
): Perch | undefined {
  const others = perches.air
    .map((id): Perch => ({ kind: 'air', id }))
    .filter((perch) => !isSamePerch(perch, from));
  const spaced = others.filter((perch) => !blocked.has(perchName(perch)));
  const hovering = from.kind === 'air' && isOffered(from, perches, kind);
  if (spaced.length === 0 && hovering && !blocked.has(perchName(from))) {
    return from;
  }
  const [spot, ...spots] =
    spaced.length > 0
      ? spaced
      : others.filter(
          (perch) => !taken.some((each) => isSamePerch(perch, each.perch)),
        );
  if (spot === undefined) return hovering ? from : undefined;
  const near = (perch: Perch) => {
    const apart = apartIn(perches.places, from, perch);
    return apart === undefined ? 1 : 1 / (1 + (apart / habits.stride) ** 2);
  };
  return weighted(random, [spot, ...spots], near);
}

/**
 * The perch the next leg of an insect of `kind` goes to: a flower
 * `flowerShare` of the time and a cap otherwise, the other kind when the one
 * drawn has none open — never a cap for a kind that does not rest on one — a
 * spotted cap `spottedPull` times as likely as any other. Open means offered
 * by `perches`, not the one it is leaving, and neither in `taken`, where the
 * other insects sit or are heading, nor crowded by one there for the two
 * kinds (`Crowding`), nor one another kind leaves to the bees
 * (`keptForBees`), so butterflies make way for them. A `fussy` kind with no
 * spotted cap open roams the air instead, that share of the time. With none
 * open it flutters up and settles again where it was, while that is still
 * offered and uncrowded, and roams the air otherwise (`roamFrom`), where it
 * looks again. It flies away only from a perch with every spot in the air
 * taken, which the scene never lets happen: the air holds a spot for every
 * insect the meadow can hold.
 */
function nextPerch(
  random: Random,
  { kind, habits }: Kinded & { habits: Habits },
  from: Perch,
  perches: Perches,
  taken: readonly Held[],
): Perch {
  const blocked = blockedFor(kind, taken, perches.crowded);
  for (const key of keptForBees(kind, taken, perches)) blocked.add(key);
  const choosing = { kind, habits, from, perches, taken, blocked };
  const open = (perchKind: 'flower' | 'cap', ids: readonly string[]) =>
    ids
      .map((id): Perch => ({ kind: perchKind, id }))
      .filter(
        (perch) => !isSamePerch(perch, from) && !blocked.has(perchName(perch)),
      );
  const flowers = open('flower', flowersFor(kind, perches));
  const caps = habits.resting === undefined ? [] : open('cap', perches.caps);
  const drawn =
    random() < habits.flowerShare ? [flowers, caps] : [caps, flowers];
  const [first, ...rest] = drawn.find((each) => each.length > 0) ?? [];
  const isSpotted = (perch: Perch) =>
    perch.kind === 'cap' && perches.spotted.includes(perch.id);
  // Drawn only for a fussy kind, so every other kind's stream is its own.
  const roams =
    habits.fussy > 0 &&
    !caps.some((cap) => isSpotted(cap)) &&
    random() < habits.fussy &&
    perches.air.some((id) => !blocked.has(perchName({ kind: 'air', id })));
  if (roams) return roamFrom(random, choosing) ?? awayPerch(random);
  if (first !== undefined) {
    const pull = (perch: Perch) => (isSpotted(perch) ? habits.spottedPull : 1);
    return weighted(random, [first, ...rest], pull);
  }
  const settles =
    habits.settles &&
    isSeat(from) &&
    isOffered(from, perches, kind) &&
    !blocked.has(perchName(from));
  if (settles) return from;
  return roamFrom(random, choosing) ?? awayPerch(random);
}

function awayPerch(random: Random): Extract<Perch, { kind: 'away' }> {
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
    case 'air': {
      return between(random, ...habits.hovering);
    }
    case 'away': {
      return 0;
    }
    default: {
      return to satisfies never;
    }
  }
}

/**
 * How a flight from `from` to `to` is timed, in times its `flying` time: 1 up
 * to a `stride`, in proportion past it up to `slowest`, and `slowest` past
 * that, where a kind that dashes (`dashing`) flies its last strides at its
 * own pace and dashes the rest, and any other simply flies faster.
 */
function paced(
  { stride, slowest, dashing }: Habits,
  { from, to }: Pick<Leg, 'from' | 'to'>,
  places: Places | undefined,
): Pick<Span, 'dash'> & { stretch: number } {
  const apart = apartIn(places, from, to);
  if (apart === undefined) return { stretch: 1 };
  const strides = apart / stride;
  if (strides <= slowest || dashing === undefined) {
    return { stretch: Math.min(slowest, Math.max(1, strides)) };
  }
  const way = 1 - ((1 - dashing) * slowest) / strides;
  return { stretch: slowest, dash: { time: dashing, way } };
}

function legTo(
  random: Random,
  habits: Habits,
  route: Pick<Leg, 'from' | 'to'>,
  { now, places }: Timed & Pick<Sight, 'places'>,
): Leg {
  const { from, to } = route;
  const flown = between(random, ...habits.flying);
  const { stretch, dash } = paced(habits, route, places);
  const arrives = now + flown * stretch;
  return {
    from,
    to,
    departs: now,
    arrives,
    ...(dash && { dash }),
    leaves: arrives + stayAt(random, habits, to),
  };
}

/**
 * A new insect's first flight, in from off screen to an open perch
 * (`nextPerch`), departing `now`. Given what the screen shows, the perch is
 * one it shows while any is open there, and the insect enters by the
 * screen's edge nearer it (`flight-in.ts`); otherwise by a side its seed
 * picks.
 */
export function firstFlight(
  { seed, kind }: InsectSeed,
  perches: Perches,
  now: number,
  taken: readonly Held[] = [],
  onscreen?: Onscreen,
): Flight {
  const random = legRandom(seed, 0);
  const habits = FLIGHT_HABITS[kind];
  const drawn = awayPerch(random);
  const choose = (among: Perches) =>
    nextPerch(random, { kind, habits }, drawn, among, taken);
  if (!onscreen) {
    const { places } = perches;
    const to = choose(perches);
    return {
      leg: legTo(random, habits, { from: drawn, to }, { now, places }),
      legs: 1,
    };
  }
  const shown = shownOf(perches, onscreen);
  const inView = choose(shown);
  const to = inView.kind === 'away' ? choose(perches) : inView;
  const { places } = shown;
  const side = enteringSide(onscreen, places, to, drawn.side);
  const from: Perch = { kind: 'away', side };
  return {
    leg: legTo(random, habits, { from, to }, { now, places }),
    legs: 1,
  };
}

/** The leg after the current one, from its perch to the one `choose` draws first off the leg's stream. */
function onward(
  { seed, kind, leg, legs }: InsectSeed & Flight,
  moment: Timed & Pick<Sight, 'places'>,
  choose: (random: Random, habits: Habits) => Perch,
): Flight {
  const random = legRandom(seed, legs);
  const habits = FLIGHT_HABITS[kind];
  const to = choose(random, habits);
  return {
    leg: legTo(random, habits, { from: leg.to, to }, moment),
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
  taken: readonly Held[] = [],
): Flight {
  const [{ kind }, { places }] = [insect, perches];
  return onward(insect, { now, places }, (random, habits) =>
    nextPerch(random, { kind, habits }, insect.leg.to, perches, taken),
  );
}

/**
 * `insect` flying off screen from `now`, past a side its seed picks, and
 * gone, as long a flight as `places` puts the edge away.
 */
export function flightAway(
  insect: InsectSeed & Flight,
  now: number,
  { places }: Pick<Sight, 'places'> = {},
): Flight {
  return onward(insect, { now, places }, awayPerch);
}

/** Whether `perches` still offers `perch` to an insect of `kind`; `away` always is. */
export function isOffered(
  perch: Perch,
  perches: Perches,
  kind: InsectKind,
): boolean {
  const { caps, air } = perches;
  switch (perch.kind) {
    case 'cap': {
      return caps.includes(perch.id);
    }
    case 'flower': {
      return flowersFor(kind, perches).includes(perch.id);
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
