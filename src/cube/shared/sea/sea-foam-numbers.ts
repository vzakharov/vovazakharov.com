import { PERIOD } from '../outside/swell';
import { f32, wgsl } from '../shader/wgsl';

/** The open swell's period, seconds, as the WGSL constant `SWELL_PERIOD`. */
export const SEA_FOAM_NUMBERS = wgsl(
  'sea/foam-numbers',
  /* wgsl */ `
const SWELL_PERIOD = ${f32(PERIOD)};
`,
);
