import * as Phaser from 'phaser';

import { type Layered, OPENING_EYE } from '../../model/ground';
import type { Random } from '../../model/random';
import { bakeTiles, onPixels, pictureColumns, SUPERSAMPLE } from './baking';
import type { Band } from './grain';
import type { MeadowLayout } from './layout';
import { paintGrain, paintGround, paintRanges } from './paint-land';
import {
  type Layer,
  paintClouds,
  paintGlow,
  paintSky,
  paintSun,
  paintWash,
} from './paint-sky';
import { driftedAzimuth, placedLeft, screenAt } from './panorama';
import { layerSpan, PARALLAX, type Span } from './parallax';
import { SUN_RAY_REACH } from './sun-layout';
import { type Following, type View, viewAt } from './view';

/** How far a cloud's puffs spread either side of its middle, in its radii. */
const CLOUD_SPREAD = 4;
/** How far past the tips of its rays the sun's picture runs, in CSS px, for their smoothed edge. */
const SUN_MARGIN = 2;

/**
 * A picture baked in columns side by side, left to right, each texture at
 * most `WIDEST_TEXTURE` texels wide.
 */
type Picture = Phaser.GameObjects.RenderTexture[];

/**
 * A picture baked round the sun, which turns with it: its columns, the
 * stretch across the opening screen it was baked over, and each column's
 * left edge from that stretch's.
 */
type Turning = { columns: Picture; home: Span; offsets: number[] };

/**
 * The backdrop as the screen shows it: pictures baked once a paint, and the
 * clouds live, since they drift. The bare sky stands fixed on the screen;
 * the sky's glow round the sun, the sun and its wash over the sky are each
 * a picture of their own that `follow` slides to where the view shows the
 * sun, and the clouds go to their azimuths through the same view. The far
 * hills and the near hills slide slower than the ground as the crop pans,
 * and the ground and its grain move with the world. Stacked by `DEPTHS`, sky
 * at the back and the grain over the wash. `layers` are what the pictures
 * are baked from, off the display list, kept so a repaint paints into them
 * again; `view` is the view last followed and `drifted` how many seconds the
 * clouds have drifted, both kept across a repaint.
 */
export type Backdrop = Following & {
  sky: Picture;
  glow: Turning;
  sun: Turning;
  clouds: Phaser.GameObjects.Graphics[];
  farHills: Picture;
  nearHills: Picture;
  ground: Picture;
  wash: Turning;
  grain: Phaser.GameObjects.TileSprite[];
  layers: Phaser.GameObjects.Graphics[];
  /** Where each tile of a bake is drawn before it is shrunk into its picture. */
  scratch: Phaser.GameObjects.RenderTexture;
  view: View;
  drifted: number;
};

/** The side of a finished picture's square baked at a time, in texels, so the supersampled scratch stays 2048² whatever the screen. */
const TILE = 1024;

/**
 * Each part of the backdrop's depth, back to front, all under everything in
 * the meadow, so a column a repaint adds stacks where its picture does.
 */
const DEPTHS = {
  sky: -9,
  glow: -8,
  sun: -7,
  clouds: -6,
  farHills: -5,
  nearHills: -4,
  ground: -3,
  wash: -2,
  grain: -1,
} as const;

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

/** The stretch across and the rows `from` to `to` either way of the sun's middle, on whole device pixels, never above the screen's top. */
function aboutTheSun(
  { sun }: MeadowLayout,
  across: readonly [number, number],
  down: readonly [number, number],
  ratio: number,
): Pick<Bake, 'span' | 'rows'> {
  const [left, right] = onPixels(sun.x + across[0], sun.x + across[1], ratio);
  const [top, bottom] = onPixels(
    Math.max(0, sun.y + down[0]),
    sun.y + down[1],
    ratio,
  );
  return { span: { left, across: right - left }, rows: { top, bottom } };
}

