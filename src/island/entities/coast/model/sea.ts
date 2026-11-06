/**
 * The land mask of a drawing on photographed paper, found by its complement:
 * the sea is whatever the image frame reaches without crossing a barrier — ink,
 * or colour clearly off the local paper's.
 */

import type { Sized } from '@/kernel/shared/typings';

export type Raster = Sized & {
  /** Row-major RGBA, four bytes a pixel. */
  data: ArrayLike<number>;
};

export type MaskOptions = {
  /** Side of the square cells the paper's colour is sampled in, in pixels. */
  paperCell: number;
  /** How many cells on each side of a cell its paper is estimated over. */
  paperWindow: number;
  /** A pixel darker than this share of the local paper's brightness is ink. */
  inkRatio: number;
  /** Radius ink is dilated by to close gaps in an outline, then given back. */
  inkClosing: number;
  /** Half-width of the box colour is averaged over, so hatching reads whole. */
  colourBlur: number;
  /** Chromaticity distance from the local paper above which a pixel is
   * coloured: the largest per-channel difference of `c / (r + g + b)`, ×3. */
  minChroma: number;
  /** A pixel whose averaged brightness is under this share of the local
   * paper's is shaded, which counts as colour: pale grey pencil barely tints. */
  maxShade: number;
  /** How far from ink a pixel must be to count towards a piece's colour, so
   * the averaging's smear of ink is not read as fill. */
  inkClearance: number;
  /** How far land may reach past its colour before it is bare … */
  coastReach: number;
  /** … and how deep from the water bare land is peeled away: a word written
   * against the coast goes, while the ink coastline, within reach of its
   * colour, stays, and so does a pale stretch inland of it. */
  peelDepth: number;
  /** The share of a piece of land's pixels that must be coloured for it to be
   * land rather than lettering. */
  minColouredShare: number;
  /** A piece of land with fewer pixels than this is dropped. */
  islandFloor: number;
};

type Rgb = [number, number, number];

const brightness = ([r, g, b]: Rgb) => r + g + b;

/** The largest per-channel chromaticity difference, scaled so grey to a pure
 * primary is about 2. */
function chromaDistance([r, g, b]: Rgb, [pr, pg, pb]: Rgb): number {
  const s = r + g + b || 1;
  const p = pr + pg + pb || 1;
  return (
    3 *
    Math.max(
      Math.abs(r / s - pr / p),
      Math.abs(g / s - pg / p),
      Math.abs(b / s - pb / p),
    )
  );
}

const saturation = ([r, g, b]: Rgb) => {
  const max = Math.max(r, g, b);
  return max === 0 ? 0 : (max - Math.min(r, g, b)) / max;
};

function pixel(data: ArrayLike<number>, index: number): Rgb {
  const at = index * 4;
  return [data[at] ?? 0, data[at + 1] ?? 0, data[at + 2] ?? 0];
}

function averaged(colours: Rgb[]): Rgb {
  const sum: Rgb = [0, 0, 0];
  for (const [r, g, b] of colours) {
    sum[0] += r;
    sum[1] += g;
    sum[2] += b;
  }
  const n = colours.length || 1;
  return [sum[0] / n, sum[1] / n, sum[2] / n];
}

/**
 * The paper's colour around every cell: each cell's lightest quarter of pixels
 * averaged, then over the window around it the least saturated quarter of
 * those. Where the window holds any bare paper, that is what it finds.
 */
function paperByCell(
  raster: Raster,
  options: MaskOptions,
): { paper: Rgb[]; cellColumns: number } {
  const { data, width, height } = raster;
  const cell = options.paperCell;
  const cellColumns = Math.ceil(width / cell);
  const cellRows = Math.ceil(height / cell);
  const lightest: Rgb[] = [];
  for (let cj = 0; cj < cellRows; cj++) {
    for (let ci = 0; ci < cellColumns; ci++) {
      const colours: Rgb[] = [];
      for (let y = cj * cell; y < Math.min(height, (cj + 1) * cell); y++) {
        for (let x = ci * cell; x < Math.min(width, (ci + 1) * cell); x++) {
          colours.push(pixel(data, y * width + x));
        }
      }
      const ranked = colours.toSorted((a, b) => brightness(b) - brightness(a));
      lightest.push(averaged(ranked.slice(0, Math.ceil(ranked.length / 4))));
    }
  }
  const paper: Rgb[] = [];
  const w = options.paperWindow;
  for (let cj = 0; cj < cellRows; cj++) {
    for (let ci = 0; ci < cellColumns; ci++) {
      const around: Rgb[] = [];
      for (
        let j = Math.max(0, cj - w);
        j <= Math.min(cellRows - 1, cj + w);
        j++
      ) {
        for (
          let i = Math.max(0, ci - w);
          i <= Math.min(cellColumns - 1, ci + w);
          i++
        ) {
          around.push(lightest[j * cellColumns + i] ?? [0, 0, 0]);
        }
      }
      const ranked = around.toSorted((a, b) => saturation(a) - saturation(b));
      paper.push(averaged(ranked.slice(0, Math.ceil(ranked.length / 4))));
    }
  }
  return { paper, cellColumns };
}

