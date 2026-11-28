import {
  at,
  ellipse,
  ink,
  limb,
  noise,
  type Pen,
  rng,
} from '@/clip/shared/ink';

import { GIG_PALETTE } from './palette-gig';

/** The world the rocket ears fly in, left to right and top to bottom. */
export const WORLD = { left: -900, right: 1860, top: -1400, bottom: 2900 };
/** Where the studio's roof runs: the rig hangs under it, the night is over it. */
export const ROOF = 1460;

const STARS = 160;
const LAMP = ellipse([0, 0], 22, 16);

/**
 * The night over the studio: dark falling to black up the world, its stars
 * twinkling at their own rates. Fills the whole world above `ROOF`.
 */
export function nightSky(pen: Pen): void {
  const { ctx, playhead } = pen;
  const { left, right, top } = WORLD;
  const glow = ctx.createLinearGradient(0, top, 0, ROOF);
  glow.addColorStop(0, GIG_PALETTE.skyHigh);
  glow.addColorStop(1, GIG_PALETTE.skyLow);
  ctx.fillStyle = glow;
  ctx.fillRect(left, top, right - left, ROOF - top);
  const next = rng(0x5_7a_25);
  ctx.save();
  for (let n = 0; n < STARS; n += 1) {
    const x = left + next() * (right - left);
    const y = top + next() * (ROOF - 80 - top);
    const size = 3 + next() * 4;
    const twinkle = 0.55 + 0.45 * Math.sin(playhead * (2 + next() * 5) + n);
    ctx.globalAlpha = twinkle;
    ctx.fillStyle = GIG_PALETTE.star;
    ctx.beginPath();
    ctx.ellipse(x, y, size, size, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** The lighting rig under the roof: a truss across the world, lamps hanging off it. */
export function rig(pen: Pen): void {
  const { ctx } = pen;
  const { left, right } = WORLD;
  ctx.fillStyle = GIG_PALETTE.truss;
  ctx.fillRect(left, ROOF - 10, right - left, 70);
  for (let x = left; x < right; x += 60) {
    limb(
      pen,
      [
        [x, ROOF],
        [x + 60, ROOF + 50],
      ],
      GIG_PALETTE.truss,
      6,
      x,
    );
  }
  for (let n = 0; n < 12; n += 1) {
    const x = left + 160 + n * 230 + noise(9, n) * 30;
    at(pen, { x, y: ROOF + 90 }, () => {
      ink(pen, LAMP, { fill: GIG_PALETTE.lamp, seed: n });
    });
  }
}
