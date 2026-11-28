import type { Seeded, Sized } from '@/kernel/shared/typings';

import { noise, type Point, reseed } from '@/clip/shared/ink';

/** A wall of tally marks: the area it covers, and the hand that scratched it. */
export type TallyWall = Partial<Seeded> &
  Sized & {
    /** A mark's height in stage units; 40 by default. */
    markHeight?: number;
    /** About one group in this many is in dried blood; 8 by default. */
    bloodEvery?: number;
    /** The share of group slots the hand skipped, left bare; 0.05 by default. */
    skipRate?: number;
  };

/** One scratch: four uprights then the strike through them make a group. */
export type TallyMark = {
  ends: readonly [Point, Point];
  /** Which group it belongs to, in reading order across the whole wall. */
  group: number;
  blood: boolean;
};

// Against a mark's height: the gap between marks, between groups, between rows.
const MARK_GAP = 0.28;
const GROUP_GAP = 0.62;
const ROW_GAP = 0.5;
// How far the hand wanders, against a mark's height.
const SHAKE = 0.07;
const LEAN = 0.1;

const groupWidth = (height: number): number =>
  height * (MARK_GAP * 3 + GROUP_GAP);

/** One group's five marks, its left foot at `[x, y]`. */
function groupAt(
  [x, y]: Point,
  height: number,
  key: number,
  group: number,
  blood: boolean,
): TallyMark[] {
  const shake = (n: number): number => noise(key, n) * height * SHAKE;
  const lean = noise(key, 99) * height * LEAN;
  const tall = height * (1 + noise(key, 98) * 0.08);
  const uprights = [0, 1, 2, 3].map((n): TallyMark => {
    const footX = x + n * height * MARK_GAP + shake(n * 4);
    return {
      ends: [
        [footX + lean + shake(n * 4 + 1), y - tall + shake(n * 4 + 2)],
        [footX, y + shake(n * 4 + 3)],
      ],
      group,
      blood,
    };
  });
  // The strike runs from below the first upright's foot to above the last's top.
  const reach = height * MARK_GAP * 3;
  const strike: TallyMark = {
    ends: [
      [x - height * 0.12 + shake(20), y - tall * 0.18 + shake(21)],
      [
        x + reach + lean + height * 0.14 + shake(22),
        y - tall * 0.8 + shake(23),
      ],
    ],
    group,
    blood,
  };
  return [...uprights, strike];
}

/**
 * Every mark on the wall, in the order they were scratched: rows left to
 * right, top to bottom. Rows start before the area's left edge and run past
 * its right, and the first and last run past its top and bottom, so no end of
 * the count is ever in sight.
 */
export function tallyGrid(wall: TallyWall): readonly TallyMark[] {
  const {
    width,
    height,
    seed = 0,
    markHeight = 40,
    bloodEvery = 8,
    skipRate = 0.05,
  } = wall;
  const pitch = groupWidth(markHeight);
  const rowPitch = markHeight * (1 + ROW_GAP);
  const marks: TallyMark[] = [];
  let group = 0;
  for (let row = 0; row * rowPitch <= height + rowPitch * 1.5; row += 1) {
    const rowKey = reseed(seed, row);
    // Each row starts a different way into a group, never at the edge.
    const start = -pitch * (1 + (noise(rowKey, 0) + 1) / 2);
    const foot = row * rowPitch + noise(rowKey, 1) * markHeight * 0.15;
    for (let slot = 0; start + slot * pitch <= width + pitch; slot += 1) {
      const key = reseed(rowKey, slot + 2);
      if ((noise(key, 0) + 1) / 2 < skipRate) continue;
      const blood = (noise(key, 1) + 1) / 2 < 1 / bloodEvery;
      marks.push(
        ...groupAt([start + slot * pitch, foot], markHeight, key, group, blood),
      );
      group += 1;
    }
  }
  return marks;
}

/**
 * How much of each mark is scratched at `progress` in `[0, 1]` across the
 * wall in reading order: whole marks up to the one in hand, that one partly,
 * none after. Returns how many marks are whole and how far the next one is.
 */
export function scratchedUpTo(
  total: number,
  progress: number,
): { whole: number; partial: number } {
  const reached = Math.min(1, Math.max(0, progress)) * total;
  const whole = Math.floor(reached);
  return { whole, partial: reached - whole };
}
