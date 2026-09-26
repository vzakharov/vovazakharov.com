import * as Phaser from 'phaser';

import type { Point } from '../../model/geometry';
import { between, type Random } from '../../model/random';
import { type MeadowLayout, SUN_GLOW_REACH } from './layout';
import { PALETTE } from './palette';
import { fillShape, petal, sample } from './shapes';

const SKY_BANDS = 48;
const GROUND_BANDS = 12;
const HILL_STEPS = 64;
const SUN_RAYS = 16;
const GLOW_RINGS = 14;
/** Each glow ring's alpha at the innermost, fading to none at the outermost. */
const GLOW_ALPHA = 0.05;
/** The next graphics object to paint into, in painting order. */
type Layer = () => Phaser.GameObjects.Graphics;

const TUFTS_PER_1000PX = 52;
const SEAM_TUFTS_PER_1000PX = 40;
/** Where a hill's shaded lower part begins, as a fraction of its height. */
const HILL_SHADE_FROM = 0.55;

function mix(from: number, to: number, t: number): number {
  const a = Phaser.Display.Color.IntegerToColor(from);
  const b = Phaser.Display.Color.IntegerToColor(to);
  return Phaser.Display.Color.GetColor(
    a.red + (b.red - a.red) * t,
    a.green + (b.green - a.green) * t,
    a.blue + (b.blue - a.blue) * t,
  );
}

/** Horizontal bands from `top` to `bottom`, blending `from` into `to`. */
function fillBands(
  graphics: Phaser.GameObjects.Graphics,
  width: number,
  [top, bottom]: readonly [number, number],
  [from, to]: readonly [number, number],
  bands: number,
  ease = 1,
): void {
  const band = (bottom - top) / bands;
  for (let index = 0; index < bands; index++) {
    graphics.fillStyle(mix(from, to, (index / (bands - 1)) ** ease));
    graphics.fillRect(0, top + index * band, width, band + 1);
  }
}

/** A rolling skyline from a sum of two waves, its phases drawn from `random`. */
function hillLine(
  random: Random,
  width: number,
  base: number,
  amplitude: number,
): Point[] {
  const phase = between(random, 0, Math.PI * 2);
  const phase2 = between(random, 0, Math.PI * 2);
  const waves = between(random, 1.2, 2.2);
  return sample(0, 1, HILL_STEPS, (t) => {
    const swell =
      0.65 * Math.sin(t * Math.PI * waves + phase) +
      0.35 * Math.sin(t * Math.PI * waves * 2.3 + phase2);
    return { x: t * width, y: base - amplitude * (0.5 + 0.5 * swell) };
  });
}

/** A hill range down to `floor`, its lower part in shade. */
function fillHills(
  graphics: Phaser.GameObjects.Graphics,
  line: Point[],
  floor: number,
  [lit, shaded]: readonly [number, number],
): void {
  const width = line.at(-1)?.x ?? 0;
  const close = [
    { x: width, y: floor },
    { x: 0, y: floor },
  ];
  graphics.fillStyle(lit);
  fillShape(graphics, [...line, ...close]);
  graphics.fillStyle(shaded);
  fillShape(graphics, [
    ...line.map(({ x, y }) => ({ x, y: y + (floor - y) * HILL_SHADE_FROM })),
    ...close,
  ]);
}

/**
 * The sun as a rosette: two rings of rays set half a step apart, then a ring
 * of petals inside the disc — the first of the meadow's mandala ornament.
 */
function paintSun(
  graphics: Phaser.GameObjects.Graphics,
  { sun }: MeadowLayout,
): void {
  // Many faint discs stacked from the outside in, so the glow thickens
  // toward the sun instead of stopping at an edge.
  for (let ring = 0; ring < GLOW_RINGS; ring++) {
    const t = ring / (GLOW_RINGS - 1);
    graphics.fillStyle(PALETTE.sunGlow, GLOW_ALPHA * t);
    graphics.fillCircle(
      sun.x,
      sun.y,
      sun.r * (SUN_GLOW_REACH + (1 - SUN_GLOW_REACH) * t),
    );
  }
  const step = (Math.PI * 2) / SUN_RAYS;
  for (const [offset, reach, width, colour] of [
    [0, [0.8, 1.8], 0.2, PALETTE.sunRayDeep],
    [0.5, [0.8, 1.5], 0.16, PALETTE.sunRay],
  ] as const) {
    graphics.fillStyle(colour);
    for (let index = 0; index < SUN_RAYS; index++) {
      fillShape(
        graphics,
        petal(
          sun,
          (index + offset) * step,
          [reach[0] * sun.r, reach[1] * sun.r],
          width * sun.r,
        ),
      );
    }
  }
  graphics.fillStyle(PALETTE.sun);
  graphics.fillCircle(sun.x, sun.y, sun.r);
  graphics.fillStyle(PALETTE.sunInner);
  for (let index = 0; index < SUN_RAYS / 2; index++) {
    fillShape(
      graphics,
      petal(sun, index * step * 2, [0.12 * sun.r, 0.7 * sun.r], 0.14 * sun.r),
    );
  }
  graphics.fillStyle(PALETTE.sunRayDeep);
  graphics.fillCircle(sun.x, sun.y, sun.r * 0.16);
}

