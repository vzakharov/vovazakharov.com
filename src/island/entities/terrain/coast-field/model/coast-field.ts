import type { Gridded } from '@/scene/shared/lib/plane';

import type { Coast } from '@/island/shared/globe';

/** A square-celled node grid on the island plane. */
export type CoastGrid = Gridded & {
  /** Plane position of node `(0, 0)`, metres. */
  originX: number;
  originY: number;
  cellMetres: number;
};

/** A signed distance per node, metres, positive inland. */
export type SignedDistances = { distance: Float32Array };

/**
 * The signed distance to the coast, in plane metres, on a node grid over the
 * coast's bounding box plus a margin, row-major, node `(i, j)` at
 * `j * columns + i`. Plain numbers and one typed array, so it survives
 * `postMessage` and its buffer can be transferred.
 */
export type CoastField = CoastGrid & SignedDistances;

const MARGIN_METRES = 100_000;

/** An index past the end reads as NaN, which poisons the result visibly. */
const read = (array: Float32Array | Float64Array, index: number) =>
  array[index] ?? Number.NaN;

/** Every ring's edges, four numbers each: `ax, ay, bx, by` in metres. */
function segmentsOf(coast: Coast): Float64Array {
  const count = coast.rings.reduce((sum, ring) => sum + ring.length, 0);
  const segments = new Float64Array(4 * count);
  let k = 0;
  for (const ring of coast.rings) {
    for (const [v, [x, y]] of ring.entries()) {
      const [nextX, nextY] = ring[(v + 1) % ring.length] ?? [x, y];
      segments.set([x * 1000, y * 1000, nextX * 1000, nextY * 1000], 4 * k);
      k += 1;
    }
  }
  return segments;
}

/**
 * The squared distance from `(x, y)` to segment `k`: the sweep compares
 * squares and roots each node once at the end, since `Math.hypot` costs
 * several times a multiply-add in V8 on this hot path.
 */
function segmentDistanceSquared(
  s: Float64Array,
  k: number,
  x: number,
  y: number,
) {
  const ax = read(s, 4 * k);
  const ay = read(s, 4 * k + 1);
  const dx = read(s, 4 * k + 2) - ax;
  const dy = read(s, 4 * k + 3) - ay;
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.min(
          1,
          Math.max(0, ((x - ax) * dx + (y - ay) * dy) / lengthSquared),
        );
  const ex = x - ax - t * dx;
  const ey = y - ay - t * dy;
  return ex * ex + ey * ey;
}

/**
 * Whether each node lies on land, by an even-odd scanline per row: the rings
 * never cross, a lake's ring lying inside its land's, so parity is membership.
 */
function insideMask(s: Float64Array, grid: CoastGrid) {
  const { originX, originY, cellMetres, columns, rows } = grid;
  const inside = new Uint8Array(columns * rows);
  const crossings: number[] = [];
  for (let j = 0; j < rows; j += 1) {
    const y = originY + j * cellMetres;
    crossings.length = 0;
    for (let k = 0; 4 * k < s.length; k += 1) {
      const ax = read(s, 4 * k);
      const ay = read(s, 4 * k + 1);
      const bx = read(s, 4 * k + 2);
      const by = read(s, 4 * k + 3);
      if (ay <= y !== by <= y) {
        crossings.push(ax + ((y - ay) / (by - ay)) * (bx - ax));
      }
    }
    crossings.sort((a, b) => a - b);
    for (let c = 0; c + 1 < crossings.length; c += 2) {
      const enter = crossings[c] ?? Number.NaN;
      const leave = crossings[c + 1] ?? Number.NaN;
      const first = Math.max(0, Math.ceil((enter - originX) / cellMetres));
      const last = Math.min(
        columns - 1,
        Math.ceil((leave - originX) / cellMetres) - 1,
      );
      inside.fill(1, j * columns + first, j * columns + last + 1);
    }
  }
  return inside;
}

/** The nodes within a cell of segment `k`'s bounding box, as index ranges. */
function nodesNear(s: Float64Array, k: number, grid: CoastGrid) {
  const { originX, originY, cellMetres, columns, rows } = grid;
  const ax = read(s, 4 * k);
  const ay = read(s, 4 * k + 1);
  const bx = read(s, 4 * k + 2);
  const by = read(s, 4 * k + 3);
  const below = (value: number, origin: number) =>
    Math.floor((value - origin) / cellMetres) - 1;
  const above = (value: number, origin: number) =>
    Math.ceil((value - origin) / cellMetres) + 1;
  return {
    i0: Math.max(0, below(Math.min(ax, bx), originX)),
    i1: Math.min(columns - 1, above(Math.max(ax, bx), originX)),
    j0: Math.max(0, below(Math.min(ay, by), originY)),
    j1: Math.min(rows - 1, above(Math.max(ay, by), originY)),
  };
}

/**
 * The squared distance from every node to the coast: exact for nodes within a
 * cell of a segment, then carried across the grid by a two-pass 8-neighbour
 * sweep that re-measures each neighbour's nearest segment exactly, so every
 * distance is a true distance to some coast point, at worst slightly more than
 * the least one.
 */
