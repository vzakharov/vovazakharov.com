import type { Surface } from '@/cube/shared/lib/surface';
import { box, type Quad, type Room, type Vec3 } from '@/cube/entities/world';

import { glimpse } from './look';
import type { Player } from './play';

const plus = (a: Vec3, b: Vec3): Vec3 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];

const scaled = (a: Vec3, by: number): Vec3 => [a[0] * by, a[1] * by, a[2] * by];

const dot = (a: Vec3, b: Vec3): number =>
  a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

const unit = (a: Vec3): Vec3 => scaled(a, 1 / Math.hypot(...a));

/** `a·x + b·y + c·z`. */
const mix = (
  [x, y, z]: readonly [Vec3, Vec3, Vec3],
  a: number,
  b: number,
  c: number,
): Vec3 => plus(plus(scaled(x, a), scaled(y, b)), scaled(z, c));

/**
 * A hand's own axes, unit and square to each other: `along` the fingers,
 * `across` the palm towards the thumb, `through` it out of the palm.
 */
type Axes = readonly [along: Vec3, across: Vec3, through: Vec3];

/** A span along one of a hand's axes, in a whole body's room sides. */
type Span = readonly [from: number, to: number];

/**
 * The lengths below are a whole body's, in room sides, a centimetre being
 * 0.002: a sleeve to the wrist, a palm 10 cm long and 9 wide, four fingers
 * with their nails and a thumb.
 */
const SLEEVE: readonly [Span, Span, Span] = [
  [-0.06, -0.004],
  [-0.011, 0.011],
  [-0.009, 0.009],
];
const PALM: readonly [Span, Span, Span] = [
  [-0.004, 0.02],
  [-0.009, 0.009],
  [-0.003, 0.003],
];
/** The fingers' lengths from the thumb's side: index to little. */
const FINGERS = [0.013, 0.016, 0.015, 0.011];
const FINGER_WIDE = 0.004;
const FINGER_PITCH = 0.0046;
const FINGER_FROM = 0.0205;
const FINGER_THICK = 0.0025;
/** A nail's length, how far it stops short of the fingertip, and its thickness. */
const NAIL = [0.0035, 0.0005, 0.0004] as const;
/** A nail's paint: paler than the skin around it. */
const NAIL_PAINT = 0xe9_cf_c6;
const THUMB_LONG = 0.014;
const THUMB_WIDE = 0.0045;

/** Where the wrists are held before the eyes: ahead, to each side, below. */
const HELD: Vec3 = [0.085, 0.035, -0.035];
/** How far under that the hands hang before they rise into sight. */
const LOWERED = 0.09;

/** One hand's quads, its wrist at `wrist`, at `scale` of a whole body's. */
function hand(wrist: Vec3, axes: Axes, scale: number, room: Room): Quad[] {
  const [along, across, through] = axes;
  // `box` wants its edges right-handed, which a mirrored hand's axes are not.
  const righted = dot(cross(along, across), through) > 0;
  const block = (
    [a, b, c]: readonly [Span, Span, Span],
    surface: Surface,
    [p, q]: readonly [Vec3, Vec3] = [along, across],
    paint?: number,
  ): Quad[] => {
    const corner = plus(
      wrist,
      scaled(mix([p, q, through], a[0], b[0], c[0]), scale),
    );
    const edgeP = scaled(p, (a[1] - a[0]) * scale);
    const edgeQ = scaled(q, (b[1] - b[0]) * scale);
    const edgeR = scaled(through, (c[1] - c[0]) * scale);
    return box(
      corner,
      righted ? [edgeP, edgeQ, edgeR] : [edgeQ, edgeP, edgeR],
      room,
      surface,
      paint,
    );
  };
  const fingerAcross = (index: number): Span => {
    const outer = PALM[1][1] - index * FINGER_PITCH;
    return [outer - FINGER_WIDE, outer];
  };
  const fingers = FINGERS.flatMap((long, index) =>
    block(
      [
        [FINGER_FROM, FINGER_FROM + long],
        fingerAcross(index),
        [-FINGER_THICK, FINGER_THICK],
      ],
      'skin',
    ),
  );
  // The nails lie on the backs of the fingers, so only a turned hand shows them.
  const [nailLong, nailShort, nailThick] = NAIL;
  const nails = FINGERS.flatMap((long, index) => {
    const tip = FINGER_FROM + long - nailShort;
    const [inner, outer] = fingerAcross(index);
    return block(
      [
        [tip - nailLong, tip],
        [inner + nailShort, outer - nailShort],
        [-FINGER_THICK - nailThick, -FINGER_THICK],
      ],
      'skin',
      [along, across],
      NAIL_PAINT,
    );
  });
  // The thumb leaves the palm's side at 45°, in the palm's own plane.
  const out = unit(plus(along, across));
  const back = unit(plus(across, scaled(along, -1)));
  const root = Math.SQRT1_2 * (0.002 + PALM[1][1]);
  const outer = Math.SQRT1_2 * (PALM[1][1] - 0.002);
  const thumb = block(
    [
      [root, root + THUMB_LONG],
      [outer - THUMB_WIDE, outer],
      [-FINGER_THICK, FINGER_THICK],
    ],
    'skin',
    [out, back],
  );
  return [
    ...block(SLEEVE, 'fabric'),
    ...block(PALM, 'skin'),
    ...fingers,
    ...nails,
    ...thumb,
  ];
}

/**
 * The body's hands as it looks at them, in the frame of its pose's room:
 * `skin` hands out of `fabric` sleeves, held before the eyes, palms up and
 * then turned over, at the body's own scale. Empty whenever they are out of
 * sight, which is always but in a shrink's look at them.
 */
export function handsOf({ pose, act }: Player): Quad[] {
  if (act?.act !== 'shrinking') return [];
  const { handsUp, turned } = glimpse(act.shrinkLook, act.actFor);
  if (handsUp <= 0) return [];
  const { n, x, y, u, v, eyeAbove, scale, yaw, elevation } = pose;
  const flat = Math.cos(elevation);
  const ahead: Vec3 = [
    flat * Math.cos(yaw),
    Math.sin(elevation),
    flat * Math.sin(yaw),
  ];
  const right: Vec3 = [-Math.sin(yaw), 0, Math.cos(yaw)];
  const up = cross(right, ahead);
  const eye: Vec3 = [u, eyeAbove, v];
  const [forth, aside, under] = HELD;
  return ([1, -1] as const).flatMap((side) => {
    const view: readonly [Vec3, Vec3, Vec3] = [ahead, scaled(right, side), up];
    const wrist = plus(
      eye,
      scaled(mix(view, forth, aside, under - (1 - handsUp) * LOWERED), scale),
    );
    // Fingers ahead, a little up and in; the thumb outward while the palm
    // faces the eye, which is how the hands come up.
    const along = unit(mix(view, 0.9, -0.3, 0.45));
    const outward = view[1];
    const across = unit(plus(outward, scaled(along, -dot(outward, along))));
    const square = cross(along, across);
    const through = dot(square, ahead) < 0 ? square : scaled(square, -1);
    const angle = turned * Math.PI;
    const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
    return hand(
      wrist,
      [
        along,
        plus(scaled(across, cos), scaled(through, sin)),
        plus(scaled(through, cos), scaled(across, -sin)),
      ],
      scale,
      { n, x, y },
    );
  });
}
