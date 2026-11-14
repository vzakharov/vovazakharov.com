import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { GARAGE_SHADER } from './garage.shader.generated';

const AIR = linear(hex(0x0a_0c_0e));

/**
 * A garage with the car out for good: strand board to the waist, white
 * pegboard above with every tool gone and its outline left in marker, a slab
 * with the oil and the tyre lines still on it, one work tube to a bay.
 */
export const GARAGE: FloorTheme = {
  name: 'Garage',
  air: AIR,
  pillar: 0.02,
  dark: 0.2,
  sound: { footing: 'concrete', hum: 100, air: 0.1, echo: 1.6 },
  decor: [
    { thing: 'cardboard-box', perRoom: 1 },
    { thing: 'ladder', perRoom: 0.3 },
    { thing: 'barrel', perRoom: 0.3 },
    { thing: 'crate', perRoom: 0.4 },
    { thing: 'traffic-cone', perRoom: 0.2 },
    { thing: 'cable-reel', perRoom: 0.2 },
    { thing: 'socket', perRoom: 0.6 },
    { thing: 'fire-extinguisher', perRoom: 0.2 },
  ],
  shader: {
    ...GARAGE_SHADER,
    needs: [
      ...GARAGE_SHADER.needs,
      ordinary('garage', {
        lamp: [4.3, 4.9, 4.9],
        ambient: [0.005, 0.006, 0.007],
        grid: 1,
        panel: [1.5, 0.05],
        stutter: 0.25,
        visibility: 40,
        exposure: 1,
        glow: 0.18,
        fringe: 0.006,
        vignette: 0.45,
        noise: 0.022,
      }),
    ],
  },
};