/** One graphics object per cloud, so each can drift on its own. */
function paintClouds(
  layer: Layer,
  { clouds }: MeadowLayout,
  random: Random,
): void {
  for (const cloud of clouds) {
    const { x, y, r } = cloud;
    const graphics = layer().setPosition(x, y);
    const puffs = Array.from({ length: 5 }, (_, index) => ({
      x: (index - 2) * r * between(random, 0.75, 0.95),
      r: r * (index === 2 ? 1 : between(random, 0.55, 0.8)),
    }));
    graphics.fillStyle(PALETTE.cloudShade);
    for (const puff of puffs) {
      graphics.fillCircle(puff.x, r * 0.14, puff.r);
    }
    graphics.fillStyle(PALETTE.cloud);
    for (const puff of puffs) {
      graphics.fillCircle(puff.x, 0, puff.r * 0.94);
    }
  }
}

function paintTuft(
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  size: number,
): void {
  for (const [lean, height, colour] of [
    [-0.5, 1.6, PALETTE.tuftDark],
    [0.45, 1.4, PALETTE.tuftDark],
    [0, 2, PALETTE.tuft],
  ] as const) {
    graphics.fillStyle(colour);
    graphics.fillTriangle(
      x - size * 0.3,
      y,
      x + size * 0.3,
      y,
      x + lean * size * 1.3,
      y - height * size,
    );
  }
}

function paintGround(
  graphics: Phaser.GameObjects.Graphics,
  { width, height, groundTop }: MeadowLayout,
  random: Random,
): void {
  // Opening on the near hills' shade, so where the hills end there is no step
  // in colour to draw a line across the screen.
  fillBands(
    graphics,
    width,
    [groundTop, height],
    [PALETTE.nearHillShade, PALETTE.groundDeep],
    GROUND_BANDS,
    0.7,
  );
  const depth = height - groundTop;
  const tufts = Math.round((width / 1000) * TUFTS_PER_1000PX);
  const seamTufts = Math.round((width / 1000) * SEAM_TUFTS_PER_1000PX);
  for (let index = 0; index < tufts + seamTufts; index++) {
    // Bunched toward the back, where the ground recedes; the first few line
    // the seam with the hills, breaking it up.
    const y =
      groundTop +
      depth *
        (index < seamTufts
          ? between(random, 0.005, 0.03)
          : between(random, 0.04, 0.98) ** 1.4);
    // Nearer tufts, lower on the screen, are bigger.
    const nearness = 0.6 + (y - groundTop) / depth;
    paintTuft(graphics, between(random, 0, width), y, nearness * depth * 0.03);
  }
}

/**
 * Everything behind the mushrooms: sky, sun, clouds, two hill ranges and the
 * ground with its tufts. `random` shapes the clouds, hills and tufts, so the
 * same source repaints the same meadow. It paints into `existing`, in the
 * order a previous call returned them, and adds only what is missing, so a
 * repaint keeps the objects — and whatever is moving them.
 */
export function paintBackdrop(
  scene: Phaser.Scene,
  existing: readonly Phaser.GameObjects.Graphics[],
  layout: MeadowLayout,
  random: Random,
): Phaser.GameObjects.Graphics[] {
  const painted: Phaser.GameObjects.Graphics[] = [];
  const layer: Layer = () => {
    const graphics = (existing[painted.length] ?? scene.add.graphics()).clear();
    painted.push(graphics);
    return graphics;
  };
  const { width, horizon, nearHills, groundTop } = layout;
  fillBands(
    layer(),
    width,
    [0, nearHills],
    [PALETTE.skyTop, PALETTE.skyHorizon],
    SKY_BANDS,
    // Eased toward the horizon, where a real sky pales fastest.
    1.6,
  );
  paintSun(layer(), layout);
  paintClouds(layer, layout, random);
  const hills = layer();
  fillHills(
    hills,
    hillLine(random, width, horizon, (groundTop - horizon) * 0.9),
    groundTop,
    [PALETTE.farHill, PALETTE.farHillShade],
  );
  fillHills(
    hills,
    hillLine(
      random,
      width,
      nearHills + (groundTop - nearHills) * 0.6,
      (groundTop - nearHills) * 1.1,
    ),
    groundTop + 2,
    [PALETTE.nearHill, PALETTE.nearHillShade],
  );
  paintGround(layer(), layout, random);
  return painted;
}
