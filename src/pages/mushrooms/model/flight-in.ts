/**
 * Where a released insect first flies in: its first perch is one the screen
 * shows as it is released, its leg is timed in from the screen's edge nearer
 * that perch, and it lands there within `ARRIVAL`, so a tap on its button is
 * answered in view. Every later perch is drawn from the whole world
 * (`nextFlight`). Where it is drawn setting off is the view's
 * (`insect-away.ts`).
 */

import type {
  Leg,
  Perch,
  Perches,
  PerchKind,
  Places,
  Side,
  Span,
} from './flight';
import type { Lefted, Point } from './geometry';
import { perchName } from './perch-room';

/**
 * The stretch of the world the screen shows as an insect is released,
 * across in the units of `Places`, and `inset`: how far inside either edge a
 * perch stands to count as shown.
 */
export type Onscreen = Lefted & { right: number; inset: number };

/** Whether `onscreen` shows `place`, `inset` clear of either edge; never for a perch placed nowhere. */
export function isShown(
  { left, right, inset }: Onscreen,
  place: Point | undefined,
): boolean {
  return (
    place !== undefined && place.x >= left + inset && place.x <= right - inset
  );
}

/** The screen's edge nearer `place`. */
export function nearerSide({ left, right }: Onscreen, place: Point): Side {
  return place.x - left <= right - place.x ? 'left' : 'right';
}

/**
 * The longest a released insect's flight in to a perch the screen shows
 * takes, in ms: faster than any kind's cruise over the same way, so the
 * butterfly, slow for a finger to catch, still lands soon after its tap.
 */
export const ARRIVAL = 1500;

/** `leg` flown in no longer than `ARRIVAL`, its stay after it as long as it was. */
export function arriving(leg: Leg): Leg {
  const flown = leg.arrives - leg.departs;
  const early = flown - Math.min(flown, ARRIVAL);
  return { ...leg, arrives: leg.arrives - early, leaves: leg.leaves - early };
}

/**
 * How long, in ms, a released insect with no open perch in view takes to
 * fly across it and out by its side, on a first leg `leg` (`outFirst`): as
 * long as an arrival at most, and half the leg, so the rest of the way is
 * still flown.
 */
export function outOfView({ departs, arrives }: Span): number {
  return Math.min(ARRIVAL, (arrives - departs) / 2);
}

/**
 * `leg`, timed from the screen's edge to a perch the screen does not show,
 * lengthened by the stretch flown out of view first, so `outOfView` of it is
 * that stretch and the rest of the way still takes as long as `leg` did, at
 * the kind's cruise; its stay after it as long as it was.
 */
export function outFirst(leg: Leg): Leg {
  const out = Math.min(ARRIVAL, leg.arrives - leg.departs);
  return { ...leg, arrives: leg.arrives + out, leaves: leg.leaves + out };
}

/**
 * `perches` cut down to those `onscreen` shows, with the away spots at the
 * screen's edges rather than past the world's, so a flight in is timed from
 * where it enters. Without `places` nothing can be told shown, and `perches`
 * comes back as it is.
 */
export function shownOf(perches: Perches, onscreen: Onscreen): Perches {
  const { places, flowers, beeFlowers, caps, spotted, air } = perches;
  if (!places) return perches;
  const within =
    (kind: Exclude<PerchKind, 'away'>) =>
    (ids: readonly string[]): string[] =>
      ids.filter((id) => isShown(onscreen, places[perchName({ kind, id })]));
  const [flowersIn, capsIn] = [within('flower'), within('cap')];
  return {
    ...perches,
    flowers: flowersIn(flowers),
    ...(beeFlowers && { beeFlowers: flowersIn(beeFlowers) }),
    caps: capsIn(caps),
    spotted: capsIn(spotted),
    air: within('air')(air),
    places: { ...places, ...edgesOf(places, onscreen) },
  };
}

/** The away spots of `places` moved to `onscreen`'s edges, at the heights `places` gives them. */
function edgesOf(places: Places, { left, right }: Onscreen): Places {
  const edge = (side: Side, x: number) => {
    const name = perchName({ kind: 'away', side });
    return [name, { x, y: places[name]?.y ?? 0 }] as const;
  };
  return Object.fromEntries([edge('left', left), edge('right', right)]);
}

/** The edge an insect flying in to `to` enters by: the one nearer where `places` puts it, `drawn` where it puts it nowhere. */
export function enteringSide(
  onscreen: Onscreen,
  places: Places | undefined,
  to: Perch,
  drawn: Side,
): Side {
  const place = to.kind === 'away' ? undefined : places?.[perchName(to)];
  return place ? nearerSide(onscreen, place) : drawn;
}
