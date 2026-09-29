/**
 * The meadow's ground and the camera that shows it. Everything that stands
 * in the meadow stands at a point on the ground, and a camera, fitted to the
 * screen, is a pure function from that point to the screen: turning or
 * resizing the screen fits a new camera and moves nothing on the ground.
 */

import type { Sized } from '@/shared/typings';

import type { Point } from './geometry';

/**
 * A point on the ground, in the clump's size: `x` across from the middle of
 * the common frame, rightward, and `z` into the distance from the clump's
 * front foot, farther away the larger.
 */
export type Ground = { x: number; z: number };

/** How far toward the sky's haze a thing's colours go, from 0 to 1. */
export type Hazed = { haze: number };

/**
 * A camera on a screen, in CSS px: the band of ground it shows, from
 * `groundTop` down to the screen's foot `ground` deep; where across the
 * ground's middle stands; and `unit`, the clump's size where the clump's
 * front foot stands.
 */
export type Camera = Sized & {
  groundTop: number;
  ground: number;
  centre: number;
  unit: number;
};

/**
 * A ground point as a camera shows it: where on the screen, how big one of
 * the clump's size stands there, how hazy, and the depth it is drawn at —
 * the nearer, the deeper, so it is drawn over what stands behind.
 */
export type Projected = Point &
  Hazed & {
    scale: number;
    depth: number;
  };

/**
 * How deep the ground is, in the clump's size, from the screen's foot to
 * where the ground begins, and how far down that band the clump's front foot
 * stands: every camera shows the same depth of ground, so a point's share of
 * the band's depth is the same on every screen.
 */
const BAND_DEPTH = 4;
const CLUMP_DOWN = 0.76;

/**
 * The haze on the farthest ground, and how far down the band it thins out
 * to none.
 */
const MAX_HAZE = 0.4;
const HAZE_REACH = 0.35;

/**
 * The ground every screen's camera shows (`fitCamera`), in the clump's size:
 * across from `left` to `right`, and in depth from `near` to `far`. A foot
 * placed inside it is in reach on every screen; a wider screen shows more
 * ground round it.
 */
export const COMMON_FRAME = {
  left: -0.62,
  right: 0.62,
  near: -0.7,
  far: 2.6,
} as const;

/**
 * How much bigger a thing stands `down` of the way down the ground's band
 * than at its top, before its own size: nearer things, lower on the screen,
 * are bigger.
 */
export function depthScale(down: number): number {
  return 0.7 + down * 0.5;
}

/** How far down the band, from its top to the screen's foot, a point `z` into the distance stands. */
function downOf(z: number): number {
  return CLUMP_DOWN - z / BAND_DEPTH;
}

/** How big a thing of the clump's size stands `z` into the distance, against the clump's front foot. */
export function scaleAt(z: number): number {
  return depthScale(downOf(z)) / depthScale(CLUMP_DOWN);
}

/** Where `camera` shows `point`, and how. */
export function project(camera: Camera, { x, z }: Ground): Projected {
  const down = downOf(z);
  const scale = camera.unit * scaleAt(z);
  const y = camera.groundTop + camera.ground * down;
  return {
    x: camera.centre + x * scale,
    y,
    scale,
    haze: MAX_HAZE * Math.max(0, 1 - down / HAZE_REACH),
    depth: y,
  };
}

/**
 * What a camera must show: `reach`, how far, in the clump's size at the
 * clump's front foot, what stands in the common frame reaches either side of
 * its middle, caps and all, which stands `margin` px inside the screen; and
 * `floor`, the least that size may be, in px, whatever the screen.
 */
export type Lens = Record<'reach' | 'margin' | 'floor', number>;

/**
 * The share of the ground's band the clump's size may take, at the most:
 * enough depth to stand the frame's back row with its caps above the
 * clump's.
 */
const UNIT_PER_BAND = 0.52;

/**
 * The camera for `screen`: the ground begins halfway down a tall screen and
 * lower on a wide one, and the clump stands as big as the screen composes
 * it — by height when the screen is wide, by width when it is tall — no
 * bigger than the band's depth leaves the back row room behind it or than
 * `lens` fits the frame across, and never under `lens.floor`.
 */
export function fitCamera({ width, height }: Sized, lens: Lens): Camera {
  const portrait = height > width;
  const groundTop = height * (portrait ? 0.5 : 0.6);
  const ground = height - groundTop;
  const composed = portrait
    ? Math.min(width * 0.6, height * 0.34)
    : height * 0.44;
  const unit = Math.max(
    lens.floor,
    Math.min(
      composed,
      ground * UNIT_PER_BAND,
      (width / 2 - lens.margin) / lens.reach,
    ),
  );
  return { width, height, groundTop, ground, centre: width / 2, unit };
}

/** Whether `point` stands inside the common frame. */
export function inFrame({ x, z }: Ground): boolean {
  const { left, right, near, far } = COMMON_FRAME;
  return x >= left && x <= right && z >= near && z <= far;
}
