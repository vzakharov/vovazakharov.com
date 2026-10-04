import * as Phaser from 'phaser';

import { wrap } from '../../model/geometry';
import { pinholeOf } from '../../model/pinhole';
import { between, mulberry32, type Random } from '../../model/random';
import {
  haloReach,
  litSkyAt,
  skyAt,
  skyGrid,
  type Tones,
} from './backdrop-tones';
import type { Span } from './baking';
import { PUFFS } from './cloud-puffs';
import { mix } from './colour';
import { duskStars } from './dusk-stars';
import type { MeadowLayout } from './layout';
import { DUSK, PALETTE } from './palette';
import { azimuthAt, OPENING_CLOUD_COUNT } from './panorama';
import { rainbowArc } from './rain-sky';
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
 * over it by `paintGlow`. Toned in `tones`, the day's unless given.
 */
export function paintSky(
  graphics: Phaser.GameObjects.Graphics,
  layout: MeadowLayout,
  tones?: Tones,
): void {
  const at = (_x: number, y: number) => skyAt(y / layout.nearHills, tones);
  paintCells(graphics, layout, at, [0, skyGrid(layout).columns]);
}

/** A star's rays, and how far out they run, in its disc's radii. */
const STAR_RAYS = 8;
const STAR_RAY_REACH = [1.3, 3] as const;

/** The dusk sky's stars (`duskStars`), each ringed as the sun's rosette is: a ring of faint rays about a bright disc. */
export function paintStars(
  graphics: Phaser.GameObjects.Graphics,
  layout: MeadowLayout,
): void {
  const step = (Math.PI * 2) / STAR_RAYS;
  for (const star of duskStars(layout)) {
    graphics.fillStyle(PALETTE.star, 0.55);
    for (let index = 0; index < STAR_RAYS; index++) {
      fillShape(
        graphics,
        petal(
          star,
          index * step,
          [STAR_RAY_REACH[0] * star.r, STAR_RAY_REACH[1] * star.r],
          0.35 * star.r,
        ),
      );
    }
    graphics.fillStyle(PALETTE.star);
    graphics.fillCircle(star.x, star.y, star.r);
  }
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
 * `random` shapes after them stays as it is. Each cloud has two twins of the
 * same puffs, from `twins` straight after it and in this order, so the rain's
 * lies over the dusk's: its dusk twin in `DUSK`'s cloud colours, a high one
 * hazed toward the dusk sky's top, and its rain twin in the rain cloud's.
 */
export function paintClouds(
  layer: Layer,
  twins: Record<'dusk' | 'rain', Layer>,
  { clouds, sun, camera, height }: MeadowLayout,
  random: Random,
): Phaser.GameObjects.Graphics[] {
  const { arc } = pinholeOf(camera);
  const sunAzimuth = azimuthAt(camera, sun.x);
  const round = mulberry32(PUFF_SEED);
  const { count, step, side, lean: leaning, sink, scale: scales } = PUFFS;
  const middle = (count - 1) / 2;
  return clouds.map(({ azimuth, y, r }, place) => {
    const graphics = layer().setPosition(0, y);
    const shaping = place < OPENING_CLOUD_COUNT ? random : round;
    const tone = (colour: number, skyTop: number) =>
      y <= height * HIGH_CLOUD_ROW
        ? mix(colour, skyTop, HIGH_CLOUD_HAZE)
        : colour;
    // The sun's way across the sky from the cloud, round the shorter side.
    const across = arc * wrap(sunAzimuth - azimuth);
    const toSun = Math.hypot(across, sun.y - y) || 1;
    const lean = {
      x: (across / toSun) * r * leaning,
      y: ((sun.y - y) / toSun) * r * leaning,
    };
    const puffs = Array.from({ length: count }, (_, index) => ({
      x: (index - middle) * r * between(shaping, ...step),
      r: r * (index === middle ? 1 : between(shaping, ...side)),
    }));
    const dusk = twins.dusk().setPosition(0, y);
    const dark = twins.rain().setPosition(0, y);
    for (const [face, rainy, dx, dy, scale] of [
      [
        'cloudShade',
        'rainCloudShade',
        -lean.x,
        r * sink - lean.y,
        scales.shade,
      ],
      ['cloudLit', 'rainCloudLit', lean.x, lean.y, scales.lit],
      ['cloud', 'rainCloud', 0, 0, scales.face],
    ] as const) {
      for (const [into, colour, skyTop] of [
        [graphics, PALETTE[face], PALETTE.skyTop],
        [dusk, DUSK[face], DUSK.skyTop],
        [dark, PALETTE[rainy], PALETTE.skyTop],
      ] as const) {
        into.fillStyle(tone(colour, skyTop));
        for (const puff of puffs) {
          into.fillCircle(puff.x + dx, dy, puff.r * scale);
        }
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

/**
 * The rainbow round `layout`'s opening screen (`rainbowArc`): each band of
 * `PALETTE.rainbow` as the arch's upper half, outermost first, each half as
 * wide again as its share so it covers the seam with the band outside it.
 * Where the arch stands, for the picture baked from it.
 */
export function paintRainbow(
  graphics: Phaser.GameObjects.Graphics,
  layout: MeadowLayout,
): ReturnType<typeof rainbowArc> {
  const arc = rainbowArc(layout);
  const { x, y, r, band } = arc;
  for (const [index, colour] of PALETTE.rainbow.entries()) {
    graphics
      .lineStyle(1.5 * band, colour)
      .beginPath()
      .arc(x, y, r - (index + 0.5) * band, Math.PI, 2 * Math.PI)
      .strokePath();
  }
  return arc;
}
