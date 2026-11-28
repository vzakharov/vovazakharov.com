import type { Seeded, Sized } from '@/kernel/shared/typings';

import {
  at,
  ellipse,
  ink,
  noise,
  type Pen,
  penAt,
  type Point,
} from '@/clip/shared/ink';

import { FEET_Y } from '../model/pose';
import { bunny } from './bunny';
import { WALLPAPER_PALETTE } from './palette-bunny';

/** A wallpaper cell, counted from the one whose bunny stands at the origin. */
export type Cell = { column: number; row: number };

/** What a pattern of figures covers: an area of the stage, from the current origin. */
export type Covering = Partial<Seeded> & {
  area: Sized & { x?: number; y?: number };
};

export type Wallpaper = Covering & {
  /** One cell's width and height in stage units; 110 by default. */
  cell?: number;
  /** Shifts the pattern, as a camera pan does; the hole moves with it. */
  offset?: Point;
  /** Where a bunny has come off the wall, leaving its shape in bare plaster. */
  hole?: Cell;
};

// The tile is rendered at this many pixels per stage unit, so the pattern
// stays crisp on a canvas scaled up to a phone's pixels.
const DENSITY = 2;
// A motif's height against its cell's.
const MOTIF_HEIGHT = 0.56;
// The bunny's extent in its own units, top of the ears to the feet.
const EARS_Y = -310;

const motifScale = (cell: number): number =>
  (MOTIF_HEIGHT * cell) / (FEET_Y - EARS_Y);

/** Where the motif in `cell` has its origin, its column dropped by half a row on every odd column. */
function motifAt(size: number, { column, row }: Cell): Point {
  const scale = motifScale(size);
  const drop = Math.abs(column % 2) === 1 ? size / 2 : 0;
  const middle = ((EARS_Y + FEET_Y) / 2) * scale;
  return [column * size, row * size + drop - middle];
}

function canvas(width: number, height: number): CanvasRenderingContext2D {
  const element = document.createElement('canvas');
  element.width = Math.ceil(width);
  element.height = Math.ceil(height);
  const ctx = element.getContext('2d');
  if (!ctx) throw new Error('No 2D context for the wallpaper');
  return ctx;
}

/** The motif bunny, printed flat in `color`: no boil, no sway, no face but the print's. */
function printBunny(
  ctx: CanvasRenderingContext2D,
  [x, y]: Point,
  scale: number,
): void {
  const pen = penAt(ctx, 0);
  bunny(pen, { x, y, bunnyScale: scale, rendering: 'shadow', swaying: 0 });
}

// Three leaves on a stalk, at 110 units a cell.
const SPRIG = [
  ellipse([0, -10], 4, 9),
  ellipse([-8, 0], 4, 8),
  ellipse([8, 0], 4, 8),
];
// Where the sprigs sit in a tile, in cells.
const SPRIGS: readonly Point[] = [
  [0, 0.25],
  [2, 0.25],
  [1, 0.75],
];

// Printed tiles, keyed on cell size and seed. Each is a pure function of its
// key, so a frame reads the same picture whether or not it is cached.
const tiles = new Map<string, HTMLCanvasElement>();

/** Two columns by one row of cells: the half-drop repeats across that. */
function tileFor(size: number, seed: number): HTMLCanvasElement {
  const key = `${size}|${seed}`;
  const cached = tiles.get(key);
  if (cached) return cached;
  const ctx = canvas(size * 2 * DENSITY, size * DENSITY);
  ctx.scale(DENSITY, DENSITY);
  const scale = motifScale(size);
  // Every motif reaching into the tile, its neighbours' overhangs included.
  for (let column = -1; column <= 2; column += 1) {
    for (let row = -1; row <= 1; row += 1) {
      const [x, y] = motifAt(size, { column, row });
      printBunny(ctx, [x + size / 2, y + size / 2], scale);
    }
  }
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = WALLPAPER_PALETTE.motif;
  ctx.fillRect(0, 0, size * 2, size);
  ctx.globalCompositeOperation = 'destination-over';
  ctx.fillStyle = WALLPAPER_PALETTE.ground;
  ctx.fillRect(0, 0, size * 2, size);
  ctx.globalCompositeOperation = 'source-over';
  const pen = penAt(ctx, 0);
  // A sprig in each gap between the columns, the tile's edge one drawn on
  // both edges so it wraps.
  for (const [n, [x, y]] of SPRIGS.entries()) {
    at(
      pen,
      { x: x * size, y: y * size, scale: size / 110, rot: noise(seed, n) * 25 },
      () => {
        for (const leaf of SPRIG) {
          ink(pen, leaf, { fill: WALLPAPER_PALETTE.sprig, stroke: null });
        }
      },
    );
  }
  tiles.set(key, ctx.canvas);
  return ctx.canvas;
}

