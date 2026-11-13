import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import type { Vec2 } from '../lib/vec';
import { f32, wgsl } from '../shader/wgsl';

/**
 * The swell as it meets the island: one train of waves from the south-west,
 * 420 an hour, each a little early or late and taller or lower than the last,
 * so the beach gets sets and lulls and a wave every 7 to 10 seconds. Every
 * function here is a scalar closed form, written twice — TypeScript below,
 * WGSL in `swell-train.wgsl` and `SWELL_SUMS` — and `swell.test.ts` runs the
 * WGSL listing itself against the TypeScript.
 */

/** Gravity at the sea's surface, m/s². */
export const SEA_GRAVITY = 9.81;
/** Seconds in the shared clock's hour, the period every motion returns in. */
export const HOUR_SECONDS = 3600;
export const RADIANS_A_TURN = 2 * Math.PI;

/** Waves the swell lands in an hour. */
export const WAVES = 420;
/** Seconds from one crest to the next, on average. */
export const PERIOD = HOUR_SECONDS / WAVES;
/** The speed the swell's crests travel over deep water, m/s. */
export const DEEP_SPEED = (SEA_GRAVITY * PERIOD) / RADIANS_A_TURN;
/** The unit direction the swell runs, on the ground plan: to the north-east. */
export const SWELL_RUNS: Vec2 = [Math.SQRT1_2, -Math.SQRT1_2];
/** Crest to trough of a middling wave before the bottom is felt, metres. */
export const SWELL_HEIGHT = 0.4;

/** Sines, each [cycles an hour, size, where it starts in turns]. */
type Sines = ReadonlyArray<
  readonly [cycles: number, size: number, start: number]
>;

/** The world the island's sea is rolled in. */
export const SEA_WORLD = '0';

/**
 * The windows three sines' whole cycles an hour are rolled in — [fewest, how
 * many to choose among, how much of the sum it tends to carry].
 */
type Windows = ReadonlyArray<
  readonly [fewest: number, span: number, share: number]
>;

const DRIFT_IN: Windows = [
  [31, 13, 1],
  [53, 17, 1],
  [89, 17, 1],
];
const SETS_IN: Windows = [
  [19, 9, 0.22],
  [37, 9, 0.16],
  [61, 13, 0.1],
];

/** How far the crests' pace swings either side of its mean, as a share of it. */
const PACE_SWING = 0.165;
/** How far the waves' height swings either side of its mean, likewise. */
const HEIGHT_SWING = 0.47;

const sineRoll = (span: number) =>
  roll.struct({
    cycles: roll.pick(span),
    weight: roll.uniform(0.75, 1.25),
    start: roll.uniform(0, 1),
  });

const sinesRoll = (windows: Windows) =>
  roll.struct({
    slow: sineRoll(windows[0]?.[1] ?? 1),
    middle: sineRoll(windows[1]?.[1] ?? 1),
    quick: sineRoll(windows[2]?.[1] ?? 1),
  });

const hash = pathHash(SEA_WORLD);

const rolled = rollWith(
  roll.struct({ drift: sinesRoll(DRIFT_IN), sets: sinesRoll(SETS_IN) }),
  (path) => hash(`island/sea/swell/${path}`),
);

/**
 * Three rolled sines — [cycles an hour, size, where it starts in turns] —
 * whose sizes, each divided by `per(cycles)`, sum to `swing`.
 */
function sinesOf(
  { slow, middle, quick }: (typeof rolled)['drift'],
  windows: Windows,
  swing: number,
  per: (cycles: number) => number,
): Sines {
  const drawn = [slow, middle, quick].map(
    ({ cycles, weight, start }, index) => {
      const [fewest = 1, , share = 1] = windows[index] ?? [];
      return { cycles: fewest + cycles, share: share * weight, start };
    },
  );
  const whole = drawn.reduce((sum, { share }) => sum + share, 0);
  return drawn.map(
    ({ cycles, share, start }) =>
      [cycles, ((swing * share) / whole) * per(cycles), start] as const,
  );
}

