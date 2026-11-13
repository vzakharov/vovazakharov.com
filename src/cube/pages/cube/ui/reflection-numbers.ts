import { SKY_METRES } from '@/cube/shared/outside';
import { wgsl } from '@/cube/shared/shader';

/**
 * The farthest the scene's depth is read as: what the sky is written at,
 * which no face is beyond, so a pixel holding infinity reads as the sky.
 */
export const REFLECTION_NUMBERS = wgsl(
  'ui/reflection-numbers',
  /* wgsl */ `
const SIGHT = ${String(SKY_METRES)};
`,
);
