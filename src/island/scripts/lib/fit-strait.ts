import type { CoastField } from '@/island/entities/terrain';

import { boxGrid, resample } from './fit-grid';
import { nodeAt, openSea } from './fit-measure';
import type { Bounds } from './fit-target';

/**
 * Bite 1's strait, plane kilometres: the Блаблания–Фейсис inlet's head, where
 * its two coasts close to a channel, and the channel's southern end, above the
 * pool the drawing inks as a lake — `trace-coast.ts`'s sea stroke from drawing
 * pixel (698.5, 198) to (698.5, 238), the main body's box centre at pixel
 * (616, 430.5) as `bite-2/overlay.py` finds it, 6.2109 km a pixel.
 */
const STRAIT = {
  head: [512, 1444],
  end: [512, 1196],
  /** The inlet's water between Блаблания's finger and Фейсис. */
  inlet: { x: [350, 600], y: [1100, 1800] },
} as const;

type Span = readonly [number, number];

/** Whether each probe reaches open sea, and how far south the inlet's does. */
export type StraitFate = {
  headOpen: boolean;
  endOpen: boolean;
  /** The southernmost open-sea node in the inlet's box, plane km, or null. */
  southmostKm: number | null;
};

/**
 * The strait's fate in `field`, on a `cellMetres` resample of it over the
 * rings' bounds plus `marginMetres` of sea: open sea is sea joined through sea
 * to that box's border.
 */
export function straitFate(
  field: CoastField,
  bounds: Bounds,
  cellMetres: number,
  marginMetres: number,
): StraitFate {
  const grid = boxGrid(
    [bounds.minX - marginMetres, bounds.maxX + marginMetres],
    [bounds.minY - marginMetres, bounds.maxY + marginMetres],
    cellMetres,
  );
  const open = openSea(resample(field, grid), grid);
  const isOpen = ([x, y]: readonly [number, number]) =>
    open[nodeAt(grid, x * 1000, y * 1000)] === 1;
  let southmostKm: number | null = null;
  const [x0, x1]: Span = STRAIT.inlet.x;
  const [y0, y1]: Span = STRAIT.inlet.y;
  for (let y = y0; y <= y1 && southmostKm === null; y += cellMetres / 1000) {
    for (let x = x0; x <= x1; x += cellMetres / 1000) {
      if (open[nodeAt(grid, x * 1000, y * 1000)] === 1) {
        southmostKm = y;
        break;
      }
    }
  }
  return {
    headOpen: isOpen(STRAIT.head),
    endOpen: isOpen(STRAIT.end),
    southmostKm,
  };
}
