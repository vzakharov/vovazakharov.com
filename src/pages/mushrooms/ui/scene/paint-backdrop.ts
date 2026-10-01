import * as Phaser from 'phaser';

import type { Layered } from '../../model/ground';
import { drift } from '../../model/motion';
import type { Random } from '../../model/random';
import { bakeTiles, pictureColumns, SUPERSAMPLE } from './baking';
import type { Band } from './grain';
import type { MeadowLayout } from './layout';
import { paintGrain, paintGround, paintRanges } from './paint-land';
import {
  type Layer,
  paintClouds,
  paintSky,
  paintSun,
  paintWash,
} from './paint-sky';
import { layerSpan, PARALLAX, type Span } from './parallax';

/**
 * A picture baked in columns side by side, left to right, each texture at
 * most `WIDEST_TEXTURE` texels wide.
 */
type Picture = Phaser.GameObjects.RenderTexture[];

/**
 * The backdrop as the screen shows it: pictures baked once a paint, each in
 * a layer that scrolls at its parallax (`PARALLAX`), and the clouds between
 * them live, since they drift. The sky (sky, halo, sun), the clouds and the
 * sun's wash stand fixed on the screen; the far hills and the near hills
 * slide slower than the ground, and the ground and its grain move with the
 * world. Stacked by `DEPTHS`, sky at the back and the grain over the wash.
 * `layers` are what the pictures are baked from, off the display list, kept
 * so a repaint paints into them again.
 */
export type Backdrop = {
  sky: Picture;
  clouds: Phaser.GameObjects.Graphics[];
  farHills: Picture;
  nearHills: Picture;
  ground: Picture;
  wash: Picture;
  grain: Phaser.GameObjects.TileSprite[];
  layers: Phaser.GameObjects.Graphics[];
  /** Where each tile of a bake is drawn before it is shrunk into its picture. */
  scratch: Phaser.GameObjects.RenderTexture;
};

/** The side of a finished picture's square baked at a time, in texels, so the supersampled scratch stays 2048² whatever the screen. */
const TILE = 1024;

/**
 * Each part of the backdrop's depth, back to front, all under everything in
 * the meadow, so a column a repaint adds stacks where its picture does.
 */
const DEPTHS = {
  sky: -7,
  clouds: -6,
  farHills: -5,
  nearHills: -4,
  ground: -3,
  wash: -2,
  grain: -1,
} as const;

/** The backdrop's baked pictures, by name. */
type Baked = 'sky' | 'farHills' | 'nearHills' | 'ground' | 'wash';

/** What a picture is baked from and where it lies: its layer's stretch, the rows it covers, its scroll factor and its depth. */
type Bake = Layered & {
  sources: readonly Phaser.GameObjects.GameObject[];
  span: Span;
  rows: Band;
  factor: number;
};

/**
 * Bakes `sources`, drawn in CSS pixels, into a picture over `span` and
 * `rows` at `ratio` device pixels each, so a texel lands on one device
 * pixel, reusing `existing`'s columns: column by column, tile by tile, each
 * tile drawn into `scratch` at `SUPERSAMPLE` times that and shrunk into
 * place. The picture scrolls at `factor` and stacks at `depth`.
 */
