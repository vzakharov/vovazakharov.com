/**
 * The course a mouse runs on the plane from one door's front to another's:
 * a curve bowed out to a side until it is long enough to be watched across
 * the screen, and toward the eye, so its middle crosses open grass in front
 * of both houses rather than the gap behind the nearer stem. Plane lengths
 * are in the clump's size.
 */

import { distanceBetween, type Point } from './geometry';

/**
 * How far a running mouse is drawn behind its middle, to its tail's tip, and
 * ahead of it, to its whiskers' tips, in its door's widths: `paintRunner`
 * draws its tail and whiskers to these.
 */
export const RUNNER_REACH = { back: 0.9, ahead: 0.92 } as const;

/** How long a running mouse is drawn, tail tip to whisker tips, in its door's widths. */
export const RUNNER_SPAN = RUNNER_REACH.back + RUNNER_REACH.ahead;

/**
 * How much nearer the eye than the nearer stem's foot a course's middle
 * runs, in drawn runners (`RUNNER_SPAN`) of the wider end's door: a whole
 * runner clears that stem, and no more keeps the course from dipping far
 * down the screen, where the aside bow already carries it out from behind
 * the stem.
 */
export const RUN_BOW = 1;

/**
 * A run's course, a quadratic curve from `from` to `to` drawn toward `bend`:
 * its middle lies halfway between `bend` and the middle of its ends.
 */
export type RunPath = { from: Point; bend: Point; to: Point };

/** The point halfway from `from` to `to`. */
const middleOf = (from: Point, to: Point): Point => ({
  x: (from.x + to.x) / 2,
  y: (from.y + to.y) / 2,
});

/** The course straight from `from` to `to`, its bend at their middle. */
export const straightPath = (from: Point, to: Point): RunPath => ({
  from,
  bend: middleOf(from, to),
  to,
});

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

/** How far `point` is from an eye at `eye`, and the unit way from it to the eye. */
function towardEye(point: Point, eye: Point): { off: number; toward: Point } {
  const off = distanceBetween(eye, point);
  return {
    off,
    toward:
      off === 0
        ? { x: 0, y: 1 }
        : { x: (eye.x - point.x) / off, y: (eye.y - point.y) / off },
  };
}

/**
 * The ways a course between `from` and `to` bows: from the ends' `middle`,
 * `aside`, square to the run's chord.
 */
function waysOf(from: Point, to: Point) {
  const middle = middleOf(from, to);
  const chord = distanceBetween(from, to) || 1;
  const aside = {
    x: -(to.y - from.y) / chord,
    y: (to.x - from.x) / chord,
  };
  return { middle, aside };
}

/**
 * Which side of its chord a course from `from` to `to` bows out to, fixed as
 * its run starts: the side nearer the eye at `eye`, `1` when neither is, so
 * an eye walking mid-run never flips it.
 */
export function sideOf(from: Point, to: Point, eye: Point): number {
  const { middle, aside } = waysOf(from, to);
  const { toward } = towardEye(middle, eye);
  return toward.x * aside.x + toward.y * aside.y < 0 ? -1 : 1;
}

/** How many halvings find the bow that gives a short course its least length. */
const HALVINGS = 30;

/**
 * The course from `from` to `to` as an eye at `eye` sees it: bowed out
 * square to its chord on `side` (`sideOf`) until, so bowed alone, it would be
 * `least` long — across the screen where the two doors stand one behind the
 * other, which a bow toward the eye shows only as a dip — and then toward the
 * eye until its middle is no farther from it than `reach`, never past half
 * the way from the nearer of the two to the eye.
 */
