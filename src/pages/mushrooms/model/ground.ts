/**
 * The meadow's ground and the camera that shows it. Everything that stands
 * in the meadow stands at a point on the ground, and a camera, fitted to the
 * screen, is a pure function from that point to the screen: turning or
 * resizing the screen fits a new camera and moves nothing on the ground.
 */

import type { Sized } from '@/shared/typings';

import type { Point, Scaled } from './geometry';

/**
 * A point on the ground, in the clump's size: `x` across from the middle of
 * the meadow, rightward, and `z` into the distance from the clump's
 * front foot, farther away the larger.
 */
export type Ground = Pick<Point, 'x'> & { z: number };

/**
 * A foot on the ground (`Ground`) and its size in the clump's before depth
 * scales it: a flower's height to its head, a mushroom's unit.
 */
export type FlowerFoot = Ground & Scaled;
/** Where a thing stands on the ground. */
export type Rooted = { foot: FlowerFoot };

/** How far toward the sky's haze a thing's colours go, from 0 to 1. */
export type Hazed = { haze: number };

/**
 * A camera on a screen, in CSS px: the band of ground it shows, from
 * `groundTop` down to the screen's foot `ground` deep; how wide the world it
 * lays the meadow out on stands (`world`), the screen being a crop of it
 * (`pan.ts`), and where across that world the ground's middle stands
 * (`midline`, the world's middle); and `unit`, the clump's size where the
 * clump's front foot stands.
 */
export type Camera = Sized & {
  groundTop: number;
  ground: number;
  world: number;
  midline: number;
  unit: number;
};
/** The camera a thing is seen through. */
export type WithCamera = { camera: Camera };

/** The depth a thing is drawn at: the nearer, the deeper, so it is drawn over what stands behind. */
export type Layered = { depth: number };

/** A point on the screen and how near the front it is painted. */
export type LayeredPoint = Point & Layered;

/** Where on the ground something is laid out: the world's frame. */
export type Framed = { frame: Frame };

/** How big, in px, one of the clump's size stands where a point is shown. */
export type Scaling = { scale: number };

/**
 * A ground point as a camera shows it: where on the screen, how big one of
 * the clump's size stands there, how hazy, and the depth it is drawn at.
 */
export type Projected = LayeredPoint & Hazed & Scaling;

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
 * How deep the world's frame is: the whole band every camera shows but for
 * `FRAME_INSET`.
 */
export const FRAME_DEPTH = {
  near: zAt(1 - FRAME_INSET.near),
  far: zAt(FRAME_INSET.far),
} as const;

/**
 * How far up the screen one step into the distance goes against one across
 * at the clump's front foot, on every camera: the flattest look at the meadow
 * that still stands the frame's back row with its caps above the clump's
 * (`UNIT_PER_BAND`). The angle is the meadow's, not the screen's, so a screen
 * picks only the clump's size and how much ground it shows, and one screen's
 * picture is a scaled copy of another's.
 */
export const UP_PER_Z = 1 / (BAND_DEPTH * UNIT_PER_BAND);

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
 * The row form above is a pinhole camera's: scale is linear in screen y and
 * vanishes `HORIZON_DOWN` of the way down the band, above its top, which is
 * the pinhole's horizon, hidden behind the hills. The constants below are
 * that pinhole's, derived from the row form's own, so `viewOf` at
 * `OPENING_EYE` is `project` exactly.
 */
const SCALE_PER_DOWN = depthScale(1) - depthScale(0);
const HORIZON_DOWN = -depthScale(0) / SCALE_PER_DOWN;

/**
 * How far ahead of the opening eye the clump's front foot stands, on the
 * plane, in the clump's size: the distance at which one step into the
 * distance (`z`) is one step on the plane, so depth is true at the clump.
 */
export const CLUMP_DISTANCE =
  (BAND_DEPTH * depthScale(CLUMP_DOWN)) / SCALE_PER_DOWN;

/**
 * How high above the plane the eye stands, in the clump's size: the height
 * that looks down at the clump's front foot at `UP_PER_Z`.
 */
export const EYE_HEIGHT = CLUMP_DISTANCE * UP_PER_Z;

/**
 * Where on the plane the eye stands, in the clump's size, and which way it
 * looks: `heading`, in radians, turned from straight into the distance (the
 * plane's `+y`) toward its `+x`, so a growing heading turns rightward.
 */
export type Eye = Point & { heading: number };

