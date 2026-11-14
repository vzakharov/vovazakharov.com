import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { PARKING_LEVEL_SHADER } from './parking-level.shader.generated';

const AIR = linear(hex(0x14_0d_06));

/**
 * A parking level with no cars and no ramp: sodium tubes between the ribs of
 * a precast deck, numbered bays on wet tarmac, a blue level band on walls
 * the exhaust has browned.
 */
export const PARKING_LEVEL: FloorTheme = {
  name: 'Parking level',
  air: AIR,
  pillar: 0.045,
  dark: 0.22,
  sound: { footing: 'concrete', hum: 120, air: 0.4, echo: 3.8 },
  decor: [
    { thing: 'traffic-cone', perRoom: 0.5 },
    { thing: 'shopping-cart', perRoom: 0.15 },
    { thing: 'pipe', perRoom: 0.6 },
    { thing: 'drain', perRoom: 0.5 },
    { thing: 'exit-sign', perRoom: 0.3 },
    { thing: 'fire-extinguisher', perRoom: 0.3 },
    { thing: 'barrel', perRoom: 0.1 },
    { thing: 'payphone', perRoom: 0.05 },
  ],
  shader: {
    ...PARKING_LEVEL_SHADER,
    needs: [
      ...PARKING_LEVEL_SHADER.needs,
      ordinary('parking-level', {
        lamp: [1.75, 1.1, 0.48],
        ambient: [0.012, 0.008, 0.004],
        grid: 2,
        panel: [0.12, 1.3],
        stutter: 0.25,
        visibility: 30,
        exposure: 1.05,
        glow: 0.22,
        fringe: 0.006,
        vignette: 0.45,
        noise: 0.024,
      }),
    ],
  },
};
