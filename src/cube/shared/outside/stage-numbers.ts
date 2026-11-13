import { f32, wgsl } from '../shader/wgsl';

/** Where the scene's `a` says the sky is: farther than anything drawn. */
export const SKY_METRES = 1e4;

/** `SKY_METRES` as the WGSL constant of that name. */
export const STAGE_NUMBERS = wgsl(
  'outside/stage-numbers',
  /* wgsl */ `
const SKY_METRES = ${f32(SKY_METRES)};
`,
);
