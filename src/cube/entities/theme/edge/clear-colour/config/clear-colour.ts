import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { CLEAR_COLOUR_SHADER } from './clear-colour.shader.generated';

const CLEAR = linear(hex(0x64_95_ed));

/**
 * The colour a frame is cleared to, with next to nothing drawn over it:
 * walls a shade off the air they stand in, lamps a paler patch of the same
 * blue, the whole of it stepping in bands where a gradient ran out of
 * numbers.
 */
export const CLEAR_COLOUR: FloorTheme = {
  name: 'Clear colour',
  air: CLEAR,
  pillar: 0.02,
  dark: 0.15,
  sound: { footing: 'soft', hum: 0, air: 0, echo: 4 },
  decor: [
    { thing: 'door', perRoom: 0.3 },
    { thing: 'bench', perRoom: 0.2 },
    { thing: 'balloon', perRoom: 0.15 },
  ],
  shader: CLEAR_COLOUR_SHADER,
};
