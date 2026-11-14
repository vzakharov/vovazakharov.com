import { f32, wgsl } from '@/cube/shared/shader';
import { HOUR_SECONDS, RADIANS_A_TURN } from '@/cube/entities/island';

import { CASCADES, CHOP, TILE } from '../../../../surface';

/** Complex pairs a cascade's transform carries: two textures' worth. */
export const FIELD_LAYERS = CASCADES.length * 2;

/** The wave field's numbers TypeScript holds too, as its compute passes read them. */
export const WAVE_FIELD_NUMBERS = wgsl(
  'sea/wave-field-numbers',
  /* wgsl */ `
const TAU = ${f32(RADIANS_A_TURN)};
const FIELD_TILE = ${String(TILE)}u;
const FIELD_HOUR = ${String(HOUR_SECONDS)}u;
const FIELD_CHOP = ${f32(CHOP)};
`,
);
