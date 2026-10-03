/**
 * The meadow's insects under `release`, `startle` and `tick`: each keeps its
 * own leg, and these decide when it takes the next one. `perches` is what
 * the meadow offers now; a new leg never goes to a perch another insect sits
 * on or is heading to, nor to one crowded by it for the two kinds
 * (`nextFlight`). A bee leaving a flower it pollinated plants one beside it
 * (`sown`), so these hand back the planted flowers with the insects.
 */

import {
  firstFlight,
  type Flight,
  flightAway,
  flowerFreed,
  givesWay,
  type Held,
  isAloft,
  isLeaving,
  isOffered,
  nextFlight,
  type Perches,
} from './flight';
import type { Onscreen } from './flight-in';
import type { Insect, InsectKind, OfKind } from './insect-genes';
import {
  type Carrying,
  NO_POLLEN,
  type Plot,
  pollenAfter,
  type Sown,
  sown,
} from './pollen';
import {
  dashesForCover,
  shelteredPerches,
  type Showered,
  stayingDry,
} from './shelter';

/** A kind that carries no pollen. */
type Visitor = OfKind<Exclude<InsectKind, 'bee'>>;
/** A bee, and the pollen it carries: only a bee has any. */
type Pollinator = OfKind<'bee'> & Carrying;
/**
 * `shied`, the leg, by its count in `legs`, a catch in the air set the flier
 * shying on (`insect-dart.ts`): it darts on that leg alone, so a later leg
 * carrying the count on never darts.
 */
type Shying = { shied?: number };
export type Flier = Insect & Flight & Shying & (Visitor | Pollinator);

/**
 * What the insects make of the meadow: the fliers, in the order they were
 * released, so the first is the oldest; and the flowers the bees planted, in
 * the order they opened.
 */
export type Swarm = { insects: readonly Flier[]; planted: readonly Sown[] };

/**
 * A swarm and the shower it flies in, which sends its fliers under the caps
 * while it falls (`shelteredPerches`).
 */
type Rained = Swarm & Showered;

/** How many of each kind the meadow holds before the oldest leaves. */
export const INSECT_LIMITS = {
  butterfly: 4,
  fly: 3,
  bee: 3,
} as const satisfies Record<InsectKind, number>;

/**
 * The oldest of `insects` of `kind` not already leaving, when that kind is at
 * its limit in `limits`; none below it. No other kind counts or is chosen.
 */
export function evicted<
  Kind extends string,
  Each extends { kind: Kind } & Flight,
>(
  insects: readonly Each[],
  kind: NoInfer<Kind>,
  limits: Readonly<Record<NoInfer<Kind>, number>>,
): Each | undefined {
  const staying = insects.filter(
    (each) => each.kind === kind && !isLeaving(each),
  );
  return staying.length >= limits[kind] ? staying[0] : undefined;
}

/** Where each of `insects` other than `self` sits or is heading, and its kind, leaving ones aside. */
function takenBy(insects: readonly Flier[], self?: Flier): Held[] {
  return insects
    .filter((each) => each !== self && !isLeaving(each))
    .map(({ kind, leg }) => ({ kind, perch: leg.to }));
}

/** `after`, or `before` when nothing was planted onto it, so an unchanged list keeps its identity. */
const plantedOnto = (before: readonly Sown[], after: readonly Sown[]) =>
  after.length === before.length ? before : after;

/** `insect` setting off on `flight`, its first, a bee with no pollen yet. */
function flierOf(insect: Insect, flight: Flight): Flier {
  const { kind } = insect;
  return kind === 'bee'
    ? { ...insect, ...flight, kind, pollen: NO_POLLEN }
    : { ...insect, ...flight, kind };
}

/**
 * `flier` setting off on `flight` at `now`. A bee carries its pollen on
 * (`pollenAfter`), and one leaving a flower it pollinated plants a flower
 * there, onto `planted`, when `plot` has room (`sown`).
 */
function tookOff(
  flier: Flier,
  flight: Flight,
  now: number,
  plot: Plot,
  planted: Sown[],
): Flier {
  if (flier.kind !== 'bee') return { ...flier, ...flight };
  const flower = sown(flier, now, plot, planted);
  if (flower !== undefined) planted.push(flower);
  const pollen = pollenAfter(flier.pollen, flier.leg, now, flight.leg);
  return { ...flier, ...flight, pollen };
}

/**
 * `swarm` with `insect` flying in from `now`, to a first perch `onscreen`
 * shows where it is given (`firstFlight`). At its kind's limit, the oldest of
 * that kind not already leaving flies away from `now`, so a release always
 * acts. In the rain the newcomer heads for shelter (`shelteredPerches`).
 */