/**
 * The slow wander of the crests' timing, in turns: each sine a whole number
 * of cycles an hour, sized so the pace never leaves `PACE_SWING` of its mean.
 */
const DRIFT = sinesOf(
  rolled.drift,
  DRIFT_IN,
  PACE_SWING,
  (cycles) => WAVES / (RADIANS_A_TURN * cycles),
);

/** The slow swelling and sinking of the waves' height, likewise, about 1. */
const SETS = sinesOf(rolled.sets, SETS_IN, HEIGHT_SWING, () => 1);

const sum = (sines: Sines, tau: number): number =>
  sines.reduce(
    (total, [cycles, size, start]) =>
      total +
      size * Math.sin(RADIANS_A_TURN * ((cycles * tau) / HOUR_SECONDS + start)),
    0,
  );

const sumWgsl = (sines: Sines): string =>
  sines
    .map(
      ([cycles, size, start]) =>
        `${f32(size)} * sin(${f32(RADIANS_A_TURN)} * fract(${f32(cycles)} * tau / ${f32(HOUR_SECONDS)} + ${f32(start)}))`,
    )
    .join('\n    + ');

/** How many crests have passed a point whose own time is `tau` seconds. */
export const turnsAt = (tau: number): number =>
  (WAVES * tau) / HOUR_SECONDS + sum(DRIFT, tau);

/** How tall the waves run at `tau`, as a multiple of `SWELL_HEIGHT`. */
export const setsAt = (tau: number): number => 1 + sum(SETS, tau);

/** The moment, in a point's own time, that crest `n` passes it. */
export function crestOf(n: number): number {
  let tau = n * PERIOD;
  for (let round = 0; round < 5; round += 1) {
    tau = (n - sum(DRIFT, tau)) * PERIOD;
  }
  return tau;
}

/**
 * A wave that has felt the bottom, at `phase` turns after its crest: crests
 * sharpened and troughs flattened by `sharp` in [0, 1), the height from crest
 * to trough staying 2 (Abreu et al. 2010, skewed with no asymmetry).
 */
export function peaked(phase: number, sharp: number): number {
  const blunt = Math.sqrt(1 - sharp * sharp);
  const swing = Math.cos(RADIANS_A_TURN * phase);
  return (blunt * (swing - sharp / (1 + blunt))) / (1 - sharp * swing);
}

/** How late in the turn a bore's face begins to rise. */
export const BORE_FACE = 0.955;
/** How fast the water behind a bore's crest falls away, per turn. */
export const BORE_FALL = 3;
/** The mean of the bore's shape, taken off so it rides the still level. */
export const BORE_MEAN = (1 - Math.exp(-BORE_FALL)) / BORE_FALL;

/**
 * A broken wave at `phase` turns after its front passed: highest just behind
 * the front, falling away, then the next front's steep face.
 */
export function bore(phase: number): number {
  const face = Math.min(Math.max((phase - BORE_FACE) / (1 - BORE_FACE), 0), 1);
  const rise = face * face * (3 - 2 * face);
  const fall = Math.exp(-BORE_FALL * phase);
  return 2.1 * (fall + (1 - fall) * rise - BORE_MEAN);
}

/**
 * `swellDrift`, the wander `turnsAt` and `crestOf` add to the crests' even
 * pace, and `setsAt`, in WGSL: sums over the rolled sines, so written out here
 * for `swell-train.wgsl` and `water-level.wgsl` to import.
 */
export const SWELL_SUMS = wgsl(
  'outside/swell',
  /* wgsl */ `
fn swellDrift(tau: f32) -> f32 {
  return ${sumWgsl(DRIFT)};
}

fn setsAt(tau: f32) -> f32 {
  return 1.0
    + ${sumWgsl(SETS)};
}
`,
);
