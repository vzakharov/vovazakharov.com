import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { DEN_SHADER } from './den.shader.generated';

const AIR = linear(hex(0x0c_06_03));

/**
 * A den, on the tape somebody shot of it one Christmas: walnut boards floor
 * to ceiling, shag the colour of a satsuma, beams, one amber globe. The frame
 * is the tape — colour smeared sideways, a tracking fault that never quite
 * leaves, the heads switching along the bottom.
 */
export const DEN: FloorTheme = {
  name: 'Den',
  air: AIR,
  pillar: 0.016,
  dark: 0.1,
  sound: { footing: 'soft', hum: 0, air: 0.04, echo: 0.2 },
  decor: [
    { thing: 'sofa', perRoom: 0.8 },
    { thing: 'armchair', perRoom: 0.6 },
    { thing: 'tv', perRoom: 0.6 },
    { thing: 'bookshelf', perRoom: 0.5 },
    { thing: 'floor-lamp', perRoom: 0.4 },
    { thing: 'rug', perRoom: 0.3 },
    { thing: 'cardboard-box', perRoom: 0.2 },
  ],
  shader: DEN_SHADER,
};
