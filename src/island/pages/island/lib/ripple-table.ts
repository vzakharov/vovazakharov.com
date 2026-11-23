import { f32, wgsl } from '@/gpu/shared/shader';

import { HOUR_SECONDS } from '@/nature/shared/swell';

/**
 * The wind sea's ripples as a fixed table of plane waves in space, each an
 * integer wave vector over a period that halves from band to band. A place is
 * handed to the shader modulo `RIPPLE_PERIOD`, so every phase is exact in
 * float32 anywhere on the planet, and a wave is one sine over the whole globe
 * with no seam between tiles. Where a wave's vector lies along the sea it
 * ripples it; where it stands up out of the sea it is left out.
 */

/** The metres every wave of the coarsest band repeats over, on each axis. */
export const RIPPLE_PERIOD = 256;
/** Bands, each half the last one's wavelengths: 40 m down to a hand's width. */
export const RIPPLE_BANDS = 8;
/** Waves a band holds, spread over every direction in space. */
export const RIPPLES_PER_BAND = 8;

const GRAVITY = 9.81;
const TAU = 2 * Math.PI;
const GOLDEN = (1 + Math.sqrt(5)) / 2;

/**
 * The cell of the two slow fields a wave's phase drifts with, metres: what
 * breaks each wave into groups a few of its lengths long, so the table's
 * waves beat into no lattice.
 */
const GROUP_CELL = 32;
/** The metres the slow fields repeat over, on each axis: a float32 keeps it to millimetres. */
export const GROUP_PERIOD = 16_384;

/** The share of the sea's slope variance one wave of the table carries, on average. */
const RIPPLE_SHARE = 0.065;

/** Turns of drift across the slow fields' range for the coarsest band, and their growth band to band. */
const GROUP_TURNS = 1;
const GROUP_GROWTH = 1.85;

/** A wave by its integer vector, in turns per its band's period. */
export type Ripple = {
  readonly vector: readonly [number, number, number];
  readonly band: number;
  /** Radians a second, a whole number of turns an hour. */
  readonly pace: number;
  /** The phase it starts the hour at, radians. */
  readonly phase: number;
  /**
   * Turns its phase drifts by per unit of each slow field: its own mix of
   * the two, so no two waves of a band keep step for long.
   */
  readonly drift: readonly [number, number];
};

/** The shortest and the longest vector a wave takes, in turns per period. */
const SHORTEST = 6;
const LONGEST = 11;

/**
 * The table: per band, `RIPPLES_PER_BAND` directions off a golden spiral
 * turned from band to band, each stretched to a length between `SHORTEST` and
 * `LONGEST` and rounded to whole turns.
 */
export const RIPPLES: readonly Ripple[] = Array.from(
  { length: RIPPLE_BANDS * RIPPLES_PER_BAND },
  (_, i) => {
    const band = Math.floor(i / RIPPLES_PER_BAND);
    const n = i % RIPPLES_PER_BAND;
    const y = 1 - (2 * (n + 0.5)) / RIPPLES_PER_BAND;
    const ring = Math.sqrt(1 - y * y);
    const turn = TAU * (n / GOLDEN + band * 0.381_966 + 0.11);
    const reach = SHORTEST + (LONGEST - SHORTEST) * ((i * GOLDEN * GOLDEN) % 1);
    const vector = [
      Math.round(reach * ring * Math.cos(turn)),
      Math.round(reach * y),
      Math.round(reach * ring * Math.sin(turn)),
    ] as const;
    const metres = RIPPLE_PERIOD / 2 ** band / Math.hypot(...vector);
    const turnsAnHour = Math.round(
      (Math.sqrt((GRAVITY * TAU) / metres) * HOUR_SECONDS) / TAU,
    );
    const turns = GROUP_TURNS * GROUP_GROWTH ** band;
    return {
      vector,
      band,
      pace: (turnsAnHour * TAU) / HOUR_SECONDS,
      phase: TAU * ((i * GOLDEN) % 1),
      drift: [
        turns * (2 * ((i * GOLDEN + 0.3) % 1) - 1),
        turns * (2 * ((i * GOLDEN * GOLDEN + 0.7) % 1) - 1),
      ],
    };
  },
);

/** The table as WGSL constants: each wave's vector and phase, its pace and its drift. */
export const RIPPLE_TABLE = wgsl(
  'island/pages/island/lib/ripple-table',
  /* wgsl */ `
const RIPPLE_BANDS = ${String(RIPPLE_BANDS)};
const RIPPLES_PER_BAND = ${String(RIPPLES_PER_BAND)};
const RIPPLE_PERIOD = ${f32(RIPPLE_PERIOD)};
const RIPPLE_SHARE = ${f32(RIPPLE_SHARE)};
const GROUP_CELL = ${f32(GROUP_CELL)};
const GROUP_CELLS = ${f32(GROUP_PERIOD / GROUP_CELL)};
const RIPPLES = array<vec4f, ${String(RIPPLES.length)}>(
${RIPPLES.map(({ vector: [x, y, z], phase }) => `  vec4f(${f32(x)}, ${f32(y)}, ${f32(z)}, ${f32(phase)})`).join(',\n')}
);
const RIPPLE_PACES = array<f32, ${String(RIPPLES.length)}>(
${RIPPLES.map(({ pace }) => `  ${f32(pace)}`).join(',\n')}
);
const RIPPLE_DRIFTS = array<vec2f, ${String(RIPPLES.length)}>(
${RIPPLES.map(({ drift: [a, b] }) => `  vec2f(${f32(a)}, ${f32(b)})`).join(',\n')}
);
`,
);
