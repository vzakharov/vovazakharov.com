import type * as Phaser from 'phaser';

import { PICTOGRAM_LIGHT } from '../lib/light';
import type { Lighting } from './ink';
import { PALETTE } from './palette';

/**
 * A pictogram's light, the same on every button whatever the sun does, and
 * its thinnest line: `hairline`, one device pixel in CSS pixels.
 */
export const iconLighting = (hairline: number): Lighting => ({
  ...PICTOGRAM_LIGHT,
  hairline,
});

/** How far below a button its shadow falls, in its radii, and how dark. */
export const DISC_DROP = 0.07;
export const DISC_SHADOW_ALPHA = 0.25;
/** A button disc's ink line, for a disc of radius `r`. */
export const discInk = (r: number) => Math.max(2, r * 0.1);

/**
 * A button's disc, opaque so nothing behind it reads through, and centred on
 * the graphics' own position so a tap can press it in by scale.
 */
export function drawDisc(
  graphics: Phaser.GameObjects.Graphics,
  r: number,
): void {
  graphics.clear();
  graphics.fillStyle(PALETTE.shadeInk, DISC_SHADOW_ALPHA);
  graphics.fillCircle(0, r * DISC_DROP, r);
  graphics.fillStyle(PALETTE.hud);
  graphics.fillCircle(0, 0, r);
  graphics.lineStyle(discInk(r), PALETTE.ink);
  graphics.strokeCircle(0, 0, r);
}
