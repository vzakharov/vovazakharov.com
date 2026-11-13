import { f32, wgsl } from '../shader/wgsl';
import { SEA_GRAVITY, SWELL_HEIGHT } from './swell';

/** The swell's numbers the TypeScript holds too, as WGSL constants. */
export const SWELL_NUMBERS = wgsl(
  'outside/swell-numbers',
  /* wgsl */ `
const SEA_GRAVITY = ${f32(SEA_GRAVITY)};
const SWELL_HEIGHT = ${f32(SWELL_HEIGHT)};
`,
);
