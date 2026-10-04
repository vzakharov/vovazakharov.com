/**
 * The ground's lawn, laid by square cells of the plane the eye walks: each
 * cell grows its own tufts and mottles from its own stream (`cellLawn`), so
 * a cell's grass is a pure function of the visit and the cell, and a walk
 * back finds the grass it left. Only the cells round the eye live
 * (`liveCells`), and they change as the eye crosses a cell's edge
 * (`LiveLawn`).
 */

import { D_SEE_MOST } from '../../model/eye-height';
import type { Point } from '../../model/geometry';
import type { Eye, Footing, Rooted } from '../../model/ground';
import { mulberry32, type Random, type Seeded } from '../../model/random';
import { FLOWER_SIZE, standingOn } from './flower-layout';
import type { Stand } from './flower-sight';
import { tuftOn, type WithTuft } from './grass';
import type { MeadowLayout } from './layout';
import { type Mottle, mottleIn, MOTTLES_PER_CELL } from './mottles';
import { PALE_SPAN } from './repaint-queue';

/** A tuft the child can plant on, and the foot on the plane a flower planted there stands on. */
export type Sprout = Rooted & WithTuft;

/** How wide a cell of the lawn stands, in the clump's size, either way. */
export const CELL = 4;

/**
 * How many tufts a cell grows: 0.85 to a square of the clump's size, the
 * opening lawn's density on the plane, uniform in the cell.
 */
export const TUFTS_PER_CELL = Math.round(0.85 * CELL * CELL);

/**
 * The farthest a live cell's middle stands from the eye's cell's: a tuft's
 * reach before the brow hides it, at the farthest the brow stands, plus a
 * diagonal for where in its cell the eye is.
 */
const LIVE_REACH = D_SEE_MOST + PALE_SPAN + CELL * Math.SQRT2;

/** A cell of the lawn: `i` across, `j` into the distance, each `CELL` wide. */
export type Cell = Record<'i' | 'j', number>;

export function cellOf({ x, y }: Point): Cell {
  return { i: Math.floor(x / CELL), j: Math.floor(y / CELL) };
}

/** The cells that live while the eye stands in `cell`, by `LIVE_REACH`. */
function liveCells(cell: Cell): Cell[] {
  const span = Math.ceil(LIVE_REACH / CELL);
  const cells: Cell[] = [];
  for (let di = -span; di <= span; di++) {
    for (let dj = -span; dj <= span; dj++) {
      if (Math.hypot(di, dj) * CELL <= LIVE_REACH) {
        cells.push({ i: cell.i + di, j: cell.j + dj });
      }
    }
  }
  return cells;
}

/** The seed of `cell`'s stream off the lawn's `seed`: well spread for neighbouring cells. */
export function cellSeed(seed: number, { i, j }: Cell): number {
  let mixed = seed >>> 0;
  for (const index of [i, j]) {
    mixed = Math.imul(mixed ^ Math.trunc(index), 0x9e_37_79_b1);
    mixed ^= mixed >>> 16;
  }
  return mixed >>> 0;
}

/** A tuft on `foot`, on the plane, drawn from `random` where `layout` lays it out. */
export function sproutOn(
  layout: MeadowLayout,
  foot: Footing,
  random: Random,
): Sprout {
  const { x, y } = standingOn(layout.camera, foot);
  return { foot, tuft: tuftOn(layout, x, y, random) };
}

/** Each of `kept` on its own foot, its tuft drawn afresh for `layout` (`sproutOn`). */
export function regrowTufts(
  layout: MeadowLayout,
  kept: readonly Sprout[],
  random: Random,
): Sprout[] {
  return kept.map(({ foot }) => sproutOn(layout, foot, random));
}

/** A lawn: the visit's `seed`, which every cell's stream is drawn off, laid out on `layout`. */
export type Lawn = Seeded & Pick<Stand, 'layout'>;

/**
 * How many tufts of the seam's grass a cell grows: 2.2 to a square of the
 * clump's size, which the brow's band (`SEAM_BAND`) shows at about the
 * density the far ground needs to read as grassy to its edge.
 */
