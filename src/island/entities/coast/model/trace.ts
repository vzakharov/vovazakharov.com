/**
 * The coastline tracer: RGBA pixels in, land polygons out, in pixel
 * coordinates (`x` right, `y` down, a pixel's centre at `+0.5`). Pure and
 * platform-free — a script runs it over the drawing today, a browser over the
 * player's own map later.
 */
import { contains, type Ring, signedArea, simplify } from './ring';

export type Raster = {
  /** Row-major RGBA, four bytes a pixel. */
  data: ArrayLike<number>;
  width: number;
  height: number;
};

export type TraceOptions = {
  /** Paper is a pixel this unsaturated (`(max − min) / max`) … */
  maxPaperSaturation: number;
  /** … and at least this bright (`max / 255`); darker is the ink line. */
  minPaperValue: number;
  /** Half-width of the box the mask is averaged over before contouring. */
  blurRadius: number;
  /** The share of land in that box above which a point is land: under ½ a
   * thin ink line survives the averaging and closes a gap narrower than the
   * box. */
  level: number;
  /** A hole in the land smaller than this many square pixels is filled. */
  holeFloor: number;
  /** A piece of land smaller than this many square pixels is dropped. */
  islandFloor: number;
  /** Douglas–Peucker tolerance, in pixels. */
  tolerance: number;
};

/** A piece of land: its outer boundary turning from +x towards +y (clockwise
 * on screen), and the holes kept in it, turning the other way. */
export type LandPolygon = { outer: Ring; holes: Ring[] };

/** Whether one pixel is land: coloured fill, or the dark ink line. */
export function isLand(
  r: number,
  g: number,
  b: number,
  a: number,
  options: Pick<TraceOptions, 'maxPaperSaturation' | 'minPaperValue'>,
): boolean {
  if (a === 0) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max / 255 < options.minPaperValue) return true;
  return (max - min) / max > options.maxPaperSaturation;
}

/** The land mask averaged over a box, on a grid one sea pixel wider on every
 * side so every contour closes. */
function landField(
  raster: Raster,
  options: TraceOptions,
): { field: Float32Array; columns: number; rows: number } {
  const { data, width, height } = raster;
  const columns = width + 2;
  const rows = height + 2;
  // Summed-area table over the padded mask, one extra row and column of zeros.
  const sums = new Float64Array((columns + 1) * (rows + 1));
  for (let j = 0; j < rows; j++) {
    let rowSum = 0;
    for (let i = 0; i < columns; i++) {
      const x = i - 1;
      const y = j - 1;
      if (x >= 0 && y >= 0 && x < width && y < height) {
        const at = (y * width + x) * 4;
        const land = isLand(
          data[at] ?? 0,
          data[at + 1] ?? 0,
          data[at + 2] ?? 0,
          data[at + 3] ?? 0,
          options,
        );
        if (land) rowSum += 1;
      }
      sums[(j + 1) * (columns + 1) + i + 1] =
        (sums[j * (columns + 1) + i + 1] ?? 0) + rowSum;
    }
  }
  const field = new Float32Array(columns * rows);
  const radius = options.blurRadius;
  for (let j = 1; j < rows - 1; j++) {
    const top = Math.max(0, j - radius);
    const bottom = Math.min(rows, j + radius + 1);
    for (let i = 1; i < columns - 1; i++) {
      const left = Math.max(0, i - radius);
      const right = Math.min(columns, i + radius + 1);
      const sum =
        (sums[bottom * (columns + 1) + right] ?? 0) -
        (sums[top * (columns + 1) + right] ?? 0) -
        (sums[bottom * (columns + 1) + left] ?? 0) +
        (sums[top * (columns + 1) + left] ?? 0);
      field[j * columns + i] = sum / ((bottom - top) * (right - left));
    }
  }
  return { field, columns, rows };
}

/**
 * Marching squares at `level`, every segment directed with land on its right
 * on screen, chained into closed rings. A saddle joins its land corners when
 * the cell's mean is land.
 */
function contours(
  field: Float32Array,
  columns: number,
  rows: number,
  level: number,
): Ring[] {
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
      const sides: Array<[number, number, number, number, number]> = [
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
        (value(i, j) + value(i + 1, j) + value(i + 1, j + 1) + value(i, j + 1)) /
        4;
      const step = mean >= level ? 1 : crossings.length - 1;
      crossings.forEach((edge, k) => {
        if (!exits[k]) return;
        next[edge] = crossings[(k + step) % crossings.length] ?? -1;
      });
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
 * Traces the land in a drawing: mask, box average, marching squares, holes
 * under the hole floor filled, land under the island floor dropped (with
 * whatever lay in a filled hole), then Douglas–Peucker. Largest piece first.
 */
export function traceCoast(
  raster: Raster,
  options: TraceOptions,
): LandPolygon[] {
  const { field, columns, rows } = landField(raster, options);
  const traced = contours(field, columns, rows, options.level).map((ring) => ({
    ring,
    area: signedArea(ring),
  }));
  const outers = traced.filter(({ area }) => area > 0);
  const holes = traced.filter(({ area }) => area < 0);

  const innermost = <T extends { ring: Ring; area: number }>(
    candidates: T[],
    point: [number, number],
  ): T | undefined =>
    candidates
      .filter(({ ring }) => contains(ring, point))
      .sort((a, b) => Math.abs(a.area) - Math.abs(b.area))[0];

  // Land reaching the frame is whatever lies beyond the paper's edge.
  const inFrame = ({ ring }: { ring: Ring }) =>
    ring.every(
      ([x, y]) =>
        x > 0.5 &&
        y > 0.5 &&
        x < raster.width - 0.5 &&
        y < raster.height - 0.5,
    );
  const filled = holes.filter(({ area }) => -area < options.holeFloor);
  const kept = outers
    .filter(({ area }) => area >= options.islandFloor)
    .filter(inFrame)
    .filter(({ ring }) => {
      const [first] = ring;
      if (!first) return false;
      const around = innermost(holes, first);
      return around === undefined || !filled.includes(around);
    })
    .sort((a, b) => b.area - a.area);

  const polygons = kept.map(({ ring }) => ({
    outer: simplify(ring, options.tolerance),
    holes: [] as Ring[],
  }));
  for (const hole of holes) {
    if (filled.includes(hole)) continue;
    const [first] = hole.ring;
    if (!first) continue;
    const owner = innermost(kept, first);
    if (!owner) continue;
    polygons[kept.indexOf(owner)]?.holes.push(
      simplify(hole.ring, options.tolerance),
    );
  }
  return polygons;
}
