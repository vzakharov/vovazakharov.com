/**
 * Basilisk, a working title: a crowned serpent from one square, in simple and
 * reverse folds only. The axis is the diagonal (0,0)–(1,1), the tail at
 * (0,0); after the fold in half the strip lies at h ≥ 0, the spine (the belly)
 * at h = 0.
 */
import {
  type FoldDirection,
  type FoldState,
  type Step,
  type StepSpec,
  type Vec,
  where,
} from '@/origami/shared/fold';

import type { Design } from './design.ts';

const DEGREE = Math.PI / 180;
const R = Math.SQRT1_2;

/** A ray from the tail corner at `deg` from the sheet's lower edge. */
const ray = (deg: number): Step['line'] => ({
  p: [0, 0],
  q: [Math.cos(deg * DEGREE), Math.sin(deg * DEGREE)],
});

/** Axis coordinates → paper: `t` along the diagonal, `h` across it. */
const axis = (t: number, h: number): Vec => [(t + h) * R, (t - h) * R];

/** A line through axis point `(t, h)` at `deg` from +t toward +h. */
const axisLine = (t: number, h: number, deg: number): Step['line'] => ({
  p: axis(t, h),
  q: axis(t + Math.cos(deg * DEGREE), h + Math.sin(deg * DEGREE)),
});

/** A point on the spine, `t` along it, in paper coordinates. */
const spine = (t: number): Vec => [t * R, t * R];

/**
 * A reverse fold through the spine at axis distance `t`, its line `deg` from
 * the spine's local direction toward the open side; the part holding spine
 * point `tMove` moves. Computed from the folded state, since by then the spine
 * is no longer straight.
 */
function spineFold(
  state: FoldState,
  t: number,
  tMove: number,
  deg: number,
  direction: FoldDirection,
): Step {
  const origin = where(state, spine(t));
  const ahead = where(state, spine(t + 0.01));
  const along = [ahead[0] - origin[0], ahead[1] - origin[1]] as const;
  const norm = Math.hypot(...along);
  const [dx, dy] = [along[0] / norm, along[1] / norm];
  // The open side: where a point just off the spine, on the strip, lands.
  const off = where(state, [t * R + 0.003, t * R - 0.003]);
  const openSide =
    Math.sign(dx * (off[1] - origin[1]) - dy * (off[0] - origin[0])) || 1;
  const a = deg * DEGREE * openSide;
  const moving = where(state, spine(tMove));
  return {
    line: {
      p: origin,
      q: [
        origin[0] + Math.cos(a) * dx - Math.sin(a) * dy,
        origin[1] + Math.sin(a) * dx + Math.cos(a) * dy,
      ],
    },
    moving,
    select: { at: moving, all: true },
    direction,
    lower: 'L',
  };
}

export type BasiliskOptions = {
  /** Axis distance of the neck's reverse fold. */
  readonly neck: number;
  /** Axis distance of the head's fold. */
  readonly head: number;
  readonly headAngle: number;
  readonly headDirection: FoldDirection;
  /** Axis distances of the tail's two reverse folds, which make an S. */
  readonly tail: readonly [number, number];
  /** Whether the kite is narrowed a third time — the needle-thin version. */
  readonly third: boolean;
};

const BASILISK_DEFAULTS: BasiliskOptions = {
  neck: 0.9,
  head: 1.2,
  headAngle: 52,
  headDirection: 'outside',
  tail: [0.55, 0.3],
  third: true,
};

export function basilisk(options: Partial<BasiliskOptions> = {}): Design {
  const { neck, head, headAngle, headDirection, tail, third } = {
    ...BASILISK_DEFAULTS,
    ...options,
  };
  const steps: StepSpec[] = [
    // kite
    { line: ray(22.5), moving: [0.9, 0.05], direction: 'valley' },
    { line: ray(67.5), moving: [0.05, 0.9], direction: 'valley' },
    // narrow the kite again
    { line: ray(33.75), moving: [0.9, 0.3], direction: 'valley' },
    { line: ray(56.25), moving: [0.3, 0.9], direction: 'valley' },
    ...(third
      ? ([
          { line: ray(39.375), moving: [0.9, 0.5], direction: 'valley' },
          { line: ray(50.625), moving: [0.5, 0.9], direction: 'valley' },
        ] as const)
      : []),
    // fold in half, flaps outside; the upper-left half goes under
    { line: ray(45), moving: [0.2, 0.8], direction: 'mountain', tag: 'L' },
    // neck up: inside reverse fold
    {
      line: axisLine(neck, 0, 43),
      moving: axis(1.2, 0.05),
      select: 'flap',
      direction: 'inside',
      lower: 'L',
    },
    // head tips forward
    (state) => spineFold(state, head, 1.3, headAngle, headDirection),
    // tail: two reverse folds make an S
    {
      line: axisLine(tail[0], 0, 145),
      moving: axis(0.05, 0.002),
      select: 'flap',
      direction: 'inside',
      lower: 'L',
    },
    (state) => spineFold(state, tail[1], 0.02, 40, 'inside'),
  ];
  return {
    steps,
    colors: { front: 0xd9_a4_41, back: 0x1f_5e_4c },
    // Axis coordinates: t right, h up — a proper rotation, seen from the L side.
    display: ([x, y, z]) => [(x + y) * R, (x - y) * R, -z],
  };
}