/** A box sum over a 0/1 or real-valued grid, through a summed-area table. */
export function boxMean(
  values: ArrayLike<number>,
  width: number,
  height: number,
  radius: number,
): Float32Array {
  const stride = width + 1;
  const sums = new Float64Array(stride * (height + 1));
  for (let y = 0; y < height; y++) {
    let row = 0;
    for (let x = 0; x < width; x++) {
      row += values[y * width + x] ?? 0;
      sums[(y + 1) * stride + x + 1] = (sums[y * stride + x + 1] ?? 0) + row;
    }
  }
  const mean = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    const top = Math.max(0, y - radius);
    const bottom = Math.min(height, y + radius + 1);
    for (let x = 0; x < width; x++) {
      const left = Math.max(0, x - radius);
      const right = Math.min(width, x + radius + 1);
      const sum =
        (sums[bottom * stride + right] ?? 0) -
        (sums[top * stride + right] ?? 0) -
        (sums[bottom * stride + left] ?? 0) +
        (sums[top * stride + left] ?? 0);
      mean[y * width + x] = sum / ((bottom - top) * (right - left));
    }
  }
  return mean;
}

/** Every pixel within `radius` (a square) of a set one, set. */
function dilate(
  mask: Uint8Array,
  width: number,
  height: number,
  radius: number,
): Uint8Array {
  if (radius <= 0) return mask;
  const near = boxMean(mask, width, height, radius);
  return Uint8Array.from(near, (share) => (share > 0 ? 1 : 0));
}

/** Ink and colour, each per pixel. */
function classify(
  raster: Raster,
  options: MaskOptions,
): { ink: Uint8Array; coloured: Uint8Array; shaded: Uint8Array } {
  const { data, width, height } = raster;
  const { paper, cellColumns } = paperByCell(raster, options);
  const channel = (c: number) =>
    boxMean(
      Float32Array.from(
        { length: width * height },
        (_, i) => data[i * 4 + c] ?? 0,
      ),
      width,
      height,
      options.colourBlur,
    );
  const blurred = [channel(0), channel(1), channel(2)];
  const ink = new Uint8Array(width * height);
  const coloured = new Uint8Array(width * height);
  const shaded = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const local =
        paper[
          Math.floor(y / options.paperCell) * cellColumns +
            Math.floor(x / options.paperCell)
        ] ?? ([255, 255, 255] as Rgb);
      if (brightness(pixel(data, i)) < options.inkRatio * brightness(local)) {
        ink[i] = 1;
      }
      const smooth: Rgb = [
        blurred[0]?.[i] ?? 0,
        blurred[1]?.[i] ?? 0,
        blurred[2]?.[i] ?? 0,
      ];
      if (chromaDistance(smooth, local) > options.minChroma) coloured[i] = 1;
      if (brightness(smooth) < options.maxShade * brightness(local))
        shaded[i] = 1;
    }
  }
  return { ink, coloured, shaded };
}

/** `seeds`, and the pixels they reach through 4-neighbours not in `barrier`. */
function flood(
  barrier: Uint8Array,
  seeds: Uint8Array,
  width: number,
  height: number,
): Uint8Array {
  const sea = Uint8Array.from(seeds);
  const queue = new Int32Array(width * height);
  let tail = 0;
  for (let i = 0; i < width * height; i++) if (sea[i] === 1) queue[tail++] = i;
  const visit = (i: number) => {
    if (barrier[i] === 1 || sea[i] === 1) return;
    sea[i] = 1;
    queue[tail++] = i;
  };
  for (let head = 0; head < tail; head++) {
    const i = queue[head] ?? 0;
    const x = i % width;
    if (x > 0) visit(i - 1);
    if (x < width - 1) visit(i + 1);
    if (i >= width) visit(i - width);
    if (i < (height - 1) * width) visit(i + width);
  }
  return sea;
}

