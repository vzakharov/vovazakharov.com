/**
 * Where an insect flies next, and when. Every leg is a pure function of the
 * insect's seed and how many legs it has flown, so a replay of the same
 * actions flies the same butterflies; nothing here knows where a perch
 * stands on screen. An insect is never lost for want of a perch: with none
 * open it roams the open air until one is, and it leaves only when sent
 * away (`flightAway`).
 */

import type { WithId } from '@/kernel/shared/typings';

import type { Timed } from '@/mushrooms/shared/lib/motion';
import {
  mulberry32,
  nextSeed,
  pick,
  type Random,
  saltedStream,
  weighted,
} from '@/mushrooms/shared/lib/random';
import { CLUMP_DISTANCE } from '@/mushrooms/shared/world';
import {
  apartIn,
  enteringSide,
  entryOf,
  type Flight,
  FLIGHT_HABITS,
  type Habits,
  type InsectKind,
  type InsectSeed,
  isSamePerch,
  isShown,
  type Kinded,
  legTo,
  type Onscreen,
  outFirst,
  outOf,
  outWay,
  type Perch,
  type PerchKind,
  perchName,
  type Placed,
  type Places,
  placesSetOff,
  type Side,
  SIDES,
} from '@/mushrooms/entities/insect/index.node-safe';

import type { Hemmed, Perches } from './offered';
import { blockedFor, flowersFor, type Held, keptForBees } from './perch-room';
import { nearestShelter, offersShelter } from './shelter';

/** Keeps a leg's stream apart from the genes grown off the same seed. */
const LEG_SALT = 0x5b_d1_e9_95;

function legRandom(seed: number, legs: number): Random {
  return mulberry32(nextSeed(saltedStream(seed, LEG_SALT, legs)));
}

/** What `nextPerch` weighs a choice by: where the insect is, what it cannot take, and the kind and habits choosing. */
type Choosing = Kinded &
  Hemmed & {
    habits: Habits;
    taken: readonly Held[];
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
 * insect the meadow can hold. While it rains it takes the nearest open
 * shelter (`nearestShelter`), roaming while none is open, and settles nowhere.
 * At dusk (`dusky`) it seeks its `roost` first, never roams by choice, and
 * with none open settles again where it was, whatever its kind.
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
  if (perches.raining === true) {
    return (
      nearestShelter(choosing) ??
      roamFrom(random, choosing) ??
      awayPerch(random)
    );
  }
  const open = (perchKind: 'flower' | 'cap', ids: readonly string[]) =>
    ids
      .map((id): Perch => ({ kind: perchKind, id }))
      .filter(
        (perch) => !isSamePerch(perch, from) && !blocked.has(perchName(perch)),
      );
  const flowers = open('flower', flowersFor(kind, perches));
  const caps = habits.resting === undefined ? [] : open('cap', perches.caps);
  const dusky = perches.dusky === true;
  // Drawn at dusk too, so a leg's stream past it is the day's.
  const flowerFirst = random() < habits.flowerShare;
  const roosting = dusky && habits.roost !== undefined;
  const drawn = (roosting ? habits.roost === 'flower' : flowerFirst)
    ? [flowers, caps]
    : [caps, flowers];
  const [first, ...rest] = drawn.find((each) => each.length > 0) ?? [];
  const isSpotted = (perch: Perch) =>
    perch.kind === 'cap' && perches.spotted.includes(perch.id);
  // Drawn only for a fussy kind, so every other kind's stream is its own.
  const roams =
    !dusky &&
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
    (habits.settles || dusky) &&
    (from.kind === 'flower' || from.kind === 'cap') &&
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
 * screen's edge nearer it, timed from over the brow (`entryOf`); with none
 * open there, its leg is lengthened by the stretch it flies out of view first
 * at its cruise (`outFirst`). Without the screen, it enters by a side its
 * seed picks.
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

/** An insect on its flight, with the id the sight's `drawn` knows it by, where it has one. */
type Flying = InsectSeed & Flight & Partial<WithId>;

/**
 * The leg after the current one, from its perch to the one `choose` draws
 * first off the leg's stream, given and timed from where the insect sets off
 * (`placesSetOff`).
 */
function onward(
  { seed, kind, leg, legs, id }: Flying,
  { now, ...placed }: Timed & Placed,
  choose: (random: Random, habits: Habits, setOff: Placed) => Perch,
): Flight {
  const random = legRandom(seed, legs);
  const habits = FLIGHT_HABITS[kind];
  const flying = { now, places: placesSetOff(placed, leg, now, id) };
  const to = choose(random, habits, flying);
  return {
    leg: legTo(random, habits, { from: leg.to, to }, flying),
    legs: legs + 1,
  };
}

/**
 * The flight after `insect`'s current one, departing `now` from the perch
 * that one went to, to an open perch (`nextPerch`) — while it rains, the
 * nearest from where the insect is drawn, mid-flight too.
 */
export function nextFlight(
  insect: Flying,
  perches: Perches,
  now: number,
  taken: readonly Held[] = [],
): Flight {
  const { kind, leg } = insect;
  return onward(
    insect,
    { now, ...placedOf(perches) },
    (random, habits, { places }) => {
      const seen = perches.raining === true ? { ...perches, places } : perches;
      return nextPerch(random, { kind, habits }, leg.to, seen, taken);
    },
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
    case 'shelter': {
      return offersShelter(perches, perch);
    }
    case 'away': {
      return true;
    }
    default: {
      return perch satisfies never;
    }
  }
}

/**
 * `perches` cut down to those `onscreen` shows, with the away spots at the
 * screen's edges rather than past the world's, so a perch is the likelier
 * the nearer it stands to the edge a release is drawn from (`nextPerch`).
 * Without `places` nothing can be told shown, and `perches` comes back as it
 * is.
 */
export function shownOf(perches: Perches, onscreen: Onscreen): Perches {
  const { places, flowers, beeFlowers, caps, spotted, air, shelters } = perches;
  if (!places) return perches;
  const shown = (perch: Perch) => isShown(onscreen, places[perchName(perch)]);
  const within =
    (kind: Exclude<PerchKind, 'away' | 'shelter'>) =>
    (ids: readonly string[]): string[] =>
      ids.filter((id) => shown({ kind, id }));
  const [flowersIn, capsIn] = [within('flower'), within('cap')];
  return {
    ...perches,
    flowers: flowersIn(flowers),
    ...(beeFlowers && { beeFlowers: flowersIn(beeFlowers) }),
    caps: capsIn(caps),
    spotted: capsIn(spotted),
    air: within('air')(air),
    ...(shelters && {
      shelters: shelters.filter((seat) => shown({ kind: 'shelter', ...seat })),
    }),
    places: { ...places, ...edgesOf(places, onscreen) },
  };
}

/** The away spots of `places` moved to `onscreen`'s edges, at the heights `places` gives them. */
function edgesOf(places: Places, { left, right }: Onscreen): Places {
  const edge = (side: Side, x: number) => {
    const name = perchName({ kind: 'away', side });
    const { y, fromEye } = places[name] ?? { y: 0, fromEye: CLUMP_DISTANCE };
    return [name, { x, y, fromEye }] as const;
  };
  return Object.fromEntries([edge('left', left), edge('right', right)]);
}
