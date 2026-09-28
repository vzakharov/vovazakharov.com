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
import type { Insect, InsectKind, OfKind } from './insect-genes';
import {
  type Carrying,
  NO_POLLEN,
  type Plot,
  pollenAfter,
  type Sown,
  sown,
} from './pollen';

/** A kind that carries no pollen. */
type Visitor = OfKind<Exclude<InsectKind, 'bee'>>;
/** A bee, and the pollen it carries: only a bee has any. */
type Pollinator = OfKind<'bee'> & Carrying;
export type Flier = Insect & Flight & (Visitor | Pollinator);

/**
 * What the insects make of the meadow: the fliers, in the order they were
 * released, so the first is the oldest; and the flowers the bees planted, in
 * the order they opened.
 */
export type Swarm = { insects: readonly Flier[]; planted: readonly Sown[] };

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
 * `swarm` with `insect` flying in from `now`. At its kind's limit, the
 * oldest of that kind not already leaving flies away from `now`, so a release
 * always acts.
 */
export function released(
  swarm: Swarm,
  insect: Insect,
  perches: Perches,
  now: number,
): Swarm {
  const oldest = evicted(swarm.insects, insect.kind, INSECT_LIMITS);
  const planted = [...swarm.planted];
  const staying = swarm.insects.map((each) =>
    each === oldest
      ? tookOff(each, flightAway(each, now, perches), now, perches, planted)
      : each,
  );
  const flight = firstFlight(insect, perches, now, takenBy(staying));
  return {
    insects: [...staying, flierOf(insect, flight)],
    planted: plantedOnto(swarm.planted, planted),
  };
}

/**
 * `swarm` with the insect called `id` taking off from `now`, when it is at
 * rest; an insect in the air, or none by that id, leaves the swarm as it
 * was, the same object.
 */
export function startled(
  swarm: Swarm,
  id: string,
  perches: Perches,
  now: number,
): Swarm {
  const { insects } = swarm;
  const insect = insects.find((each) => each.id === id);
  if (insect === undefined || isAloft(insect, now)) return swarm;
  const taken = takenBy(insects, insect);
  const planted = [...swarm.planted];
  const flight = nextFlight(insect, perches, now, taken);
  return {
    insects: insects.map((each) =>
      each === insect ? tookOff(each, flight, now, perches, planted) : each,
    ),
    planted: plantedOnto(swarm.planted, planted),
  };
}

/**
 * Whether `insect`'s next leg is due at `now`, among `insects`: its stay is
 * over, the meadow no longer offers its perch, or it sits where a waiting
 * bee is owed room (`givesWay`).
 */
function isDue(
  insect: Flier,
  insects: readonly Flier[],
  perches: Perches,
  now: number,
): boolean {
  const { kind, leg } = insect;
  if (now >= leg.leaves || !isOffered(leg.to, perches, kind)) return true;
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
 * do changes nothing.
 */
export function ticked(swarm: Swarm, perches: Perches, now: number): Swarm {
  const { insects } = swarm;
  let changed = false;
  const next: Flier[] = [...insects];
  const planted = [...swarm.planted];
  for (const [index, insect] of insects.entries()) {
    if (isLeaving(insect)) {
      if (now >= insect.leg.arrives) changed = true;
    } else if (isDue(insect, next, perches, now)) {
      changed = true;
      const taken = takenBy(next, insect);
      const flight = nextFlight(insect, perches, now, taken);
      next[index] = tookOff(insect, flight, now, perches, planted);
    }
  }
  if (!changed) return swarm;
  return {
    insects: next.filter((each) => !isLeaving(each) || now < each.leg.arrives),
    planted: plantedOnto(swarm.planted, planted),
  };
}
