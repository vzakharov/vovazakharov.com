import * as Phaser from 'phaser';

import type { Random } from '../../model/random';
import type { MeadowLayout } from './layout';
import { paintGrain, paintGround, paintRanges } from './paint-land';
import {
  type Layer,
  paintClouds,
  paintSky,
  paintSun,
  paintWash,
} from './paint-sky';

/** The backdrop's objects in painting order, which of them are clouds, and the grain over them all. */
export type Backdrop = {
  layers: Phaser.GameObjects.Graphics[];
  clouds: Phaser.GameObjects.Graphics[];
  grain: Phaser.GameObjects.TileSprite;
};

/**
 * Everything behind the grass: sky, sun, clouds, three hill ranges, the
 * ground, the sun's wash over the land and the ground's grain. `random` shapes
 * the clouds, the hills, the ground's mottling and the grain, so the same
 * source repaints the same meadow. It paints into `existing`, in the order a
 * previous call returned them, and adds only what is missing, so a repaint
 * keeps the objects — and whatever is moving them.
 */
export function paintBackdrop(
  scene: Phaser.Scene,
  existing: Backdrop | undefined,
  layout: MeadowLayout,
  random: Random,
): Backdrop {
  const painted: Phaser.GameObjects.Graphics[] = [];
  const layer: Layer = () => {
    const graphics = (existing?.layers[painted.length] ?? scene.add.graphics())
      .clear()
      .setPosition(0, 0)
      .setBlendMode(Phaser.BlendModes.NORMAL);
    painted.push(graphics);
    return graphics;
  };
  paintSky(layer(), layout);
  paintSun(layer(), layout);
  const clouds = paintClouds(layer, layout, random);
  paintRanges(layer(), layout, random);
  paintGround(layer(), layout, random);
  paintWash(layer(), layout);
  const grain = paintGrain(
    scene,
    existing?.grain,
    layout,
    Math.floor(random() * 2 ** 32),
  );
  return { layers: painted, clouds, grain };
}
