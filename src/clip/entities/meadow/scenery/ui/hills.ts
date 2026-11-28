import type { Strewn } from '@/kernel/shared/typings';

import {
  at,
  ink,
  noise,
  type Path,
  type Pen,
  type Place,
  type Point,
  polygon,
} from '@/clip/shared/ink';

import { MEADOW_PALETTE } from './palette-meadow';

/** Felt hills filling a box, its top left corner at the place. */
export type Hills = Strewn & Place;

// How finely a hill's crest is traced, in stage units.
const STEP = 16;
// How far apart the grass tufts on the nearest crest stand.
const TUFT_EVERY = 90;

/** The height of range `range`'s crest above its baseline at `x`. */
function crest(seed: number, range: number, x: number): number {
  const a = noise(seed, range * 10);
  const b = noise(seed, range * 10 + 1);
  // Two slow swells of their own length and phase per range.
  return (
    Math.sin(x / (240 + 60 * a) + a * 6) * (34 + 10 * range) +
    Math.sin(x / (110 + 30 * b) + b * 6) * 12
  );
}

/** Three short blades of grass standing on `[x, y]`. */
const tuft = ([x, y]: Point): Path =>
  [-1, 0, 1].flatMap(
    (blade) =>
      [
        { kind: 'M', points: [[x + blade * 5, y + 4]] },
        { kind: 'L', points: [[x + blade * 9, y - 12 + Math.abs(blade) * 4]] },
      ] as const,
  );

/**
 * Rolling felt hills, one range behind another, the far ones paler, grass
 * tufts along the nearest crest. They stand still: a scene pans past them.
 * Fixed by `seed`.
 */
export function rollingHills(pen: Pen, hills: Hills): void {
  const { width, height, seed = 0 } = hills;
  const ranges = MEADOW_PALETTE.hills.length;
  at(pen, hills, () => {
    for (const [range, fill] of MEADOW_PALETTE.hills.entries()) {
      const baseline = height * (0.2 + (0.75 * range) / ranges);
      const ridge: Point[] = [];
      for (let x = -STEP; x <= width + STEP; x += STEP) {
        ridge.push([x, baseline - crest(seed, range, x)]);
      }
      const ground: Point[] = [
        [width + STEP, height + STEP],
        [-STEP, height + STEP],
      ];
      ink(pen, polygon([...ridge, ...ground], 'closed'), {
        fill,
        width: 3,
        seed: seed + range,
      });
      if (range === ranges - 1) {
        const tufts = ridge
          .filter((_, n) => (n * STEP) % TUFT_EVERY < STEP)
          .flatMap((root) => tuft(root));
        ink(pen, tufts, { stroke: MEADOW_PALETTE.tuft, width: 3, seed });
      }
    }
  });
}