/** Something seen from an eye: the eye it is seen from. */
export type Eyed = { eye: Eye };

/** The eye a visit opens on: it sees what `project` shows on the opening crop. */
export const OPENING_EYE: Eye = { x: 0, y: 0, heading: 0 };

/**
 * How many times wider the meadow's angles round `OPENING_EYE` stand on the
 * plane than the opening crop's pinhole sees them: the plane is the layout's
 * ground spread round the opening eye by this, every point kept at its
 * distance, so the screen, linear in azimuth at `focal / SPREAD` px to the
 * radian, still shows the opening crop's middle as the pinhole did and a
 * full turn of the heading spans four screens of a sideways tablet (1180 px
 * across at a unit of 170.56). One factor for the one world; every other
 * screen turns in its own count of screens.
 */
export const SPREAD = (2 * Math.PI * 170.56 * CLUMP_DISTANCE) / (4 * 1180);

/**
 * `point`, as the opening crop's pinhole sees the ground round
 * `OPENING_EYE`, on the plane the eye walks: its azimuth from the opening
 * heading `SPREAD` times as wide, its distance kept.
 */
export function spread(point: Point): Point {
  const distance = Math.hypot(point.x, point.y);
  const azimuth = SPREAD * Math.atan2(point.x, point.y);
  return {
    x: distance * Math.sin(azimuth),
    y: distance * Math.cos(azimuth),
  };
}

/**
 * `spread` run backwards: a plane point as the opening crop's pinhole sees
 * it. A point turned more than `SPREAD` half-turns from the opening heading
 * has none there, and comes back at or behind the opening eye (`y` ≤ 0).
 */
export function gathered(point: Point): Point {
  const distance = Math.hypot(point.x, point.y);
  const azimuth = Math.atan2(point.x, point.y) / SPREAD;
  return {
    x: distance * Math.sin(azimuth),
    y: distance * Math.cos(azimuth),
  };
}

/**
 * A ground point on the plane the eye walks: as the opening crop's pinhole
 * stands it, `x` across as it is and `y` its true distance ahead of
 * `OPENING_EYE`, of which `z` is a warped measure, then `spread`.
 */
export function planeOf({ x, z }: Ground): Point {
  return spread({ x, y: CLUMP_DISTANCE / scaleAt(z) });
}

/**
 * The lens `camera` is, in CSS px: the screen point straight ahead on the
 * horizon (`x` the screen's middle, `y` the horizon's row); `focal`, the
 * opening crop's pinhole's focal length, which the ground's bend and a
 * distance's scale are measured in; and `arc`, the px across the screen to a
 * radian of the plane's azimuth.
 */
export type Pinhole = Point & Record<'focal' | 'arc', number>;

export function pinholeOf({ width, groundTop, ground, unit }: Camera): Pinhole {
  const focal = unit * CLUMP_DISTANCE;
  return {
    x: width / 2,
    y: groundTop + ground * HORIZON_DOWN,
    focal,
    arc: focal / SPREAD,
  };
}

/** `angle` wrapped into `[−π, π)`. */
function wrapped(angle: number): number {
  return angle - 2 * Math.PI * Math.floor((angle + Math.PI) / (2 * Math.PI));
}

/**
 * How much the screen bends the ground down at `x` across it: the ground's
 * rows go by distance from the eye, so a circle round it is a straight row,
 * and below the horizon every row is drawn this many times as far down at
 * `x` as at the middle, a fixed curve on the screen, the opening crop's
 * pinhole's own for the circle of the clump's distance.
 */
export function bendAt(pinhole: Pinhole, x: number): number {
  return Math.hypot(1, (x - pinhole.x) / pinhole.focal);
}

/**
 * A plane point as an eye sees it: where on the screen, in CSS px, how big
 * one of the clump's size stands there, and `ahead`, its distance from the
 * eye less the screen's bend there, in the clump's size, the distance a
 * thing of its drawn size stands at the screen's middle.
 */
export type Viewed = Point & Scaling & { ahead: number };

/**
 * Where `camera` shows `point` on the plane, `height` above it in the clump's
 * size, to `eye`: across by its azimuth off the heading the shorter way
 * round, `arc` px to the radian, so a thing behind the eye stands off the
 * screen's side; down by its distance, bent (`bendAt`).
 */
