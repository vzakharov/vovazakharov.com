import {
  colatitudeLongitude,
  gridFrame,
  type LatLonGrid,
  nodeOf,
  ringAbove,
} from './lat-lon';

/** Per segment `a` and `d = b − a` (3D) and `1/|d|²` (0 for a point). */
const STRIDE = 7;

/**
 * How many times the sweep runs down and back up. One leaves errors of up to
 * 1.6 cells near a cap's antipode, where every coast point is nearly as far
 * and each one's nearest-node region narrows to a wedge thinner than a cell;
 * two bring a 20° cap within 0.06 of a cell everywhere, and a third changes
 * no node.
 */
const PASSES = 2;

const read = (array: Float32Array | Float64Array, index: number) =>
  array[index] ?? Number.NaN;

function packSegments(segments: Float64Array): Float64Array {
  const count = segments.length / 6;
  const packed = new Float64Array(count * STRIDE);
  for (let k = 0; k < count; k += 1) {
    const s = 6 * k;
    const o = STRIDE * k;
    const dx = read(segments, s + 3) - read(segments, s);
    const dy = read(segments, s + 4) - read(segments, s + 1);
    const dz = read(segments, s + 5) - read(segments, s + 2);
    const lengthSquared = dx * dx + dy * dy + dz * dz;
    packed.set(segments.subarray(s, s + 3), o);
    packed[o + 3] = dx;
    packed[o + 4] = dy;
    packed[o + 5] = dz;
    packed[o + 6] = lengthSquared === 0 ? 0 : 1 / lengthSquared;
  }
  return packed;
}

/**
 * The squared chord from `(x, y, z)` to segment `k`'s straight chord. A
 * segment spans a cell or two, so the chord's sag under the arc (metres at
 * these grids) is far inside a cell.
 */
function chordSquared(
  s: Float64Array,
  k: number,
  x: number,
  y: number,
  z: number,
) {
  const o = STRIDE * k;
  const px = x - read(s, o);
  const py = y - read(s, o + 1);
  const pz = z - read(s, o + 2);
  const dx = read(s, o + 3);
  const dy = read(s, o + 4);
  const dz = read(s, o + 5);
  const t = Math.min(
    1,
    Math.max(0, (px * dx + py * dy + pz * dz) * read(s, o + 6)),
  );
  const ex = px - t * dx;
  const ey = py - t * dy;
  const ez = pz - t * dz;
  return ex * ex + ey * ey + ez * ez;
}

/**
 * The sweep's state, each node's best squared chord and its segment, and the
 * one move on it: `offer(r, j, from)` measures node `(r, j)` against node
 * `from`'s segment and takes it if nearer, saying whether it did.
 */
function sweepState(s: Float64Array, grid: LatLonGrid) {
  const { rows, columns } = grid;
  const { ringSin, ringCos, columnCos, columnSin } = gridFrame(grid);
  const nearest = new Int32Array(rows * columns).fill(-1);
  const best = new Float32Array(rows * columns).fill(Infinity);
  const measure = (r: number, j: number, k: number) => {
    const node = r * columns + j;
    const sine = read(ringSin, r);
    const d = chordSquared(
      s,
      k,
      sine * read(columnCos, j),
      read(ringCos, r),
      -sine * read(columnSin, j),
    );
    if (d >= read(best, node)) return false;
    best[node] = d;
    nearest[node] = k;
    return true;
  };
  const offer = (r: number, j: number, from: number) => {
    const k = nearest[from] ?? -1;
    if (k < 0 || k === nearest[r * columns + j]) return false;
    return measure(r, j, k);
  };
  return { best, measure, offer };
}

type SweepState = ReturnType<typeof sweepState>;

/** Measures every segment exactly at the 4×4 nodes around each endpoint. */
function seed(s: Float64Array, grid: LatLonGrid, { measure }: SweepState) {
  const { columns } = grid;
  for (let k = 0; STRIDE * k < s.length; k += 1) {
    const o = STRIDE * k;
    for (const end of [0, 1]) {
      const { theta, lambda } = colatitudeLongitude([
        read(s, o) + end * read(s, o + 3),
        read(s, o + 1) + end * read(s, o + 4),
        read(s, o + 2) + end * read(s, o + 5),
      ]);
      const r0 = ringAbove(grid, theta);
      const j0 = Math.floor((lambda * columns) / (2 * Math.PI));
      for (let r = r0 - 1; r <= r0 + 2; r += 1) {
        for (let j = j0 - 1; j <= j0 + 2; j += 1) {
          const node = nodeOf(grid, r, j);
          const ring = Math.floor(node / columns);
          measure(ring, node - ring * columns, k);
        }
      }
    }
  }
}

/**
 * The squared chord from every node to the coast: exact at the nodes around
 * each segment's ends, then carried over the sphere by an 8-neighbour sweep —
 * rings north to south and back, `PASSES` times, each ring swept both ways
 * round — that re-measures each neighbour's nearest segment exactly. A ring's
 * neighbour past a pole is `nodeOf`'s, and a sweep round a ring carries on
 * past longitude 0 until a node keeps its own, since every offer after that
 * repeats one already made.
 */
export function nearestChords(
  segments: Float64Array,
  grid: LatLonGrid,
): Float32Array {
  const { rows, columns } = grid;
  const s = packSegments(segments);
  const state = sweepState(s, grid);
  const { offer, best } = state;
  seed(s, grid, state);
  const wrap = (j: number) => {
    if (j < 0) return j + columns;
    return j >= columns ? j - columns : j;
  };
  const fromRing = (r: number, beside: number) => {
    const across = beside < 0 || beside >= rows;
    const base = (across ? r : beside) * columns;
    const shift = across ? columns / 2 : 0;
    for (let j = 0; j < columns; j += 1) {
      const c = j + shift;
      offer(r, j, base + wrap(c - 1));
      offer(r, j, base + wrap(c));
      offer(r, j, base + wrap(c + 1));
    }
  };
  const alongRing = (r: number, step: 1 | -1) => {
    const base = r * columns;
    const first = step === 1 ? 0 : columns - 1;
    for (let i = 0; i < columns; i += 1) {
      const j = first + step * i;
      offer(r, j, base + wrap(j - step));
    }
    for (let i = 0; i < columns; i += 1) {
      const j = first + step * i;
      if (!offer(r, j, base + wrap(j - step))) break;
    }
  };
  for (let pass = 0; pass < PASSES; pass += 1) {
    for (let r = 0; r < rows; r += 1) {
      fromRing(r, r - 1);
      alongRing(r, 1);
      alongRing(r, -1);
    }
    for (let r = rows - 1; r >= 0; r -= 1) {
      fromRing(r, r + 1);
      alongRing(r, -1);
      alongRing(r, 1);
    }
  }
  return best;
}
