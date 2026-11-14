import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { LAUNDRY_SHADER } from './laundry.shader.generated';

const AIR = linear(hex(0x0d_10_10));

/**
 * The laundry under the house: blockwork painted pipe-blue to the waist and
 * cream above, oxide-red floor paint worn through to the slab where the
 * baskets went, bare joists and a copper pipe overhead, tubes on battens.
 */
export const LAUNDRY: FloorTheme = {
  name: 'Laundry',
  air: AIR,
  pillar: 0.02,
  dark: 0.15,
  sound: { footing: 'concrete', hum: 100, air: 0.55, echo: 1.3 },
  decor: [
    { thing: 'pipe', perRoom: 1.2 },
    { thing: 'drain', perRoom: 0.6 },
    { thing: 'tank', perRoom: 0.3 },
    { thing: 'cardboard-box', perRoom: 0.5 },
    { thing: 'bin', perRoom: 0.3 },
    { thing: 'socket', perRoom: 0.6 },
    { thing: 'ladder', perRoom: 0.15 },
    { thing: 'vent', perRoom: 0.5 },
  ],
  shader: {
    ...LAUNDRY_SHADER,
    needs: [
      ...LAUNDRY_SHADER.needs,
      ordinary('laundry', {
        lamp: [1.5, 1.66, 1.6],
        ambient: [0.006, 0.008, 0.008],
        grid: 2,
        panel: [0.06, 1.2],
        stutter: 0.2,
        visibility: 36,
        exposure: 1,
        glow: 0.16,
        fringe: 0.005,
        vignette: 0.42,
        noise: 0.02,
      }),
    ],
  },
};
