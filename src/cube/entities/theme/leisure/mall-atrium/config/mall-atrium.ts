import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { MALL_ATRIUM_SHADER } from './mall-atrium.shader.generated';

const AIR = linear(hex(0x1a_18_16));

/**
 * A mall on the morning it did not open: marble buffed for nobody, every
 * shutter down, the signs above them lit and saying nothing, a skylight in
 * every ceiling whatever is above it.
 */
export const MALL_ATRIUM: FloorTheme = {
  name: 'Mall atrium',
  air: AIR,
  pillar: 0.04,
  dark: 0.02,
  sound: { footing: 'tile', hum: 60, air: 0.3, echo: 3 },
  decor: [
    { thing: 'potted-plant', perRoom: 1.4 },
    { thing: 'bench', perRoom: 0.8 },
    { thing: 'bin', perRoom: 0.5 },
    { thing: 'mannequin', perRoom: 0.3 },
    { thing: 'vending-machine', perRoom: 0.2 },
    { thing: 'payphone', perRoom: 0.15 },
    { thing: 'wet-floor-sign', perRoom: 0.2 },
    { thing: 'shopping-cart', perRoom: 0.15 },
  ],
  shader: {
    ...MALL_ATRIUM_SHADER,
    needs: [
      ...MALL_ATRIUM_SHADER.needs,
      ordinary('mall-atrium', {
        lamp: [2.1, 2.2, 2.35],
        ambient: [0.014, 0.014, 0.015],
        grid: 1,
        panel: [2.6, 2.6],
        stutter: 0,
        visibility: 80,
        exposure: 1,
        glow: 0.16,
        fringe: 0.004,
        vignette: 0.3,
        noise: 0.012,
      }),
    ],
  },
};
