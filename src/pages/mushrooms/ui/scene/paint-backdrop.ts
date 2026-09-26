import * as Phaser from 'phaser';

import { between, type Random } from '../../model/random';
import type { MeadowLayout, Point } from './layout';
import { PALETTE } from './palette';
import { fillShape, petal } from './shapes';

const SKY_BANDS = 48;
const GROUND_BANDS = 12;
const HILL_STEPS = 64;
const SUN_RAYS = 16;
const TUFTS_PER_1000PX = 52;
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
  { width, top, bottom }: { width: number; top: number; bottom: number },
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
  return Array.from({ length: HILL_STEPS + 1 }, (_, step) => {
    const t = step / HILL_STEPS;
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
function paintSun(scene: Phaser.Scene, { sun }: MeadowLayout): void {
  const graphics = scene.add.graphics();
  for (const [scale, alpha] of [
    [2.8, 0.08],
    [2.1, 0.14],
  ] as const) {
    graphics.fillStyle(PALETTE.sunGlow, alpha);
    graphics.fillCircle(sun.x, sun.y, sun.r * scale);
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
  scene: Phaser.Scene,
  { clouds }: MeadowLayout,
  random: Random,
): void {
  for (const cloud of clouds) {
    const graphics = scene.add.graphics({ x: cloud.x, y: cloud.y });
    const puffs = Array.from({ length: 5 }, (_, index) => ({
      x: (index - 2) * cloud.r * between(random, 0.75, 0.95),
      r: cloud.r * (index === 2 ? 1 : between(random, 0.55, 0.8)),
    }));
    graphics.fillStyle(PALETTE.cloudShade);
    for (const puff of puffs) {
      graphics.fillCircle(puff.x, cloud.r * 0.14, puff.r);
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
  scene: Phaser.Scene,
  { width, height, groundTop }: MeadowLayout,
  random: Random,
): void {
  const graphics = scene.add.graphics();
  fillBands(
    graphics,
    { width, top: groundTop, bottom: height },
    [PALETTE.ground, PALETTE.groundDeep],
    GROUND_BANDS,
  );
  const depth = height - groundTop;
  const tufts = Math.round((width / 1000) * TUFTS_PER_1000PX);
  for (let index = 0; index < tufts; index++) {
    // Bunched toward the back, where the ground recedes.
    const y = groundTop + depth * between(random, 0.04, 0.98) ** 1.4;
    // Nearer tufts, lower on the screen, are bigger.
    const nearness = 0.6 + (y - groundTop) / depth;
    paintTuft(graphics, between(random, 0, width), y, nearness * depth * 0.03);
  }
}

/**
 * Everything behind the mushrooms: sky, sun, clouds, two hill ranges and the
 * ground with its tufts. `random` shapes the clouds, hills and tufts, so the
 * same source repaints the same meadow.
 */
export function paintBackdrop(
  scene: Phaser.Scene,
  layout: MeadowLayout,
  random: Random,
): void {
  const { width, horizon, nearHills, groundTop } = layout;
  fillBands(
    scene.add.graphics(),
    { width, top: 0, bottom: nearHills },
    [PALETTE.skyTop, PALETTE.skyHorizon],
    SKY_BANDS,
    // Eased toward the horizon, where a real sky pales fastest.
    1.6,
  );
  paintSun(scene, layout);
  paintClouds(scene, layout, random);
  const hills = scene.add.graphics();
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
  paintGround(scene, layout, random);
}
