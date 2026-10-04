/**
 * The leg's frame (`flight-frame.ts`) on the screen: `view`'s pinhole as the
 * frame, in world px, so at the opening eye facing the clump a leg is flown
 * as the layout flies it; where a framed flight stands in the air, never
 * under the ground; and how a leg veers round the eye.
 */

import { pick } from '@/shared/lib/collections';

import {
  type Aloft,
  azimuthOf,
  type EyeFrame,
  type Framed,
  unframed,
} from '../../model/flight-frame';
import {
  alongAzimuth,
  distanceBetween,
  type Point,
} from '../../model/geometry';
import {
  type Camera,
  CLUMP_DISTANCE,
  type Eye,
  EYE_HEIGHT,
} from '../../model/ground';
import { smooth } from '../../model/motion';
import { alongSight, bendAt, pinholeOf } from '../../model/pinhole';
import {
  buried,
  middleOf,
  type Placed,
  placedAt,
  sunkOver,
  V_NEAR,
  type View,
} from './view';

/** `view`'s pinhole as the frame a leg is drawn in (`EyeFrame`), in px of `unit` CSS px: the world px of the opening layout at 1. */
export function eyeFrameOf(view: View, unit = 1): EyeFrame {
  const pinhole = pinholeOf(view);
  return {
    x: middleOf(view) / unit,
    y: pinhole.y / unit,
    focal: pinhole.focal / unit,
    ...pick(view, 'eye'),
  };
}

/**
 * The height, in the clump's size, under which a flight's height eases
 * toward the ground instead of going under it (`aloftFramed`).
 */
export const SKIM = 0.1;

/**
 * The `Aloft` a flight framed at `framed` stands at: `unframed`, but never
 * under the ground. A leg mixes its forward distance along its chord, so a
 * point its bow, zigzag or flutter swings below the chord's ground line
 * would read back under the ground; it is nearer instead, on the same sight,
 * so the screen point is kept. Its height is `unframed`'s from `SKIM` up and
 * below it eases toward 0 on an exponential matched in value and slope, so
 * a swoop toward the grass bends its height and size with no kink.
 */
