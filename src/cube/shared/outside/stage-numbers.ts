import { f32, wgsl } from '../shader/wgsl';

/** How far off the eye's far plane is whenever a frame shows the outside. */
export const FAR_METRES = 20_000;

/** Where the scene's `a` says the sky is: farther than anything drawn. */
export const SKY_METRES = 1e4;

/** `SKY_METRES` as the WGSL constant of that name. */
export const STAGE_NUMBERS = wgsl(
  'outside/stage-numbers',
  /* wgsl */ `
const SKY_METRES = ${f32(SKY_METRES)};
`,
);
