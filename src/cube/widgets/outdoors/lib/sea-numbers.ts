import { f32, wgsl } from '@/cube/shared/shader';

import { UNSEEN_SPREAD } from './sea-state';

/** `UNSEEN_SPREAD` as the WGSL constant of that name. */
export const SEA_NUMBERS = wgsl(
  'sea/numbers',
  /* wgsl */ `
const UNSEEN_SPREAD = ${f32(UNSEEN_SPREAD)};
`,
);