export function aloftFramed(view: View, centre: number, framed: Framed): Aloft {
  const frame = eyeFrameOf(view);
  const exact = unframed(frame, centre, framed);
  if (exact.h >= SKIM) return exact;
  const h = SKIM * Math.exp((exact.h - SKIM) / SKIM);
  // Below the horizon the sight drops `EYE_HEIGHT − h` over `forward`.
  const forward = (framed.forward * (EYE_HEIGHT - h)) / (EYE_HEIGHT - exact.h);
  return { ...unframed(frame, centre, { ...framed, forward }), h };
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
 * ahead`) and sunk under the brow by the ground under it (`drawn`), sunk or
 * not; it and that ground as the view places them before they sink
 * (`placed`, `ground`); none at or behind the eye.
 */
export function sinkingAloft(
  view: View,
  aloft: Aloft,
): { drawn: Placed; placed: Placed; ground: Placed } | undefined {
  const placed = placedAt(view, aloft, aloft.h, CLUMP_DISTANCE);
  if (!(placed.ahead > 0)) return undefined;
  const ground = placedAt(view, aloft, 0, CLUMP_DISTANCE);
  return { drawn: sunkOver(view, placed, ground), placed, ground };
}

/**
 * Where `view` draws `aloft` (`sinkingAloft`); none at or behind the eye,
 * nor once it has sunk below the brow.
 */
export function drawnAloft(view: View, aloft: Aloft): Placed | undefined {
  const drawn = sinkingAloft(view, aloft)?.drawn;
  return drawn && !buried(view, drawn) ? drawn : undefined;
}

/**
 * The `Aloft` `view` draws at the screen's `at`, in CSS px, `distance` from
 * its eye in the clump's size: on the plane along the sight at `at.x`, at the
 * height that draws it at `at.y`. `drawnAloft` takes it back to `at` wherever
 * the ground under it has not sunk under the brow.
 */
export function aloftAt(view: View, at: Point, distance: number): Aloft {
  const pinhole = pinholeOf(view);
  const scale = (pinhole.focal * bendAt(pinhole, at.x)) / distance;
  return {
    ...alongSight(view, view.eye, at.x, distance),
    h: view.eyeHeight - (at.y - pinhole.y) / scale,
  };
}

/**
 * How a leg veers round the eye, in the clump's size on the plane: `near`,
 * the least distance it passes the eye at, and `width`, half the band over
 * which the veer eases in.
 */
export type Veer = Record<'near' | 'width', number>;

/**
 * The veer on `camera`'s screen: `near` is `V_NEAR` bent as the screen's edge
 * bends it, so an insect passing the eye there is drawn no bigger than the
 * nearest mushroom drawn at the middle, and never fills the screen; `width`
 * barely moves the zoom, so it is kept narrow.
 */
export function veerOf(camera: Camera): Veer {
  return {
    near: V_NEAR * bendAt(pinholeOf(camera), 0),
    width: 0.1 * CLUMP_DISTANCE,
  };
}

/**
 * `aloft` pushed radially out on the plane from `eye` to `veer.near`: as it
 * is past `near + width`, at `near` inside `near − width`, and between them
 * on the parabola that joins the two with a matching slope at both ends, so
 * a leg bends round the eye with no kink. Straight at the eye, it is pushed
 * along the eye's heading.
 */
export function veered(eye: Eye, aloft: Aloft, veer: Veer): Aloft {
  const { near, width } = veer;
  const distance = distanceBetween(eye, aloft);
  if (distance >= near + width) return aloft;
  const pushed =
    distance <= near - width
      ? near
      : near + (distance - near + width) ** 2 / (4 * width);
  const azimuth = distance > 0 ? azimuthOf(eye, aloft) : eye.heading;
  return { ...aloft, ...alongAzimuth(eye, azimuth, pushed) };
}

/**
 * The seats a leg leaves from (`from`) and lands on (`to`), as plane points;
 * an end in the air, which the veer may move, is absent.
 */
export type SeatEnds = Partial<Record<'from' | 'to', Point>>;

/** The share of `flown` at a seat end over which the veer fades out. */
export const SEAT_FADE = 0.3;

/**
 * How much of the veer a leg keeps `flown` of the way along, from the seat
 * `seat` at its end `toward` (`flown`'s distance from that end, 0 at it):
 * all of it unless the veer moves the seat (inside `near + width` of `eye`),
 * none at the seat, and in between a smoothstep over `SEAT_FADE` of the way,
 * shortened as the seat nears the band's outer edge, where the veer moves it
 * less, so the keep is continuous as the eye walks a seat out of the band.
 */
function keptBy(eye: Eye, seat: Point, veer: Veer, toward: number): number {
  const distance = distanceBetween(eye, seat);
  const depth = smooth((veer.near + veer.width - distance) / veer.width);
  if (depth === 0) return 1;
  return smooth(toward / (SEAT_FADE * depth));
}

/**
 * `aloft`, `flown` of the way along its leg, veered round `eye` (`veered`)
 * but with the veer faded out toward a seat end the veer would move, so the
 * insect leaves and lands on that seat exactly. The fade is C¹ in `flown`;
 * on a leg with no such seat end it is `veered` itself.
 */
export function veeredAlong(
  eye: Eye,
  aloft: Aloft,
  veer: Veer,
  flown: number,
  ends: SeatEnds,
): Aloft {
  const moved = veered(eye, aloft, veer);
  if (moved === aloft) return aloft;
  const keep =
    (ends.from ? keptBy(eye, ends.from, veer, flown) : 1) *
    (ends.to ? keptBy(eye, ends.to, veer, 1 - flown) : 1);
  return {
    ...aloft,
    x: aloft.x + keep * (moved.x - aloft.x),
    y: aloft.y + keep * (moved.y - aloft.y),
  };
}
