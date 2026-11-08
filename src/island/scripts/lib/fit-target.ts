import type { Coast } from '@/island/shared/globe';
import {
  type Dome,
  DOME_RANGES,
  domeAt,
  GRID_NODES,
  SQUARE,
} from '@/island/entities/terrain';

/** A plane box, metres. */
export type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

/** Every ring's bounding box, metres. */
export function ringBounds(coast: Coast): Bounds {
  const xs = coast.rings.flatMap((ring) => ring.map(([x]) => x * 1000));
  const ys = coast.rings.flatMap((ring) => ring.map(([, y]) => y * 1000));
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

/**
 * How far `bounds` reaches from the square's middle along each axis, in units
 * of its side: the larger of its two sides' reach.
 */
export const reachOf = ({ minX, maxX, minY, maxY }: Bounds) => ({
  x: Math.max(SQUARE.centreX - minX, maxX - SQUARE.centreX) / SQUARE.side,
  y: Math.max(SQUARE.centreY - minY, maxY - SQUARE.centreY) / SQUARE.side,
});

/**
 * Throws unless every ring lies within `limit` of the side from the square's
 * middle on both axes — inside the waves' untapered window, which leaves
 * the sea between it and the edge.
 */
export function assertInside(bounds: Bounds, limit: number): void {
  const { x, y } = reachOf(bounds);
  if (x > limit || y > limit) {
    throw new Error(
      `the rings reach ${x.toFixed(3)}, ${y.toFixed(3)} of the side from ` +
        `the square's middle, past ${String(limit)}`,
    );
  }
}

const clamp = (value: number, [lo, hi]: readonly [number, number]) =>
  Math.min(hi, Math.max(lo, value));

/**
 * The dome the drawing's bounds give: centred on the square (itself centred
 * on the bounds), unturned, its radii the half-extents clamped into range.
 */
export function domeFromBounds({ minX, maxX, minY, maxY }: Bounds): Dome {
  return {
    centreX: 0,
    centreY: 0,
    radiusA: clamp((maxX - minX) / 2 / SQUARE.side, DOME_RANGES.radiusA),
    radiusB: clamp((maxY - minY) / 2 / SQUARE.side, DOME_RANGES.radiusB),
    turn: 0,
  };
}

/** `dome` clamped into `DOME_RANGES`, parameter by parameter. */
export const clampDome = (dome: Dome): Dome => ({
  centreX: clamp(dome.centreX, DOME_RANGES.centreX),
  centreY: clamp(dome.centreY, DOME_RANGES.centreY),
  radiusA: clamp(dome.radiusA, DOME_RANGES.radiusA),
  radiusB: clamp(dome.radiusB, DOME_RANGES.radiusB),
  turn: clamp(dome.turn, DOME_RANGES.turn),
});

/** The target's shape: a clip on the signed distance, then a scale. */
export type TargetShape = {
  /** The signed distance is clipped to `±clipMetres`. */
  clipMetres: number;
  /** Field units per metre of signed distance. */
  scale: number;
};

/** The field the fit aims at: `scale · clamp(distance, ±clipMetres)`. */
export const targetOf = (
  distance: Float64Array,
  { clipMetres, scale }: TargetShape,
): Float64Array =>
  distance.map((d) => scale * Math.min(clipMetres, Math.max(-clipMetres, d)));

/** `dome` on the world grid, node `(i, j)` at `(i, j) / N`. */
export function domeGrid(dome: Dome): Float64Array {
  const n = GRID_NODES;
  const out = new Float64Array(n * n);
  for (let j = 0; j < n; j += 1) {
    for (let i = 0; i < n; i += 1) out[j * n + i] = domeAt(dome, i / n, j / n);
  }
  return out;
}