function bake(
  scene: Phaser.Scene,
  existing: Picture | undefined,
  scratch: Phaser.GameObjects.RenderTexture,
  { sources, span, rows, factor, depth }: Bake,
  ratio: number,
): Picture {
  const columns = pictureColumns(Math.ceil(span.across * ratio));
  for (const spare of existing?.slice(columns.length) ?? []) spare.destroy();
  const tall = Math.max(2, Math.ceil((rows.bottom - rows.top) * ratio));
  scratch.camera.setOrigin(0, 0).setZoom(ratio * SUPERSAMPLE);
  return columns.map(({ left, across }, index) => {
    const picture = (
      existing?.[index] ?? scene.add.renderTexture(0, 0, 2, 2)
    ).setOrigin(0, 0);
    picture.resize(Math.max(2, across), tall);
    picture.camera.setOrigin(0, 0).setZoom(1).setScroll(0, 0);
    const x = span.left + left / ratio;
    picture
      .setPosition(x, rows.top)
      .setScale(1 / ratio)
      .setScrollFactor(factor)
      .setDepth(depth)
      .clear()
      .render();
    for (const tile of bakeTiles(picture.width, picture.height, TILE)) {
      scratch.camera.setScroll(
        x + tile.left / ratio,
        rows.top + tile.top / ratio,
      );
      scratch.clear().draw(sources).render();
      picture.draw(scratch, tile.left, tile.top).render();
    }
    return picture;
  });
}

/**
 * Everything behind the grass: sky, sun, clouds, three hill ranges, the
 * ground, the sun's wash over the land and the ground's grain. `random` shapes
 * the clouds, the hills, the ground's mottling and the grain, so the same
 * source repaints the same meadow. It paints into `existing` and adds only
 * what is missing, so a repaint keeps the objects — and whatever is moving
 * them. Only the clouds are drawn afresh each frame; the rest is baked here
 * and costs a frame a few textured quads and the grain's strips.
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
  let cloudCount = 0;
  const cloudLayer: Layer = () => {
    const graphics = (
      existing?.clouds[cloudCount] ??
      scene.add.graphics().setScrollFactor(0).setDepth(DEPTHS.clouds)
    ).clear();
    cloudCount += 1;
    return graphics;
  };
  // Drawn in this order, which is the order `random` is drawn from.
  const skyLayer = layer();
  paintSky(skyLayer, layout);
  const sunLayer = layer();
  paintSun(sunLayer, layout);
  const clouds = paintClouds(cloudLayer, layout, random);
  const hills = { far: layer(), near: layer() };
  const hillRows = paintRanges(hills, layout, random);
  const groundLayer = layer();
  const groundRows = paintGround(groundLayer, layout, random);
  const washLayer = layer();
  paintWash(washLayer, layout);
  const grain = paintGrain(
    scene,
    existing?.grain,
    layout,
    Math.floor(random() * 2 ** 32),
  );
  for (const strip of grain) strip.setDepth(DEPTHS.grain);
  const scratch = (
    existing?.scratch ??
    scene.make.renderTexture(
      { width: TILE * SUPERSAMPLE, height: TILE * SUPERSAMPLE },
      false,
    )
  )
    .setOrigin(0, 0)
    .setScale(1 / SUPERSAMPLE);
  const { camera, height } = layout;
  const screen = {
    span: layerSpan(camera, PARALLAX.fixed),
    rows: { top: 0, bottom: height },
    factor: PARALLAX.fixed,
  };
  const baked = (picture: Baked, how: Omit<Bake, 'depth'>) =>
    bake(
      scene,
      existing?.[picture],
      scratch,
      { ...how, depth: DEPTHS[picture] },
      ratio,
    );
  const layered = (factor: number) => ({
    span: layerSpan(camera, factor),
    factor,
  });
  const wash = baked('wash', { ...screen, sources: [washLayer] });
  for (const column of wash) column.setBlendMode(Phaser.BlendModes.SCREEN);
  return {
    sky: baked('sky', { ...screen, sources: [skyLayer, sunLayer] }),
    clouds,
    farHills: baked('farHills', {
      ...layered(PARALLAX.far),
      rows: hillRows.far,
      sources: [hills.far],
    }),
    nearHills: baked('nearHills', {
      ...layered(PARALLAX.near),
      rows: hillRows.near,
      sources: [hills.near],
    }),
    ground: baked('ground', {
      ...layered(PARALLAX.ground),
      rows: groundRows,
      sources: [groundLayer],
    }),
    wash,
    grain,
    layers: painted,
    scratch,
  };
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
