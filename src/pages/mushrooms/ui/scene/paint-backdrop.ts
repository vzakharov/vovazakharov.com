import * as Phaser from 'phaser';

import { OPENING_EYE } from '../../model/ground';
import type { Random } from '../../model/random';
import { DEPTHS } from './backdrop-depths';
import { DUSK_TONES, tonesAt } from './backdrop-tones';
import {
  aboutTheSun,
  type Bake,
  bake,
  type Picture,
  TILE,
} from './bake-picture';
import { onPixels, type Span, SUPERSAMPLE } from './baking';
import { type BrowBlade, browBlades, drawBrow } from './brow';
import { PUFF_REACH } from './cloud-puffs';
import { moonAt, starClear, sunOnScreen } from './dusk-sky';
import { duskStars } from './dusk-stars';
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
  paintRainbow,
  paintSky,
  paintSun,
  paintWash,
} from './paint-sky';
import { driftedAzimuth, placedLeft, screenAt } from './panorama';
import { starImages } from './star-images';
import { SUN_RAY_REACH } from './sun-layout';
import { focusTwins, shade } from './twin-fade';
import { type Following, type View, viewAt } from './view';
import { GROUND_BOB } from './walking';

/** How far past the tips of its rays the sun's picture runs, in CSS px, for their smoothed edge. */
const SUN_MARGIN = 2;
/** The steps per day-to-dusk the hills and the brow are redrawn at as the light turns. */
const LIGHT_STEPS = 64;

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
 * view shows the sun, and the rainbow to where it shows the sky opposite;
 * the clouds go to their azimuths through the view, and the hills and the
 * brow are redrawn through it whenever its heading changes.
 * The ground's pictures, the brow's included, bob with the beds
 * (`GROUND_BOB`). `layers`, the off-list graphics the pictures are baked from,
 * `view` and `drifted` (the clouds' seconds) are kept for a repaint.
 */
export type Backdrop = Following & {
  sky: Picture;
  /** The sky at full dusk, over the day's sky and the glow, shown by its alpha (`relight`). */
  duskSky: Picture;
  /**
   * The dusk sky's stars (`starImages`), fixed on the screen over it:
   * shown with it, but never where the moon's halo reaches as the view
   * stands (`starClear`), since the moon turns with the sun and they do not.
   */
  stars: Phaser.GameObjects.Image[];
  glow: Turning;
  sun: Turning;
  /** The rainbow opposite the sun, shown by its columns' alpha as a shower ends (`rain-view.ts`). */
  rainbow: Turning;
  /** The day's clouds, `visible` while on the screen, unseen by their alpha at full dusk (`relight`). */
  clouds: Phaser.GameObjects.Graphics[];
  /** Each cloud's dusk twin, placed with it and faded in over it toward dusk (`relight`). */
  duskClouds: Phaser.GameObjects.Graphics[];
  /** Each cloud's dark twin, over its dusk twin, placed with it and faded in as it rains (`rain-view.ts`). */
  rainClouds: Phaser.GameObjects.Graphics[];
  hills: HillLayers;
  /** The meadow's brow along the ground's cover row, in front of what sinks under it. */
  brow: Phaser.GameObjects.Graphics;
  /** The heading, and the level in `LIGHT_STEPS`, the hills and the brow were last drawn from. */
  hillsFrom: { heading: number; level: number } | undefined;
  ground: Picture;
  /** The ground's rows at full dusk, over the day's, shown by its alpha (`relight`). */
  duskGround: Picture;
  /** How far toward dusk the backdrop was last lit (`relight`), kept over a repaint. */
  level: number;
  /**
   * Lights the backdrop `level` of the way to dusk (`duskness`): the dusk's
   * pictures, stars and cloud twins faded in over the day's, hiding them at
   * 1, at no repaint; the live hills and brow redrawn whenever it crosses a
   * step of `LIGHT_STEPS`. Runs after `follow`: the stars clear the moon as
   * the view last followed shows it.
   */
  relight: (level: number) => void;
  wash: Turning;
  grain: Phaser.GameObjects.TileSprite[];
  layers: Phaser.GameObjects.Graphics[];
  /** Where each tile of a bake is drawn before it is shrunk into its picture. */
  scratch: Phaser.GameObjects.RenderTexture;
  view: View;
  drifted: number;
};

/**
 * Everything behind the grass: sky, its glow round the sun, the sun, clouds,
 * the rainbow opposite the sun, three hill ranges, the ground and its brow,
 * the sun's wash over the sky and the ground's grain, with the sky and the
 * ground baked a second time at full dusk to lie over the day's. `random`
 * shapes the opening screen's clouds, the hills, the ground's mottling and
 * the grain, so the same source repaints the same meadow. It
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
  /** A layer for one of each cloud's twins, unseen until it is faded in (`twin-fade.ts`), collected into `twins`. */
  const twinLayer =
    (
      twins: Phaser.GameObjects.Graphics[],
      was: readonly Phaser.GameObjects.Graphics[] | undefined,
    ): Layer =>
    () => {
      const graphics = (
        was?.[twins.length] ?? fixedAt('clouds').setAlpha(0).enableFilters()
      ).clear();
      twins.push(graphics);
      return graphics;
    };
  const duskClouds: Phaser.GameObjects.Graphics[] = [];
  const rainClouds: Phaser.GameObjects.Graphics[] = [];
  // Drawn in this order, which is the order `random` is drawn from.
  const skyLayer = layer();
  paintSky(skyLayer, layout);
  const glowLayer = layer();
  const glowSpan = paintGlow(glowLayer, layout);
  const sunLayer = layer();
  paintSun(sunLayer, layout);
  const clouds = paintClouds(
    cloudLayer,
    {
      dusk: twinLayer(duskClouds, existing?.duskClouds),
      rain: twinLayer(rainClouds, existing?.rainClouds),
    },
    layout,
    random,
  );
  for (const spare of [
    ...(existing?.clouds.slice(cloudCount) ?? []),
    ...(existing?.duskClouds.slice(duskClouds.length) ?? []),
    ...(existing?.rainClouds.slice(rainClouds.length) ?? []),
  ]) {
    spare.destroy();
  }
  focusTwins(duskClouds, scene.cameras.main);
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
  const rainbowLayer = layer();
  const arch = paintRainbow(rainbowLayer, layout);
  const duskSkyLayer = layer();
  paintSky(duskSkyLayer, layout, DUSK_TONES);
  const placedStars = duskStars(layout);
  const stars = starImages(scene, existing?.stars, placedStars, ratio);
  const duskGroundLayer = layer();
  paintGround(duskGroundLayer, layout, DUSK_TONES);
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
    picture: 'glow' | 'sun' | 'wash' | 'rainbow',
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
  // A repaint keeps how strongly the rainbow showed; a new one starts unseen.
  const rainbowAlpha = existing?.rainbow.columns[0]?.alpha ?? 0;
  const [archLeft, archRight] = onPixels(
    arch.x - arch.r - arch.band,
    arch.x + arch.r + arch.band,
    ratio,
  );
  const [archTop, archBottom] = onPixels(
    arch.y - arch.r - arch.band,
    arch.y,
    ratio,
  );
  const rainbow = turning('rainbow', {
    span: { left: archLeft, across: archRight - archLeft },
    rows: { top: archTop, bottom: archBottom },
    sources: [rainbowLayer],
  });
  for (const column of rainbow.columns) column.setAlpha(rainbowAlpha);
  const backdrop: Backdrop = {
    sky: baked('sky', existing?.sky, {
      span: screen,
      rows: { top: 0, bottom: height },
      sources: [skyLayer],
    }),
    duskSky: baked('duskSky', existing?.duskSky, {
      span: screen,
      rows: { top: 0, bottom: glowBottom },
      sources: [duskSkyLayer],
    }),
    stars,
    glow: turning('glow', {
      span: { left: glowLeft, across: glowRight - glowLeft },
      rows: { top: 0, bottom: glowBottom },
      sources: [glowLayer],
    }),
    sun: turning('sun', {
      ...aboutTheSun(layout, rays, ratio),
      sources: [sunLayer],
    }),
    rainbow,
    clouds,
    duskClouds,
    rainClouds,
    hills: hillLayers,
    brow,
    hillsFrom: undefined,
    // A repaint keeps how far the dusk had come; a new one opens at day.
    level: existing?.level ?? 0,
    ground: baked('ground', existing?.ground, {
      span: screen,
      rows: groundRows,
      sources: [groundLayer],
      bobbing: GROUND_BOB,
    }),
    duskGround: baked('duskGround', existing?.duskGround, {
      span: screen,
      rows: groundRows,
      sources: [duskGroundLayer],
      bobbing: GROUND_BOB,
    }),
    relight: (level) => {
      backdrop.level = level;
      for (const column of [...backdrop.duskSky, ...backdrop.duskGround]) {
        column.setAlpha(level);
      }
      const moon = moonAt(sunOnScreen(backdrop.view, sun), level);
      for (const [index, graphics] of backdrop.stars.entries()) {
        const star = placedStars[index];
        graphics.setAlpha(star ? level * starClear(star, moon) : 0);
      }
      for (const twin of backdrop.duskClouds) shade(twin, level);
      // At full dusk the opaque twins hide their clouds whole.
      for (const cloud of backdrop.clouds) cloud.setAlpha(level < 1 ? 1 : 0);
      raiseHills(backdrop, hills, blades);
    },
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
      turn(backdrop.rainbow, view, arch.x);
      placeClouds(backdrop, layout);
      raiseHills(backdrop, hills, blades);
    },
  };
  backdrop.follow(backdrop.view);
  backdrop.relight(backdrop.level);
  return backdrop;
}

