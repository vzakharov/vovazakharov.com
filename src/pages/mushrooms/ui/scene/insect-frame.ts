/**
 * The leg's frame: the space an insect's leg is steered in. It is the opening
 * layout's pinhole stood at the eye and turned to a centre azimuth fixed as
 * the leg sets off, so at the opening eye facing the clump it is the layout
 * itself, in world px, and the leg is flown as the layout flies it. Turning
 * the eye moves no framed point; walking moves them by true parallax.
 */

import type { Point } from '../../model/geometry';
import {
  CLUMP_DISTANCE,
  type Eye,
  EYE_HEIGHT,
  pinholeOf,
  SPREAD,
} from '../../model/ground';
import { wrapAngle } from './panorama';
import {
  buried,
  middleOf,
  type Placed,
  placedAt,
  sunkOver,
  V_NEAR,
  type View,
} from './view';

/** A point in the air: a plane point and its height over the plane, both in the clump's size. */
export type Aloft = Point & { h: number };

/** An `Aloft` in a leg's frame: world px across and down, and `forward`, its distance ahead of the eye along the frame’s centre, in the clump's size. */
export type Framed = Point & { forward: number };

/**
 * How far off a leg's centre, in plane azimuth, either end may stand:
 * `tan 0.9` (1.26 focal lengths) at the frame's edge, well inside its one
 * singular line at `SPREAD · π/2`. Twice it exceeds π, so any chord fits.
 */
export const FRAME_MARGIN = SPREAD * 0.9;

/** The plane azimuth of `point` from `eye`, turned from its `+y` toward its `+x`. */
function azimuthOf(eye: Point, point: Point): number {
  return Math.atan2(point.x - eye.x, point.y - eye.y);
}

/**
 * The centre azimuth of a leg from `from` to `to` as `eye` sets it off: the
 * eye's heading, clamped so both ends, taken the short way round, lie within
 * `FRAME_MARGIN` of it. Facing anything on the screen the clamp does not
 * bite, so the leg's frame is the screen's own crop; only the eye's heading
 * reproduces the layout's bow sides, a chord-derived centre does not.
 */
export function centreOf(eye: Eye, from: Point, to: Point): number {
  const start = azimuthOf(eye, from);
  const end = start + wrapAngle(azimuthOf(eye, to) - start);
  const low = Math.min(start, end);
  const high = Math.max(start, end);
  const middle = (low + high) / 2;
  const heading = middle + wrapAngle(eye.heading - middle);
  return Math.min(Math.max(heading, high - FRAME_MARGIN), low + FRAME_MARGIN);
}

/**
 * `aloft` in the frame `centre` stands at `view`'s eye: across by the tangent
 * of its gathered azimuth off `centre`, down by its height over its forward
 * distance. Defined only within `SPREAD · π/2` of `centre`.
 */
export function framedOf(view: View, centre: number, aloft: Aloft): Framed {
  const pinhole = pinholeOf(view);
  const distance = Math.hypot(aloft.x - view.eye.x, aloft.y - view.eye.y);
  const theta = wrapAngle(azimuthOf(view.eye, aloft) - centre) / SPREAD;
  const forward = distance * Math.cos(theta);
  return {
    x: middleOf(view) + pinhole.focal * Math.tan(theta),
    y: pinhole.y + ((EYE_HEIGHT - aloft.h) * pinhole.focal) / forward,
    forward,
  };
}

/** `framedOf` run backwards: the `Aloft` the frame `centre` at `view`'s eye stands at `framed`. */
export function aloftFramed(view: View, centre: number, framed: Framed): Aloft {
  const pinhole = pinholeOf(view);
  const theta = Math.atan((framed.x - middleOf(view)) / pinhole.focal);
  const azimuth = centre + SPREAD * theta;
  const distance = framed.forward / Math.cos(theta);
  return {
    x: view.eye.x + distance * Math.sin(azimuth),
    y: view.eye.y + distance * Math.cos(azimuth),
    h: EYE_HEIGHT - ((framed.y - pinhole.y) * framed.forward) / pinhole.focal,
  };
}

/**
 * The forward distance `flown` of the way from `from` to `to`: `1 / forward` mixed
 * straight, which is the layout's row mixed straight, and which never dips
 * nearer than the nearer end.
 */
export function mixD(from: number, to: number, flown: number): number {
  return 1 / ((1 - flown) / from + flown / to);
}

/**
 * Where `view` draws `aloft`, sized by its own distance (`CLUMP_DISTANCE /
 * ahead`) and sunk under the brow by the ground under it; none at or behind
 * the eye, nor once it has sunk below the brow.
 */
export function drawnAloft(view: View, aloft: Aloft): Placed | undefined {
  const placed = placedAt(view, aloft, aloft.h, CLUMP_DISTANCE);
  if (!(placed.ahead > 0)) return undefined;
  const drawn = sunkOver(
    view,
    placed,
    placedAt(view, aloft, 0, CLUMP_DISTANCE),
  );
  return buried(view, drawn) ? undefined : drawn;
}

/**
 * How a leg veers round the eye, in the clump's size on the plane: `near`,
 * the least distance it passes the eye at, and `width`, half the band over
 * which the veer eases in. `near` is `V_NEAR`, where an insect's zoom is the
 * nearest drawn mushroom's, so a fly passes the child's ear and never fills
 * the screen.
 */
export type Veer = Record<'near' | 'width', number>;

export const VEER: Veer = { near: V_NEAR, width: V_NEAR / 2 };

/**
 * `aloft` pushed radially out on the plane from `eye` to `veer.near`: as it
 * is past `near + width`, at `near` inside `near − width`, and between them
 * on the parabola that joins the two with a matching slope at both ends, so
 * a leg bends round the eye with no kink. Straight at the eye, it is pushed
 * along the eye's heading.
 */
export function veered(eye: Eye, aloft: Aloft, veer: Veer = VEER): Aloft {
  const { near, width } = veer;
  const distance = Math.hypot(aloft.x - eye.x, aloft.y - eye.y);
  if (distance >= near + width) return aloft;
  const pushed =
    distance <= near - width
      ? near
      : near + (distance - near + width) ** 2 / (4 * width);
  const azimuth = distance > 0 ? azimuthOf(eye, aloft) : eye.heading;
  return {
    ...aloft,
    x: eye.x + pushed * Math.sin(azimuth),
    y: eye.y + pushed * Math.cos(azimuth),
  };
}
