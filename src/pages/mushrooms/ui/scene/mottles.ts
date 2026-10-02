/**
 * The ground's mottles: flattened patches a little lighter or deeper than the
 * ground round them, so the meadow reads as rolling. Each lies on the plane,
 * grown by a cell of the lawn (`cellLawn`), so a walk back finds the same
 * ones, and is drawn flat on the ground through each frame's view, fading
 * out before the brow, where the ground goes under.
 */

import type * as Phaser from 'phaser';

import {
  distanceBetween,
  type Point,
  type Wide,
  type WithMiddle,
} from '../../model/geometry';
import { D_SEE, viewOf } from '../../model/ground';
import { smooth } from '../../model/motion';
import { between, type Random } from '../../model/random';
import { forwardOf } from '../../model/stride';
import { DEPTHS } from './backdrop-depths';
import { mix } from './colour';
import type { Translucent } from './ink';
import { PALETTE } from './palette';
import { V_NEAR, type View } from './view';

/** How many mottles a cell of the lawn grows. */
export const MOTTLES_PER_CELL = 3;

/** How far across a mottle reaches from its middle, in the clump's size, and its reach along as a share of that. */
const ACROSS = [0.6, 1.4] as const;
const ALONG = [0.45, 0.85] as const;

/** A mottle's alpha, split over its two rings, and its share of the way from the ground toward the lit or the deep ground. */
const MOTTLE_ALPHA = 0.4;
const MOTTLE_TONE = 0.7;
/** How much wider a mottle's outer ring reaches than its inner one, so its edge is soft. */
const SOFT_EDGE = 1.3;
/** How many points round a ring. */
const RING_STEPS = 16;
/** How far short of `D_SEE` a mottle's far edge, in the clump's size, starts fading out. */
const FADE_SPAN = 2;

/** The depth mottles are drawn at: over the ground's rows, under the brow that covers the ground past `D_SEE`. */
export const MOTTLE_DEPTH = (DEPTHS.ground + DEPTHS.brow) / 2;

/**
 * A mottle on the plane: its middle, how far it reaches across and along
 * from it, in the clump's size, turned `angle` radians on the plane, and
 * whether it is deeper than the ground or lighter.
 */
export type Mottle = WithMiddle &
  Wide & {
    lengthways: number;
    angle: number;
    deep: boolean;
  };

/** A mottle drawn from `random` anywhere in the square `side` wide from `corner`, on the plane. */
export function mottleIn(random: Random, corner: Point, side: number): Mottle {
  const middle = {
    x: corner.x + random() * side,
    y: corner.y + random() * side,
  };
  const across = between(random, ...ACROSS);
  return {
    middle,
    across,
    lengthways: across * between(random, ...ALONG),
    angle: random() * Math.PI,
    deep: random() < 0.5,
  };
}

/** A mottle as a frame draws it: its two rings on the screen, outer first, its colour and each ring's alpha. */
export type ShownMottle = Translucent & {
  rings: readonly [Point[], Point[]];
  tint: number;
};

/** `mottle`'s outline `reach` times its size, on the plane. */
function ringOf(
  { middle, across, lengthways, angle }: Mottle,
  reach: number,
): Point[] {
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  return Array.from({ length: RING_STEPS }, (_, step) => {
    const turn = (step / RING_STEPS) * Math.PI * 2;
    const [u, v] = [
      across * reach * Math.cos(turn),
      lengthways * reach * Math.sin(turn),
    ];
    return { x: middle.x + u * cos - v * sin, y: middle.y + u * sin + v * cos };
  });
}

/**
 * Where `view` draws each of `mottles`, flat on the ground: every point of
 * its rings through the view. One with any of its outer ring nearer ahead
 * than half `V_NEAR`, under the screen's bottom or behind the eye, is not
 * drawn, nor one standing wholly off the screen; one fades out as its far
 * edge nears `D_SEE`, gone by it.
 */
export function shownMottles(
  view: View,
  mottles: readonly Mottle[],
): ShownMottle[] {
  const { eye, width, height } = view;
  const forward = forwardOf(eye.heading);
  return mottles.flatMap((mottle) => {
    const reach = mottle.across * SOFT_EDGE;
    const far = distanceBetween(eye, mottle.middle) + reach;
    const fade = 1 - smooth((far - (D_SEE - FADE_SPAN)) / FADE_SPAN);
    if (fade <= 0) return [];
    const outer = ringOf(mottle, SOFT_EDGE);
    const ahead = ({ x, y }: Point) =>
      (x - eye.x) * forward.x + (y - eye.y) * forward.y;
    if (outer.some((point) => ahead(point) < V_NEAR / 2)) return [];
    const onScreen = (plane: readonly Point[]) =>
      plane.map((point) => viewOf(view, eye, point, 0));
    const drawn = onScreen(outer);
    const xs = drawn.map(({ x }) => x);
    const ys = drawn.map(({ y }) => y);
    const off =
      Math.max(...xs) < 0 ||
      Math.min(...xs) > width ||
      Math.max(...ys) < 0 ||
      Math.min(...ys) > height;
    if (off) return [];
    const tone = mottle.deep ? PALETTE.groundDeep : PALETTE.groundLit;
    return [
      {
        rings: [drawn, onScreen(ringOf(mottle, 1))],
        tint: mix(PALETTE.ground, tone, MOTTLE_TONE),
        alpha: (MOTTLE_ALPHA / 2) * fade,
      },
    ];
  });
}

/** `shown` into `graphics` cleared for them, each ring over the last. */
export function paintMottles(
  graphics: Phaser.GameObjects.Graphics,
  shown: readonly ShownMottle[],
): void {
  graphics.clear();
  for (const { rings, tint, alpha } of shown) {
    graphics.fillStyle(tint, alpha);
    for (const ring of rings) {
      // A path rather than `fillShape`, whose Phaser vectors would keep this
      // module from loading outside the browser.
      graphics.beginPath();
      for (const { x, y } of ring) graphics.lineTo(x, y);
      graphics.closePath();
      graphics.fillPath();
    }
  }
}
