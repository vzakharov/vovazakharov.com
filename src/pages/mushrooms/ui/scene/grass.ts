import type * as Phaser from 'phaser';

import { type Phased, sway } from '../../model/motion';
import { between, type Random } from '../../model/random';
import { groundAt } from './backdrop-tones';
import { mix } from './colour';
import type { Footing, MeadowLayout } from './layout';
import { PALETTE } from './palette';
import { groundSeam, seamAt } from './skyline';

const TUFTS_PER_1000PX = 52;
const SEAM_TUFTS_PER_1000PX = 28;
/** How far below the seam the tufts that break it up stand, as shares of the ground's depth. */
const SEAM_SCATTER = [0.004, 0.09] as const;
/** How far a tuft's tip swings in the breeze, in units of its size. */
const SWING = 0.35;
/**
 * How much of the breeze's cycle each CSS pixel across lags, so a gust is
 * seen crossing the grass.
 */
const GUST_LAG = 0.008;
/** How far toward the ground under it the farthest tuft is mixed; the nearest is not at all. */
const FADE = 0.85;
/** How far up a blade its lit crown, the tip, begins, as a share of its height. */
const TIP_FROM = 0.6;

/** A tuft's blades' colours, toned by its distance: the two flanking blades, the middle one, and every blade's lit crown. */
type TuftColours = { flank: number; middle: number; crown: number };

export type Tuft = Footing & Phased & TuftColours;

/** A tuft's colours `down` of the way from the ground's top to the bottom edge, fading into the ground the farther back it stands. */
export function tuftColours(down: number): TuftColours {
  const under = groundAt(down);
  const fade = (1 - down) * FADE;
  return {
    flank: mix(PALETTE.tuftDark, under, fade),
    middle: mix(PALETTE.tuft, under, fade),
    crown: mix(mix(PALETTE.tuft, PALETTE.groundLit, 0.4), under, fade),
  };
}

/** Where the grass grows, drawn from `random`, so the same source regrows it. */
export function growTufts(layout: MeadowLayout, random: Random): Tuft[] {
  const { width, height, groundTop } = layout;
  const seam = groundSeam(layout);
  const depth = height - groundTop;
  const tufts = Math.round((width / 1000) * TUFTS_PER_1000PX);
  const seamTufts = Math.round((width / 1000) * SEAM_TUFTS_PER_1000PX);
  return Array.from({ length: tufts + seamTufts }, (_, index) => {
    // Bunched toward the back, where the ground recedes; the first few
    // scatter just under the seam with the hills, following its waver, so
    // they break it up rather than line it.
    const x = between(random, 0, width);
    const y =
      index < seamTufts
        ? seamAt(seam, x) +
          depth *
            (SEAM_SCATTER[0] +
              (SEAM_SCATTER[1] - SEAM_SCATTER[0]) * random() ** 1.6)
        : groundTop + depth * between(random, 0.1, 0.98) ** 1.4;
    // Nearer tufts, lower on the screen, are bigger.
    const nearness = 0.6 + Math.max(0, y - groundTop) / depth;
    return {
      x,
      y,
      size: nearness * depth * 0.03,
      phase: -x * GUST_LAG * Math.PI * 2 + between(random, -0.4, 0.4),
      ...tuftColours(Math.max(0, y - groundTop) / depth),
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
  for (const { x, y, size, phase, flank, middle, crown } of tufts) {
    const bend = sway(time, phase) * SWING;
    for (const [lean, height, colour] of [
      [-0.5, 1.6, flank],
      [0.45, 1.4, flank],
      [0, 2, middle],
    ] as const) {
      const left = x - size * 0.3;
      const right = x + size * 0.3;
      const apexX = x + (lean * 1.3 + bend * height) * size;
      const apexY = y - height * size;
      graphics.fillStyle(colour);
      graphics.fillTriangle(left, y, right, y, apexX, apexY);
      const tipY = y + (apexY - y) * TIP_FROM;
      graphics.fillStyle(crown);
      graphics.fillTriangle(
        left + (apexX - left) * TIP_FROM,
        tipY,
        right + (apexX - right) * TIP_FROM,
        tipY,
        apexX,
        apexY,
      );
    }
  }
}
