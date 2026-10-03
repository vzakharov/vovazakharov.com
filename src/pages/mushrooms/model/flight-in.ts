/**
 * Where a released insect first flies in: its first perch is one the screen
 * shows as it is released, so a tap on its button is answered in view; it
 * enters by the screen's edge nearer that perch, its leg timed at its kind's
 * cruise from over the brow, where the screen draws it setting off (`WayOut`,
 * `insect-away.ts`). Every later perch is drawn from the whole world
 * (`nextFlight`).
 */

import { pick } from '@/shared/lib/collections';

import type {
  Leg,
  Perch,
  Perches,
  PerchKind,
  Place,
  Places,
  Side,
} from './flight';
import { apartOf } from './flight-timing';
import { distanceBetween, type Lefted, type Point } from './geometry';
import { CLUMP_DISTANCE } from './ground';
import { perchName } from './perch-room';

/**
 * A release's way out of view as the screen draws it, in the units of
 * `Places`: `brow`, where it sets off, and `outs`, the point past each side
 * it flies out by before the rest of its way.
 */
export type WayOut = { brow: Place; outs: Readonly<Record<Side, Place>> };

/**
 * The stretch of the world the screen shows as an insect is released: across
 * and down to `downTo`, the screen's foot, in the units of `Places`, and out
 * to `far`, the brow (the farthest the ground shows), round the eye;
 * `inset`, how far inside either edge and the foot a perch
 * stands to count as shown; and the release's way out of view.
 */
export type Onscreen = Lefted & {
  right: number;
  downTo: number;
  far: number;
  inset: number;
} & WayOut;

/**
 * Whether `onscreen` shows `place`: `inset` clear of either edge and of the
 * screen's foot, and no farther than the brow; never for a perch placed
 * nowhere.
 */
export function isShown(
  { left, right, downTo, far, inset }: Onscreen,
  place: Place | undefined,
): boolean {
  return (
    place !== undefined &&
    place.x >= left + inset &&
    place.x <= right - inset &&
    place.y <= downTo - inset &&
    roundFromEye(place) <= far
  );
}

/**
 * How far round the eye `place` stands, as the brow is measured
 * (`behindHills`): a posed place's plane distance from its eye, so one off
 * the heading is judged past the brow where it sinks; an unposed one's
 * `fromEye`.
 */
function roundFromEye({ fromEye, pose }: Place): number {
  return pose ? distanceBetween(pose.frame.eye, pose.aloft) : fromEye;
}

/** The screen's edge nearer `place`. */
export function nearerSide({ left, right }: Onscreen, place: Point): Side {
  return place.x - left <= right - place.x ? 'left' : 'right';
}

/**
 * How far a released insect with no open perch in view flies out of it
 * first by `side`, in butterfly sizes where it is (`apartOf`): from over the
 * brow to past that side, as the screen draws it (`WayOut`).
 */
export function outWay({ brow, outs }: WayOut, side: Side): number {
  return apartOf(brow, outs[side]);
}

/** `places` with the away spot by `side` where a release flying out of view by it sets off again (`WayOut`), so the rest of its way is timed from there. */
export function outOf(
  places: Places | undefined,
  { outs }: WayOut,
  side: Side,
): Places {
  return { ...places, [perchName({ kind: 'away', side })]: outs[side] };
}

/**
 * `places` with the away spot by `side` where a release into `to`, a perch
 * the screen shows, sets off: over the brow halfway across from the screen's
 * middle (`WayOut`'s `brow`) to `to`, as the screen draws it, so its leg is
 * timed as long as it is drawn. At `brow` where `places` puts `to` nowhere.
 * Moved, it is unposed: `to` is shown, so the leg's frame is the heading's,
 * where its place stands.
 */
export function entryOf(
  places: Places | undefined,
  { brow }: WayOut,
  side: Side,
  to: Perch,
): Places {
  const there = placeOf(places, to);
  const from = there
    ? { ...pick(brow, 'y', 'fromEye'), x: (brow.x + there.x) / 2 }
    : brow;
  return { ...places, [perchName({ kind: 'away', side })]: from };
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
 * screen's edges rather than past the world's, so a perch is the likelier
 * the nearer it stands to the edge a release is drawn from (`nextPerch`).
 * Without `places` nothing can be told shown, and `perches` comes back as it
 * is.
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
  const place = placeOf(places, to);
  return place ? nearerSide(onscreen, place) : drawn;
}

/** Where `places` puts `to`, a shown perch; never an away spot, which stands past the screen. */
function placeOf(places: Places | undefined, to: Perch): Place | undefined {
  return to.kind === 'away' ? undefined : places?.[perchName(to)];
}
