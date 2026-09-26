import type * as Phaser from 'phaser';

import { type Phased, sway } from '../../model/motion';
import { between, type Random } from '../../model/random';
import type { Footing, MeadowLayout } from './layout';
import { PALETTE } from './palette';

const TUFTS_PER_1000PX = 52;
const SEAM_TUFTS_PER_1000PX = 40;
/** How far a tuft's tip swings in the breeze, in units of its size. */
const SWING = 0.35;
/**
 * How much of the breeze's cycle one CSS pixel across the meadow is behind the
 * last, so a gust is seen travelling over the grass rather than every tuft
 * moving at once.
 */
const GUST_LAG = 0.008;

type Tuft = Footing & Phased;

/** Where the grass grows, drawn from `random`, so the same source regrows it. */
export function growTufts(
  { width, height, groundTop }: MeadowLayout,
  random: Random,
): Tuft[] {
  const depth = height - groundTop;
  const tufts = Math.round((width / 1000) * TUFTS_PER_1000PX);
  const seamTufts = Math.round((width / 1000) * SEAM_TUFTS_PER_1000PX);
  return Array.from({ length: tufts + seamTufts }, (_, index) => {
    // Bunched toward the back, where the ground recedes; the first few line
    // the seam with the hills, breaking it up.
    const y =
      groundTop +
      depth *
        (index < seamTufts
          ? between(random, 0.005, 0.03)
          : between(random, 0.04, 0.98) ** 1.4);
    // Nearer tufts, lower on the screen, are bigger.
    const nearness = 0.6 + (y - groundTop) / depth;
    const x = between(random, 0, width);
    return {
      x,
      y,
      size: nearness * depth * 0.03,
      phase: -x * GUST_LAG * Math.PI * 2 + between(random, -0.4, 0.4),
    };
  });
}

/** The grass as it bends at `time`, into `graphics` cleared for it. */
export function paintTufts(
  graphics: Phaser.GameObjects.Graphics,
  tufts: readonly Tuft[],
  time: number,
): void {
  graphics.clear();
  for (const { x, y, size, phase } of tufts) {
    const bend = sway(time, phase) * SWING;
    for (const [lean, height, colour] of [
      [-0.5, 1.6, PALETTE.tuftDark],
      [0.45, 1.4, PALETTE.tuftDark],
      [0, 2, PALETTE.tuft],
    ] as const) {
      graphics.fillStyle(colour);
      graphics.fillTriangle(
        x - size * 0.3,
        y,
        x + size * 0.3,
        y,
        x + (lean * 1.3 + bend * height) * size,
        y - height * size,
      );
    }
  }
}
