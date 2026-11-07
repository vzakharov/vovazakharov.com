/**
 * The traced rings made into a coast: a trace follows the crayon strokes and
 * the paper's grain, so specks are dropped, and each ring is resampled evenly,
 * blurred along its own length and simplified again — spikes and frays a few
 * units wide melt, a spit many units long keeps its length.
 */
import { type Ring, signedArea, type Simplified, simplify } from './ring';

/** `tolerance` is the Douglas–Peucker pass's after the blur. */
export type SmoothOptions = Simplified & {
  /** Rings of a smaller area, in square units, are dropped. */
  minArea: number;
  /** The even arc length a ring is resampled at before the blur. */
  resampleStep: number;
  /** The blur's standard deviation along the ring, in units of length. */
  sigma: number;
};

/** The fewest points a resampled ring keeps, so a small island stays round. */
const FEWEST_POINTS = 12;

const at = (ring: Ring, i: number): [number, number] =>
  ring[((i % ring.length) + ring.length) % ring.length] ?? [0, 0];

/** The ring resampled at even arc length, about `spacing` apart. */
export function resample(ring: Ring, spacing: number): Ring {
  const lengths = ring.map((point, i) => {
    const [nx, ny] = at(ring, i + 1);
    return Math.hypot(nx - point[0], ny - point[1]);
  });
  const perimeter = lengths.reduce((sum, length) => sum + length, 0);
  const count = Math.max(FEWEST_POINTS, Math.round(perimeter / spacing));
  const step = perimeter / count;
  const out: Ring = [];
  let edge = 0;
  let walked = 0;
  for (let k = 0; k < count; k++) {
    const target = k * step;
    while (walked + (lengths[edge] ?? 0) < target && edge < ring.length - 1) {
      walked += lengths[edge] ?? 0;
      edge += 1;
    }
    const length = lengths[edge] ?? 0;
    const t = length === 0 ? 0 : (target - walked) / length;
    const [ax, ay] = at(ring, edge);
    const [bx, by] = at(ring, edge + 1);
    out.push([ax + t * (bx - ax), ay + t * (by - ay)]);
  }
  return out;
}

/** A Gaussian blur of an evenly spaced closed ring's points along itself. */
function blur(ring: Ring, sigmaPoints: number): Ring {
  if (sigmaPoints <= 0) return ring;
  const reach = Math.min(Math.ceil(3 * sigmaPoints), ring.length >> 1);
  const weights = Array.from({ length: 2 * reach + 1 }, (_, k) =>
    Math.exp(-((k - reach) ** 2) / (2 * sigmaPoints * sigmaPoints)),
  );
  const total = weights.reduce((sum, w) => sum + w, 0);
  return ring.map((_, i) => {
    let x = 0;
    let y = 0;
    for (const [k, w] of weights.entries()) {
      const [px, py] = at(ring, i + k - reach);
      x += w * px;
      y += w * py;
    }
    return [x / total, y / total];
  });
}

type Segment = [[number, number], [number, number]];

const turn = (
  [ax, ay]: [number, number],
  [bx, by]: [number, number],
  [cx, cy]: [number, number],
) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);

/** Whether two segments cross at a point inside both (touching ends do not). */
function crosses([a, b]: Segment, [c, d]: Segment): boolean {
  const d1 = turn(c, d, a);
  const d2 = turn(c, d, b);
  const d3 = turn(a, b, c);
  const d4 = turn(a, b, d);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

const segmentsOf = (ring: Ring): Segment[] =>
  ring.map((point, i) => [point, at(ring, i + 1)]);

/** Whether any two non-adjacent edges of the ring cross. */
export function selfIntersects(ring: Ring): boolean {
  const segments = segmentsOf(ring);
  const n = segments.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const a = segments[i];
      const b = segments[j];
      if (a && b && crosses(a, b)) return true;
    }
  }
  return false;
}

/** Whether any edge of one ring crosses any edge of the other. */
export function ringsCross(one: Ring, other: Ring): boolean {
  const theirs = segmentsOf(other);
  return segmentsOf(one).some((a) => theirs.some((b) => crosses(a, b)));
}

/**
 * One ring smoothed, its turning kept: the blur is halved until the result is
 * simple and crosses none of `others`, down to the resampled ring unblurred.
 */
function smoothRing(ring: Ring, others: Ring[], options: SmoothOptions): Ring {
  const even = resample(ring, options.resampleStep);
  for (let sigma = options.sigma; ; sigma /= 2) {
    const blurred =
      sigma < options.resampleStep / 4
        ? even
        : blur(even, sigma / options.resampleStep);
    const result = simplify(blurred, options.tolerance);
    const clean =
      Math.sign(signedArea(result)) === Math.sign(signedArea(ring)) &&
      !selfIntersects(result) &&
      !others.some((other) => ringsCross(result, other));
    if (clean || blurred === even) return result;
  }
}

/**
 * The coast's rings with specks under `minArea` dropped and each kept ring
 * smoothed, largest first. Every ring keeps its turning, stays simple and
 * crosses no ring smoothed before it.
 */
export function smoothCoast(rings: Ring[], options: SmoothOptions): Ring[] {
  const kept = rings
    .map((ring) => ({ ring, area: Math.abs(signedArea(ring)) }))
    .filter(({ area }) => area >= options.minArea)
    .toSorted((a, b) => b.area - a.area);
  const done: Ring[] = [];
  for (const { ring } of kept) done.push(smoothRing(ring, done, options));
  return done;
}
