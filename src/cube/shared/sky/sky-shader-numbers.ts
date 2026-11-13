import { FAR_METRES } from '../outside/frame';
import { f32, wgsl } from '../shader/wgsl';

/** `FAR_METRES`, the camera's far plane, as the WGSL constant of that name. */
export const SKY_SHADER_NUMBERS = wgsl(
  'sky/sky-shader-numbers',
  /* wgsl */ `
const FAR_METRES = ${f32(FAR_METRES)};
`,
);
