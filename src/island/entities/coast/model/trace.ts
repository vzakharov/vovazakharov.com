/**
 * The coastline tracer: RGBA pixels in, the outer rings of the land out, in
 * pixel coordinates (`x` right, `y` down, a pixel's centre at `+0.5`). Pure
 * and platform-free, so a browser can run it over a player's own map as a
 * script runs it over the drawing.
 */
import type { Raster } from './paper';
import { type Ring, signedArea, type Simplified, simplify } from './ring';
import { boxMean, landMask, type MaskOptions } from './sea';

/** `tolerance` is in pixels. */
export type TraceOptions = MaskOptions &
  Simplified & {
    /** Half-width of the box the land mask is smoothed over before contouring. */
    blurRadius: number;
  };

type Edge = [index: number, ai: number, aj: number, bi: number, bj: number];

/**
 * Marching squares at ½, every segment directed with land on its right on
 * screen, chained into closed rings. A saddle joins its land corners when the
 * cell's mean is land.
 */
function contours(field: Float32Array, columns: number, rows: number): Ring[] {
  const level = 0.5;
  const edges = 2 * columns * rows;
  const next = new Int32Array(edges).fill(-1);
  const px = new Float64Array(edges);
  const py = new Float64Array(edges);
  const value = (i: number, j: number) => field[j * columns + i] ?? 0;

  const crossings: number[] = [];
  const exits: boolean[] = [];
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < columns - 1; i++) {
      // The cell's four edges clockwise on screen, each from corner to corner.
      const sides: Edge[] = [
        [2 * (j * columns + i), i, j, i + 1, j],
        [2 * (j * columns + i + 1) + 1, i + 1, j, i + 1, j + 1],
        [2 * ((j + 1) * columns + i), i + 1, j + 1, i, j + 1],
        [2 * (j * columns + i) + 1, i, j + 1, i, j],
      ];
      crossings.length = 0;
      exits.length = 0;
      for (const [edge, ai, aj, bi, bj] of sides) {
        const va = value(ai, aj);
        const vb = value(bi, bj);
        if (va >= level === vb >= level) continue;
        const s = (level - va) / (vb - va);
        px[edge] = ai + s * (bi - ai) - 0.5;
        py[edge] = aj + s * (bj - aj) - 0.5;
        crossings.push(edge);
        exits.push(va >= level);
      }
      if (crossings.length === 0) continue;
      const mean =
        (value(i, j) +
          value(i + 1, j) +
          value(i + 1, j + 1) +
          value(i, j + 1)) /
        4;
      const step = mean >= level ? 1 : crossings.length - 1;
      for (const [k, edge] of crossings.entries()) {
        if (exits[k] === true)
          next[edge] = crossings[(k + step) % crossings.length] ?? -1;
      }
    }
  }

  const rings: Ring[] = [];
  for (let start = 0; start < edges; start++) {
    if (next[start] === -1) continue;
    const ring: Ring = [];
    let edge = start;
    while (edge !== -1 && next[edge] !== -1) {
      ring.push([px[edge] ?? 0, py[edge] ?? 0]);
      const following = next[edge] ?? -1;
      next[edge] = -1;
      edge = following;
    }
    if (ring.length >= 3) rings.push(ring);
  }
  return rings;
}

/**
 * Traces the land in a drawing: the land mask (`landMask`), smoothed and
 * contoured on a grid one sea pixel wider on every side so every ring closes,
 * then Douglas–Peucker. Outer rings only, turning from +x towards +y
 * (clockwise on screen), largest first; land enclosed by land is land.
 */
export function traceCoast(raster: Raster, options: TraceOptions): Ring[] {
  const { width, height } = raster;
  const land = landMask(raster, options);
  const columns = width + 2;
  const rows = height + 2;
  const padded = new Uint8Array(columns * rows);
  for (let y = 0; y < height; y++) {
    padded.set(
      land.subarray(y * width, (y + 1) * width),
      (y + 1) * columns + 1,
    );
  }
  const field = boxMean(padded, columns, rows, options.blurRadius);
  return contours(field, columns, rows)
    .map((ring) => ({ ring, area: signedArea(ring) }))
    .filter(({ area }) => area >= options.islandFloor)
    .toSorted((a, b) => b.area - a.area)
    .map(({ ring }) => simplify(ring, options.tolerance));
}
