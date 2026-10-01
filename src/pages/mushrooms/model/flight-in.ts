/**
 * Where a released insect first flies in: its first perch is one the screen
 * shows as it is released, and its leg is timed in from the screen's edge
 * nearer that perch at its kind's cruise, so a tap on its button is answered
 * in view. Every later perch is drawn from the whole world
 * (`nextFlight`). Where it is drawn setting off is the view's
 * (`insect-away.ts`).
 */

import type { Leg, Perch, Perches, PerchKind, Places, Side } from './flight';
import type { Lefted, Point } from './geometry';
import { CLUMP_DISTANCE } from './ground';
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
 * How far a released insect with no open perch in view flies out of it
 * first, in the units of `Places`: across `onscreen` from its middle and out
 * by a side.
 */
export function outWay({ left, right }: Onscreen): number {
  return (right - left) / 2;
}

/**
 * How long, in ms, a released insect with no open perch in view takes to
 * fly across it and out by its side, on a first leg `leg`: the stretch
 * `outFirst` lengthened it by, or half its flight for a leg it did not.
 */
export function outOfView({
  departs,
  arrives,
  out,
}: Pick<Leg, 'departs' | 'arrives' | 'out'>): number {
  return out ?? (arrives - departs) / 2;
}

/**
 * `leg`, timed from the screen's edge to a perch the screen does not show,
 * lengthened by `out` ms flown out of view first, so the rest of the way
 * still takes as long as `leg` did; its stay after it as long as it was.
 */
export function outFirst(leg: Leg, out: number): Leg {
  return { ...leg, arrives: leg.arrives + out, leaves: leg.leaves + out, out };
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
    const { y, fromEye } = places[name] ?? { y: 0, fromEye: CLUMP_DISTANCE };
    return [name, { x, y, fromEye }] as const;
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