function nearestDistances(s: Float64Array, grid: CoastGrid): Float32Array {
  const { originX, originY, cellMetres, columns, rows } = grid;
  const nearest = new Int32Array(columns * rows).fill(-1);
  const best = new Float32Array(columns * rows).fill(Infinity);

  for (let k = 0; 4 * k < s.length; k += 1) {
    const { i0, i1, j0, j1 } = nodesNear(s, k, grid);
    for (let j = j0; j <= j1; j += 1) {
      const y = originY + j * cellMetres;
      for (let i = i0; i <= i1; i += 1) {
        const node = j * columns + i;
        const d = segmentDistanceSquared(s, k, originX + i * cellMetres, y);
        if (d < read(best, node)) {
          best[node] = d;
          nearest[node] = k;
        }
      }
    }
  }

  const offer = (node: number, from: number, x: number, y: number) => {
    const k = nearest[from] ?? -1;
    if (k < 0 || k === nearest[node]) return;
    const d = segmentDistanceSquared(s, k, x, y);
    if (d < read(best, node)) {
      best[node] = d;
      nearest[node] = k;
    }
  };

  for (let j = 0; j < rows; j += 1) {
    const y = originY + j * cellMetres;
    const row = j * columns;
    for (let i = 0; i < columns; i += 1) {
      const node = row + i;
      const x = originX + i * cellMetres;
      if (i > 0) offer(node, node - 1, x, y);
      if (j > 0) {
        if (i > 0) offer(node, node - columns - 1, x, y);
        offer(node, node - columns, x, y);
        if (i + 1 < columns) offer(node, node - columns + 1, x, y);
      }
    }
    for (let i = columns - 2; i >= 0; i -= 1) {
      offer(row + i, row + i + 1, originX + i * cellMetres, y);
    }
  }
  for (let j = rows - 1; j >= 0; j -= 1) {
    const y = originY + j * cellMetres;
    const row = j * columns;
    for (let i = columns - 1; i >= 0; i -= 1) {
      const node = row + i;
      const x = originX + i * cellMetres;
      if (i + 1 < columns) offer(node, node + 1, x, y);
      if (j + 1 < rows) {
        if (i + 1 < columns) offer(node, node + columns + 1, x, y);
        offer(node, node + columns, x, y);
        if (i > 0) offer(node, node + columns - 1, x, y);
      }
    }
    for (let i = 1; i < columns; i += 1) {
      offer(row + i, row + i - 1, originX + i * cellMetres, y);
    }
  }
  return best;
}

/**
 * The coast's signed-distance field, built once per coast. The grid covers
 * every ring's bounding box plus 100 km of sea on each side; beyond it
 * `sampleCoastField` extrapolates. Its cell defaults to half a pixel of the
 * drawing the coast was traced from, which holds all the detail there is.
 */
export function buildCoastField(
  coast: Coast,
  cellMetres = coast.kmPerPixel * 500,
): CoastField {
  const s = segmentsOf(coast);
  if (s.length < 12) throw new Error('buildCoastField: the coast has no ring');
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let k = 0; 4 * k < s.length; k += 1) {
    const x = read(s, 4 * k);
    const y = read(s, 4 * k + 1);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  const grid: CoastGrid = {
    originX: minX - MARGIN_METRES,
    originY: minY - MARGIN_METRES,
    cellMetres,
    columns: Math.ceil((maxX - minX + 2 * MARGIN_METRES) / cellMetres) + 1,
    rows: Math.ceil((maxY - minY + 2 * MARGIN_METRES) / cellMetres) + 1,
  };
  return signedDistanceField(s, insideMask(s, grid), grid);
}

/**
 * The signed distance from every node of `grid` to the coast drawn by
 * `segments` (four numbers each, `ax, ay, bx, by`, plane metres), positive
 * where `inside` is 1. The segments and the mask must agree on where the
 * coast is; nothing here checks that they do.
 */
export function signedDistanceField(
  segments: Float64Array,
  inside: Uint8Array,
  grid: CoastGrid,
): CoastField {
  const distance = nearestDistances(segments, grid);
  for (const [n, isInside] of inside.entries()) {
    const unsigned = Math.sqrt(read(distance, n));
    distance[n] = isInside === 1 ? unsigned : -unsigned;
  }
  return { ...grid, distance };
}

/**
 * The signed distance at plane point `(x, y)`, bilinear between nodes, so it
 * is continuous everywhere. Off the grid it takes the nearest edge value less
 * the distance past the edge — the margin is all sea, so that stays negative
 * and keeps falling away from the island.
 */
export function sampleCoastField(field: CoastField, x: number, y: number) {
  const { originX, originY, cellMetres, columns, rows, distance } = field;
  const u = (x - originX) / cellMetres;
  const v = (y - originY) / cellMetres;
  const cu = Math.min(columns - 1, Math.max(0, u));
  const cv = Math.min(rows - 1, Math.max(0, v));
  const pastU = u - cu;
  const pastV = v - cv;
  const beyond =
    pastU === 0 && pastV === 0 ? 0 : Math.hypot(pastU, pastV) * cellMetres;
  const i = Math.min(columns - 2, Math.floor(cu));
  const j = Math.min(rows - 2, Math.floor(cv));
  const tu = cu - i;
  const tv = cv - j;
  const n = j * columns + i;
  const a = read(distance, n);
  const b = read(distance, n + 1);
  const c = read(distance, n + columns);
  const d = read(distance, n + columns + 1);
  const bottom = a + (b - a) * tu;
  const top = c + (d - c) * tu;
  return bottom + (top - bottom) * tv - beyond;
}
