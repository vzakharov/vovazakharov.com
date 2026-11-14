import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { MICROGRAPH_SHADER } from './micrograph.shader.generated';

/**
 * An electron micrograph with the visitor inside the specimen chamber: a
 * diatom's sieve for a floor, a moth's wing scales for walls, everything grey
 * and bright along its edges, and the instrument's bar along the bottom of the
 * frame.
 */
export const MICROGRAPH: FloorTheme = {
  name: 'Micrograph',
  air: linear(hex(0x05_05_05)),
  pillar: 0.028,
  dark: 0.1,
  sound: { footing: 'hollow', hum: 220, air: 0.02, echo: 0.15 },
  decor: [
    { thing: 'monolith', perRoom: 0.4 },
    { thing: 'pipe', perRoom: 0.5 },
    { thing: 'crate', perRoom: 0.2 },
    { thing: 'ladder', perRoom: 0.15 },
  ],
  shader: MICROGRAPH_SHADER,
};