/** The image's frame, less `barrier`. */
function frame(barrier: Uint8Array, width: number, height: number): Uint8Array {
  const edge = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const x = i % width;
    const onEdge =
      x === 0 || x === width - 1 || i < width || i >= (height - 1) * width;
    if (onEdge && barrier[i] !== 1) edge[i] = 1;
  }
  return edge;
}

/**
 * Keeps, of the pixels the sea does not reach, the pieces (8-connected) clear
 * of the frame, at least `islandFloor` pixels and painted enough.
 */
function keptPieces(
  sea: Uint8Array,
  painted: Uint8Array,
  raster: Raster,
  options: MaskOptions,
): Uint8Array {
  const { width, height } = raster;
  const kept = new Uint8Array(width * height);
  const seen = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  for (let start = 0; start < width * height; start++) {
    if (sea[start] === 1 || seen[start] === 1) continue;
    seen[start] = 1;
    queue[0] = start;
    let tail = 1;
    let paint = 0;
    let framed = false;
    for (let head = 0; head < tail; head++) {
      const i = queue[head] ?? 0;
      const x = i % width;
      const y = (i - x) / width;
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        framed = true;
      }
      paint += painted[i] ?? 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const n = ny * width + nx;
          if (sea[n] === 1 || seen[n] === 1) continue;
          seen[n] = 1;
          queue[tail++] = n;
        }
      }
    }
    const land =
      !framed &&
      tail >= options.islandFloor &&
      paint >= options.minColouredShare * tail;
    if (land) for (const i of queue.subarray(0, tail)) kept[i] = 1;
  }
  return kept;
}

/**
 * Land per pixel (1): what the sea does not reach, in pieces painted enough —
 * lettering on the paper is ink alone, so it goes whatever its size, and a
 * lake the sea cannot reach is land — with bare land peeled off its coast.
 */
export function landMask(raster: Raster, options: MaskOptions): Uint8Array {
  const { width, height } = raster;
  const { ink, coloured, shaded } = classify(raster, options);
  const closed = dilate(ink, width, height, options.inkClosing);
  const barrier = closed.map((set, i) => set | (coloured[i] ?? 0));
  const open = dilate(
    flood(barrier, frame(barrier, width, height), width, height),
    width,
    height,
    options.inkClosing,
  );
  // The closing seals a bay whose mouth is narrower than it; the sea is let
  // back in through the bare ink, stopped by any tint as well as colour.
  const tinted = ink.map(
    (set, i) => set | (coloured[i] ?? 0) | (shaded[i] ?? 0),
  );
  const sea = flood(tinted, open, width, height);
  const nearInk = dilate(ink, width, height, options.inkClearance);
  const painted = coloured.map(
    (set, i) => (set | (shaded[i] ?? 0)) & ((nearInk[i] ?? 0) ^ 1),
  );
  const reach = dilate(painted, width, height, options.coastReach);
  const land = keptPieces(sea, painted, raster, options);
  const bare = land.map((set, i) => set & ((reach[i] ?? 0) ^ 1));
  return peel(land, bare, raster, options.peelDepth);
}

/** Land with its `bare` pixels removed where they lie within `depth` steps
 * (4-neighbours, through bare land) of the water. */
function peel(
  land: Uint8Array,
  bare: Uint8Array,
  { width, height }: Raster,
  depth: number,
): Uint8Array {
  const peeled = Uint8Array.from(land);
  const distance = new Int32Array(width * height).fill(-1);
  const queue = new Int32Array(width * height);
  let tail = 0;
  const neighbours = (i: number) => {
    const x = i % width;
    return [
      x > 0 ? i - 1 : -1,
      x < width - 1 ? i + 1 : -1,
      i >= width ? i - width : -1,
      i < (height - 1) * width ? i + width : -1,
    ];
  };
  for (let i = 0; i < width * height; i++) {
    if (bare[i] !== 1) continue;
    if (neighbours(i).some((n) => n < 0 || land[n] !== 1)) {
      distance[i] = 1;
      queue[tail++] = i;
    }
  }
  for (let head = 0; head < tail; head++) {
    const i = queue[head] ?? 0;
    peeled[i] = 0;
    const d = distance[i] ?? 0;
    if (d >= depth) continue;
    for (const n of neighbours(i)) {
      if (n < 0 || bare[n] !== 1 || distance[n] !== -1) continue;
      distance[n] = d + 1;
      queue[tail++] = n;
    }
  }
  return peeled;
}
