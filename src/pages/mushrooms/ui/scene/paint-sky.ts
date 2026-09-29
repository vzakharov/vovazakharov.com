import * as Phaser from 'phaser';

import { between, type Random } from '../../model/random';
import { litSkyAt, skyGrid } from './backdrop-tones';
import { mix } from './colour';
import type { MeadowLayout } from './layout';
import { PALETTE } from './palette';
import { fillShape, petal } from './shapes';
import { SUN_RAY_REACH } from './sun-layout';

const SUN_RAYS = 16;
const WASH_ALPHA = 0.02;
/** The highest cloud's share of the way toward the sky's top colour. */
const HIGH_CLOUD_HAZE = 0.2;

/** The next graphics object to paint into, in painting order. */
export type Layer = () => Phaser.GameObjects.Graphics;

/**
 * The sky down to the near hills, warm at the bottom, and pale and warm round
 * the sun: `skyGrid`'s cells, each shaded between its corners' colours. A
 * renderer that cannot shade between corners fills each with the colour at
 * its middle.
 */
export function paintSky(
  graphics: Phaser.GameObjects.Graphics,
  layout: MeadowLayout,
): void {
  const { columns, rows, across, down } = skyGrid(layout);
  const at = (x: number, y: number) => litSkyAt(layout, x, y);
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {
      const [x, y] = [column * across, row * down];
      graphics.fillStyle(at(x + across / 2, y + down / 2));
      graphics.fillGradientStyle(
        at(x, y),
        at(x + across, y),
        at(x, y + down),
        at(x + across, y + down),
      );
      graphics.fillRect(x, y, across, down);
    }
  }
}

/**
 * The sun as a rosette: two rings of rays set half a step apart, then a ring
 * of petals inside the disc — the first of the meadow's mandala ornament —
 * over the glow the sky lays round it (`litSkyAt`).
 */
export function paintSun(
  graphics: Phaser.GameObjects.Graphics,
  { sun }: MeadowLayout,
): void {
  const step = (Math.PI * 2) / SUN_RAYS;
  for (const [offset, reach, width, colour] of [
    [0, [0.8, SUN_RAY_REACH], 0.2, PALETTE.sunRayDeep],
    [0.5, [0.8, 1.5], 0.16, PALETTE.sunRay],
  ] as const) {
    graphics.fillStyle(colour);
    for (let index = 0; index < SUN_RAYS; index++) {
      fillShape(
        graphics,
        petal(
          sun,
          (index + offset) * step,
          [reach[0] * sun.r, reach[1] * sun.r],
          width * sun.r,
        ),
      );
    }
  }
  graphics.fillStyle(PALETTE.sun);
  graphics.fillCircle(sun.x, sun.y, sun.r);
  graphics.fillStyle(PALETTE.sunInner);
  for (let index = 0; index < SUN_RAYS / 2; index++) {
    fillShape(
      graphics,
      petal(sun, index * step * 2, [0.12 * sun.r, 0.7 * sun.r], 0.14 * sun.r),
    );
  }
  graphics.fillStyle(PALETTE.sunRayDeep);
  graphics.fillCircle(sun.x, sun.y, sun.r * 0.16);
}

/**
 * One graphics object per cloud, so each can drift on its own: a cool shade
 * below and away from the sun, a warm rim on its side, the highest cloud
 * paler with the sky's blue.
 */
export function paintClouds(
  layer: Layer,
  { clouds, sun }: MeadowLayout,
  random: Random,
): Phaser.GameObjects.Graphics[] {
  const highest = Math.min(...clouds.map(({ y }) => y));
  return clouds.map(({ x, y, r }) => {
    const graphics = layer().setPosition(x, y);
    const tone = (colour: number) =>
      y === highest ? mix(colour, PALETTE.skyTop, HIGH_CLOUD_HAZE) : colour;
    const toSun = Math.hypot(sun.x - x, sun.y - y) || 1;
    const lean = {
      x: ((sun.x - x) / toSun) * r * 0.08,
      y: ((sun.y - y) / toSun) * r * 0.08,
    };
    const puffs = Array.from({ length: 5 }, (_, index) => ({
      x: (index - 2) * r * between(random, 0.75, 0.95),
      r: r * (index === 2 ? 1 : between(random, 0.55, 0.8)),
    }));
    for (const [colour, dx, dy, scale] of [
      [PALETTE.cloudShade, -lean.x, r * 0.14 - lean.y, 1],
      [PALETTE.cloudLit, lean.x, lean.y, 0.96],
      [PALETTE.cloud, 0, 0, 0.9],
    ] as const) {
      graphics.fillStyle(tone(colour));
      for (const puff of puffs) {
        graphics.fillCircle(puff.x + dx, dy, puff.r * scale);
      }
    }
    return graphics;
  });
}

/**
 * The sun's light over the land, screened on so it only ever lightens: faint
 * discs round the sun at the layout's `wash`, so the ground a mushroom stands
 * on is never lifted.
 */
export function paintWash(
  graphics: Phaser.GameObjects.Graphics,
  layout: MeadowLayout,
): void {
  const { sun, wash } = layout;
  graphics.setBlendMode(Phaser.BlendModes.SCREEN);
  graphics.fillStyle(PALETTE.sunGlow, WASH_ALPHA);
  for (const radius of wash) {
    graphics.fillCircle(sun.x, sun.y, radius);
  }
}
