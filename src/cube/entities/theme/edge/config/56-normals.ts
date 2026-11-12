import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../kit';
import { NORMALS_SHADER } from './56-normals.shader';

const AIR = linear(hex(0x80_80_ff));

/**
 * The floor as its own normal map: nothing has a colour, only a direction
 * it faces, and the direction is shown as the colour. Brick, paving and
 * coffers are all still there, as slopes.
 */
export const NORMALS: FloorTheme = {
  name: 'Normals',
  air: AIR,
  pillar: 0.03,
  dark: 0,
  sound: { footing: 'tile', hum: 0, air: 0.1, echo: 1.2 },
  decor: [
    { thing: 'monolith', perRoom: 0.3 },
    { thing: 'barrel', perRoom: 0.4 },
    { thing: 'bench', perRoom: 0.3 },
    { thing: 'staircase', perRoom: 0.1 },
  ],
  shader: NORMALS_SHADER,
};
