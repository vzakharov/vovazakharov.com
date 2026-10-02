import type * as Phaser from 'phaser';

import { type Light, sunLight } from '../../model/light';
import type { Random } from '../../model/random';
import { GROUND_BANDS, groundRowAt, RANGES, ridgeTone } from './backdrop-tones';
import { browFloor, nearFoot } from './brow';
import { mix } from './colour';
import { type Band, grainPixels, grainStrips } from './grain';
import type { MeadowLayout } from './layout';
import { type Crest, crestAcross, type WithCrest } from './panorama';
import { fillShape } from './shapes';
import {
  farSkyline,
  farthestSkyline,
  HILL_STEPS,
  hillBands,
  litRidge,
  nearSkyline,
  SEAM_STEPS,
  seamCrest,
  seamTop,
} from './skyline';
import type { View } from './view';
import { GROUND_BOB } from './walking';

const HILL_BANDS = 16;
const GRAIN_KEY = 'grain';
const GRAIN_SIDE = 256;
const GRAIN_ALPHA = 0.07;
/** CSS pixels per grain texel. */
const GRAIN_SCALE = 1;
/** How far past either edge of the screen the hills are drawn, in CSS px, so no rim or band stops short of it. */
const HILL_MARGIN = 4;
/** The two layers the hills are drawn into: the farthest and far ranges, and the near one under the far. */
export type HillLayers = Record<'far' | 'near', Phaser.GameObjects.Graphics>;

/** A range as it is drawn: its skyline round the panorama, its tones, the layer it lies in and its sunlit rim's depth. */
type Range = WithCrest & {
  tones: (typeof RANGES)[keyof typeof RANGES];
  layer: keyof HillLayers;
  rim: number;
};

/**
 * The hills round the panorama, ready to draw from any heading: the three
 * ranges, farthest first, the seam along the near range's foot, how far
 * down each layer reaches, and the light their rims face, as it stands at
 * the opening.
 */
export type Hills = {
  ranges: Range[];
  seam: Crest;
  floors: Record<keyof HillLayers, number>;
  light: Light;
};

/**
 * The hills' ranges, their phases drawn from `random` farthest first, so the
 * same source raises the same hills: the farthest and far ranges stop at the
 * ground's top, the near one reaches under the whole seam.
 */
export function hillsOf(layout: MeadowLayout, random: Random): Hills {
  const ranges: Range[] = [
    {
      crest: farthestSkyline(random, layout),
      tones: RANGES.farthest,
      layer: 'far',
      rim: 2,
    },
    {
      crest: farSkyline(random, layout),
      tones: RANGES.far,
      layer: 'far',
      rim: 3,
    },
    {
      crest: nearSkyline(random, layout),
      tones: RANGES.near,
      layer: 'near',
      rim: 4,
    },
  ];
  return {
    ranges,
    seam: seamCrest(layout),
    floors: {
      far: layout.groundTop,
      near: nearFoot(layout.camera),
    },
    light: sunLight(layout),
  };
}

/**
 * The hills as `view` shows them, into `layers`, cleared first: each range
 * nearer the air the farther it stands and paling into the mist at its foot,
 * its slopes that face the sun rimmed with light, and the near range's foot
 * meeting the ground along the seam, in the ground's own colour there.
 */
export function drawHills(
  layers: HillLayers,
  { ranges, seam, floors, light }: Hills,
  view: View,
): void {
  for (const graphics of Object.values(layers)) graphics.clear();
  for (const { crest, tones, layer, rim } of ranges) {
    const graphics = layers[layer];
    const line = crestAcross(crest, view, HILL_STEPS, HILL_MARGIN);
    for (const { outline, down } of hillBands(
      line,
      floors[layer],
      HILL_BANDS,
    )) {
      graphics.fillStyle(mix(tones.lit, tones.foot, down));
      fillShape(graphics, outline);
    }
    graphics.fillStyle(ridgeTone(tones.lit));
    for (const quad of litRidge(line, light, rim)) fillShape(graphics, quad);
  }
  const seamLine = crestAcross(seam, view, SEAM_STEPS, HILL_MARGIN);
  layers.near.fillStyle(RANGES.near.foot);
  fillShape(layers.near, [
    ...seamLine,
    { x: seamLine.at(-1)?.x ?? view.width, y: floors.near },
    { x: seamLine[0]?.x ?? 0, y: floors.near },
  ]);
}

/**
 * The ground as the screen shows it, from any heading: rows from below the
 * brow and the seam (`browFloor`) to the bottom edge, lit far and deeper
 * near, each toned by how far down the ground it lies (`groundRowAt`). Above
 * them the brow draws the ground on down from itself, and the near range's
 * foot fills the seam and the far ground beyond the brow. Returns the rows it
 * covers.
 */
export function paintGround(
  graphics: Phaser.GameObjects.Graphics,
  layout: MeadowLayout,
): Band {
  const { width, height, camera } = layout;
  const top = seamTop(layout);
  const from = browFloor(camera);
  const step = (height - top) / GROUND_BANDS;
  for (let band = 0; band < GROUND_BANDS; band++) {
    const [y0, y1] = [
      Math.max(from, top + band * step),
      top + (band + 1) * step,
    ];
    if (y1 <= y0) continue;
    graphics.fillStyle(groundRowAt(layout, top + (band + 0.5) * step));
    graphics.fillRect(0, y0, width, y1 - y0);
  }
  return { top: from, bottom: height };
}

/**
 * The grain over the ground, standing on the screen and bobbing with the
 * ground (`GROUND_BOB`), under the grass and every creature: one tile texture made from `seed` the first time, then one
 * sprite per strip of `grainStrips` from where the seam rises highest,
 * reused on every repaint, the texture lying continuous across the strips.
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
  const top = seamTop(layout);
  return grainStrips(layout, top).map(({ top: from, bottom, share }, index) =>
    (existing?.[index] ?? scene.add.tileSprite(0, 0, width, 1, GRAIN_KEY))
      .setOrigin(0, 0)
      .setScrollFactor(0, GROUND_BOB)
      .setPosition(0, from)
      .setSize(width, bottom - from)
      .setTileScale(GRAIN_SCALE)
      .setTilePosition(0, from / GRAIN_SCALE)
      .setAlpha(GRAIN_ALPHA * share),
  );
}
