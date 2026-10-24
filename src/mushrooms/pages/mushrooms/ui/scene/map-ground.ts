/**
 * The map's ground: the meadow seen from above, soft mottles and scattered
 * tufts over a grass wash (`draw-map-ground.ts` lays them). Each mark lies on
 * the plane, grown by a cell of its own from the visit's seed (`cellSeed`),
 * so the same meadow draws the same ground, and a mark keeps its place among
 * the things however the map is framed at that zoom.
 */

import type { Box, Point } from '../../model/geometry';
import { fromMap, type MapFrame, onMap } from '../../model/map-frame';
import { between, mulberry32, type Random } from '../../model/random';
import type { Blade } from './brow';
import { CELL, cellSeed } from './lawn';
import {
  type Mottle,
  mottleIn,
  ringOf,
  shownAs,
  type ShownMottle,
  SOFT_EDGE,
} from './mottles';

/** About how far apart tufts stand on the map, in CSS px: a cell's side, whatever the zoom. */
const TUFT_SPACING = 30;
/** The share of tuft cells that grow one, and of those that catch the light. */
const TUFT_CHANCE = 0.6;
const LIT_CHANCE = 0.35;
/** A tuft's height, in CSS px, and how far its blades lean off upright. */
const TUFT_HEIGHT = [4, 7] as const;
const TUFT_LEAN = 0.25;
/** A mottle cell's side, in tuft cells, and how many mottles one grows, as the meadow's lawn cell does. */
const MOTTLE_CELLS = 4;
const MOTTLES_PER_CELL = 2;
/** Salts telling the tufts' cells from the mottles' at one zoom, and one zoom from the next. */
const TUFT_SALT = 0x7f_4a_11;
const MOTTLE_SALT = 0x3c_e9_05;
const LEVEL_SALT = 0x9e_37_79_b1;

/** A tuft on the map: where it stands, how tall in px, its blades' lean, and whether it catches the light. */
type MapTuft = Point & Blade;
type MapGround = { tufts: MapTuft[]; mottles: ShownMottle[] };

/** The ground's box on the map, its corners rounded `corner` px. */
export type GroundBox = Box & { corner: number };

/** Whether `point` lies inside `box`, `inset` px in from its rounded edge. */
function within(
  { left, right, top, bottom, corner }: GroundBox,
  inset: number,
  { x, y }: Point,
): boolean {
  const [l, r, t, b] = [
    left + inset,
    right - inset,
    top + inset,
    bottom - inset,
  ];
  if (x < l || x > r || y < t || y > b) return false;
  // Round the corners: past one, the point keeps within its arc.
  const cx = Math.min(Math.max(x, l + corner), r - corner);
  const cy = Math.min(Math.max(y, t + corner), b - corner);
  return Math.hypot(x - cx, y - cy) <= corner;
}

/**
 * Each plane cell `side` clump sizes wide that `box`, on the map, covers:
 * its corner on the plane and the stream it grows from, off `seed`.
 */
function cellsUnder(
  frame: MapFrame,
  box: Box,
  side: number,
  seed: number,
): Array<{ corner: Point; random: Random }> {
  const corners = [
    { x: box.left, y: box.top },
    { x: box.right, y: box.top },
    { x: box.left, y: box.bottom },
    { x: box.right, y: box.bottom },
  ].map((at) => fromMap(frame, at));
  const span = (axis: 'x' | 'y') => {
    const values = corners.map((corner) => corner[axis] / side);
    return [Math.floor(Math.min(...values)), Math.ceil(Math.max(...values))];
  };
  const [iLow = 0, iHigh = 0] = span('x');
  const [jLow = 0, jHigh = 0] = span('y');
  const cells = [];
  for (let i = iLow; i < iHigh; i++) {
    for (let j = jLow; j < jHigh; j++) {
      cells.push({
        corner: { x: i * side, y: j * side },
        random: mulberry32(cellSeed(seed, { i, j })),
      });
    }
  }
  return cells;
}

const onSheet = (frame: MapFrame, ring: readonly Point[]) =>
  ring.map((point) => onMap(frame, point));

/** A mottle the meadow's lawn would grow in a cell, scaled to a cell `side` wide at `corner`. */
function mottleOver(random: Random, corner: Point, side: number): Mottle {
  const grown = mottleIn(random, { x: 0, y: 0 }, CELL);
  const scale = side / CELL;
  return {
    ...grown,
    middle: {
      x: corner.x + grown.middle.x * scale,
      y: corner.y + grown.middle.y * scale,
    },
    across: grown.across * scale,
    lengthways: grown.lengthways * scale,
  };
}

/**
 * The ground under `frame` inside `box`, on the map, grown from `seed`. A
 * tuft cell is the power of two of the clump's size nearest `TUFT_SPACING`
 * px, so every zoom between two of them grows the same marks. A tuft keeps
 * its blades, and a mottle its soft edge, inside the box.
 */
export function mapGround(
  frame: MapFrame,
  box: GroundBox,
  seed: number,
): MapGround {
  const level = Math.round(Math.log2(TUFT_SPACING / frame.scale));
  const side = 2 ** level;
  const salted = (salt: number) =>
    (seed ^ salt ^ Math.imul(level, LEVEL_SALT)) >>> 0;
  const tufts = cellsUnder(frame, box, side, salted(TUFT_SALT)).flatMap(
    ({ corner, random }): MapTuft[] => {
      const at = onMap(frame, {
        x: corner.x + random() * side,
        y: corner.y + random() * side,
      });
      const grows = random() < TUFT_CHANCE;
      const tuft = {
        ...at,
        tall: between(random, ...TUFT_HEIGHT),
        lean: between(random, -TUFT_LEAN, TUFT_LEAN),
        lit: random() < LIT_CHANCE,
      };
      const top = { ...at, y: at.y - tuft.tall };
      const rooted = within(box, 2, at) && within(box, 2, top);
      return grows && rooted ? [tuft] : [];
    },
  );
  const wide = side * MOTTLE_CELLS;
  const mottles = cellsUnder(frame, box, wide, salted(MOTTLE_SALT)).flatMap(
    ({ corner, random }) =>
      Array.from({ length: MOTTLES_PER_CELL }, () =>
        mottleOver(random, corner, wide),
      ).flatMap((mottle): ShownMottle[] => {
        const outer = onSheet(frame, ringOf(mottle, SOFT_EDGE));
        return outer.every((point) => within(box, 0, point))
          ? [shownAs(mottle, [outer, onSheet(frame, ringOf(mottle, 1))])]
          : [];
      }),
  );
  return { tufts, mottles };
}
