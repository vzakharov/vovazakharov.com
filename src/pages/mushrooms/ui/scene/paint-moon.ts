import type * as Phaser from 'phaser';

import type { Circle } from '../../model/geometry';
import { moonShadow } from './moon-shadow';
import { PALETTE } from './palette';
import { fillShape, petal, strokeShape } from './shapes';
import { SUN_RAY_REACH } from './sun-layout';

const MOON_PETALS = 12;
/** The rosette's two rings, as the sun's: each set off, out from and to, and wide, in radii. */
const RINGS = [
  [0, [0.8, SUN_RAY_REACH], 0.22],
  [0.5, [0.8, 1.45], 0.18],
] as const;
/** Where the lit side faces: up and toward the right, so the shadow sits low on the left. */
const LIT = -Math.PI / 4;
/** How far the disc that cuts the shadow is moved off the moon's, in radii. */
const SHADOW_OFFSET = 0.35;
const SHADOW_STEPS = 24;

/**
 * The moon, as Syama's sun is drawn but in the night's ink: a rosette of
 * petals in `moonHalo` reaching as far as the sun's rays, each outlined in
 * `inkCool`, then a pale disc with a crescent of shadow (`moonShadow`). `ink`
 * is the outline's width, so the meadow's moon and the map's compass share
 * one picture at their own sizes.
 */
export function drawMoon(
  graphics: Phaser.GameObjects.Graphics,
  moon: Circle,
  ink: number,
): void {
  const step = (Math.PI * 2) / MOON_PETALS;
  for (const [offset, [from, to], width] of RINGS) {
    for (let index = 0; index < MOON_PETALS; index++) {
      const outline = petal(
        moon,
        (index + offset) * step,
        [from * moon.r, to * moon.r],
        width * moon.r,
      );
      fillShape(graphics.fillStyle(PALETTE.moonHalo), outline);
      strokeShape(graphics.lineStyle(ink, PALETTE.inkCool), outline);
    }
  }
  graphics.fillStyle(PALETTE.moon).fillCircle(moon.x, moon.y, moon.r);
  fillShape(
    graphics.fillStyle(PALETTE.moonShade),
    moonShadow(moon, LIT, SHADOW_OFFSET, SHADOW_STEPS),
  );
  graphics.lineStyle(ink, PALETTE.inkCool).strokeCircle(moon.x, moon.y, moon.r);
}
