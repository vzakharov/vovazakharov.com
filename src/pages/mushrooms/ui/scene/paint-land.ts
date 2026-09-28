import type * as Phaser from 'phaser';

import { sunLight } from '../../model/light';
import type { Random } from '../../model/random';
import { groundAt, RANGES, ridgeTone } from './backdrop-tones';
import { mix } from './colour';
import { grainPixels, grainStrips, mottles } from './grain';
import type { MeadowLayout } from './layout';
import { PALETTE } from './palette';
import { fillShape } from './shapes';
import {
  farSkyline,
  farthestSkyline,
  groundSeam,
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

/**
 * Each range: its skyline, its tones, whether its floor reaches down past the
 * seam's lowest point (the near range's foot lies under the whole seam) or
 * stops at the ground's top, and its sunlit rim's depth; farthest first.
 */
const RANGE_FLOORS = [
  [farthestSkyline, RANGES.farthest, false, 2],
  [farSkyline, RANGES.far, false, 3],
  [nearSkyline, RANGES.near, true, 4],
] as const;
/** How far past the seam's lowest point the near range's foot reaches, so no sliver of sky shows under it. */
const FOOT_OVERLAP = 2;

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
  const seamBottom = Math.max(...groundSeam(layout).map(({ y }) => y));
  for (const [skyline, { lit, foot }, underSeam, rim] of RANGE_FLOORS) {
    const line = skyline(random, layout);
    const floor = underSeam ? seamBottom + FOOT_OVERLAP : layout.groundTop;
    for (const { outline, down } of hillBands(line, floor, HILL_BANDS)) {
      graphics.fillStyle(mix(lit, foot, down));
      fillShape(graphics, outline);
    }
    graphics.fillStyle(ridgeTone(lit));
    for (const quad of litRidge(line, light, rim)) fillShape(graphics, quad);
  }
}

/**
 * The ground from its seam with the near hills to the bottom edge, lit far
 * and deeper near, mottled: bands under the seam, each toned by how far down
 * the ground it starts.
 */
export function paintGround(
  graphics: Phaser.GameObjects.Graphics,
  layout: MeadowLayout,
  random: Random,
): void {
  const { height, groundTop } = layout;
  const seam = groundSeam(layout);
  const top = Math.min(...seam.map(({ y }) => y));
  for (const { outline, down } of hillBands(seam, height, GROUND_BANDS)) {
    const y = top + (height - top) * down * ((GROUND_BANDS - 1) / GROUND_BANDS);
    graphics.fillStyle(groundAt((y - groundTop) / (height - groundTop)));
    fillShape(graphics, outline);
  }
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
 * texture made from `seed` the first time, then one sprite per strip of
 * `grainStrips`, reused on every repaint, the texture lying continuous across
 * the strips.
 */
export function paintGrain(
  scene: Phaser.Scene,
  existing: readonly Phaser.GameObjects.TileSprite[] | undefined,
  layout: MeadowLayout,
  seed: number,
): Phaser.GameObjects.TileSprite[] {
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
  const { width } = layout;
  const top = Math.min(...groundSeam(layout).map(({ y }) => y));
  return grainStrips(layout, top).map(({ top: from, bottom, share }, index) =>
    (existing?.[index] ?? scene.add.tileSprite(0, 0, width, 1, GRAIN_KEY))
      .setOrigin(0, 0)
      .setPosition(0, from)
      .setSize(width, bottom - from)
      .setTileScale(GRAIN_SCALE)
      .setTilePosition(0, from / GRAIN_SCALE)
      .setAlpha(GRAIN_ALPHA * share),
  );
}
