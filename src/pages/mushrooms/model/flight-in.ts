/**
 * Where a released insect first flies in: its first perch is one the screen
 * shows as it is released, and it enters by the screen's edge nearer that
 * perch. Every later perch is drawn from the whole world (`nextFlight`).
 */

import type { Perch, Perches, PerchKind, Places, Side } from './flight';
import type { Lefted, Point } from './geometry';
import { perchName } from './perch-room';

/**
 * The stretch of the world the screen shows as an insect is released,
 * across in the units of `Places`, and `inset`: how far inside either edge a
 * perch stands to count as shown, and how far past it the insect sets off.
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
 * `perches` cut down to those `onscreen` shows, with the away spots just past
 * the screen's edges rather than the world's, so a flight in is timed from
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

/** The away spots of `places` moved to just past `onscreen`'s edges, at the heights `places` gives them. */
function edgesOf(places: Places, { left, right, inset }: Onscreen): Places {
  const edge = (side: Side, x: number) => {
    const name = perchName({ kind: 'away', side });
    return [name, { x, y: places[name]?.y ?? 0 }] as const;
  };
  return Object.fromEntries([
    edge('left', left - inset),
    edge('right', right + inset),
  ]);
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
