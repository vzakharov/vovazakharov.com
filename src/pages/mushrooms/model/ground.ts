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
 * the meadow, rightward, and `z` into the distance from the clump's
 * front foot, farther away the larger.
 */
export type Ground = Pick<Point, 'x'> & { z: number };

/** How far toward the sky's haze a thing's colours go, from 0 to 1. */
export type Hazed = { haze: number };

/**
 * A camera on a screen, in CSS px: the band of ground it shows, from
 * `groundTop` down to the screen's foot `ground` deep; where across the
 * ground's middle stands (`midline`); and `unit`, the clump's size where the
 * clump's front foot stands.
 */
export type Camera = Sized & {
  groundTop: number;
  ground: number;
  midline: number;
  unit: number;
};

/** The depth a thing is drawn at: the nearer, the deeper, so it is drawn over what stands behind. */
export type Layered = { depth: number };

/** Where on the ground something is laid out (`frameFor`). */
export type Framed = { frame: Frame };

/**
 * A ground point as a camera shows it: where on the screen, how big one of
 * the clump's size stands there, how hazy, and the depth it is drawn at.
 */
export type Projected = Point & Hazed & Layered & { scale: number };

/**
 * How deep the ground is, in the clump's size, from the screen's foot to
 * where the ground begins, and how far down that band the clump's front foot
 * stands: every camera shows the same depth of ground, so a point's share of
 * the band's depth is the same on every screen.
 */
const BAND_DEPTH = 4;
const CLUMP_DOWN = 0.76;

/**
 * The share of the ground's band the clump's size may take, at the most:
 * enough depth to stand the frame's back row with its caps above the
 * clump's.
 */
const UNIT_PER_BAND = 0.52;

/**
 * The haze on the farthest ground, and how far down the band it thins out
 * to none.
 */
const MAX_HAZE = 0.4;
const HAZE_REACH = 0.35;

/**
 * How far in from the band's top and foot, as shares of its depth, the
 * frame's far and near edges stand: a foot on the frame's near edge
 * still stands on the screen, and one on its far edge on the flat ground
 * below the hills.
 */
const FRAME_INSET = { far: 0.01, near: 0.005 } as const;

/**
 * How far into the distance a point `down` of the way down the band stands,
 * the same on every camera.
 */
export function zAt(down: number): number {
  return (CLUMP_DOWN - down) * BAND_DEPTH;
}

/**
 * A stretch of ground, in the clump's size: in depth from `near` to `far`,
 * and across `across` either side of the middle as a camera lays it out
 * (`seen`).
 */
export type Frame = Record<'across' | 'near' | 'far', number>;

/**
 * How deep every screen's frame is (`frameFor`): the whole band every camera
 * shows but for `FRAME_INSET`.
 */
export const FRAME_DEPTH = {
  near: zAt(1 - FRAME_INSET.near),
  far: zAt(FRAME_INSET.far),
} as const;

/**
 * How far up the screen one step into the distance goes against one across
 * at the clump's front foot, on the camera whose band the clump's size fills
 * the most of (`UNIT_PER_BAND`).
 */
const UP_PER_Z = 1 / (BAND_DEPTH * UNIT_PER_BAND);

/**
 * A ground point as a camera lays it out, in the clump's size at its front
 * foot: `across` from the middle, `up` the screen from the clump's front
 * foot. Two points as far apart here stand as far apart on the screen.
 */
export function seen({ x, z }: Ground): Point {
  return { x: x * scaleAt(z), y: z * UP_PER_Z };
}

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
    x: camera.midline + x * scale,
    y,
    scale,
    haze: MAX_HAZE * Math.max(0, 1 - down / HAZE_REACH),
    depth: y,
  };
}

/**
 * What a camera must show: `reach`, how far, in the clump's size at the
 * clump's front foot, the opening clump's caps reach either side of the
 * middle, and `beyond`, how far past its foot a cap standing on the frame's
 * side reaches, both standing `margin` px inside the screen; `floor`, the
 * least that size may be, in px, whatever the screen; and `least`, the least
 * a frame reaches across, whatever the screen, which leaves the forest room.
 */
export type Lens = Record<
  'reach' | 'beyond' | 'margin' | 'floor' | 'least',
  number
>;

/**
 * The clump's size on `screen` as the screen composes it: by height when
 * the screen is wide, by width when it is tall, no bigger than the band's
 * depth leaves the back row room behind it, never under `lens.floor`.
 */
function composedUnit({ width, height }: Sized, lens: Lens): number {
  const portrait = height > width;
  const ground = height * (portrait ? 0.5 : 0.4);
  const composed = portrait
    ? Math.min(width * 0.6, height * 0.34)
    : height * 0.44;
  return Math.max(lens.floor, Math.min(composed, ground * UNIT_PER_BAND));
}

/** How far across `screen` shows the ground at the size it composes the clump at, caps inside the margin. */
function shownAcross(screen: Sized, lens: Lens): number {
  return (
    (screen.width / 2 - lens.margin) / composedUnit(screen, lens) - lens.beyond
  );
}

/**
 * The frame the meadow on `screen` is laid out in: as far across as both
 * `screen` and `screen` turned show at the size each composes the clump at,
 * and never under `lens.least`, the full depth deep. The same for a screen
 * and its turn, so a foot in it stays in reach through a turn.
 */
export function frameFor(screen: Sized, lens: Lens): Frame {
  const turned = { width: screen.height, height: screen.width };
  const across = Math.min(shownAcross(screen, lens), shownAcross(turned, lens));
  return { across: Math.max(lens.least, across), ...FRAME_DEPTH };
}

/**
 * The camera for `screen`: the ground begins halfway down a tall screen and
 * lower on a wide one, and the clump stands as big as the screen composes it
 * (`composedUnit`), smaller where its frame (`frameFor`), caps and all, would
 * reach past `lens.margin`, and never under `lens.floor`.
 */
export function fitCamera(screen: Sized, lens: Lens): Camera {
  const { width, height } = screen;
  const groundTop = height * (height > width ? 0.5 : 0.6);
  const reach = Math.max(
    lens.reach,
    frameFor(screen, lens).across + lens.beyond,
  );
  const unit = Math.max(
    lens.floor,
    Math.min(composedUnit(screen, lens), (width / 2 - lens.margin) / reach),
  );
  return {
    width,
    height,
    groundTop,
    ground: height - groundTop,
    midline: width / 2,
    unit,
  };
}

/**
 * How many px down the screen a step of the clump's size into the distance
 * takes on `camera`, per px a thing of the clump's size stands across at the
 * clump's front foot.
 */
export function foreshortening({ ground, unit }: Camera): number {
  return ground / (BAND_DEPTH * unit);
}