const SEAM_PER_CELL = Math.round(2.2 * CELL * CELL);

/**
 * What a cell of the lawn grows: its tufts, its mottles, and its share of
 * the seam's grass, which only the band under the brow shows and no flower
 * is planted on.
 */
export type CellLawn = { tufts: Sprout[]; mottles: Mottle[]; seam: Sprout[] };

/** `count` tufts anywhere in `cell` of `lawn`, each in a flower's size, from `random`. */
function sproutsIn(
  lawn: Lawn,
  cell: Cell,
  count: number,
  random: Random,
): Sprout[] {
  return Array.from({ length: count }, () => {
    const foot = {
      x: (cell.i + random()) * CELL,
      y: (cell.j + random()) * CELL,
      size: FLOWER_SIZE,
    };
    return sproutOn(lawn.layout, foot, random);
  });
}

/**
 * What `cell` of `lawn` grows, anywhere in the cell, from the cell's own
 * stream: `TUFTS_PER_CELL` tufts, then `MOTTLES_PER_CELL` mottles, then
 * `SEAM_PER_CELL` tufts of the seam's grass, each drawn after the last so it
 * leaves the earlier draws as they are.
 */
export function cellLawn(lawn: Lawn, cell: Cell): CellLawn {
  const random = mulberry32(cellSeed(lawn.seed, cell));
  const tufts = sproutsIn(lawn, cell, TUFTS_PER_CELL, random);
  const corner = { x: cell.i * CELL, y: cell.j * CELL };
  const mottles = Array.from({ length: MOTTLES_PER_CELL }, () =>
    mottleIn(random, corner, CELL),
  );
  const seam = sproutsIn(lawn, cell, SEAM_PER_CELL, random);
  return { tufts, mottles, seam };
}

export function cellTufts(lawn: Lawn, cell: Cell): Sprout[] {
  return cellLawn(lawn, cell).tufts;
}

const keyOf = ({ i, j }: Cell) => `${String(i)},${String(j)}`;

/**
 * The lawn's live tufts and mottles as the eye walks: those of the cells
 * live round the eye's cell (`liveCells`), each cell grown once while it
 * lives and grown the same again when it comes back.
 */
export class LiveLawn {
  private cells = new Map<string, CellLawn>();
  private at: Cell | undefined;
  private tufts: readonly Sprout[] = [];
  private liveMottles: readonly Mottle[] = [];
  private liveSeam: readonly Sprout[] = [];

  private readonly lawn: Lawn;

  constructor(lawn: Lawn) {
    this.lawn = lawn;
  }

  /** The live tufts round `eye`, regrown only when its cell is not the one last asked about. */
  round(eye: Eye): readonly Sprout[] {
    const cell = cellOf(eye);
    if (this.at?.i === cell.i && this.at.j === cell.j) {
      return this.tufts;
    }
    const cells = new Map<string, CellLawn>();
    for (const live of liveCells(cell)) {
      const key = keyOf(live);
      cells.set(key, this.cells.get(key) ?? cellLawn(this.lawn, live));
    }
    this.cells = cells;
    this.at = cell;
    const grown = [...cells.values()];
    this.tufts = grown.flatMap(({ tufts }) => tufts);
    this.liveMottles = grown.flatMap(({ mottles }) => mottles);
    this.liveSeam = grown.flatMap(({ seam }) => seam);
    return this.tufts;
  }

  /** The live cells' mottles as of the last `round`. */
  get mottles(): readonly Mottle[] {
    return this.liveMottles;
  }

  /** The live cells' seam grass as of the last `round`. */
  get seam(): readonly Sprout[] {
    return this.liveSeam;
  }

  /** The tufts of the cell `foot` stands in, live or not. */
  of(foot: Point): readonly Sprout[] {
    const cell = cellOf(foot);
    return this.cells.get(keyOf(cell))?.tufts ?? cellTufts(this.lawn, cell);
  }
}
