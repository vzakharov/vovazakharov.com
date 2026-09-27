/**
 * The meadow's insects under `release`, `startle` and `tick`: each keeps its
 * own leg, and these decide when it takes the next one. `caps` is every
 * mushroom id still standing, the only perches the model can check.
 */

import {
  BUTTERFLY_LIMIT,
  firstFlight,
  type Flight,
  flightAway,
  isAloft,
  isLeaving,
  nextFlight,
} from './flight';
import type { Insect, InsectKind } from './insect-genes';

export type Flier = Insect & Flight;

/** How many of each kind the meadow holds before the oldest leaves. */
export const INSECT_LIMITS = {
  butterfly: BUTTERFLY_LIMIT,
} as const satisfies Record<InsectKind, number>;

/**
 * `insects` with `insect` flying in from `now`. At its kind's limit, the
 * oldest of that kind not already leaving flies away from `now`, so a release
 * always acts.
 */
export function released(
  insects: readonly Flier[],
  insect: Insect,
  caps: readonly string[],
  now: number,
): Flier[] {
  const staying = insects.filter((each) => !isLeaving(each));
  const oldest =
    staying.length >= INSECT_LIMITS[insect.kind] ? staying[0] : undefined;
  return [
    ...insects.map((each) =>
      each === oldest ? { ...each, ...flightAway(each, now) } : each,
    ),
    { ...insect, ...firstFlight(insect, caps, now) },
  ];
}

/**
 * `insects` with the one called `id` taking off from `now`, when it is at
 * rest; an insect in the air, or none by that id, leaves them as they were.
 */
export function startled(
  insects: readonly Flier[],
  id: string,
  caps: readonly string[],
  now: number,
): readonly Flier[] {
  const insect = insects.find((each) => each.id === id);
  if (insect === undefined || isAloft(insect, now)) return insects;
  return insects.map((each) =>
    each === insect ? { ...each, ...nextFlight(each, caps, now) } : each,
  );
}

function capGone({ leg: { to } }: Flight, caps: readonly string[]): boolean {
  return to.kind === 'cap' && !caps.includes(to.id);
}

/**
 * `insects` at `now`: one whose stay is over, or whose cap is gone, takes its
 * next leg from `now`; one whose flight away has landed is gone. The same
 * array comes back when nothing is due, so a frame with nothing to do
 * changes nothing.
 */
export function ticked(
  insects: readonly Flier[],
  caps: readonly string[],
  now: number,
): readonly Flier[] {
  let changed = false;
  const next: Flier[] = [];
  for (const insect of insects) {
    if (isLeaving(insect)) {
      if (now >= insect.leg.arrives) changed = true;
      else next.push(insect);
    } else if (now >= insect.leg.leaves || capGone(insect, caps)) {
      changed = true;
      next.push({ ...insect, ...nextFlight(insect, caps, now) });
    } else {
      next.push(insect);
    }
  }
  return changed ? next : insects;
}
