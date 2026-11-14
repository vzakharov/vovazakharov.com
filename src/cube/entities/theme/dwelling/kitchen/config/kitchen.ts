import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { KITCHEN_SHADER } from './kitchen.shader.generated';

const AIR = linear(hex(0x12_12_08));

/**
 * A kitchen with the units taken out and the smell left in: cream tiles to
 * the height of a splashback, an orange in every tenth one, mustard woodchip
 * gone tacky above, sheet vinyl in brown roundels, a ring tube that pinks.
 */
export const KITCHEN: FloorTheme = {
  name: 'Kitchen',
  air: AIR,
  pillar: 0.016,
  dark: 0.08,
  sound: { footing: 'tile', hum: 100, air: 0.2, echo: 0.6 },
  decor: [
    { thing: 'wall-clock', perRoom: 0.5 },
    { thing: 'socket', perRoom: 1 },
    { thing: 'bin', perRoom: 0.4 },
    { thing: 'radiator', perRoom: 0.3 },
    { thing: 'window', perRoom: 0.3 },
    { thing: 'curtain', perRoom: 0.3 },
    { thing: 'vent', perRoom: 0.4 },
    { thing: 'pipe', perRoom: 0.3 },
  ],
  shader: {
    ...KITCHEN_SHADER,
    needs: [
      ...KITCHEN_SHADER.needs,
      ordinary('kitchen', {
        lamp: [1.3, 1.5, 1.12],
        ambient: [0.008, 0.01, 0.007],
        grid: 2,
        panel: [0.34, 0.34],
        stutter: 0.22,
        visibility: 42,
        exposure: 1,
        glow: 0.14,
        fringe: 0.005,
        vignette: 0.36,
        noise: 0.018,
      }),
    ],
  },
};
