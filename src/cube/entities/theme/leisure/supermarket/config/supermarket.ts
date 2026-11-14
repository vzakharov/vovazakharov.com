import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { SUPERMARKET_SHADER } from './supermarket.shader.generated';

const AIR = linear(hex(0x12_14_16));

/**
 * A supermarket at three in the morning: every wall a run of shelves faced
 * up by someone, waxed tiles, tubes that never go off and nothing for sale
 * that has a name.
 */
export const SUPERMARKET: FloorTheme = {
  name: 'Supermarket, 3 am',
  air: AIR,
  pillar: 0.03,
  dark: 0.05,
  sound: { footing: 'tile', hum: 120, air: 0.45, echo: 1.1 },
  decor: [
    { thing: 'shopping-cart', perRoom: 1.2 },
    { thing: 'cardboard-box', perRoom: 0.9 },
    { thing: 'wet-floor-sign', perRoom: 0.3 },
    { thing: 'crate', perRoom: 0.4 },
    { thing: 'bin', perRoom: 0.2 },
    { thing: 'ladder', perRoom: 0.15 },
    { thing: 'exit-sign', perRoom: 0.15 },
    { thing: 'balloon', perRoom: 0.1 },
  ],
  shader: {
    ...SUPERMARKET_SHADER,
    needs: [
      ...SUPERMARKET_SHADER.needs,
      ordinary('supermarket', {
        lamp: [1.02, 1.15, 1.25],
        ambient: [0.012, 0.014, 0.016],
        grid: 2,
        panel: [0.16, 2.2],
        stutter: 0.12,
        visibility: 55,
        exposure: 1.05,
        glow: 0.14,
        fringe: 0.005,
        vignette: 0.3,
        noise: 0.014,
      }),
    ],
  },
};
