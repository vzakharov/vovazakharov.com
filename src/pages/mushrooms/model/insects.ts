/**
 * The meadow's insects under `release`, `startle` and `tick`: each keeps its
 * own leg, and these decide when it takes the next one. `perches` is what
 * the meadow offers now; a new leg never goes to a perch another insect sits
 * on or is heading to, nor to one crowded by it (`nextFlight`).
 */

import {
  BUTTERFLY_LIMIT,
  firstFlight,
  type Flight,
  flightAway,
  isAloft,
  isLeaving,
  isOffered,
  nextFlight,
  type Perch,
  type Perches,
} from './flight';
import type { Insect, InsectKind } from './insect-genes';

export type Flier = Insect & Flight;

/** How many of each kind the meadow holds before the oldest leaves. */
const INSECT_LIMITS = {
  butterfly: BUTTERFLY_LIMIT,
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

/** Where each of `insects` other than `self` sits or is heading, leaving ones aside. */
function takenBy(insects: readonly Flight[], self?: Flight): Perch[] {
  return insects
    .filter((each) => each !== self && !isLeaving(each))
    .map(({ leg }) => leg.to);
}

/**
 * `insects` with `insect` flying in from `now`. At its kind's limit, the
 * oldest of that kind not already leaving flies away from `now`, so a release
 * always acts.
 */
export function released(
  insects: readonly Flier[],
  insect: Insect,
  perches: Perches,
  now: number,
): Flier[] {
  const oldest = evicted(insects, insect.kind, INSECT_LIMITS);
  const staying = insects.map((each) =>
    each === oldest ? { ...each, ...flightAway(each, now) } : each,
  );
  return [
    ...staying,
    { ...insect, ...firstFlight(insect, perches, now, takenBy(staying)) },
  ];
}

/**
 * `insects` with the one called `id` taking off from `now`, when it is at
 * rest; an insect in the air, or none by that id, leaves them as they were.
 */
export function startled(
  insects: readonly Flier[],
  id: string,
  perches: Perches,
  now: number,
): readonly Flier[] {
  const insect = insects.find((each) => each.id === id);
  if (insect === undefined || isAloft(insect, now)) return insects;
  const taken = takenBy(insects, insect);
  return insects.map((each) =>
    each === insect
      ? { ...each, ...nextFlight(each, perches, now, taken) }
      : each,
  );
}

/**
 * `insects` at `now`: one whose stay is over, or whose perch the meadow no
 * longer offers, takes its next leg from `now`; one whose flight away has
 * landed is gone. They are taken in order, each new leg seeing the ones
 * before it already taken, so two due on one frame never pick one perch.
 * The same array comes back when nothing is due, so a frame with nothing to
 * do changes nothing.
 */
export function ticked(
  insects: readonly Flier[],
  perches: Perches,
  now: number,
): readonly Flier[] {
  let changed = false;
  const next: Flier[] = [...insects];
  for (const [index, insect] of insects.entries()) {
    if (isLeaving(insect)) {
      if (now >= insect.leg.arrives) changed = true;
    } else if (now >= insect.leg.leaves || !isOffered(insect.leg.to, perches)) {
      changed = true;
      const taken = takenBy(next, insect);
      next[index] = { ...insect, ...nextFlight(insect, perches, now, taken) };
    }
  }
  if (!changed) return insects;
  return next.filter((each) => !isLeaving(each) || now < each.leg.arrives);
}
