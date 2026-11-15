import { wgsl } from '@/cube/shared/shader';

/** How many times the frame is halved: the last is what a lamp's halo is as wide as. */
export const BLOOM_LEVELS = 5;

/** `BLOOM_LEVELS` as a WGSL constant of that name. */
export const BLOOM_NUMBERS = wgsl(
  'ui/bloom-numbers',
  /* wgsl */ `
const BLOOM_LEVELS = ${BLOOM_LEVELS.toFixed(1)};
`,
);
