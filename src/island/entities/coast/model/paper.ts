/**
 * A photographed drawing and the colour of the paper under it, which varies
 * across the photo with the light: every judgement of ink or colour is made
 * against the paper around the pixel, never against white.
 */

import type { Sized } from '@/kernel/shared/typings';

export type Raster = Sized & {
  /** Row-major RGBA, four bytes a pixel. */
  data: ArrayLike<number>;
};

export type Rgb = [number, number, number];

export const brightness = ([r, g, b]: Rgb) => r + g + b;

/** The largest per-channel chromaticity difference, scaled so grey to a pure
 * primary is about 2. */
export function chromaDistance([r, g, b]: Rgb, [pr, pg, pb]: Rgb): number {
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

export function pixel(data: ArrayLike<number>, index: number): Rgb {
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
 * The paper's colour around every `cell`-pixel square cell: each cell's
 * lightest quarter of pixels averaged, then over the `window` cells on each
 * side the least saturated quarter of those. Where the window holds any bare
 * paper, that is what it finds.
 */
export function paperByCell(
  raster: Raster,
  cell: number,
  window: number,
): { paper: Rgb[]; cellColumns: number } {
  const { data, width, height } = raster;
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
  for (let cj = 0; cj < cellRows; cj++) {
    for (let ci = 0; ci < cellColumns; ci++) {
      const around: Rgb[] = [];
      for (
        let j = Math.max(0, cj - window);
        j <= Math.min(cellRows - 1, cj + window);
        j++
      ) {
        for (
          let i = Math.max(0, ci - window);
          i <= Math.min(cellColumns - 1, ci + window);
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
