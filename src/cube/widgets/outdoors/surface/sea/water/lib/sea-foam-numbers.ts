import { f32, wgsl } from '@/cube/shared/shader';
import { PERIOD } from '@/cube/entities/island';

/** The open swell's period, seconds, as the WGSL constant `SWELL_PERIOD`. */
export const SEA_FOAM_NUMBERS = wgsl(
  'sea/foam-numbers',
  /* wgsl */ `
const SWELL_PERIOD = ${f32(PERIOD)};
`,
);
