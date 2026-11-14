import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { HALLWAY_SHADER } from './hallway.shader.generated';

const AIR = linear(hex(0x14_0e_08));

/**
 * The hall of a house with more rooms than it has: four doors to a wall, none
 * of them a way through, light and television under some. Herringbone oak,
 * green paper with a gold stripe, one frosted dome to a room.
 */
export const HALLWAY: FloorTheme = {
  name: 'Hallway',
  air: AIR,
  pillar: 0.016,
  dark: 0.1,
  sound: { footing: 'wood', hum: 0, air: 0.05, echo: 0.7 },
  decor: [
    { thing: 'mirror', perRoom: 0.4 },
    { thing: 'radiator', perRoom: 0.4 },
    { thing: 'rug', perRoom: 0.6 },
    { thing: 'wall-clock', perRoom: 0.2 },
    { thing: 'socket', perRoom: 0.5 },
    { thing: 'potted-plant', perRoom: 0.2 },
  ],
  shader: {
    ...HALLWAY_SHADER,
    needs: [
      ...HALLWAY_SHADER.needs,
      ordinary('hallway', {
        lamp: [4.4, 3.2, 1.8],
        ambient: [0.01, 0.008, 0.006],
        grid: 1,
        panel: [0.34, 0.34],
        stutter: 0.06,
        visibility: 45,
        exposure: 1,
        glow: 0.16,
        fringe: 0.004,
        vignette: 0.4,
        noise: 0.016,
      }),
    ],
  },
};
