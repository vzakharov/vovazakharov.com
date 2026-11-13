import { f32, wgsl } from '../shader/wgsl';
import { SLOPE } from './water-level';

/** The shore's numbers the TypeScript holds too, as WGSL constants. */
export const WATER_LEVEL_NUMBERS = wgsl(
  'outside/water-level-numbers',
  /* wgsl */ `
const BEACH_SLOPE = ${f32(SLOPE)};
`,
);