export function bowedPath(
  from: Point,
  to: Point,
  eye: Point,
  reach: number,
  least: number,
  side: number,
): RunPath {
  const { middle, aside } = waysOf(from, to);
  const through = ({ x, y }: Point): RunPath => ({
    from,
    to,
    bend: { x: 2 * x - middle.x, y: 2 * y - middle.y },
  });
  const outBy = (out: number): Point => ({
    x: middle.x + aside.x * side * out,
    y: middle.y + aside.y * side * out,
  });
  let out = 0;
  if (pathLength(through(middle)) < least) {
    // Bowed out by half its least length, a course is longer than that.
    let [low, high] = [0, least / 2];
    for (let halving = 0; halving < HALVINGS; halving++) {
      const tried = (low + high) / 2;
      if (pathLength(through(outBy(tried))) < least) low = tried;
      else high = tried;
    }
    out = high;
  }
  const top = outBy(out);
  const { off, toward } = towardEye(top, eye);
  const nearer = Math.min(distanceBetween(eye, from), distanceBetween(eye, to));
  const near = Math.min(
    Math.max(0, off - nearer / 2),
    Math.max(0, off - reach),
  );
  return through({ x: top.x + toward.x * near, y: top.y + toward.y * near });
}

/** The curve parameter, 0 to 1, a runner `progress` of the way along a course by length stands at, its `lengths` from `lengthsOf`. */
function curveParameter(lengths: readonly number[], progress: number): number {
  const whole = lengths[PIECES] ?? 0;
  const goal = Math.min(1, Math.max(0, progress)) * whole;
  let piece = 1;
  while (piece < PIECES && (lengths[piece] ?? 0) < goal) piece++;
  const [before, after] = [lengths[piece - 1] ?? 0, lengths[piece] ?? 0];
  const within = after > before ? (goal - before) / (after - before) : 0;
  return (piece - 1 + within) / PIECES;
}

/** The unit way along a course at `s` of its curve's parameter. */
function headingAt({ from, bend, to }: RunPath, s: number): Point {
  const tangent = {
    x: 2 * (1 - s) * (bend.x - from.x) + 2 * s * (to.x - bend.x),
    y: 2 * (1 - s) * (bend.y - from.y) + 2 * s * (to.y - bend.y),
  };
  const size = Math.hypot(tangent.x, tangent.y);
  return size === 0
    ? { x: 1, y: 0 }
    : { x: tangent.x / size, y: tangent.y / size };
}

/**
 * Where a runner `progress` of the way along `path` by length (0 to 1)
 * stands, and the unit way along the course it faces there.
 */
export function alongPath(
  path: RunPath,
  progress: number,
): { point: Point; heading: Point } {
  const s = curveParameter(lengthsOf(path), progress);
  return { point: curveAt(path, s), heading: headingAt(path, s) };
}

/**
 * How far `heading` at `point` on the plane runs across the screen of an eye
 * at `eye`: 1 straight right, -1 straight left, 0 toward the eye or away.
 */
export function acrossOn(heading: Point, point: Point, eye: Point): number {
  const dx = point.x - eye.x;
  const dy = point.y - eye.y;
  return (heading.x * dy - heading.y * dx) / (Math.hypot(dx, dy) || 1);
}

/** How clearly across the screen a course must run before its runner turns to face that way. */
const TURN_ACROSS = 0.25;

/**
 * Which way a runner `progress` of the way along `path` faces on the screen
 * of an eye at `eye`, 1 right and -1 left: the way the course last ran
 * clearly across (`TURN_ACROSS`), else the way it first will, else the way
 * it runs most across anywhere — so it never flips where the course runs
 * toward the eye or away, and turns only where the course itself turns back
 * across the screen.
 */
export function facingAlong(
  path: RunPath,
  progress: number,
  eye: Point,
): number {
  const now = curveParameter(lengthsOf(path), progress);
  const across = (s: number) =>
    acrossOn(headingAt(path, s), curveAt(path, s), eye);
  const piece = Math.floor(now * PIECES);
  const looked = [
    now,
    ...Array.from({ length: piece + 1 }, (_, back) => (piece - back) / PIECES),
    ...Array.from(
      { length: PIECES - piece },
      (_, ahead) => (piece + 1 + ahead) / PIECES,
    ),
  ];
  for (const s of looked) {
    const way = across(s);
    if (Math.abs(way) >= TURN_ACROSS) return way >= 0 ? 1 : -1;
  }
  let most = 0;
  for (let at = 0; at <= PIECES; at++) {
    const way = across(at / PIECES);
    if (Math.abs(way) > Math.abs(most)) most = way;
  }
  return most >= 0 ? 1 : -1;
}
