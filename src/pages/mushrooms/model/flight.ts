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
import {
  enteringSide,
  entryOf,
  type Onscreen,
  outFirst,
  outOf,
  outWay,
  shownOf,
} from './flight-in';
import {
  apartIn,
  legTo,
  type Placed,
  placesSetOff,
  type Span,
} from './flight-timing';
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
import { mulberry32, nextSeed, pick, type Random, weighted } from './random';

export { FLIGHT_HABITS } from './flight-habits';
export type { Span } from './flight-timing';
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
 * Where a perch stands, in units of a butterfly's size as the layout draws
 * one, and `fromEye`, how far from the eye, in the clump's size: an insect there
 * is drawn `CLUMP_DISTANCE / fromEye` of that size.
 */
export type Place = Point & { fromEye: number };

/**
 * Where each perch stands (`Place`), by its name (`perchName`), so a distance
 * between two reads the same on every screen; `away` by its side, just past
 * the screen's edge.
 */
export type Places = Readonly<Record<string, Place>>;

/**
 * What the scene sees of the perches, which only the screen can say: the
 * flowers in sight, by id, the only ones an insect is sent to, and where the
 * scene gives them the more a bee's narrower wings see (`flowersFor`); the spots in
 * the open air an insect with nowhere to sit roams between, by id; the pairs
 * of perches standing too close for an insect on each (`Crowding`), so a
 * perch crowded by a taken one counts as taken; and, where the scene gives
 * them, the `places` of the perches, so a long flight takes longer than a
 * short one (`Habits`), and where it last drew each flier, by its id
 * (`drawn`), in the places' frame, since only the scene's steering knows
 * where a flier cut off mid-flight sets off from, and each flier's own away
 * spots, by its id (`aways`), since the scene draws one leaving at its own
 * height and span past the edge. With them, where a bee could plant a
 * flower (`Plot`).
 */
export type Sight = Plot & {
  flowers: readonly string[];
  beeFlowers?: readonly string[];
  air: readonly string[];
  crowded: readonly Crowding[];
  places?: Places;
  drawn?: Readonly<Record<string, Place>>;
  aways?: Readonly<Record<string, Places>>;
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
 * One flight and the stay after it: from `from` to `to` over `departs` to
 * `arrives`, then sitting there until `leaves`, when the next leg is due. A
 * leg to the air hovers there a while (`hovering`); an `away` leg leaves as
 * it arrives, and the insect is gone.
 */
export type Leg = Span & {
  from: Perch;
  to: Perch;
  leaves: number;
  /** On a first leg flown out of view first (`outFirst`), how long that stretch takes, in ms. */
  out?: number;
};

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

/**
 * A new insect's first flight, in from off screen to an open perch
 * (`nextPerch`), departing `now`. Given what the screen shows, the perch is
 * one it shows while any is open there, and the insect enters by the
 * screen's edge nearer it, timed from over the brow (`entryOf`), and with
 * none open there its leg
 * is lengthened by the stretch it flies out of view first at its cruise
 * (`outFirst`); otherwise by a side its seed picks.
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
  const side = enteringSide(onscreen, shown.places, to, drawn.side);
  const from: Perch = { kind: 'away', side };
  const outside = to !== inView;
  const places = outside
    ? outOf(shown.places, onscreen, side)
    : entryOf(shown.places, onscreen, side, to);
  const leg = legTo(random, habits, { from, to }, { now, places });
  if (!outside) return { leg, legs: 1 };
  const out = (1000 * outWay(onscreen, side)) / habits.cruising;
  return { leg: outFirst(leg, out), legs: 1 };
}

/** An insect on its flight, by its id where it has one, as the sight says where it was drawn (`drawn`). */
type Flying = InsectSeed & Flight & Partial<WithId>;

/**
 * The leg after the current one, from its perch to the one `choose` draws
 * first off the leg's stream, timed from where the insect sets off
 * (`placesSetOff`).
 */
function onward(
  { seed, kind, leg, legs, id }: Flying,
  { now, ...placed }: Timed & Placed,
  choose: (random: Random, habits: Habits) => Perch,
): Flight {
  const random = legRandom(seed, legs);
  const habits = FLIGHT_HABITS[kind];
  const to = choose(random, habits);
  const flying = { now, places: placesSetOff(placed, leg, now, id) };
  return {
    leg: legTo(random, habits, { from: leg.to, to }, flying),
    legs: legs + 1,
  };
}

/**
 * The flight after `insect`'s current one, departing `now` from the perch
 * that one went to, to an open perch (`nextPerch`).
 */
export function nextFlight(
  insect: Flying,
  perches: Perches,
  now: number,
  taken: readonly Held[] = [],
): Flight {
  const { kind, leg } = insect;
  return onward(insect, { now, ...placedOf(perches) }, (random, habits) =>
    nextPerch(random, { kind, habits }, leg.to, perches, taken),
  );
}

/**
 * `insect` flying off screen from `now`, past a side its seed picks, and
 * gone, as long a flight as `places` puts the edge away.
 */
export function flightAway(
  insect: Flying,
  now: number,
  placed: Placed = {},
): Flight {
  return onward(insect, { now, ...placedOf(placed) }, awayPerch);
}

/** Of `sight`, only what times a leg (`Placed`). */
function placedOf({ places, drawn, aways }: Placed): Placed {
  return {
    ...(places && { places }),
    ...(drawn && { drawn }),
    ...(aways && { aways }),
  };
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