/**
 * Draws `backdrop`'s hills and its brow as its `view` shows them, toned at
 * its `level` in `LIGHT_STEPS`, unless they were last drawn from that heading
 * at that step.
 */
function raiseHills(
  backdrop: Backdrop,
  hills: Hills,
  blades: readonly BrowBlade[],
): void {
  const { view, hillsFrom: was, hills: layers, brow } = backdrop;
  const { heading } = view.eye;
  const level = Math.round(backdrop.level * LIGHT_STEPS) / LIGHT_STEPS;
  if (was?.heading === heading && was.level === level) return;
  backdrop.hillsFrom = { heading, level };
  const tones = tonesAt(level);
  drawHills(layers, hills, view, tones);
  drawBrow(brow, blades, view, tones);
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
 * Moves `backdrop`'s clouds, and their twins with them, to where they have
 * drifted round the sky by its `drifted`, as its `view` shows them: a cloud
 * past the screen's edges by more than it spreads is hidden.
 */
function placeClouds(
  { clouds: drawn, duskClouds, rainClouds, view, drifted }: Backdrop,
  { clouds, width }: MeadowLayout,
): void {
  for (const [index, graphics] of drawn.entries()) {
    const cloud = clouds[index];
    if (!cloud) continue;
    const x = screenAt(view, driftedAzimuth(cloud, drifted));
    const spread = cloud.r * PUFF_REACH.across;
    const shown = x > -spread && x < width + spread;
    for (const each of [graphics, duskClouds[index], rainClouds[index]]) {
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
