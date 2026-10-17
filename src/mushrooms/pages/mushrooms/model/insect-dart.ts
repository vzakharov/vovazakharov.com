/**
 * A flier caught in the air shying away: a quick dart off its flight, away
 * from the finger and never down, that it eases back out of by the time it
 * lands, so the leg still ends exactly on its perch. The dart is an offset
 * laid over the flight, in the insect's sizes, as its hops about a spot in
 * the air are; it never turns the body.
 */

import type { Span } from './flight';
import type { Point } from './geometry';
import type { InsectKind } from './insect-genes';
import { phaseBow } from './insect-paths';
import { smooth } from './motion';

/**
 * How each kind darts: how far off its flight at the most, in its sizes, and
 * how long it takes to get there, in ms — a fly snapping off, a butterfly
 * fluttering off wider and a touch slower, a bee in between.
 */
export const DARTS = {
  butterfly: { reach: 1.6, rise: 260 },
  fly: { reach: 1.8, rise: 140 },
  bee: { reach: 1.4, rise: 190 },
} as const satisfies Record<InsectKind, { reach: number; rise: number }>;

/** How much a dart lifts as well as backs off, against its way from the finger. */
const DART_LIFT = 0.5;

/**
 * The way a flier at `at` darts from a finger at `finger`, a unit vector in
 * the same units, y down: away from the finger, never down, and lifting a
 * little besides, so it reads as flying up out of reach. A finger dead on it
 * sends it up and to the side its `phase` picks.
 */
export function dartWay(finger: Point, at: Point, phase: number): Point {
  const away = { x: at.x - finger.x, y: Math.min(0, at.y - finger.y) };
  const length = Math.hypot(away.x, away.y);
  const [x, y] =
    length > 1e-9
      ? [away.x / length, away.y / length - DART_LIFT]
      : [phaseBow(phase), -DART_LIFT];
  const out = Math.hypot(x, y);
  return { x: x / out, y: y / out };
}

/**
 * How far off its flight a dart has a flier of `kind` at `now`, in its
 * sizes, on the leg `span` it shies on: 0 as the leg sets off, out to the
 * kind's `reach` over its `rise` — a third of the flight at the most, so a
 * short leg darts sooner — and back to 0 exactly as it arrives, starting and
 * ending at rest.
 */
export function dartAt(
  { departs, arrives }: Span,
  now: number,
  kind: InsectKind,
): number {
  const flight = arrives - departs;
  const since = now - departs;
  if (flight <= 0 || since <= 0 || since >= flight) return 0;
  const { reach, rise } = DARTS[kind];
  const peak = Math.min(rise, flight / 3);
  const out = smooth(since / peak);
  const back = smooth((since - peak) / (flight - peak));
  return reach * out * (1 - back);
}
