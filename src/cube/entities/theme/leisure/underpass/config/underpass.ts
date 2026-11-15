import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { UNDERPASS_SHADER } from './underpass.shader.generated';

const AIR = linear(hex(0x1c_10_05));

/**
 * The underpass everyone walks a little faster through: glazed tiles gone
 * the colour of the lamps, somebody's name on them, rain that got in years
 * ago still lying on the paving, one sodium lamp to a bay.
 */
export const UNDERPASS: FloorTheme = {
  name: 'Underpass',
  air: AIR,
  pillar: 0.035,
  dark: 0.2,
  sound: { footing: 'wet', hum: 100, air: 0.55, echo: 2.4 },
  decor: [
    { thing: 'drain', perRoom: 0.8 },
    { thing: 'pipe', perRoom: 0.8 },
    { thing: 'bin', perRoom: 0.3 },
    { thing: 'traffic-cone', perRoom: 0.3 },
    { thing: 'shopping-cart', perRoom: 0.2 },
    { thing: 'cardboard-box', perRoom: 0.5 },
    { thing: 'mattress', perRoom: 0.15 },
    { thing: 'payphone', perRoom: 0.1 },
  ],
  shader: {
    ...UNDERPASS_SHADER,
    needs: [
      ...UNDERPASS_SHADER.needs,
      ordinary('underpass', {
        lamp: [3.4, 1.75, 0.42],
        ambient: [0.008, 0.004, 0.001],
        grid: 1,
        panel: [0.5, 0.22],
        stutter: 0.3,
        visibility: 24,
        exposure: 1.15,
        glow: 0.3,
        fringe: 0.007,
        vignette: 0.5,
        noise: 0.03,
      }),
    ],
  },
};