export function viewOf(
  camera: Camera,
  eye: Eye,
  point: Point,
  height: number,
): Viewed {
  const pinhole = pinholeOf(camera);
  const dx = point.x - eye.x;
  const dy = point.y - eye.y;
  const distance = Math.hypot(dx, dy);
  const x = pinhole.x + pinhole.arc * wrapped(Math.atan2(dx, dy) - eye.heading);
  const bend = bendAt(pinhole, x);
  const scale = (pinhole.focal * bend) / distance;
  return {
    x,
    y: pinhole.y + (EYE_HEIGHT - height) * scale,
    scale,
    ahead: distance / bend,
  };
}

/**
 * `viewOf` run backwards for the ground: the plane point `eye` sees under
 * `screen`, in CSS px; none at or above the horizon.
 */
export function planeSeen(
  camera: Camera,
  eye: Eye,
  screen: Point,
): Point | undefined {
  const pinhole = pinholeOf(camera);
  const below = screen.y - pinhole.y;
  if (below <= 0) return undefined;
  const distance =
    (pinhole.focal * bendAt(pinhole, screen.x) * EYE_HEIGHT) / below;
  return alongSight(camera, eye, screen.x, distance);
}

/** The plane point `distance` from `eye` along the azimuth it sees at `x` across `camera`'s screen. */
export function alongSight(
  camera: Camera,
  eye: Eye,
  x: number,
  distance: number,
): Point {
  const pinhole = pinholeOf(camera);
  const azimuth = eye.heading + (x - pinhole.x) / pinhole.arc;
  return {
    x: eye.x + distance * Math.sin(azimuth),
    y: eye.y + distance * Math.cos(azimuth),
  };
}

/**
 * What a camera must show: `reach`, how far, in the clump's size at the
 * clump's front foot, the opening clump's caps reach either side of the
 * middle, and `least`, the least ground a screen shows across either side of
 * it, both with the caps standing `margin` px inside the screen; `beyond`,
 * how far past its foot a cap standing on the frame's side reaches; `floor`,
 * the least that size may be, in px, whatever the screen; and `across`, how
 * far the world's frame reaches either side of the middle, the same on every
 * screen.
 */
export type Lens = Record<
  'reach' | 'beyond' | 'margin' | 'floor' | 'least' | 'across',
  number
>;

/**
 * The biggest clump size `screen` stands the meadow at: where the ground's
 * band, at `UP_PER_Z`, takes the lower half of a tall screen or the lower 0.4
 * of a wide one, leaving the sky room for the controls and the sun.
 */
function mostUnit({ width, height }: Sized): number {
  return height * (height > width ? 0.5 : 0.4) * UNIT_PER_BAND;
}

/**
 * The least clump size on `screen`: `lens.floor`, but where the screen is
 * too short to stand the clump that big (`mostUnit`).
 */
function floorOn(screen: Sized, lens: Lens): number {
  return Math.min(lens.floor, mostUnit(screen));
}

/**
 * The clump's size on `screen` as the screen composes it: by height when
 * the screen is wide, by width when it is tall, never over `mostUnit` nor
 * under `floorOn`.
 */
function composedUnit(screen: Sized, lens: Lens): number {
  const { width, height } = screen;
  const composed =
    height > width ? Math.min(width * 0.6, height * 0.34) : height * 0.44;
  return Math.min(mostUnit(screen), Math.max(lens.floor, composed));
}

/**
 * The camera for `screen`: the clump stands as big as the screen composes it
 * (`composedUnit`), smaller where the screen would show less than
 * `lens.least` across or cut the opening clump's caps, caps inside
 * `lens.margin`, and never under `floorOn`. The world is the frame
 * `lens.across` wide either side of the middle at that size, a cap on its
 * side inside the margin, and the ground's middle its middle; the ground's
 * band is as deep as `UP_PER_Z` stands it at that size. Nothing the meadow
 * has used changes it, so a turn or a resize changes the zoom and the crop,
 * never the ground.
 */
export function fitCamera(screen: Sized, lens: Lens): Camera {
  const { width, height } = screen;
  const half = width / 2 - lens.margin;
  const shown = Math.max(lens.reach, lens.least + lens.beyond);
  const unit = Math.max(
    floorOn(screen, lens),
    Math.min(composedUnit(screen, lens), half / shown),
  );
  const ground = unit * BAND_DEPTH * UP_PER_Z;
  const world = 2 * (lens.margin + (lens.across + lens.beyond) * unit);
  return {
    width,
    height,
    groundTop: height - ground,
    ground,
    world,
    midline: world / 2,
    unit,
  };
}