export function released(
  swarm: Rained,
  insect: Insect,
  given: Perches,
  now: number,
  onscreen?: Onscreen,
): Swarm {
  const { insects, rain } = swarm;
  const perches = shelteredPerches(given, rain, now);
  const oldest = evicted(insects, insect.kind, INSECT_LIMITS);
  const planted = [...swarm.planted];
  const staying = insects.map((each) =>
    each === oldest
      ? tookOff(each, flightAway(each, now, perches), now, perches, planted)
      : each,
  );
  const flight = firstFlight(insect, perches, now, takenBy(staying), onscreen);
  return {
    insects: stayingDry([...staying, flierOf(insect, flight)], rain, now),
    planted: plantedOnto(swarm.planted, planted),
  };
}

/**
 * Whether a tap at `now` catches `flier` in the air: flying a leg, or
 * hovering at a spot in the air it came to, and not on its way away.
 */
export function caughtAloft(flier: Flight, now: number): boolean {
  return (
    !isLeaving(flier) && (isAloft(flier, now) || flier.leg.to.kind === 'air')
  );
}

/**
 * `swarm` with the insect called `id` taking its next leg from `now`, to a
 * perch other than the one it sat on or was heading to (`nextFlight`): at
 * rest it takes off; caught in the air (`caughtAloft`) it shies, darting off
 * as the leg sets off (`shied`). One flying away, or none by that id, leaves
 * the swarm as it was, the same object. In the rain one under a cap darts to
 * the nearest other shelter, or up into the air while none is open.
 */
export function startled(
  swarm: Rained,
  id: string,
  given: Perches,
  now: number,
): Swarm {
  const { insects, rain } = swarm;
  const insect = insects.find((each) => each.id === id);
  if (insect === undefined) return swarm;
  const shies = caughtAloft(insect, now);
  if (!shies && isAloft(insect, now)) return swarm;
  const perches = shelteredPerches(given, rain, now);
  const taken = takenBy(insects, insect);
  const planted = [...swarm.planted];
  const flight = nextFlight(insect, perches, now, taken);
  const shied = shies ? { shied: flight.legs } : {};
  const next = insects.map((each) =>
    each === insect
      ? { ...tookOff(each, flight, now, perches, planted), ...shied }
      : each,
  );
  return {
    insects: stayingDry(next, rain, now),
    planted: plantedOnto(swarm.planted, planted),
  };
}

/** Whether `flier` is darting on its current leg, the one a catch in the air set it on. */
export const isShying = ({ shied, legs }: Flier): boolean => shied === legs;

/**
 * Whether `insect`'s next leg is due at `now`, among `insects`: its stay is
 * over, the meadow no longer offers its perch, `rain` has just started
 * (`dashesForCover`), or it sits where a waiting bee is owed room
 * (`givesWay`).
 */
function isDue(
  insect: Flier,
  { insects, rain }: Omit<Rained, 'planted'>,
  perches: Perches,
  now: number,
): boolean {
  const { kind, leg } = insect;
  if (now >= leg.leaves || !isOffered(leg.to, perches, kind)) return true;
  if (dashesForCover(leg, rain, perches)) return true;
  if (now < leg.arrives) return false;
  const [held, taken] = [{ kind, perch: leg.to }, takenBy(insects, insect)];
  return givesWay(held, taken, perches) || flowerFreed(held, taken, perches);
}

/**
 * `swarm` at `now`: an insect whose next leg is due (`isDue`) takes it from
 * `now`; one whose flight away has
 * landed is gone. They are taken in order, each new leg seeing the ones
 * before it already taken, so two due on one frame never pick one perch.
 * The same object comes back when nothing is due, so a frame with nothing to
 * do changes nothing. In the rain a stay under a cap lasts until the shower
 * stops, and the flier's own linger after (`stayingDry`).
 */
export function ticked(swarm: Rained, given: Perches, now: number): Swarm {
  const { insects, rain } = swarm;
  const perches = shelteredPerches(given, rain, now);
  let changed = false;
  const next: Flier[] = [...insects];
  const planted = [...swarm.planted];
  for (const [index, insect] of insects.entries()) {
    if (isLeaving(insect)) {
      if (now >= insect.leg.arrives) changed = true;
    } else if (isDue(insect, { insects: next, rain }, perches, now)) {
      changed = true;
      const taken = takenBy(next, insect);
      const flight = nextFlight(insect, perches, now, taken);
      next[index] = tookOff(insect, flight, now, perches, planted);
    }
  }
  const stayed = stayingDry(next, rain, now);
  if (!changed && stayed === next) return swarm;
  return {
    insects: stayed.filter(
      (each) => !isLeaving(each) || now < each.leg.arrives,
    ),
    planted: plantedOnto(swarm.planted, planted),
  };
}
