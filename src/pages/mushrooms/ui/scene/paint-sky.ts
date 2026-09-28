import * as Phaser from 'phaser';

import { between, type Random } from '../../model/random';
import { skyAt } from './backdrop-tones';
import { mix } from './colour';
import type { MeadowLayout } from './layout';
import { PALETTE } from './palette';
import { fillShape, petal } from './shapes';
import { SUN_GLOW_REACH, SUN_RAY_REACH, washReach } from './sun-layout';

const SKY_BANDS = 96;
const SUN_RAYS = 16;
const GLOW_RINGS = 14;
/** Each glow ring's alpha at the innermost, fading to none at the outermost. */
const GLOW_ALPHA = 0.05;
/** The bloom past the glow: rings out to `BLOOM_REACH` radii, each at `BLOOM_ALPHA`. */
const BLOOM_RINGS = 8;
const BLOOM_REACH = 6;
const BLOOM_ALPHA = 0.025;
/** The sky's warmth round the sun: discs from 3 to 9 radii, each at `WARM_ALPHA`. */
const WARM_DISCS = 6;
const WARM_ALPHA = 0.04;
/** The light the sun lays over the land, one disc of each alpha per ring. */
const WASH_RINGS = 10;
/** The wash's innermost and outermost rings, in sun radii, before it is shrunk to fit. */
const WASH_REACH = [4, 14] as const;
const WASH_ALPHA = 0.02;
/** The highest cloud's share of the way toward the sky's top colour. */
const HIGH_CLOUD_HAZE = 0.2;

/** The next graphics object to paint into, in painting order. */
export type Layer = () => Phaser.GameObjects.Graphics;

/** Horizontal bands from `top` to `bottom`, the colour at each from `colourAt` of its share down, 0 to 1. */
export function fillBands(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  [top, bottom]: readonly [number, number],
  colourAt: (down: number) => number,
  bands: number,
): void {
  const band = (bottom - top) / bands;
  for (let index = 0; index < bands; index++) {
    graphics.fillStyle(colourAt(index / (bands - 1)));
    graphics.fillRect(0, top + index * band, width, band + 1);
  }
}

/** The sky down to the near hills, warm at the bottom and warmer round the sun. */
export function paintSky(
  graphics: Phaser.GameObjects.Graphics,
  { width, nearHills, sun }: MeadowLayout,
): void {
  fillBands(graphics, width, [0, nearHills], skyAt, SKY_BANDS);
  graphics.fillStyle(PALETTE.skyWarm, WARM_ALPHA);
  for (let disc = 0; disc < WARM_DISCS; disc++) {
    graphics.fillCircle(sun.x, sun.y, sun.r * (3 + disc * 1.2));
  }
}

/**
 * The sun as a rosette: two rings of rays set half a step apart, then a ring
 * of petals inside the disc — the first of the meadow's mandala ornament —
 * inside a glow, and a fainter bloom past it.
 */
export function paintSun(
  graphics: Phaser.GameObjects.Graphics,
  { sun }: MeadowLayout,
): void {
  graphics.fillStyle(PALETTE.sunGlow, BLOOM_ALPHA);
  for (let ring = 0; ring < BLOOM_RINGS; ring++) {
    const t = ring / (BLOOM_RINGS - 1);
    graphics.fillCircle(
      sun.x,
      sun.y,
      sun.r * (BLOOM_REACH + (SUN_GLOW_REACH - BLOOM_REACH) * t),
    );
  }
  // Many faint discs stacked from the outside in, so the glow thickens
  // toward the sun with no edge of its own.
  for (let ring = 0; ring < GLOW_RINGS; ring++) {
    const t = ring / (GLOW_RINGS - 1);
    graphics.fillStyle(PALETTE.sunGlow, GLOW_ALPHA * t);
    graphics.fillCircle(
      sun.x,
      sun.y,
      sun.r * (SUN_GLOW_REACH + (1 - SUN_GLOW_REACH) * t),
    );
  }
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
 * discs round the sun, none reaching past `washReach`, so the ground where
 * the caps stand is never lifted.
 */
export function paintWash(
  graphics: Phaser.GameObjects.Graphics,
  layout: MeadowLayout,
): void {
  const { sun } = layout;
  const reach = washReach(layout);
  graphics.setBlendMode(Phaser.BlendModes.SCREEN);
  graphics.fillStyle(PALETTE.sunGlow, WASH_ALPHA);
  // Shrunk as a whole to fit, rather than each clamped, so no two rings
  // share an edge that would stack into a line.
  const outer = Math.min(sun.r * WASH_REACH[1], reach);
  for (let ring = 0; ring < WASH_RINGS; ring++) {
    const t = ring / (WASH_RINGS - 1);
    const r = WASH_REACH[0] + (WASH_REACH[1] - WASH_REACH[0]) * t;
    graphics.fillCircle(sun.x, sun.y, (outer * r) / WASH_REACH[1]);
  }
}
