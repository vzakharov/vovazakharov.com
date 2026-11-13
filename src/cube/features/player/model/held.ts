import {
  cross,
  dot,
  minus,
  pillOn,
  pillQuads,
  plus,
  type Pose,
  type Quad,
  times,
  unit,
  type Vec3,
} from '@/cube/entities/world';

import { rise } from './ease';
import { type Axes, CM, hand, inAxes, padOf } from './hand';
import { between, LOOSE, PINCH } from './hand-shape';
import type { Station, Taking } from './player';
import { graspOf } from './take';
import { type View, viewOf } from './view';

// Where a station has the pill, the elbow or shoulder its arm comes from and
// the way its palm faces are in the gaze's own axes — ahead, to the right,
// up — in room sides of a whole body, from the eye.

/** Where the pill is held before the eyes, and at the mouth, under them. */
const BEFORE_EYES: Vec3 = [0.062, 0.006, -0.014];
const AT_MOUTH: Vec3 = [0.012, 0, -0.026];
/** Where the hand hangs, out of sight. */
const HANGING: Vec3 = [0.05, 0.03, -0.11];

/** The shoulder a reaching arm comes from, and the elbow a raised one does. */
const SHOULDER: Vec3 = [0, 0.036, -0.04];
const ELBOW: Vec3 = [0.045, 0.032, -0.09];

/** Where the thumb's and the forefinger's pads close, in the hand's axes, in cm. */
const [FOREFINGER, THUMB] = [padOf(PINCH, 0), padOf(PINCH, 4)];
const PINCH_AT = times(plus(FOREFINGER, THUMB), 0.5);
/** The way a pinched pill's length runs: square to the pinch, in the palm's plane. */
const PINCH_AXIS = unit(cross(minus(THUMB, FOREFINGER), [0, 0, 1]));

/** Each station's pill, null on the shelf, which has its own, and whether its arm is raised. */
const STATIONS: Record<Station, { pill: Vec3 | null; raised: boolean }> = {
  down: { pill: HANGING, raised: false },
  shelf: { pill: null, raised: false },
  eyes: { pill: BEFORE_EYES, raised: true },
  mouth: { pill: AT_MOUTH, raised: true },
};

const partWay = (a: Vec3, b: Vec3, share: number): Vec3 =>
  plus(a, times(minus(b, a), share));

/**
 * A station's hand in the room's frame: where the pill is, where its arm
 * comes from, and the way its palm faces — down from a lowered arm, at the
 * eye from a raised one.
 */
function stationed(
  station: Station,
  { eye, ahead, right, up }: View,
  shelfAt: Vec3,
  scale: number,
): { pill: Vec3; arm: Vec3; palm: Vec3 } {
  const view = [ahead, right, up] as const;
  const from = (at: Vec3): Vec3 => plus(eye, times(inAxes(view, at), scale));
  const { pill, raised } = STATIONS[station];
  return {
    pill: pill === null ? shelfAt : from(pill),
    arm: from(raised ? ELBOW : SHOULDER),
    palm: raised ? times(ahead, -1) : [0, -1, 0],
  };
}

/** `way` turned `angle` about `axis`, a unit vector square to it. */
const about = (way: Vec3, axis: Vec3, angle: number): Vec3 =>
  plus(times(way, Math.cos(angle)), times(cross(axis, way), Math.sin(angle)));

/**
 * The hand of a body at `pose` taking its room's pill, and the pill once the
 * hand has it: a right hand, pinching, its arm running back out of sight.
 */
export function takingHand(
  pose: Pose,
  act: Taking & { actFor: number },
): Quad[] {
  const { n, x, y, scale } = pose;
  const room = { n, x, y };
  const { from, to, gone, pinch, wristTurn, holds } = graspOf(act);
  const onShelf = pillOn(act.shelf);
  const view = viewOf(pose);
  const [a, b] = [
    stationed(from, view, onShelf.centre, scale),
    stationed(to, view, onShelf.centre, scale),
  ];
  const pill = partWay(a.pill, b.pill, gone);
  const arm = partWay(a.arm, b.arm, gone);
  const along = unit(minus(pill, arm));
  const facing = partWay(a.palm, b.palm, gone);
  const palm = unit(minus(facing, times(along, dot(facing, along))));
  const through = about(palm, along, wristTurn);
  const axes: Axes = [along, cross(along, through), through];
  const wrist = minus(pill, times(inAxes(axes, PINCH_AT), scale * CM));
  const sleeve = Math.hypot(...minus(wrist, arm)) / (scale * CM);
  const quads = hand(wrist, axes, scale, room, {
    ...between(LOOSE, PINCH, pinch),
    sleeve,
  });
  if (!holds) return quads;
  // The pill lies as the shelf has it while the hand is there, and as the
  // pinch has it away from it.
  const inHand = inAxes(axes, PINCH_AXIS);
  const lying = times(onShelf.axis, dot(onShelf.axis, inHand) < 0 ? -1 : 1);
  const settled =
    from === 'shelf'
      ? rise(gone, 0, 0.35)
      : to === 'shelf'
        ? 1 - rise(gone, 0.65, 1)
        : 1;
  return [
    ...quads,
    ...pillQuads(pill, unit(partWay(lying, inHand, settled)), 1, room),
  ];
}
