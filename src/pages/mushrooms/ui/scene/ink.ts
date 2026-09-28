/**
 * The pen and the light the creatures are drawn with, as pure geometry and
 * colour: an ink that takes the colour of what it edges, a line heavier on
 * the shade side than the lit one, a stroke that tapers, and which side of a
 * shape faces the light and which way its shadow falls.
 */

import type { Point } from '../../model/geometry';
import type { Light } from '../../model/light';
import { darken, dimTo, luminance, mix } from './colour';
import { PALETTE } from './palette';

/**
 * The light a painter draws by, and the thinnest line the screen shows, in
 * CSS px: one device pixel.
 */
export type Lighting = Light & { hairline: number };
/** A thing drawn in `lighting`. */
export type Lighted = { lighting: Lighting };

/** How far a fill's own dark goes, and how much of Syama's pen it takes. */
const INK_DARKEN = 0.6;
const INK_COOL = 0.35;
/** The lightest an ink may be, so every silhouette stays dark on the grass. */
const INK_MOST = 0.06;
/** The contrast an ink keeps against its own fill, where the fill is light enough to allow it, with a little room over 3:1. */
const INK_CONTRAST = 3.1;
/** The darkest an ink is held to, so a dark fill's edge is its own deep colour and never black. */
const INK_LEAST = 0.012;
/** How far an inner line's ink goes back toward its fill, so the silhouette reads first. */
const INNER_BACK = 0.4;

/**
 * The ink that edges `fill`: its own dark, cooled toward Syama's blue pen,
 * then dimmed until it is dark on the grass and stands off the fill itself.
 */
export function inkFor(fill: number): number {
  const ink = mix(darken(fill, INK_DARKEN), PALETTE.inkCool, INK_COOL);
  const own = (luminance(fill) + 0.05) / INK_CONTRAST - 0.05;
  return dimTo(ink, Math.max(INK_LEAST, Math.min(INK_MOST, own)));
}

/** The ink of a line inside a shape filled `fill`: a band's edge, a plank, a vein. */
export function innerInk(fill: number): number {
  return mix(inkFor(fill), fill, INNER_BACK);
}

/** The share of the base width the line keeps on its lit side, and how much more it gains turned full away. */
const LIT_WEIGHT = 0.45;
const SHADE_WEIGHT = 0.85;
/** How far a stroke tapers by its end, as a share of where it starts. */
export const TAPER = 0.35;

/** Twice the area `points` enclose, signed by which way round they run. */
function doubleArea(points: readonly Point[]): number {
  let area = 0;
  for (const [index, point] of points.entries()) {
    const next = points[(index + 1) % points.length] ?? point;
    area += point.x * next.y - next.x * point.y;
  }
  return area;
}

/** Each vertex's unit normal, the way `turn` says, across the chord from the vertex before it to the one after. */
function normals(
  points: readonly Point[],
  closed: boolean,
  turn: number,
): Point[] {
  const last = points.length - 1;
  return points.map((point, index) => {
    const at = (step: number): Point => {
      const reach = index + step;
      const wrapped = closed
        ? (reach + points.length) % points.length
        : Math.min(last, Math.max(0, reach));
      return points[wrapped] ?? point;
    };
    const [before, after] = [at(-1), at(1)];
    const dx = after.x - before.x;
    const dy = after.y - before.y;
    const length = Math.hypot(dx, dy) || 1;
    return { x: (turn * dy) / length, y: (-turn * dx) / length };
  });
}

/** Each vertex's outward unit normal round a closed outline, whichever way it runs. */
export function outwardNormals(points: readonly Point[]): Point[] {
  return normals(points, true, Math.sign(doubleArea(points)) || 1);
}

const dot = (a: Point, b: Point) => a.x * b.x + a.y * b.y;

/**
 * A closed outline grown outward, each vertex along its normal by `base`
 * weighted by how far it turns from the light: ~0.45 `base` facing `toward`,
 * ~1.3 `base` turned full away, never under `least`. Filled in the ink before
 * the shape's own fill, it is the shape's ink line with no polygon holed.
 */
export function weightedOutline(
  points: readonly Point[],
  base: number,
  toward: Point,
  least = 0,
): Point[] {
  const outward = outwardNormals(points);
  return points.map((point, index) => {
    const normal = outward[index] ?? { x: 0, y: 0 };
    const width = Math.max(
      least,
      base * (LIT_WEIGHT + SHADE_WEIGHT * Math.max(0, -dot(normal, toward))),
    );
    return { x: point.x + normal.x * width, y: point.y + normal.y * width };
  });
}

/**
 * An open line through `points` as a ribbon to fill, `from` wide at its first
 * point narrowing to `to` at its last, by length along it; no width under
 * `least`.
 */
export function taperedLine(
  points: readonly Point[],
  [from, to]: readonly [number, number],
  least = 0,
): Point[] {
  const across = normals(points, false, 1);
  const lengths = points.map((point, index) => {
    const before = points[index - 1] ?? point;
    return Math.hypot(point.x - before.x, point.y - before.y);
  });
  const total = lengths.reduce((sum, length) => sum + length, 0) || 1;
  let along = 0;
  const sides = points.map((point, index) => {
    along += lengths[index] ?? 0;
    const half = Math.max(least, from + (to - from) * (along / total)) / 2;
    const normal = across[index] ?? { x: 0, y: 0 };
    return [
      { x: point.x + normal.x * half, y: point.y + normal.y * half },
      { x: point.x - normal.x * half, y: point.y - normal.y * half },
    ] as const;
  });
  return [
    ...sides.map(([left]) => left),
    ...sides.map(([, right]) => right).toReversed(),
  ];
}

/**
 * The longest run of a closed outline's vertices whose outward normal meets
 * `toward` at `least` or more (a dot product, from -1 to 1), in the order the
 * outline runs: the edge a rim light lies along, or a shade.
 */
export function facingArc(
  points: readonly Point[],
  toward: Point,
  least: number,
): Point[] {
  return longestRun(
    points,
    outwardNormals(points).map((normal) => dot(normal, toward) >= least),
  );
}

/** The longest run of a closed outline's vertices that `keep` marks, in the order the outline runs, round its end if need be. */
export function longestRun(
  points: readonly Point[],
  keep: readonly boolean[],
): Point[] {
  if (keep.every(Boolean)) return [...points];
  // From just past a vertex left out, round once.
  const start = keep.indexOf(false);
  let best: Point[] = [];
  let run: Point[] = [];
  for (let step = 1; step <= points.length; step++) {
    const index = (start + step) % points.length;
    const point = points[index];
    if (keep[index] === true && point) {
      run.push(point);
      if (run.length > best.length) best = run;
    } else {
      run = [];
    }
  }
  return best;
}

/** `toward` in a frame whose y runs up, as a model's outlines do. */
export function upward({ x, y }: Point): Point {
  return { x, y: -y };
}

/** The side of a shape the light falls on, -1 left or 1 right: the sun's side, a straight-down light counting as the left. */
export function litSide({ x }: Point): -1 | 1 {
  return x > 0 ? 1 : -1;
}

/** How far a shadow falls from under the foot, as a share of the thing's width. */
const SHADOW_FALL = 0.25;

/**
 * The shadow `width` across a thing casts on the ground: its middle's
 * offset from the foot, away from the sun.
 */
export function shadowFall({ x }: Point, width: number): number {
  return -x * SHADOW_FALL * width;
}
