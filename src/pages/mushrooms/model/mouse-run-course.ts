/**
 * The course a mouse runs on the plane from one door's front to another's:
 * a curve bowed toward the eye, so its middle crosses open grass in front of
 * both houses rather than the gap behind the nearer stem, and out to a side
 * until it is long enough to be watched. Plane lengths are in the clump's
 * size.
 */

import { distanceBetween, type Point } from './geometry';

/**
 * How much nearer the eye than the nearer door's front a course's middle
 * runs, in the wider end's door widths: a runner's length, its body, tail
 * and shadow spanning about 1.8 of its door.
 */
export const RUN_BOW = 1.8;

/**
 * A run's course, a quadratic curve from `from` to `to` drawn toward `bend`:
 * its middle lies halfway between `bend` and the middle of its ends.
 */
export type RunPath = { from: Point; bend: Point; to: Point };

/** Where a run's course is at `s` of its curve's own parameter, 0 to 1. */
function curveAt({ from, bend, to }: RunPath, s: number): Point {
  const [a, b, c] = [(1 - s) ** 2, 2 * s * (1 - s), s * s];
  return {
    x: a * from.x + b * bend.x + c * to.x,
    y: a * from.y + b * bend.y + c * to.y,
  };
}

/** How many straight pieces a course is measured in: a bow's length to well within a percent. */
const PIECES = 32;

/** The course's length run from its start to each of `PIECES` points along its curve. */
function lengthsOf(path: RunPath): number[] {
  const lengths = [0];
  let last = path.from;
  let run = 0;
  for (let piece = 1; piece <= PIECES; piece++) {
    const point = curveAt(path, piece / PIECES);
    run += distanceBetween(last, point);
    lengths.push(run);
    last = point;
  }
  return lengths;
}

/** How long a run's course is on the plane. */
export const pathLength = (path: RunPath): number =>
  lengthsOf(path)[PIECES] ?? 0;

/**
 * The ways a course between `from` and `to` bows as an eye at `eye` sees it:
 * `toward` the eye from the ends' `middle`, `off` that far from it, and
 * `aside`, square to the run's chord.
 */
function waysOf(from: Point, to: Point, eye: Point) {
  const middle = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const off = distanceBetween(eye, middle);
  const toward =
    off === 0
      ? { x: 0, y: 1 }
      : { x: (eye.x - middle.x) / off, y: (eye.y - middle.y) / off };
  const chord = distanceBetween(from, to) || 1;
  const aside = {
    x: -(to.y - from.y) / chord,
    y: (to.x - from.x) / chord,
  };
  return { middle, off, toward, aside };
}

/**
 * Which side of its chord a course from `from` to `to` bows out to, fixed as
 * its run starts: the side nearer the eye at `eye`, `1` when neither is, so
 * an eye walking mid-run never flips it.
 */
export function sideOf(from: Point, to: Point, eye: Point): number {
  const { toward, aside } = waysOf(from, to, eye);
  return toward.x * aside.x + toward.y * aside.y < 0 ? -1 : 1;
}

/** How many halvings find the bow that gives a short course its least length. */
const HALVINGS = 30;

/**
 * The course from `from` to `to` as an eye at `eye` sees it: its middle at
 * least `clearance` nearer the eye than the nearer of the two, never past
 * half the way from it to the eye, then bowed out square to its chord on
 * `side` (`sideOf`) until it is `least` long — across the screen where the
 * two doors stand one behind the other, which a bow toward the eye shows
 * only as a dip.
 */
export function bowedPath(
  from: Point,
  to: Point,
  eye: Point,
  clearance: number,
  least: number,
  side: number,
): RunPath {
  const { middle, off, toward, aside } = waysOf(from, to, eye);
  const nearer = Math.min(distanceBetween(eye, from), distanceBetween(eye, to));
  const near = Math.min(
    Math.max(0, off - nearer / 2),
    Math.max(0, off - nearer + clearance),
  );
  const pathAt = (out: number): RunPath => {
    const top = {
      x: middle.x + toward.x * near + aside.x * side * out,
      y: middle.y + toward.y * near + aside.y * side * out,
    };
    return {
      from,
      to,
      bend: { x: 2 * top.x - middle.x, y: 2 * top.y - middle.y },
    };
  };
  if (pathLength(pathAt(0)) >= least) return pathAt(0);
  // Bowed out by half its least length, a course is longer than that.
  let [low, high] = [0, least / 2];
  for (let halving = 0; halving < HALVINGS; halving++) {
    const out = (low + high) / 2;
    if (pathLength(pathAt(out)) < least) low = out;
    else high = out;
  }
  return pathAt(high);
}

/**
 * Where a runner `progress` of the way along `path` by length (0 to 1)
 * stands, and the unit way along the course it faces there.
 */
export function alongPath(
  path: RunPath,
  progress: number,
): { point: Point; heading: Point } {
  const lengths = lengthsOf(path);
  const whole = lengths[PIECES] ?? 0;
  const goal = Math.min(1, Math.max(0, progress)) * whole;
  let piece = 1;
  while (piece < PIECES && (lengths[piece] ?? 0) < goal) piece++;
  const [before, after] = [lengths[piece - 1] ?? 0, lengths[piece] ?? 0];
  const within = after > before ? (goal - before) / (after - before) : 0;
  const s = (piece - 1 + within) / PIECES;
  const { from, bend, to } = path;
  const tangent = {
    x: 2 * (1 - s) * (bend.x - from.x) + 2 * s * (to.x - bend.x),
    y: 2 * (1 - s) * (bend.y - from.y) + 2 * s * (to.y - bend.y),
  };
  const size = Math.hypot(tangent.x, tangent.y);
  return {
    point: curveAt(path, s),
    heading:
      size === 0
        ? { x: 1, y: 0 }
        : { x: tangent.x / size, y: tangent.y / size },
  };
}
