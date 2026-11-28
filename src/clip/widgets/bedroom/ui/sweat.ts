import { at, ellipse, ink, noise, path, type Pen } from '@/clip/shared/ink';

import { BEDROOM_PALETTE } from './palette-bedroom';
import { SLEEPER_FACE } from './room';

// How far from the middle of his face a drop starts, and where his lap is.
const FACE_REACH = 60;
const LAP_Y = 480;
const DROPS = 11;
// Each drop's fall, in seconds, from his face to his lap.
const FALL = 0.65;
const SWEAT_DROP = path(
  'M 0,-9 C 4,-3 6,2 6,5 C 6,9 3,11 0,11 C -3,11 -6,9 -6,5 C -6,2 -4,-3 0,-9 Z',
);

/**
 * Sweat running off his face: `amount` of `DROPS` drops at a time, each
 * sliding off a point of his face and falling into his lap, staggered so
 * they never fall in step.
 */
export function sweatDrops(pen: Pen, amount: number): void {
  const count = Math.round(DROPS * amount);
  for (let n = 0; n < count; n += 1) {
    const phase = (pen.playhead / FALL + noise(311, n) * 0.5 + n / DROPS) % 1;
    const startX = SLEEPER_FACE[0] + noise(312, n) * FACE_REACH;
    const startY = SLEEPER_FACE[1] + noise(313, n) * FACE_REACH;
    const y = startY + (LAP_Y - startY) * phase * phase;
    at(pen, { x: startX, y, scale: 1.5 + 0.8 * phase }, () => {
      ink(pen, SWEAT_DROP, {
        fill: BEDROOM_PALETTE.sweat,
        width: 2.5,
        seed: 314 + n,
      });
    });
  }
}

/** The damp spreading on the pillow behind him, `amount` 0 → 1. */
export function dampPillow(pen: Pen, amount: number): void {
  if (amount <= 0) return;
  ink(pen, ellipse([262, 452], 46 * amount, 20 * amount), {
    fill: BEDROOM_PALETTE.damp,
    stroke: null,
    seed: 321,
  });
}
