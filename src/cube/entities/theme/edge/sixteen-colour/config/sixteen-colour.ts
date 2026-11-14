import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { lit } from '../../lit';
import { SIXTEEN_COLOUR_SHADER } from './sixteen-colour.shader.generated';

const AIR = linear(hex(0x02_02_0a));

/**
 * A corridor from a game that shipped on floppies: dressed stone, a
 * chequered floor and torch-yellow lamps, shown three hundred and twenty
 * dots across in the sixteen colours the card had, the rest made up by
 * dithering.
 */
export const SIXTEEN_COLOUR: FloorTheme = {
  name: 'Sixteen colours',
  air: AIR,
  pillar: 0.035,
  dark: 0.2,
  sound: { footing: 'concrete', hum: 0, air: 0.1, echo: 2.6 },
  decor: [
    { thing: 'barrel', perRoom: 0.8 },
    { thing: 'crate', perRoom: 0.6 },
    { thing: 'door', perRoom: 0.6 },
    { thing: 'bench', perRoom: 0.2 },
    { thing: 'drain', perRoom: 0.2 },
  ],
  shader: {
    ...SIXTEEN_COLOUR_SHADER,
    needs: [
      ...SIXTEEN_COLOUR_SHADER.needs,
      lit(
        'sixteen-colours',
        'Lamps(vec3f(2.4, 2.0, 1.2), vec3f(0.01, 0.014, 0.04), 2, vec2f(0.35, 0.35), 0.4)',
        30,
      ),
    ],
  },
};
