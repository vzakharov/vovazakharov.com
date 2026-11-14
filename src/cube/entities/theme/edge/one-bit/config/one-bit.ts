import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { lit } from '../../lit';
import { ONE_BIT_SHADER } from './one-bit.shader.generated';

const AIR = linear(hex(0x04_04_06));

/**
 * One bit a dot: ink or paper. A panelled hall under bare bulbs, its every
 * grey a pattern of the two and its edges ruled in, like a picture on the
 * first screen that had no greys to offer.
 */
export const ONE_BIT: FloorTheme = {
  name: 'One bit',
  air: AIR,
  pillar: 0.03,
  dark: 0.25,
  sound: { footing: 'wood', hum: 0, air: 0.05, echo: 1.3 },
  decor: [
    { thing: 'door', perRoom: 0.8 },
    { thing: 'window', perRoom: 0.4 },
    { thing: 'bookshelf', perRoom: 0.4 },
    { thing: 'armchair', perRoom: 0.3 },
    { thing: 'wall-clock', perRoom: 0.3 },
    { thing: 'ladder', perRoom: 0.1 },
  ],
  shader: {
    ...ONE_BIT_SHADER,
    needs: [
      ...ONE_BIT_SHADER.needs,
      lit(
        'one-bit',
        'Lamps(vec3f(2.2), vec3f(0.004), 1, vec2f(0.3, 0.3), 0.3)',
        35,
      ),
    ],
  },
};
