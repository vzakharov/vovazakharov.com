import { lerp, noise, type Point, rng, smoothstep } from '@/clip/shared/ink';

import type { Stroke } from './glyph';
import { cut, lengthOf, type TextLayout } from './layout';

/** A stretch of a stroke, as fractions of its length from its start. */
export type Stretch = readonly [number, number];

/** One time the nail went along a stroke: its own wavering line and ends. */
export type Pass = {
  line: Stroke;
  lineLength: number;
  /** The fresher red one of the bundle; the rest have dried brown. */
  stillWet: boolean;
  /** Seeds the pressure along it. */
  pressureSeed: number;
};

/** Where blood gathers under a stroke, and how far it runs when it runs all the way. */
export type Drip = {
  pool: Point;
  dripLength: number;
  /** How far its run bends sideways, in stage units. */
  sway: number;
};

/** Everything one written stroke leaves on the wall. */
export type Scratch = {
  passes: readonly Pass[];
  /** Where the nail went through the paint to the plaster. */
  grooves: readonly Stretch[];
  /** A thumb dragged along part of it: which part, and how far aside it smears. */
  smear?: { stretch: Stretch; aside: number };
  /** Only a near-vertical stroke drips, from its low end. */
  drip?: Drip;
};

// How far a pass wavers off the stroke, and how far its ends wander, in cap heights.
const PASS_WAVER = 0.05;
const ENDS_WANDER = 0.09;

/** `points` cut into short pieces, each joint nudged by up to `amplitude`. */
function shaky(
  points: Stroke,
  random: () => number,
  amplitude: number,
  step: number,
): Stroke {
  const out: Point[] = [];
  const nudge = () => (random() - 0.5) * amplitude;
  for (let n = 1; n < points.length; n += 1) {
    const [ax, ay] = points[n - 1] ?? [0, 0];
    const [bx, by] = points[n] ?? [0, 0];
    const pieces = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step));
    for (let k = n === 1 ? 0 : 1; k <= pieces; k += 1) {
      out.push([
        lerp(ax, bx, k / pieces) + nudge(),
        lerp(ay, by, k / pieces) + nudge(),
      ]);
    }
  }
  return out.length > 0 ? out : points;
}

/** `points` from `start` to `end` along it; a negative `start` or an `end` past its length runs on straight. */
export function stretchOf(points: Stroke, start: number, end: number): Stroke {
  const total = lengthOf(points);
  const [a = [0, 0], b = a] = points;
  const [y = [0, 0], z = y] = points.slice(-2);
  const run = (from: Point, to: Point, by: number): Point => {
    const span = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
    return [
      to[0] + ((to[0] - from[0]) / span) * by,
      to[1] + ((to[1] - from[1]) / span) * by,
    ];
  };
  const head = cut(points, Math.min(end, total));
  const tail = cut(head.toReversed(), Math.max(0, lengthOf(head) - start));
  const kept = tail.toReversed();
  return [
    ...(start < 0 ? [run(b, a, -start)] : []),
    ...kept,
    ...(end > total ? [run(y, z, end - total)] : []),
  ];
}

/** The lowest of `points`, where blood gathers. */
function lowest(points: Stroke): Point {
  let low: Point = points[0] ?? [0, 0];
  for (const point of points) if (point[1] > low[1]) low = point;
  return low;
}

/** A stretch somewhere along a stroke, `span` of it long. */
function stretchAt(random: () => number, span: number): Stretch {
  const start = random() * (1 - span);
  return [start, start + span];
}

/** What each stroke of `layout` leaves, fixed by `seed`, at cap height `size`. */
export function scratchesOf(
  layout: TextLayout,
  size: number,
  seed: number,
): Scratch[] {
  const random = rng(seed);
  return layout.strokes.map(({ points }) => {
    const count = random() < 0.5 ? 3 : 4;
    const freshOne = Math.floor(random() * count);
    const total = lengthOf(points);
    const wander = () => (random() - 0.35) * size * ENDS_WANDER;
    const passes = Array.from({ length: count }, (_, n): Pass => {
      const line = shaky(
        stretchOf(points, -wander(), total + wander()),
        random,
        size * PASS_WAVER,
        size * 0.1,
      );
      return {
        line,
        lineLength: lengthOf(line),
        stillWet: n === freshOne,
        pressureSeed: Math.floor(random() * 0x7f_ff_ff_ff),
      };
    });
    const grooves =
      random() < 0.6
        ? [stretchAt(random, 0.15 + random() * 0.25)]
        : ([] as const);
    const smearing = random() < 0.2;
    const smear = {
      stretch: stretchAt(random, 0.3 + random() * 0.3),
      aside: (random() < 0.5 ? -1 : 1) * size * (0.04 + random() * 0.05),
    };
    const [first = [0, 0]] = points;
    const last = points.at(-1) ?? first;
    const upright =
      Math.abs(last[1] - first[1]) > 2 * Math.abs(last[0] - first[0]);
    const dripping = upright && random() < 0.5;
    const drip = {
      pool: lowest(points),
      dripLength: size * (0.2 + random() * 0.7),
      sway: (random() - 0.5) * size * 0.06,
    };
    return {
      passes,
      grooves,
      ...(smearing ? { smear } : {}),
      ...(dripping ? { drip } : {}),
    };
  });
}

// Pressure changes this often along a pass, in stage units at cap height 100.
const PRESSURE_EVERY = 14;

/**
 * How hard the nail pressed `along` a pass of `lineLength`, in `(0, 1]`:
 * wandering with `seed`, tapering to nothing at both ends and at `reach`,
 * the tip still being written.
 */
export function pressureAt(
  seed: number,
  along: number,
  lineLength: number,
  reach: number,
  size: number,
): number {
  const knot = along / ((PRESSURE_EVERY * size) / 100);
  const k = Math.floor(knot);
  const wander = lerp(
    noise(seed, k),
    noise(seed, k + 1),
    smoothstep(0, 1, knot - k),
  );
  const taper = Math.min(lineLength / 2, size * 0.18);
  return (
    (0.6 + 0.4 * wander) *
    Math.max(
      0.15,
      smoothstep(0, taper, along) *
        smoothstep(0, taper, lineLength - along) *
        smoothstep(0, taper * 0.5, reach - along),
    )
  );
}

/**
 * The outline of a line of `points` drawn `half(along)` to either side, as
 * one closed polygon: up its left side, back down its right.
 */
export function ribbon(
  points: Stroke,
  half: (along: number) => number,
): Point[] {
  const left: Point[] = [];
  const right: Point[] = [];
  let along = 0;
  for (const [n, [x, y]] of points.entries()) {
    const [px, py] = points[n - 1] ?? [x, y];
    const [nx, ny] = points[n + 1] ?? [x, y];
    along += Math.hypot(x - px, y - py);
    const span = Math.hypot(nx - px, ny - py) || 1;
    const w = half(along);
    const [ox, oy] = [(-(ny - py) / span) * w, ((nx - px) / span) * w];
    left.push([x + ox, y + oy]);
    right.push([x - ox, y - oy]);
  }
  return [...left, ...right.toReversed()];
}
