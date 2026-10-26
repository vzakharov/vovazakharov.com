/**
 * Where a worm called out of a window goes: which window it crawls to, the
 * way it takes over the cap, and how the windows swing for it. Points are in
 * the cap's own frame (`capFrame`'s, y up), times in seconds.
 */

import { type Point, sample } from '@/mushrooms/shared/lib/geometry';
import { outAndBack } from '@/mushrooms/shared/lib/motion';
import {
  capBase,
  capSurface,
  hasTrumpet,
  MUSHROOM_INK,
  type MushroomGenes,
  PANE,
  slotLevel,
} from '@/mushrooms/entities/mushroom/index.node-safe';
import {
  tripDuration,
  WORM_GIRTH,
  WORM_LENGTH,
  WORM_PEEK_DURATION,
  wormTrip,
} from '@/mushrooms/entities/worm/index.node-safe';

/** How near two windows' distances count as the same, against the sums that place the slots. */
const TIE = 1e-9;

/** The highest a dome's arch climbs from the row toward the cap's top, on the longest trip. */
const WORM_LIFT = 0.8;
/** How far a chanterelle's worm humps over its row. */
const RIM_HUMP = PANE / 2;
/** How many chords a trip's path is sampled with. */
const PATH_STEPS = 24;

/**
 * The window a worm called out of `from` crawls to, of the first `count` of
 * `slots` (`windowSlots`, the windows put in): the farthest along the row,
 * and of two as far, the left on an even `trips` and the right on an odd —
 * so from the middle it goes either way in turn. `undefined` with no other
 * window: the worm peeks.
 */
export function wormTarget(
  slots: readonly Point[],
  count: number,
  from: number,
  trips: number,
): number | undefined {
  const start = slots[from];
  if (!start) return undefined;
  const others = slots
    .slice(0, count)
    .map((slot, index) => ({ index, far: Math.abs(slot.x - start.x), slot }))
    .filter(({ index }) => index !== from);
  const farthest = Math.max(...others.map(({ far }) => far));
  const tied = others
    .filter(({ far }) => far > farthest - TIE)
    .toSorted((a, b) => a.slot.x - b.slot.x);
  return (trips % 2 === 1 ? tied.at(-1) : tied[0])?.index;
}

/**
 * The way a worm takes from window `from` to window `to`, as a polyline from
 * one's middle to the other's. On a dome it arches over the face, rising
 * from the row toward the cap's top by `WORM_LIFT` at most, the farther the
 * higher, and keeping `girth` and an ink line under it; on a chanterelle it
 * follows the row under the rim, dipping with it, humped a little and kept
 * a girth under the rim.
 */
export function wormPath(
  genes: MushroomGenes,
  from: Point,
  to: Point,
  girth = WORM_GIRTH,
): Point[] {
  const lift = Math.min(WORM_LIFT, Math.abs(to.x - from.x) / genes.capWidth);
  const path = sample(0, 1, PATH_STEPS, (share) => {
    const x = from.x + (to.x - from.x) * share;
    const rise = Math.sin(Math.PI * share);
    if (hasTrumpet(genes)) {
      const y = slotLevel(genes, x) + rise * RIM_HUMP;
      return { x, y: Math.min(y, capBase(genes, x) - girth) };
    }
    const level = from.y + (to.y - from.y) * share;
    const ceiling = capSurface(genes, x) - girth - MUSHROOM_INK;
    const y = level + (ceiling - level) * rise * lift;
    return { x, y: Math.min(y, ceiling) };
  });
  // Each end at its window's middle, whatever the rim or the ceiling there.
  return [from, ...path.slice(1, -1), to];
}

/**
 * The straight way up out of a lone window that a peeking worm takes: a
 * body's length, or less where the cap's top comes lower (a russula's
 * hollow), so a head `girth` thick stays under its ink line.
 */
export function peekPath(
  genes: MushroomGenes,
  from: Point,
  girth = WORM_GIRTH,
): Point[] {
  const { x, y } = from;
  const room = capSurface(genes, x) - MUSHROOM_INK - girth / 2 - y;
  return [from, { x, y: y + Math.max(0, Math.min(WORM_LENGTH, room)) }];
}

/** How long a window takes to swing open, and to swing shut. */
export const WINDOW_SWING = 0.2;
/** How far along its path a worm's end is clear of a window: past the pane's half by a tail's round. */
const WINDOW_CLEAR = (PANE + WORM_GIRTH) / 2;

/**
 * Where a worm tapped `sinceTap` ago is on its own clock, the one `wormTrip`
 * and `wormPeek` run on: it sets off once its window has swung open.
 */
export function wormClock(sinceTap: number): number {
  return sinceTap - WINDOW_SWING;
}

/** The tap, on the worm's clock: when its window starts to swing open. */
const TAP = wormClock(0);

/** How long after the tap a worm out `duration` on its clock has its windows shut again, it in. */
function shutAfter(duration: number): number {
  return WINDOW_SWING + duration + WINDOW_SWING;
}

/** How long after the tap a trip `length` long has its windows shut again, its worm in. */
export function tripSpan(length: number): number {
  return shutAfter(tripDuration(length));
}
export const PEEK_SPAN = shutAfter(WORM_PEEK_DURATION);

/** How open a window is at `time` on the worm's clock, swinging open from `opens` and shut from `shuts`. */
function swung(time: number, opens: number, shuts: number): number {
  const hold = Math.max(0, shuts - opens - WINDOW_SWING);
  return outAndBack(time - opens, WINDOW_SWING, hold, WINDOW_SWING);
}

/**
 * The earliest time on the worm's clock at which `end` of a trip `length`
 * long is `past` along its path, the trip's end if never: both ends only
 * ever go forward, so a halving search finds it.
 */
function whenPast(length: number, end: 'head' | 'tail', past: number): number {
  let [early, late] = [0, tripDuration(length)];
  for (let halving = 0; halving < 40; halving++) {
    const middle = (early + late) / 2;
    const pose = wormTrip(middle, length);
    if (!pose || pose[end] >= past) late = middle;
    else early = middle;
  }
  return late;
}

/** How open a trip's two windows are, from 0 (shut) to 1: the tapped one, and the one it crawls to. */
export type TripWindows = { tapped: number; reached: number };

/**
 * How open the windows of a trip `length` long are `sinceTap` after the tap:
 * the tapped one swings open before the worm comes out and shuts once its
 * tail is clear of it; the other is open by the time the head reaches its
 * pane and shuts once the worm is in.
 */
export function tripWindows(sinceTap: number, length: number): TripWindows {
  const time = wormClock(sinceTap);
  const nearing = whenPast(length, 'head', length - WINDOW_CLEAR);
  return {
    tapped: swung(time, TAP, whenPast(length, 'tail', WINDOW_CLEAR)),
    reached: swung(
      time,
      Math.max(TAP, nearing - WINDOW_SWING),
      tripDuration(length),
    ),
  };
}

/** How open a lone window is `sinceTap` after the tap: open before the worm peeks out, shut once it is back in. */
export function peekWindow(sinceTap: number): number {
  return swung(wormClock(sinceTap), TAP, WORM_PEEK_DURATION);
}