/**
 * Everything behind the grass: sky, its glow round the sun, the sun, clouds,
 * three hill ranges, the ground, the sun's wash over the sky and the ground's
 * grain. `random` shapes the opening screen's clouds, the hills, the ground's
 * mottling and the grain, so the same source repaints the same meadow. It
 * paints into `existing` and adds only what is missing, so a repaint keeps
 * the objects — and whatever is moving them — and the view and the drift
 * they were placed by. Only the clouds are drawn afresh each frame; the rest
 * is baked here and costs a frame a few textured quads and the grain's
 * strips.
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
  const glowLayer = layer();
  const glowSpan = paintGlow(glowLayer, layout);
  const sunLayer = layer();
  paintSun(sunLayer, layout);
  const clouds = paintClouds(cloudLayer, layout, random);
  for (const spare of existing?.clouds.slice(cloudCount) ?? []) spare.destroy();
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
  const { camera, height, nearHills, sun, wash: rings } = layout;
  const baked = (
    picture: keyof typeof DEPTHS,
    was: Picture | undefined,
    how: Omit<Bake, 'depth'>,
  ) => bake(scene, was, scratch, { ...how, depth: DEPTHS[picture] }, ratio);
  const turning = (
    picture: 'glow' | 'sun' | 'wash',
    how: Omit<Bake, 'depth' | 'factor'>,
  ): Turning => {
    const columns = baked(picture, existing?.[picture].columns, {
      ...how,
      factor: PARALLAX.fixed,
    });
    return {
      columns,
      home: how.span,
      offsets: columns.map(({ x }) => x - how.span.left),
    };
  };
  const layered = (factor: number) => ({
    span: layerSpan(camera, factor),
    factor,
  });
  const [glowLeft, glowRight] = onPixels(
    glowSpan.left,
    glowSpan.left + glowSpan.across,
    ratio,
  );
  const [, glowBottom] = onPixels(0, nearHills, ratio);
  const rays = sun.r * SUN_RAY_REACH + SUN_MARGIN;
  const outer = Math.max(...rings);
  const wash = turning('wash', {
    ...aboutTheSun(layout, [-outer, outer], [-outer, outer], ratio),
    sources: [washLayer],
  });
  for (const column of wash.columns) {
    column.setBlendMode(Phaser.BlendModes.SCREEN);
  }
  const backdrop: Backdrop = {
    sky: baked('sky', existing?.sky, {
      span: layerSpan(camera, PARALLAX.fixed),
      rows: { top: 0, bottom: height },
      factor: PARALLAX.fixed,
      sources: [skyLayer],
    }),
    glow: turning('glow', {
      span: { left: glowLeft, across: glowRight - glowLeft },
      rows: { top: 0, bottom: glowBottom },
      sources: [glowLayer],
    }),
    sun: turning('sun', {
      ...aboutTheSun(layout, [-rays, rays], [-rays, rays], ratio),
      sources: [sunLayer],
    }),
    clouds,
    farHills: baked('farHills', existing?.farHills, {
      ...layered(PARALLAX.far),
      rows: hillRows.far,
      sources: [hills.far],
    }),
    nearHills: baked('nearHills', existing?.nearHills, {
      ...layered(PARALLAX.near),
      rows: hillRows.near,
      sources: [hills.near],
    }),
    ground: baked('ground', existing?.ground, {
      ...layered(PARALLAX.ground),
      rows: groundRows,
      sources: [groundLayer],
    }),
    wash,
    grain,
    layers: painted,
    scratch,
    view: viewAt(camera, existing?.view.eye ?? OPENING_EYE),
    drifted: existing?.drifted ?? 0,
    follow: (view) => {
      backdrop.view = view;
      for (const picture of [backdrop.glow, backdrop.sun, backdrop.wash]) {
        turn(picture, view, sun.x);
      }
      placeClouds(backdrop, layout);
    },
  };
  backdrop.follow(backdrop.view);
  return backdrop;
}

/** Slides `picture`, baked round the opening x `at`, to where `view` shows `at`, or hides it. */
function turn({ columns, home, offsets }: Turning, view: View, at: number) {
  const left = placedLeft(view, at, home);
  for (const [index, column] of columns.entries()) {
    column.setVisible(left !== undefined);
    if (left !== undefined) column.x = left + (offsets[index] ?? 0);
  }
}

/**
 * Moves `backdrop`'s clouds to where they have drifted round the sky by its
 * `drifted`, as its `view` shows them: a cloud behind the eye, or past the
 * screen's edges by more than it spreads, is hidden.
 */
function placeClouds(
  { clouds: drawn, view, drifted }: Backdrop,
  { clouds, width }: MeadowLayout,
): void {
  for (const [index, graphics] of drawn.entries()) {
    const cloud = clouds[index];
    if (!cloud) continue;
    const x = screenAt(view, driftedAzimuth(cloud, drifted));
    const spread = cloud.r * CLOUD_SPREAD;
    const shown = x !== undefined && x > -spread && x < width + spread;
    graphics.setVisible(shown);
    if (shown) graphics.x = x;
  }
}

/** Drifts `backdrop`'s clouds round the sky to where they are `t` seconds into the visit, through the view it last followed. */
export function driftClouds(
  backdrop: Backdrop,
  layout: MeadowLayout,
  t: number,
): void {
  backdrop.drifted = t;
  placeClouds(backdrop, layout);
}
