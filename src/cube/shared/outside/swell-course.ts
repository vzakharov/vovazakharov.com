import { f32, vecf, wgsl } from '../shader/wgsl';
import { DEEP_SPEED, SWELL_RUNS } from './swell';

/** Which way the open swell runs, and how slowly, as WGSL constants. */
export const SWELL_COURSE = wgsl(
  'outside/swell-course',
  /* wgsl */ `
const SWELL_RUNS = ${vecf(SWELL_RUNS)};
/// Seconds the open swell takes over a metre.
const SWELL_PACE = ${f32(1 / DEEP_SPEED)};
`,
);
