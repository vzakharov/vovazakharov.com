import type * as Phaser from 'phaser';

import { type Light, sunLight } from '../../model/light';
import type { Random } from '../../model/random';
import { groundAt, RANGES, ridgeTone } from './backdrop-tones';
import { mix } from './colour';
import { type Band, grainPixels, grainStrips, mottles } from './grain';
import type { MeadowLayout } from './layout';
import { PALETTE } from './palette';
import { type Crest, crestAcross } from './panorama';
import { layerSpan, PARALLAX } from './parallax';
import { fillShape } from './shapes';
import {
  farSkyline,
  farthestSkyline,
  groundSeam,
  HILL_STEPS,
  hillBands,
  litRidge,
  nearSkyline,
  SEAM_STEPS,
  seamCrest,
  seamReach,
} from './skyline';
import type { View } from './view';

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
/** How far past either edge of the screen the hills are drawn, in CSS px, so no rim or band stops short of it. */
const HILL_MARGIN = 4;
/** How far past the seam's lowest point the near range's foot reaches, so no sliver of sky shows under it. */
const FOOT_OVERLAP = 2;

/** The two layers the hills are drawn into: the farthest and far ranges, and the near one under the far. */
export type HillLayers = Record<'far' | 'near', Phaser.GameObjects.Graphics>;

/** A range as it is drawn: its skyline round the panorama, its tones, the layer it lies in and its sunlit rim's depth. */
type Range = {
  crest: Crest;
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
      near: layout.groundTop + seamReach(layout) + FOOT_OVERLAP,
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
 * The ground across the world from its seam with the near hills to the
 * bottom edge, lit far and deeper near, mottled: bands under the seam, each
 * toned by how far down the ground it starts. Returns the rows it covers.
 */
export function paintGround(
  graphics: Phaser.GameObjects.Graphics,
  layout: MeadowLayout,
  random: Random,
): Band {
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
  return { top, bottom: height };
}

/**
 * The grain over the ground across the world, under the grass and every
 * creature, scrolling with the ground: one tile texture made from `seed` the
 * first time, then one sprite per strip of `grainStrips`, reused on every
 * repaint, the texture lying continuous across the strips.
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
  const { left, across } = layerSpan(layout.camera, PARALLAX.ground);
  const top = Math.min(...groundSeam(layout).map(({ y }) => y));
  return grainStrips(layout, top).map(({ top: from, bottom, share }, index) =>
    (existing?.[index] ?? scene.add.tileSprite(0, 0, across, 1, GRAIN_KEY))
      .setOrigin(0, 0)
      .setPosition(left, from)
      .setSize(across, bottom - from)
      .setTileScale(GRAIN_SCALE)
      .setTilePosition(0, from / GRAIN_SCALE)
      .setAlpha(GRAIN_ALPHA * share),
  );
}
