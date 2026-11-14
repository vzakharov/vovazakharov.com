import { f32, vecf, wgsl } from '@/cube/shared/shader';

import { DEEP_SPEED, SWELL_RUNS } from './swell';

/**
 * Which way the open swell runs, and how slowly, as WGSL constants: the
 * heading as a vector and as its two components.
 */
export const SWELL_COURSE = wgsl(
  'outside/swell-course',
  /* wgsl */ `
const SWELL_RUNS = ${vecf(SWELL_RUNS)};
const SWELL_RUNS_X = ${f32(SWELL_RUNS[0])};
const SWELL_RUNS_Z = ${f32(SWELL_RUNS[1])};
/// Seconds the open swell takes over a metre.
const SWELL_PACE = ${f32(1 / DEEP_SPEED)};
`,
);
