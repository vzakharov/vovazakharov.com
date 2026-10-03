/**
 * How each kind of insect flies, stays and chooses, as `nextFlight` in
 * `flight.ts` reads it.
 */

import type { InsectKind } from './insect-genes';

/**
 * How a flight that darts gets there: it dashes `way` of the way in the first
 * `time` of its flight, both shares, and comes in the rest of the way slower.
 */
export type Dash = { time: number; way: number };

/**
 * How a kind that never hangs still holds a spot in the air: a hop every
 * `every` ms to somewhere within `range` of it, in the insect's own sizes.
 */
export type Hops = { every: number; range: number };

/** How fast one kind flies a leg; every time in ms. */
export type Pace = {
  /** How long a flight takes at the least, however short. */
  flying: readonly [number, number];
  /**
   * How fast it flies, in butterfly sizes (`Places`) a second: a flight
   * takes its length at this speed, however long.
   */
  cruising: number;
  /** How it darts over every flight, at its `cruising` speed on average; `undefined` for a kind that glides evenly. */
  dashing: Dash | undefined;
};

/** How one kind flies, stays and chooses; every time in ms. */
export type Habits = Pace & {
  /**
   * How far off, in butterfly sizes (`Places`), a perch is half as likely to
   * be flown to as one beside it.
   */
  stride: number;
  /** Its pace to a shelter from the rain; `undefined` for a kind whose own is quick enough. */
  sheltering: Pace | undefined;
  /** A stay at a flower. */
  drinking: readonly [number, number];
  /** A hover at a spot in the air. */
  hovering: readonly [number, number];
  /** How it hops about a spot in the air while it hovers there; `undefined` for a kind that hangs still. */
  hopping: Hops | undefined;
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
 * with none open mostly hovers and looks again, never hanging still but
 * hopping about its spot in short jerks; a bee goes only to flowers,
 * roaming the air while none is open — and never settling back on the
 * flower it is leaving, so bees as many as the flowers still take turns at
 * them and carry pollen between them. Hovers are long enough that on a
 * small screen few insects in the air move at once. Each cruises at its
 * own speed whatever the way, a fly fastest and a butterfly slowest; a fly
 * darts most of the way in a little under a quarter of its flight and a bee
 * a little less of it in a fifth, each coming in to its perch slower, so a
 * finger can catch it most of the time. That catch bounds both numbers: the
 * coming-in, `cruising` times `(1 - way) / (1 - time)`, stays near a size a
 * second, or on a screen with big insects (a tablet held upright) a tap
 * 200 ms late misses; and no flier is caught mid-dash, so a dash longer than
 * the fly's drops its catch under seven in ten. The dash's own speed,
 * `cruising` times `way / time`, is what reads as fast, or as sharp. To
 * shelter from the rain a butterfly doubles its pace and darts, under cover
 * in about two seconds, its coming-in still near a size a second; a fly and
 * a bee keep their own.
 */
export const FLIGHT_HABITS = {
  butterfly: {
    flying: [2400, 3900],
    stride: 3,
    cruising: 0.95,
    dashing: undefined,
    sheltering: {
      flying: [1200, 1900],
      cruising: 1.9,
      dashing: { time: 0.3, way: 0.6 },
    },
    drinking: [3000, 6000],
    hovering: [4000, 8000],
    hopping: undefined,
    resting: [4000, 9000],
    flowerShare: 0.6,
    spottedPull: 0.25,
    fussy: 0,
    settles: true,
  },
  fly: {
    flying: [600, 1100],
    stride: 0.9,
    cruising: 5,
    dashing: { time: 0.24, way: 0.85 },
    sheltering: undefined,
    drinking: [1500, 4000],
    hovering: [2000, 4500],
    hopping: { every: 280, range: 0.7 },
    resting: [1500, 4000],
    flowerShare: 0.1,
    spottedPull: 8,
    fussy: 0.85,
    settles: true,
  },
  bee: {
    flying: [1100, 1800],
    stride: 1.4,
    cruising: 4,
    dashing: { time: 0.2, way: 0.75 },
    sheltering: undefined,
    drinking: [2000, 3500],
    hovering: [1500, 3000],
    hopping: undefined,
    resting: undefined,
    flowerShare: 1,
    spottedPull: 1,
    fussy: 0,
    settles: false,
  },
} as const satisfies Record<InsectKind, Habits>;
