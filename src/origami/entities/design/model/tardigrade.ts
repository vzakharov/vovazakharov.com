/**
 * Tardigrade, a working title: a water bear from one square whose volume is
 * in the folds. The spine is the sheet's midline y = 0.5, the tail at x = 0
 * and the head at x = 1. Every flat fold runs parallel or perpendicular to the
 * spine, so the spine stays one straight crease the body opens on.
 */
import { type StepSpec, type Vec, where } from '@/origami/shared/fold';

import type { Design } from './design.ts';

export type TardigradeOptions = {
  /** Width of the hem folded under along each long edge — the belly. */
  readonly hem: number;
  /** Sheet x of each segment pleat's valley, head end first. */
  readonly pleats: readonly number[];
  /** How much length each pleat hides, half of it per crease. */
  readonly depth: number;
  /** Degrees each half turns at the spine. */
  readonly spine: number;
  /** Distance of each barrel crease from the spine, and its angle. */
  readonly barrel: ReadonlyArray<readonly [number, number]>;
  /** How far up the crease each leg's hinge starts, and how far it turns. */
  readonly leg: number;
  readonly legAngle: number;
  /** The head's corners, folded under: how far below the spine the fold
   * meets the head edge, and how far back it meets the belly edge. */
  readonly snout: readonly [number, number];
};

const TARDIGRADE_DEFAULTS: TardigradeOptions = {
  hem: 0.22,
  pleats: [0.72, 0.45, 0.18],
  depth: 0.12,
  spine: 25,
  barrel: [
    [0.07, 30],
    [0.14, 35],
    [0.19, 70],
  ],
  leg: 0.08,
  legAngle: 90,
  snout: [0.1, 0.12],
};

/** A line across the sheet at flat x. */
const across = (x: number) => ({ p: [x, 0] as Vec, q: [x, 1] as Vec });
/** A line along the sheet at flat y. */
const along = (y: number) => ({ p: [0, y] as Vec, q: [1, y] as Vec });

export function tardigrade(options: Partial<TardigradeOptions> = {}): Design {
  const { hem, pleats, depth, spine, barrel, leg, legAngle, snout } = {
    ...TARDIGRADE_DEFAULTS,
    ...options,
  };
  const w = depth / 2;
  /**
   * A leg: the corner where the tail edge, or a pleat's head-side crease, meets
   * the belly edge, turned outward. The belly is curled under, so outward is
   * down. Only the corner's outer layers turn — at a pleat, the tuck and the
   * paper over it, each with its hem — so nothing lies in their way. `x` is
   * the crease's sheet x, `half` which half (-1 the lower).
   */
  const legStep =
    (x: number, half: number): StepSpec =>
    (state) => {
      const edge = half < 0 ? hem : 1 - hem;
      const up = -half;
      const [cx] = where(state, [x, 0.5]);
      // A tuck is w wide, so a corner wider would drag the paper past it.
      const base: Vec = [cx + w * 0.95, edge];
      const top: Vec = [cx, edge + up * leg];
      const inside: Vec = [cx + w * 0.3, edge + up * leg * 0.3];
      return {
        line: { p: base, q: top },
        moving: inside,
        select: { at: inside, top: 4 },
        direction: 'valley',
        angle: legAngle,
      };
    };
  const steps: StepSpec[] = [
    // the belly: both long edges under
    { line: along(hem), moving: [0.5, 0.01], direction: 'mountain' },
    { line: along(1 - hem), moving: [0.5, 0.99], direction: 'mountain' },
    // the head: its lower corners under, each within its own half
    ...[-1, 1].map((half): StepSpec => {
      const edge = 0.5 + half * (0.5 - hem);
      const p: Vec = [1, 0.5 + half * snout[0]];
      const q: Vec = [1 - snout[1], edge];
      return {
        line: { p, q },
        moving: [1 - snout[1] * 0.2, edge - half * 0.01],
        direction: 'mountain',
      };
    }),
    // segments: a pleat across the whole sheet, the head end first, so each
    // later pleat's lines are still where the sheet put them
    ...pleats.flatMap((a): StepSpec[] => [
      { line: across(a), moving: [Math.min(a + 0.01, 0.999), 0.5] },
      // the paper past the tuck, back over it
      (state) => {
        const crease = where(state, [a + w, 0.5]);
        return {
          line: across(crease[0]),
          moving: [crease[0] - 0.005, 0.5],
          select: { at: [crease[0] - 0.005, 0.5], top: 1 },
        };
      },
    ]),
    // the tent: each half turns down about the spine
    {
      line: along(0.5),
      moving: [0.5, 0.1],
      direction: 'mountain',
      angle: spine,
      tag: 'L',
    },
    {
      line: along(0.5),
      moving: [0.5, 0.9],
      direction: 'mountain',
      angle: spine,
      tag: 'U',
    },
    // the barrel: each half bends again further down, the last bend curling
    // the belly under
    ...barrel.flatMap(([c, angle]): StepSpec[] => [
      {
        line: along(0.5 - c),
        moving: [0.5, 0.01],
        select: { tag: 'L' },
        direction: 'mountain',
        angle,
      },
      {
        line: along(0.5 + c),
        moving: [0.5, 0.99],
        select: { tag: 'U' },
        direction: 'mountain',
        angle,
      },
    ]),
    // eight legs: the tail's corners and each pleat's corner, on both halves
    ...[-1, 1].flatMap((half) => [
      legStep(0, half),
      ...pleats.map((a) => legStep(a + w, half)),
    ]),
  ];
  return {
    steps,
    colors: { front: 0x8a_9a_5b, back: 0xe8_dc_c0 },
    // The spine on top: x along the ground, y across, the paper's z up.
    display: ([x, y, z]) => [x, y - 0.5, z],
  };
}
