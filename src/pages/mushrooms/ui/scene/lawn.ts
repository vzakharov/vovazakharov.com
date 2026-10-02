/**
 * The ground's lawn, laid by square cells of the plane the eye walks: each
 * cell grows its own tufts from its own stream (`cellTufts`), so a cell's
 * grass is a pure function of the visit and the cell, and a walk back finds
 * the grass it left. Only the cells round the eye live (`liveCells`), and
 * they change as the eye crosses a cell's edge (`LiveLawn`).
 */

import type { Point } from '../../model/geometry';
import { D_SEE, type Eye, type Footing, type Rooted } from '../../model/ground';
import { mulberry32, type Random, type Seeded } from '../../model/random';
import { FLOWER_SIZE, standingOn } from './flower-layout';
import type { Stand } from './flower-sight';
import { tuftOn, type WithTuft } from './grass';
import type { MeadowLayout } from './layout';
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
 * How far from the eye's cell's middle a cell's middle stands at the most
 * to live: as far as a tuft is drawn before it sinks away behind the brow,
 * and a cell's diagonal, so every point that far from the eye anywhere in
 * its cell has its cell alive.
 */
const LIVE_REACH = D_SEE + PALE_SPAN + CELL * Math.SQRT2;

/** A cell of the lawn: `i` across, `j` into the distance, each `CELL` wide. */
export type Cell = Record<'i' | 'j', number>;

/** The cell `point` stands in. */
export function cellOf({ x, y }: Point): Cell {
  return { i: Math.floor(x / CELL), j: Math.floor(y / CELL) };
}

/** The cells that live while the eye stands in `cell`, by `LIVE_REACH`. */
export function liveCells(cell: Cell): Cell[] {
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
function cellSeed(seed: number, { i, j }: Cell): number {
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

/** The `TUFTS_PER_CELL` tufts `cell` of `lawn` grows, anywhere in the cell, each in a flower's size. */
export function cellTufts(lawn: Lawn, cell: Cell): Sprout[] {
  const random = mulberry32(cellSeed(lawn.seed, cell));
  return Array.from({ length: TUFTS_PER_CELL }, () => {
    const foot = {
      x: (cell.i + random()) * CELL,
      y: (cell.j + random()) * CELL,
      size: FLOWER_SIZE,
    };
    return sproutOn(lawn.layout, foot, random);
  });
}

const keyOf = ({ i, j }: Cell) => `${String(i)},${String(j)}`;

/**
 * The lawn's live tufts as the eye walks: those of the cells live round the
 * eye's cell (`liveCells`), each cell grown once while it lives and grown
 * the same again when it comes back.
 */
export class LiveLawn {
  private cells = new Map<string, readonly Sprout[]>();
  private at: Cell | undefined;
  private tufts: readonly Sprout[] = [];

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
    const cells = new Map<string, readonly Sprout[]>();
    for (const live of liveCells(cell)) {
      const key = keyOf(live);
      cells.set(key, this.cells.get(key) ?? cellTufts(this.lawn, live));
    }
    this.cells = cells;
    this.at = cell;
    this.tufts = [...cells.values()].flat();
    return this.tufts;
  }

  /** The tufts of the cell `foot` stands in, live or not. */
  of(foot: Point): readonly Sprout[] {
    const cell = cellOf(foot);
    return this.cells.get(keyOf(cell)) ?? cellTufts(this.lawn, cell);
  }
}
