import { hex, linear } from '@/cube/shared/lib/colour';

import { vec3f, wgsl } from '../../kit';

/** The micrograph's air: the theme's own colour and the shader's haze. */
export const MICROGRAPH_AIR = linear(hex(0x05_05_05));

export const MICROGRAPH_AIR_WGSL = wgsl(
  'cube/entities/theme/laboratory/config/micrograph-air',
  `const AIR = ${vec3f(MICROGRAPH_AIR)};`,
);
