/**
 * What a fly's and a bee's painters share: the clear wings, each a graphics
 * of its own turned about its root so a beat never repaints it; the blur
 * they make aloft, where a beat of 30-odd ms would strobe at 60 frames a
 * second if drawn as a wing; and the legs' ink.
 */

import type * as Phaser from 'phaser';

import { type Point, sample } from '../../model/geometry';
import type { Buzzing } from '../../model/insect-genes';
import { buzzRoot, buzzWing, type Side } from '../../model/insect-outline';
import { inkFor, scaled } from './draw-insect';
import { PALETTE } from './palette';
import { fillShape, strokeLine, strokeShape } from './shapes';

export const SIDES: readonly Side[] = [-1, 1];
/** A clear wing's glass, and its veins', alpha. */
const GLASS_ALPHA = 0.5;
const VEIN_ALPHA = 0.75;
/**
 * The spread a beating wing swings between aloft, the blur fanning over it,
 * how many wing shapes it is laid down from, and each one's alpha.
 */
const BLUR_FROM = 0.5;
const BLUR_LAYERS = 6;
const BLUR_ALPHA = 0.16;

/**
 * A fly's or a bee's parts, each a graphics of its own: its legs under the
 * body, which are repainted as they move; its body; a wing a side, turned
 * about its root; and the blur the wings make in the air.
 */
export type BuzzParts = Record<
  'legs' | 'body' | 'left' | 'right' | 'blur',
  Phaser.GameObjects.Graphics
>;

/**
 * One wing into `graphics`, laid back over the body, about its root, where
 * the painter stands the graphics: glass, `veins` veins fanning out from the
 * root, a shine, and a fine ink edge.
 */
export function paintWing(
  graphics: Phaser.GameObjects.Graphics,
  genes: Buzzing,
  side: Side,
  size: number,
  veins: number,
): void {
  const root = buzzRoot(genes, side);
  const at = scaled(size);
  const own = (point: Point) =>
    at({ x: point.x - root.x, y: point.y - root.y });
  const outline = buzzWing(genes, side, 0).map((point) => own(point));
  const ink = inkFor(size);
  graphics.fillStyle(PALETTE.wingGlass, GLASS_ALPHA);
  fillShape(graphics, outline);
  // The outline runs out along one edge and back along the other, so the
  // point halfway round is its tip and a vein runs out toward points between.
  const half = Math.floor(outline.length / 2);
  graphics.lineStyle(Math.max(1, ink * 0.55), PALETTE.wingVein, VEIN_ALPHA);
  for (const step of sample(0.25, 0.75, Math.max(1, veins - 1), (u) => u)) {
    const edge = outline[Math.round(half * (0.5 + step))] ?? outline[0];
    if (!edge) continue;
    strokeLine(
      graphics,
      sample(0.12, 0.92, 6, (t) => ({
        x: edge.x * t,
        y: edge.y * t + Math.sin(Math.PI * t) * size * 0.01,
      })),
    );
  }
  const tip = outline[half] ?? { x: 0, y: 0 };
  graphics.fillStyle(PALETTE.highlight, 0.7);
  graphics.fillEllipse(
    tip.x * 0.35,
    tip.y * 0.35,
    Math.max(2, Math.abs(tip.y) * 0.25 + size * 0.03),
    Math.max(1.5, size * 0.035),
  );
  graphics.lineStyle(Math.max(1, ink * 0.75), PALETTE.ink, 0.85);
  strokeShape(graphics, outline);
}

/**
 * Both wings' blur in the air into `graphics`, about the body's middle: each
 * wing's shape laid down faintly at spreads across its stroke, so they build
 * a soft fan, densest where the wing spends its beat.
 */
export function paintBlur(
  graphics: Phaser.GameObjects.Graphics,
  genes: Buzzing,
  size: number,
): void {
  const at = scaled(size);
  for (const side of SIDES) {
    for (const spread of sample(BLUR_FROM, 1, BLUR_LAYERS - 1, (u) => u)) {
      graphics.fillStyle(PALETTE.wingGlass, BLUR_ALPHA);
      fillShape(
        graphics,
        buzzWing(genes, side, spread).map((point) => at(point)),
      );
    }
  }
}

/** Stands each wing's graphics on its root, for an insect `size` to its unit. */
export function rootWings(
  { left, right }: Pick<BuzzParts, 'left' | 'right'>,
  genes: Buzzing,
  size: number,
): void {
  const at = scaled(size);
  for (const [graphics, side] of [
    [left, -1],
    [right, 1],
  ] as const) {
    const { x, y } = at(buzzRoot(genes, side));
    graphics.setPosition(x, y);
  }
}

/** A leg as a jointed ink line through `points`, already in pixels, its foot a dot. */
export function paintLeg(
  graphics: Phaser.GameObjects.Graphics,
  points: readonly Point[],
  size: number,
): void {
  const ink = inkFor(size);
  graphics.lineStyle(Math.max(1.2, ink * 0.9), PALETTE.ink);
  strokeLine(graphics, points);
  const foot = points.at(-1);
  if (foot) {
    graphics.fillStyle(PALETTE.ink);
    graphics.fillCircle(foot.x, foot.y, Math.max(0.8, ink * 0.6));
  }
}
