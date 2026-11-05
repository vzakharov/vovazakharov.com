/**
 * Basilisk, a working title: a serpent from one square, in simple and reverse
 * folds, then shaped. The axis is the diagonal (0,0)–(1,1), the tail at (0,0)
 * and the head at (1,1); a diamond narrowed from both corners leaves the body
 * widest mid-sheet. After the fold in half the strip lies at h ≥ 0, the spine
 * (the belly) at h = 0.
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

/** A ray from `from` at `deg` from the sheet's lower edge. */
const ray = (deg: number, from: Vec = [0, 0]): Step['line'] => ({
  p: from,
  q: [from[0] + Math.cos(deg * DEGREE), from[1] + Math.sin(deg * DEGREE)],
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
  angle?: number,
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
    ...(angle === undefined ? {} : { angle }),
  };
}

export type BasiliskOptions = {
  /** Axis distance of the neck's reverse fold, and its line's angle from the
   * spine; the neck rises at twice that. */
  readonly neck: number;
  readonly neckAngle: number;
  /** Axis distance of the head's fold. */
  readonly head: number;
  readonly headAngle: number;
  readonly headDirection: FoldDirection;
  /** Axis distances where the tail bends sideways, head end first. */
  readonly tail: readonly number[];
  /** Degrees of each of the tail's sideways bends. */
  readonly bend: number;
  /** Whether the tail is narrowed a third time — the needle-thin version. */
  readonly third: boolean;
};

const BASILISK_DEFAULTS: BasiliskOptions = {
  neck: 0.95,
  neckAngle: 38,
  head: 1.22,
  headAngle: 50,
  headDirection: 'outside',
  tail: [0.6, 0.42, 0.25],
  bend: 30,
  third: false,
};

/** The head's corner of the sheet; the tail's is the origin. */
const HEAD: Vec = [1, 1];

export function basilisk(options: Partial<BasiliskOptions> = {}): Design {
  const { neck, neckAngle, head, headAngle, headDirection, tail, bend, third } =
    {
      ...BASILISK_DEFAULTS,
      ...options,
    };
  const steps: StepSpec[] = [
    // a diamond: both corners' edges to the diagonal…
    { line: ray(22.5), moving: [0.9, 0.05], direction: 'valley' },
    { line: ray(67.5), moving: [0.05, 0.9], direction: 'valley' },
    { line: ray(247.5, HEAD), moving: [0.98, 0.6], direction: 'valley' },
    { line: ray(202.5, HEAD), moving: [0.6, 0.98], direction: 'valley' },
    // …and again, so the body is widest mid-sheet and tapers both ways
    { line: ray(33.75), moving: [0.9, 0.3], direction: 'valley' },
    { line: ray(56.25), moving: [0.3, 0.9], direction: 'valley' },
    { line: ray(236.25, HEAD), moving: [0.95, 0.7], direction: 'valley' },
    { line: ray(213.75, HEAD), moving: [0.7, 0.95], direction: 'valley' },
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
      line: axisLine(neck, 0, neckAngle),
      moving: axis(1.35, 0.005),
      select: 'flap',
      direction: 'inside',
      lower: 'L',
    },
    // head forward
    (state) => spineFold(state, head, 1.38, headAngle, headDirection),
    // shaping: the tail sweeps sideways along the ground, alternating
    ...tail.map(
      (t, i): StepSpec =>
        (state) =>
          spineFold(state, t, 0.01, 90, i % 2 ? 'mountain' : 'valley', bend),
    ),
  ];
  return {
    steps,
    colors: { front: 0xd9_a4_41, back: 0x1f_5e_4c },
    // Stands on its belly: t along the ground, h up, the paper's own z across
    // — a proper rotation.
    display: ([x, y, z]) => [(x + y) * R, z, (x - y) * R],
  };
}
