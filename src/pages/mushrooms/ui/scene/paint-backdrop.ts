import * as Phaser from 'phaser';

import { drift } from '../../model/motion';
import type { Random } from '../../model/random';
import { bakeTiles, SUPERSAMPLE } from './baking';
import type { MeadowLayout } from './layout';
import { paintGrain, paintGround, paintRanges } from './paint-land';
import {
  type Layer,
  paintClouds,
  paintSky,
  paintSun,
  paintWash,
} from './paint-sky';

/**
 * The backdrop as the screen shows it: three pictures baked once a paint, and
 * the clouds between them live, since they drift. `far` (sky, halo, sun) lies
 * under the clouds, `near` (hills and ground) over them, as the hills stand
 * in front of the sky, and `wash` screens the sun's light over all of it; the
 * grain's strips, already a texture, lie over the wash. `layers` are what the
 * pictures are baked from, off the display list, kept so a repaint paints
 * into them again.
 */
export type Backdrop = {
  far: Phaser.GameObjects.RenderTexture;
  clouds: Phaser.GameObjects.Graphics[];
  near: Phaser.GameObjects.RenderTexture;
  wash: Phaser.GameObjects.RenderTexture;
  grain: Phaser.GameObjects.TileSprite[];
  layers: Phaser.GameObjects.Graphics[];
  /** Where each tile of a bake is drawn before it is shrunk into its picture. */
  scratch: Phaser.GameObjects.RenderTexture;
};

/** The side of a finished picture's square baked at a time, in texels, so the supersampled scratch stays 2048² whatever the screen. */
const TILE = 1024;

/** A picture the size of the screen, one texel to a device pixel, laid at the origin. */
function bakedPicture(
  scene: Phaser.Scene,
  existing: Phaser.GameObjects.RenderTexture | undefined,
): Phaser.GameObjects.RenderTexture {
  return existing ?? scene.add.renderTexture(0, 0, 2, 2).setOrigin(0, 0);
}

/**
 * Bakes `sources`, drawn in CSS pixels, into `picture` at `ratio` device
 * pixels each, so a texel lands on one device pixel: tile by tile, each tile
 * drawn into `scratch` at `SUPERSAMPLE` times that and shrunk into place.
 */
function bake(
  picture: Phaser.GameObjects.RenderTexture,
  scratch: Phaser.GameObjects.RenderTexture,
  sources: readonly Phaser.GameObjects.GameObject[],
  { width, height }: MeadowLayout,
  ratio: number,
): void {
  picture.resize(Math.ceil(width * ratio), Math.ceil(height * ratio));
  picture.camera.setOrigin(0, 0).setZoom(1).setScroll(0, 0);
  picture
    .setPosition(0, 0)
    .setScale(1 / ratio)
    .clear()
    .render();
  scratch.camera.setOrigin(0, 0).setZoom(ratio * SUPERSAMPLE);
  for (const { left, top } of bakeTiles(picture.width, picture.height, TILE)) {
    scratch.camera.setScroll(left / ratio, top / ratio);
    scratch.clear().draw(sources).render();
    picture.draw(scratch, left, top).render();
  }
}

/**
 * Everything behind the grass: sky, sun, clouds, three hill ranges, the
 * ground, the sun's wash over the land and the ground's grain. `random` shapes
 * the clouds, the hills, the ground's mottling and the grain, so the same
 * source repaints the same meadow. It paints into `existing` and adds only
 * what is missing, so a repaint keeps the objects — and whatever is moving
 * them. Only the clouds are drawn afresh each frame; the rest is baked here
 * and costs a frame three textured quads and the grain's strips.
 */
export function paintBackdrop(
  scene: Phaser.Scene,
  existing: Backdrop | undefined,
  layout: MeadowLayout,
  random: Random,
  ratio: number,
): Backdrop {
  const painted: Phaser.GameObjects.Graphics[] = [];
  const layer: Layer = () => {
    const graphics = (
      existing?.layers[painted.length] ?? scene.make.graphics({}, false)
    )
      .clear()
      .setPosition(0, 0)
      .setBlendMode(Phaser.BlendModes.NORMAL);
    painted.push(graphics);
    return graphics;
  };
  // Made in the order they stack, the first paint adding them in turn.
  const far = bakedPicture(scene, existing?.far);
  let cloudCount = 0;
  const cloudLayer: Layer = () => {
    const graphics = (
      existing?.clouds[cloudCount] ?? scene.add.graphics()
    ).clear();
    cloudCount += 1;
    return graphics;
  };
  paintSky(layer(), layout);
  paintSun(layer(), layout);
  const farLayers = painted.length;
  const clouds = paintClouds(cloudLayer, layout, random);
  const near = bakedPicture(scene, existing?.near);
  const wash = bakedPicture(scene, existing?.wash).setBlendMode(
    Phaser.BlendModes.SCREEN,
  );
  paintRanges(layer(), layout, random);
  paintGround(layer(), layout, random);
  const washLayer = layer();
  paintWash(washLayer, layout);
  const grain = paintGrain(
    scene,
    existing?.grain,
    layout,
    Math.floor(random() * 2 ** 32),
  );
  const scratch = (
    existing?.scratch ??
    scene.make.renderTexture(
      { width: TILE * SUPERSAMPLE, height: TILE * SUPERSAMPLE },
      false,
    )
  )
    .setOrigin(0, 0)
    .setScale(1 / SUPERSAMPLE);
  bake(far, scratch, painted.slice(0, farLayers), layout, ratio);
  bake(near, scratch, painted.slice(farLayers, -1), layout, ratio);
  bake(wash, scratch, [washLayer], layout, ratio);
  return { far, clouds, near, wash, grain, layers: painted, scratch };
}

/** How far a cloud drifts each second, in CSS pixels, the nearest fastest. */
const CLOUD_SPEEDS = [7, 4, 5.5];

/** Moves `backdrop`'s clouds to where they have drifted across `layout` by `t`, in seconds. */
export function driftClouds(
  backdrop: Backdrop,
  { width, clouds }: MeadowLayout,
  t: number,
): void {
  for (const [index, graphics] of backdrop.clouds.entries()) {
    const cloud = clouds[index];
    if (!cloud) continue;
    const { x, r } = cloud;
    const margin = r * 4;
    graphics.x =
      drift(
        x + margin,
        CLOUD_SPEEDS[index % CLOUD_SPEEDS.length] ?? 5,
        t,
        width + margin * 2,
      ) - margin;
  }
}
