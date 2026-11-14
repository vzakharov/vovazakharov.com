import { f32, wgsl } from '@/cube/shared/shader';

import {
  BORE_FACE,
  BORE_FALL,
  BORE_MEAN,
  HOUR_SECONDS,
  PERIOD,
  RADIANS_A_TURN,
  SEA_GRAVITY,
  SWELL_HEIGHT,
  WAVES,
} from './swell';

/**
 * The swell's numbers the TypeScript holds too, as WGSL constants, with the
 * bore's rising face as one span the shader divides by.
 */
export const SWELL_NUMBERS = wgsl(
  'outside/swell-numbers',
  /* wgsl */ `
const SEA_GRAVITY = ${f32(SEA_GRAVITY)};
const SWELL_HEIGHT = ${f32(SWELL_HEIGHT)};
const HOUR_SECONDS = ${f32(HOUR_SECONDS)};
const RADIANS_A_TURN = ${f32(RADIANS_A_TURN)};
const WAVES = ${f32(WAVES)};
const PERIOD = ${f32(PERIOD)};
const BORE_FACE = ${f32(BORE_FACE)};
const BORE_FACE_SPAN = ${f32(1 - BORE_FACE)};
const BORE_FALL = ${f32(BORE_FALL)};
const BORE_MEAN = ${f32(BORE_MEAN)};
`,
);
