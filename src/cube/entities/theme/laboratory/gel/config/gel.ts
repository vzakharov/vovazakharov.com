import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { GEL_SHADER } from './gel.shader.generated';

const AIR = linear(hex(0x05_00_10));

/**
 * A gel on the transilluminator, run and never read: the floor is ultraviolet
 * tubes under scratched glass, and every wall a slab of lanes with their
 * bands glowing orange where something stopped.
 */
export const GEL: FloorTheme = {
  name: 'Gel',
  air: AIR,
  pillar: 0.02,
  dark: 0.15,
  sound: { footing: 'tile', hum: 150, air: 0.1, echo: 0.8 },
  decor: [
    { thing: 'lab-bench', perRoom: 0.4 },
    { thing: 'tank', perRoom: 0.4 },
    { thing: 'bin', perRoom: 0.2 },
    { thing: 'socket', perRoom: 0.5 },
    { thing: 'cable-reel', perRoom: 0.15 },
  ],
  shader: {
    ...GEL_SHADER,
    needs: [
      ...GEL_SHADER.needs,
      ordinary('gel', {
        lamp: [0.35, 0.12, 1.1],
        ambient: [0.004, 0.001, 0.012],
        grid: 2,
        panel: [0.08, 1.5],
        stutter: 0.12,
        visibility: 40,
        exposure: 1.15,
        glow: 0.45,
        fringe: 0.006,
        vignette: 0.45,
        noise: 0.02,
      }),
    ],
  },
};
