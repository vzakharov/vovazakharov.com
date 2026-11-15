import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { BALL_PIT_SHADER } from './ball-pit.shader.generated';

const AIR = linear(hex(0x1a_14_10));

/**
 * Soft play with the pit grown to the size of the building: the floor is
 * balls from wall to wall, the walls are padded to the waist and netted
 * above, and nothing in it has a corner.
 */
export const BALL_PIT: FloorTheme = {
  name: 'Ball pit',
  air: AIR,
  pillar: 0.035,
  dark: 0.02,
  sound: { footing: 'hollow', hum: 100, air: 0.1, echo: 0.4 },
  decor: [
    { thing: 'slide', perRoom: 0.9 },
    { thing: 'balloon', perRoom: 0.8 },
    { thing: 'mattress', perRoom: 0.5 },
    { thing: 'ladder', perRoom: 0.4 },
    { thing: 'bench', perRoom: 0.2 },
    { thing: 'wall-clock', perRoom: 0.1 },
    { thing: 'mannequin', perRoom: 0.05 },
  ],
  shader: {
    ...BALL_PIT_SHADER,
    needs: [
      ...BALL_PIT_SHADER.needs,
      ordinary('ball-pit', {
        lamp: [1.15, 1.08, 0.94],
        ambient: [0.014, 0.013, 0.011],
        grid: 2,
        panel: [0.625, 0.625],
        stutter: 0,
        visibility: 60,
        exposure: 1.05,
        glow: 0.14,
        fringe: 0.004,
        vignette: 0.3,
        noise: 0.012,
      }),
    ],
  },
};
