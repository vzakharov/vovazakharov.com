import type * as Phaser from 'phaser';

import type { Point } from '../../model/geometry';
import { drawMoon } from './paint-moon';
import { PALETTE } from './palette';

const SUN_RADIUS = 7;
const SUN_RAYS = 8;
/** The moon's outline on the map, in CSS px. */
const MOON_INK = 1;

/**
 * The map's compass at `at`, up being the sun's azimuth: a little sun by
 * day, and past half way to dusk the moon, which stands where the sun did.
 */
export function drawCompass(
  pen: Phaser.GameObjects.Graphics,
  at: Point,
  dusky: boolean,
): void {
  if (dusky) drawMoon(pen, { ...at, r: SUN_RADIUS }, MOON_INK);
  else drawSun(pen, at);
}

function drawSun(pen: Phaser.GameObjects.Graphics, { x, y }: Point): void {
  pen.lineStyle(2, PALETTE.sunRay);
  for (let ray = 0; ray < SUN_RAYS; ray++) {
    const angle = (ray / SUN_RAYS) * Math.PI * 2;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    pen.lineBetween(
      x + dx * SUN_RADIUS * 1.35,
      y + dy * SUN_RADIUS * 1.35,
      x + dx * SUN_RADIUS * 1.85,
      y + dy * SUN_RADIUS * 1.85,
    );
  }
  pen
    .fillStyle(PALETTE.sun)
    .fillCircle(x, y, SUN_RADIUS)
    .lineStyle(1.5, PALETTE.ink)
    .strokeCircle(x, y, SUN_RADIUS);
}
