import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { lit } from '../../lit';
import { STATIC_SHADER } from './static.shader.generated';

const AIR = linear(hex(0x1a_1c_1e));

/**
 * The signal has gone and the room is what snow there is on each face:
 * coarse overhead, combed sideways along the walls, fine underfoot, new
 * twenty-four times a second. The picture tears, and keeps a ghost of
 * itself a hand to the right.
 */
export const STATIC: FloorTheme = {
  name: 'Static',
  air: AIR,
  pillar: 0.03,
  dark: 0.2,
  sound: { footing: 'hollow', hum: 15_625, air: 1, echo: 0.2 },
  decor: [
    { thing: 'tv', perRoom: 1.5 },
    { thing: 'sofa', perRoom: 0.2 },
    { thing: 'mannequin', perRoom: 0.2 },
    { thing: 'payphone', perRoom: 0.2 },
  ],
  shader: {
    ...STATIC_SHADER,
    needs: [
      ...STATIC_SHADER.needs,
      lit(
        'static',
        'Lamps(vec3f(1.5, 1.6, 1.8), vec3f(0.02), 2, vec2f(0.4, 0.4), 0.7)',
        22,
      ),
    ],
  },
};
