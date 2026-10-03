import * as Phaser from 'phaser';

import { type Layered, OPENING_EYE } from '../../model/ground';
import type { Random } from '../../model/random';
import { DEPTHS } from './backdrop-depths';
import {
  bakeTiles,
  onPixels,
  pictureColumns,
  type Span,
  SUPERSAMPLE,
} from './baking';
import { type BrowBlade, browBlades, drawBrow } from './brow';
import type { Band } from './grain';
import type { MeadowLayout } from './layout';
import {
  drawHills,
  type HillLayers,
  type Hills,
  hillsOf,
  paintGrain,
  paintGround,
} from './paint-land';
import {
  type Layer,
  paintClouds,
  paintGlow,
  paintSky,
  paintSun,
  paintWash,
} from './paint-sky';
import { driftedAzimuth, placedLeft, screenAt } from './panorama';
import { CLOUD_SPREAD } from './rain-sky';
import { SUN_RAY_REACH } from './sun-layout';
import { type Following, type View, viewAt } from './view';
import { GROUND_BOB } from './walking';

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
 * The backdrop as the screen shows it. The bare sky and the ground's rows and
 * grain stand fixed on the screen, which a step or a turn leaves as they are;
 * the glow, the sun and its wash are pictures `follow` slides to where the
 * view shows the sun; the clouds go to their azimuths through the view, and
 * the hills and the brow are redrawn through it whenever its heading changes.
 * The ground's pictures, the brow's included, bob with the beds
 * (`GROUND_BOB`). `layers`, the off-list graphics the pictures are baked from,
 * `view` and `drifted` (the clouds' seconds) are kept for a repaint.
 */
export type Backdrop = Following & {
  sky: Picture;
  glow: Turning;
  sun: Turning;
  clouds: Phaser.GameObjects.Graphics[];
  /** Each cloud's dark twin, placed with it and shown by its alpha as it rains (`rain-view.ts`). */
  rainClouds: Phaser.GameObjects.Graphics[];
  hills: HillLayers;
  /** The meadow's brow along the ground's cover row, in front of what sinks under it. */
  brow: Phaser.GameObjects.Graphics;
  /** The heading the hills and the brow were last drawn from. */
  hillsFrom: number | undefined;
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
 * What a picture is baked from and where it lies: its stretch across the
 * screen, the rows it covers, its depth, and how much of the camera's bob it
 * takes (`GROUND_BOB` for the ground's, none for the sky's).
 */
type Bake = Layered & {
  sources: readonly Phaser.GameObjects.GameObject[];
  span: Span;
  rows: Band;
  bobbing?: number;
};

/**
 * Bakes `sources`, drawn in CSS pixels, into a picture over `span` and
 * `rows` at `ratio` device pixels each, so a texel lands on one device
 * pixel, reusing `existing`'s columns: column by column, tile by tile, each
 * tile drawn into `scratch` at `SUPERSAMPLE` times that and shrunk into
 * place. The picture stands on the screen, bobbing by `bobbing`, and stacks
 * at `depth`.
 */
function bake(
  scene: Phaser.Scene,
  existing: Picture | undefined,
  scratch: Phaser.GameObjects.RenderTexture,
  { sources, span, rows, depth, bobbing = 0 }: Bake,
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
      .setScrollFactor(0, bobbing)
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

/** The square `reach` either way of the sun's middle, across and down, on whole device pixels, never above the screen's top. */
function aboutTheSun(
  { sun }: MeadowLayout,
  reach: number,
  ratio: number,
): Pick<Bake, 'span' | 'rows'> {
  const [left, right] = onPixels(sun.x - reach, sun.x + reach, ratio);
  const [top, bottom] = onPixels(
    Math.max(0, sun.y - reach),
    sun.y + reach,
    ratio,
  );
  return { span: { left, across: right - left }, rows: { top, bottom } };
}

/**
 * Everything behind the grass: sky, its glow round the sun, the sun, clouds,
 * three hill ranges, the ground and its brow, the sun's wash over the sky and the ground's
 * grain. `random` shapes the opening screen's clouds, the hills, the ground's
 * mottling and the grain, so the same source repaints the same meadow. It
 * paints into `existing` and adds only what is missing, so a repaint keeps
 * the objects — and whatever is moving them — and the view and the drift
 * they were placed by. All but the clouds, the hills and the brow is baked
 * here, and costs a frame a few textured quads and the grain's strips.
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
  /** A graphics standing fixed on the screen at `part`'s depth. */
  const fixedAt = (part: keyof typeof DEPTHS) =>
    scene.add.graphics().setScrollFactor(0).setDepth(DEPTHS[part]);
  let cloudCount = 0;
  const cloudLayer: Layer = () => {
    const graphics = (
      existing?.clouds[cloudCount] ?? fixedAt('clouds')
    ).clear();
    cloudCount += 1;
    return graphics;
  };
  const rainClouds: Phaser.GameObjects.Graphics[] = [];
  const twinLayer: Layer = () => {
    const graphics = (
      existing?.rainClouds[rainClouds.length] ??
      fixedAt('clouds').setAlpha(0).enableFilters()
    ).clear();
    rainClouds.push(graphics);
    return graphics;
  };
  // Drawn in this order, which is the order `random` is drawn from.
  const skyLayer = layer();
  paintSky(skyLayer, layout);
  const glowLayer = layer();
  const glowSpan = paintGlow(glowLayer, layout);
  const sunLayer = layer();
  paintSun(sunLayer, layout);
  const clouds = paintClouds(cloudLayer, twinLayer, layout, random);
  for (const spare of [
    ...(existing?.clouds.slice(cloudCount) ?? []),
    ...(existing?.rainClouds.slice(rainClouds.length) ?? []),
  ]) {
    spare.destroy();
  }
  const { camera, width, height, nearHills, sun, wash: rings } = layout;
  const hills = hillsOf(layout, random);
  const hillLayers: HillLayers = existing?.hills ?? {
    far: fixedAt('farHills'),
    near: fixedAt('nearHills'),
  };
  const brow =
    existing?.brow ??
    scene.add.graphics().setScrollFactor(0, GROUND_BOB).setDepth(DEPTHS.brow);
  const blades = browBlades(camera);
  const groundLayer = layer();
  const groundRows = paintGround(groundLayer, layout);
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
  const screen = { left: 0, across: width };
  const baked = (
    picture: keyof typeof DEPTHS,
    was: Picture | undefined,
    how: Omit<Bake, 'depth'>,
  ) => bake(scene, was, scratch, { ...how, depth: DEPTHS[picture] }, ratio);
  const turning = (
    picture: 'glow' | 'sun' | 'wash',
    how: Omit<Bake, 'depth'>,
  ): Turning => {
    const columns = baked(picture, existing?.[picture].columns, how);
    return {
      columns,
      home: how.span,
      offsets: columns.map(({ x }) => x - how.span.left),
    };
  };
  const [glowLeft, glowRight] = onPixels(
    glowSpan.left,
    glowSpan.left + glowSpan.across,
    ratio,
  );
  const [, glowBottom] = onPixels(0, nearHills, ratio);
  const rays = sun.r * SUN_RAY_REACH + SUN_MARGIN;
  const outer = Math.max(...rings);
  const wash = turning('wash', {
    ...aboutTheSun(layout, outer, ratio),
    sources: [washLayer],
  });
  for (const column of wash.columns) {
    column.setBlendMode(Phaser.BlendModes.SCREEN);
  }
  const backdrop: Backdrop = {
    sky: baked('sky', existing?.sky, {
      span: screen,
      rows: { top: 0, bottom: height },
      sources: [skyLayer],
    }),
    glow: turning('glow', {
      span: { left: glowLeft, across: glowRight - glowLeft },
      rows: { top: 0, bottom: glowBottom },
      sources: [glowLayer],
    }),
    sun: turning('sun', {
      ...aboutTheSun(layout, rays, ratio),
      sources: [sunLayer],
    }),
    clouds,
    rainClouds,
    hills: hillLayers,
    brow,
    hillsFrom: undefined,
    ground: baked('ground', existing?.ground, {
      span: screen,
      rows: groundRows,
      sources: [groundLayer],
      bobbing: GROUND_BOB,
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
      raiseHills(backdrop, hills, blades, view);
    },
  };
  backdrop.follow(backdrop.view);
  return backdrop;
}

/** Draws `backdrop`'s hills and its brow as `view` shows them, unless they were last drawn from its heading. */
function raiseHills(
  backdrop: Backdrop,
  hills: Hills,
  blades: readonly BrowBlade[],
  view: View,
): void {
  if (backdrop.hillsFrom === view.eye.heading) return;
  backdrop.hillsFrom = view.eye.heading;
  drawHills(backdrop.hills, hills, view);
  drawBrow(backdrop.brow, blades, view);
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
 * Moves `backdrop`'s clouds, and their dark twins with them, to where they
 * have drifted round the sky by its `drifted`, as its `view` shows them: a
 * cloud past the screen's edges by more than it spreads is hidden.
 */
function placeClouds(
  { clouds: drawn, rainClouds, view, drifted }: Backdrop,
  { clouds, width }: MeadowLayout,
): void {
  for (const [index, graphics] of drawn.entries()) {
    const cloud = clouds[index];
    if (!cloud) continue;
    const x = screenAt(view, driftedAzimuth(cloud, drifted));
    const spread = cloud.r * CLOUD_SPREAD;
    const shown = x > -spread && x < width + spread;
    for (const each of [graphics, rainClouds[index]]) {
      each?.setVisible(shown);
      if (each && shown) each.x = x;
    }
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