// How far the paper tore back past the bunny's edge, against its scale.
const TEAR = 0.05;
const TEAR_PASSES = 9;

const holes = new Map<number, HTMLCanvasElement>();

/**
 * The hole a motif bunny leaves: bare plaster in its shape, ringed by the
 * torn paper's white edge where the print came away ragged.
 */
function holeFor(size: number): HTMLCanvasElement {
  const cached = holes.get(size);
  if (cached) return cached;
  const ctx = canvas(size * 2 * DENSITY, size * 2 * DENSITY);
  ctx.scale(DENSITY, DENSITY);
  const scale = motifScale(size);
  const middle: Point = [size, size - ((EARS_Y + FEET_Y) / 2) * scale];
  for (let pass = 0; pass < TEAR_PASSES; pass += 1) {
    const jag = size * TEAR;
    printBunny(
      ctx,
      [
        middle[0] + noise(size, pass * 2) * jag,
        middle[1] + noise(size, pass * 2 + 1) * jag,
      ],
      scale * (1.04 + 0.05 * Math.abs(noise(size + 1, pass))),
    );
  }
  ctx.globalCompositeOperation = 'source-in';
  ctx.fillStyle = WALLPAPER_PALETTE.torn;
  ctx.fillRect(0, 0, size * 2, size * 2);
  const plaster = canvas(size * 2 * DENSITY, size * 2 * DENSITY);
  plaster.scale(DENSITY, DENSITY);
  printBunny(plaster, middle, scale * 1.01);
  plaster.globalCompositeOperation = 'source-in';
  plaster.fillStyle = WALLPAPER_PALETTE.plaster;
  plaster.fillRect(0, 0, size * 2, size * 2);
  ctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(plaster.canvas, 0, 0);
  holes.set(size, ctx.canvas);
  return ctx.canvas;
}

/**
 * The nursery wallpaper the bunny came off: small bunnies in a half-drop
 * repeat with a sprig between, printed once per cell size and laid as a
 * pattern, so a full-frame wall costs one fill. With `hole`, one bunny is
 * missing from it.
 */
export function bunnyWallpaper(pen: Pen, wallpaper: Wallpaper): void {
  const { ctx } = pen;
  const { area, cell = 110, offset = [0, 0], hole, seed = 0 } = wallpaper;
  const { x = 0, y = 0, width, height } = area;
  const [dx, dy] = offset;
  const pattern = ctx.createPattern(tileFor(cell, seed), 'repeat');
  if (!pattern) throw new Error('No pattern for the wallpaper');
  pattern.setTransform(
    new DOMMatrix([
      1 / DENSITY,
      0,
      0,
      1 / DENSITY,
      dx - cell / 2,
      dy - cell / 2,
    ]),
  );
  ctx.save();
  ctx.fillStyle = pattern;
  ctx.fillRect(x, y, width, height);
  if (hole) {
    const [hx, hy] = motifAt(cell, hole);
    const scale = motifScale(cell);
    const middleY = hy + ((EARS_Y + FEET_Y) / 2) * scale;
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    ctx.drawImage(
      holeFor(cell),
      hx + dx - cell,
      middleY + dy - cell,
      cell * 2,
      cell * 2,
    );
  }
  ctx.restore();
}
