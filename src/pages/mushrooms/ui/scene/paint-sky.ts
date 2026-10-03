import * as Phaser from 'phaser';

import { wrap } from '../../model/geometry';
import { pinholeOf } from '../../model/ground';
import { between, mulberry32, type Random } from '../../model/random';
import { haloReach, litSkyAt, skyAt, skyGrid } from './backdrop-tones';
import type { Span } from './baking';
import { mix } from './colour';
import type { MeadowLayout } from './layout';
import { PALETTE } from './palette';
import { azimuthAt, OPENING_CLOUD_COUNT } from './panorama';
import { fillShape, petal } from './shapes';
import { SUN_RAY_REACH } from './sun-layout';

const SUN_RAYS = 16;
const WASH_ALPHA = 0.02;
/** A high cloud's share of the way toward the sky's top colour. */
const HIGH_CLOUD_HAZE = 0.2;
/** How far down the screen, as a share of its height, a cloud is high. */
const HIGH_CLOUD_ROW = 0.1;
/** The seed the clouds round the sky past the opening screen are shaped from. */
const PUFF_SEED = 0x9f_f5;

/** The next graphics object to paint into, in painting order. */
export type Layer = () => Phaser.GameObjects.Graphics;

/**
 * `skyGrid`'s cells from column `from` up to `to`, which may lie past the
 * screen's edges, each shaded between its corners' colours `at`. A renderer
 * that cannot shade between corners fills each with the colour at its
 * middle.
 */
function paintCells(
  graphics: Phaser.GameObjects.Graphics,
  layout: MeadowLayout,
  at: (x: number, y: number) => number,
  [from, to]: readonly [number, number],
): void {
  const { rows, across, down } = skyGrid(layout);
  for (let row = 0; row < rows; row++) {
    for (let column = from; column < to; column++) {
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
 * The bare sky down to the near hills, warm at the bottom: by rows alone, so
 * it stands fixed on the screen however the eye turns, the sun's light laid
 * over it by `paintGlow`.
 */
export function paintSky(
  graphics: Phaser.GameObjects.Graphics,
  layout: MeadowLayout,
): void {
  const at = (_x: number, y: number) => skyAt(y / layout.nearHills);
  paintCells(graphics, layout, at, [0, skyGrid(layout).columns]);
}

/**
 * The sky pale and warm round the sun, opaque, in the cells `litSkyAt` lights
 * either side of it, on or off the screen, so it turns with the sun over the
 * bare sky and meets it seamlessly where the light runs out. Returns the
 * stretch across the screen it covers.
 */
export function paintGlow(
  graphics: Phaser.GameObjects.Graphics,
  layout: MeadowLayout,
): Span {
  const { across } = skyGrid(layout);
  const reach = haloReach(layout);
  const from = Math.floor((layout.sun.x - reach) / across);
  const to = Math.ceil((layout.sun.x + reach) / across);
  const at = (x: number, y: number) => litSkyAt(layout, x, y);
  paintCells(graphics, layout, at, [from, to]);
  return { left: from * across, across: (to - from) * across };
}

/**
 * The sun as a rosette: two rings of rays set half a step apart, then a ring
 * of petals inside the disc — the first of the meadow's mandala ornament —
 * a picture of its own over the glow the sky lays round it (`paintGlow`).
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
 * below and away from the sun, a warm rim on its side, the high clouds paler
 * with the sky's blue. The opening screen's clouds are shaped from `random`,
 * the rest from a stream of their own, so however many the sky holds, what
 * `random` shapes after them stays as it is. Each cloud's rain twin is the
 * same puffs in the rain cloud's colours, from `twin` straight after it.
 */
export function paintClouds(
  layer: Layer,
  twin: Layer,
  { clouds, sun, camera, height }: MeadowLayout,
  random: Random,
): Phaser.GameObjects.Graphics[] {
  const { arc } = pinholeOf(camera);
  const sunAzimuth = azimuthAt(camera, sun.x);
  const round = mulberry32(PUFF_SEED);
  return clouds.map(({ azimuth, y, r }, place) => {
    const graphics = layer().setPosition(0, y);
    const shaping = place < OPENING_CLOUD_COUNT ? random : round;
    const tone = (colour: number) =>
      y <= height * HIGH_CLOUD_ROW
        ? mix(colour, PALETTE.skyTop, HIGH_CLOUD_HAZE)
        : colour;
    // The sun's way across the sky from the cloud, round the shorter side.
    const across = arc * wrap(sunAzimuth - azimuth);
    const toSun = Math.hypot(across, sun.y - y) || 1;
    const lean = {
      x: (across / toSun) * r * 0.08,
      y: ((sun.y - y) / toSun) * r * 0.08,
    };
    const puffs = Array.from({ length: 5 }, (_, index) => ({
      x: (index - 2) * r * between(shaping, 0.75, 0.95),
      r: r * (index === 2 ? 1 : between(shaping, 0.55, 0.8)),
    }));
    const dark = twin().setPosition(0, y);
    for (const [colour, rainy, dx, dy, scale] of [
      [
        PALETTE.cloudShade,
        PALETTE.rainCloudShade,
        -lean.x,
        r * 0.14 - lean.y,
        1,
      ],
      [PALETTE.cloudLit, PALETTE.rainCloudLit, lean.x, lean.y, 0.96],
      [PALETTE.cloud, PALETTE.rainCloud, 0, 0, 0.9],
    ] as const) {
      graphics.fillStyle(tone(colour));
      dark.fillStyle(tone(rainy));
      for (const puff of puffs) {
        graphics.fillCircle(puff.x + dx, dy, puff.r * scale);
        dark.fillCircle(puff.x + dx, dy, puff.r * scale);
      }
    }
    return graphics;
  });
}

/**
 * The sun's light over the sky, screened on so it only ever lightens: faint
 * discs round the sun at the layout's `wash`, short of the ground's top, so
 * the ground a mushroom stands on is never lifted.
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
