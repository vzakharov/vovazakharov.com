import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { BATHROOM_SHADER } from './bathroom.shader.generated';

const AIR = linear(hex(0x9a_a8_a4));

/**
 * A bathroom the size of a house and no bath in it: mint tiles to the pencil
 * line and white above, a hexagon mosaic under a film of water that something
 * keeps dripping into, bulkhead lamps in steam that never clears.
 */
export const BATHROOM: FloorTheme = {
  name: 'Bathroom',
  air: AIR,
  pillar: 0.02,
  dark: 0.05,
  sound: { footing: 'wet', hum: 50, air: 0.25, echo: 2.6 },
  decor: [
    { thing: 'mirror', perRoom: 1 },
    { thing: 'drain', perRoom: 0.8 },
    { thing: 'pipe', perRoom: 0.8 },
    { thing: 'radiator', perRoom: 0.3 },
    { thing: 'curtain', perRoom: 0.4 },
    { thing: 'wet-floor-sign', perRoom: 0.1 },
    { thing: 'vent', perRoom: 0.4 },
  ],
  shader: {
    ...BATHROOM_SHADER,
    needs: [
      ...BATHROOM_SHADER.needs,
      ordinary('bathroom', {
        lamp: [1.25, 1.45, 1.5],
        ambient: [0.012, 0.015, 0.015],
        grid: 2,
        panel: [0.26, 0.26],
        stutter: 0.08,
        visibility: 22,
        exposure: 1,
        glow: 0.24,
        fringe: 0.004,
        vignette: 0.3,
        noise: 0.014,
      }),
    ],
  },
};
