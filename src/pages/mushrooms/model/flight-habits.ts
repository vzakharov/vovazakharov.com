/**
 * How each kind of insect flies, stays and chooses, as `nextFlight` in
 * `flight.ts` reads it.
 */

import type { InsectKind } from './insect-genes';

/** How one kind flies, stays and chooses; every time in ms. */
export type Habits = {
  /** How long a flight takes, over a `stride` or less. */
  flying: readonly [number, number];
  /**
   * The farthest a flight goes in its `flying` time, in butterfly sizes
   * (`Places`); a farther one flies on at that speed, so a child's finger can
   * follow it across a wide screen.
   */
  stride: number;
  /** The most times its `flying` time any flight takes, so none drags. */
  slowest: number;
  /**
   * Past `slowest`, the share of its time a flight dashes before it flies its
   * last strides at its pace; `undefined` for a kind that simply flies faster.
   */
  dashing: number | undefined;
  /** A stay at a flower. */
  drinking: readonly [number, number];
  /** A hover at a spot in the air. */
  hovering: readonly [number, number];
  /** A rest on a cap; `undefined` for a kind that never sits on one. */
  resting: readonly [number, number] | undefined;
  /** How often, with both open, it goes to a flower rather than a cap. */
  flowerShare: number;
  /** How many times as often it picks a spotted cap as any other. */
  spottedPull: number;
  /** How often, with no spotted cap open, it roams the air and looks again rather than land anywhere else. */
  fussy: number;
  /** Whether, with nowhere else open, it settles again where it sat rather than roaming. */
  settles: boolean;
};

/**
 * Every kind's habits. A butterfly drinks at a flower three times in five,
 * rests long, mostly on a plain cap, and hovers lazily; a fly darts the
 * quickest, to a fly agaric far more often than to any other perch, and
 * with none open mostly hovers and looks again; a bee goes only to flowers,
 * roaming the air while none is open — and never settling back on the
 * flower it is leaving, so bees as many as the flowers still take turns at
 * them and carry pollen between them. Hovers are long enough that on a
 * small screen few insects in the air move at once. Across a wide screen a
 * butterfly takes at most a third longer than over a stride, flying the
 * faster the farther it goes, and a fly or a bee darts over most of it and
 * comes in to its perch at its own pace, so each is a child's finger's to
 * catch most of the way.
 */
export const FLIGHT_HABITS = {
  butterfly: {
    flying: [2400, 3900],
    stride: 3,
    slowest: 1.3,
    dashing: undefined,
    drinking: [3000, 6000],
    hovering: [4000, 8000],
    resting: [4000, 9000],
    flowerShare: 0.6,
    spottedPull: 0.25,
    fussy: 0,
    settles: true,
  },
  fly: {
    flying: [600, 1100],
    stride: 0.9,
    slowest: 1.8,
    dashing: 0.2,
    drinking: [1500, 4000],
    hovering: [2000, 4500],
    resting: [1500, 4000],
    flowerShare: 0.1,
    spottedPull: 8,
    fussy: 0.85,
    settles: true,
  },
  bee: {
    flying: [1100, 1800],
    stride: 1.4,
    slowest: 1.7,
    dashing: 0.2,
    drinking: [2000, 3500],
    hovering: [1500, 3000],
    resting: undefined,
    flowerShare: 1,
    spottedPull: 1,
    fussy: 0,
    settles: false,
  },
} as const satisfies Record<InsectKind, Habits>;
