import { f32, wgsl } from '@/cube/shared/shader';

import { SHORE_CUSP_SINES } from './shore-cusps';
import { RADIANS_A_TURN } from './swell';

/**
 * `cusped(across: f32) -> f32`, the twin of `cusped` in shore-cusps.ts: a sum
 * written out over the rolled sines, for `shore-cusps.wgsl` to import.
 */
export const SHORE_CUSPED = wgsl(
  'outside/shore-cusped',
  /* wgsl */ `
fn cusped(across: f32) -> f32 {
  return 1.0
    + ${SHORE_CUSP_SINES.map(
      ([turns, size, start]) =>
        `${f32(size)} * sin(${f32(RADIANS_A_TURN)} * (${f32(turns)} * across + ${f32(start)}))`,
    ).join('\n    + ')};
}
`,
);
