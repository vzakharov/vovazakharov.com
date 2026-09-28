import type * as Phaser from 'phaser';

import { sunLight } from '../../model/light';
import type { Random } from '../../model/random';
import { groundAt, RANGES, ridgeTone } from './backdrop-tones';
import { mix } from './colour';
import { grainPixels, mottles } from './grain';
import type { MeadowLayout } from './layout';
import { fillBands } from './paint-sky';
import { PALETTE } from './palette';
import { fillShape } from './shapes';
import {
  farSkyline,
  farthestSkyline,
  hillBands,
  litRidge,
  nearSkyline,
} from './skyline';

const HILL_BANDS = 16;
const GROUND_BANDS = 32;
const MOTTLE_ALPHA = 0.16;
/** A mottle's share of the way from the ground toward the lit or the deep ground. */
const MOTTLE_TONE = 0.3;
const GRAIN_KEY = 'grain';
const GRAIN_SIDE = 256;
const GRAIN_ALPHA = 0.07;
/** CSS pixels per grain texel. */
const GRAIN_SCALE = 1;

/** Each range: its skyline, its tones, how far below the ground's top its floor lies, and its sunlit rim's depth; farthest first. */
const RANGE_FLOORS = [
  [farthestSkyline, RANGES.farthest, 0, 2],
  [farSkyline, RANGES.far, 0, 3],
  [nearSkyline, RANGES.near, 2, 4],
] as const;

/**
 * The three hill ranges, farthest first, each nearer the air the farther it
 * stands and paling into the mist at its foot, its slopes that face the sun
 * rimmed with light.
 */
export function paintRanges(
  graphics: Phaser.GameObjects.Graphics,
  layout: MeadowLayout,
  random: Random,
): void {
  const light = sunLight(layout);
  for (const [skyline, { lit, foot }, below, rim] of RANGE_FLOORS) {
    const line = skyline(random, layout);
    for (const { outline, down } of hillBands(
      line,
      layout.groundTop + below,
      HILL_BANDS,
    )) {
      graphics.fillStyle(mix(lit, foot, down));
      fillShape(graphics, outline);
    }
    graphics.fillStyle(ridgeTone(lit));
    for (const quad of litRidge(line, light, rim)) fillShape(graphics, quad);
  }
}

/** The ground from the near hills' foot to the bottom edge, lit far and deeper near, mottled. */
export function paintGround(
  graphics: Phaser.GameObjects.Graphics,
  layout: MeadowLayout,
  random: Random,
): void {
  const { width, height, groundTop } = layout;
  fillBands(graphics, width, [groundTop, height], groundAt, GROUND_BANDS);
  // Each patch twice, the outer at a wider reach, so its edge is soft.
  for (const { x, y, rx, ry, deep } of mottles(random, layout)) {
    graphics.fillStyle(
      mix(
        PALETTE.ground,
        deep ? PALETTE.groundDeep : PALETTE.groundLit,
        MOTTLE_TONE,
      ),
      MOTTLE_ALPHA / 2,
    );
    graphics.fillEllipse(x, y, rx * 2.6, ry * 2.6);
    graphics.fillEllipse(x, y, rx * 2, ry * 2);
  }
}

/**
 * The grain over the ground, under the grass and every creature: one tile
 * texture made from `seed` the first time, then one sprite sized to the
 * ground, reused on every repaint.
 */
export function paintGrain(
  scene: Phaser.Scene,
  existing: Phaser.GameObjects.TileSprite | undefined,
  { width, height, groundTop }: MeadowLayout,
  seed: number,
): Phaser.GameObjects.TileSprite {
  if (!scene.textures.exists(GRAIN_KEY)) {
    const texture = scene.textures.createCanvas(
      GRAIN_KEY,
      GRAIN_SIDE,
      GRAIN_SIDE,
    );
    if (!texture)
      throw new Error(`The grain texture '${GRAIN_KEY}' could not be made`);
    const context = texture.getContext();
    const image = context.createImageData(GRAIN_SIDE, GRAIN_SIDE);
    image.data.set(grainPixels(seed, GRAIN_SIDE));
    context.putImageData(image, 0, 0);
    texture.refresh();
  }
  const grain =
    existing ?? scene.add.tileSprite(0, 0, width, height, GRAIN_KEY);
  return grain
    .setOrigin(0, 0)
    .setPosition(0, groundTop)
    .setSize(width, height - groundTop)
    .setTileScale(GRAIN_SCALE)
    .setAlpha(GRAIN_ALPHA);
}
