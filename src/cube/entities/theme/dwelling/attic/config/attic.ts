import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { ATTIC_SHADER } from './attic.shader.generated';

const AIR = linear(hex(0x2a_1e_12));

/**
 * The attic, which goes on over every house in the street: old brick with
 * the limewash coming away, wide boards under a fur of dust that paths have
 * been walked through, rafters, felt, and a bare bulb where there is one.
 */
export const ATTIC: FloorTheme = {
  name: 'Attic',
  air: AIR,
  pillar: 0.018,
  dark: 0.38,
  sound: { footing: 'hollow', hum: 0, air: 0.3, echo: 0.5 },
  decor: [
    { thing: 'cardboard-box', perRoom: 1.6 },
    { thing: 'crate', perRoom: 0.5 },
    { thing: 'mattress', perRoom: 0.3 },
    { thing: 'mannequin', perRoom: 0.15 },
    { thing: 'mirror', perRoom: 0.2 },
    { thing: 'rug', perRoom: 0.2 },
    { thing: 'tank', perRoom: 0.2 },
    { thing: 'ladder', perRoom: 0.2 },
  ],
  shader: {
    ...ATTIC_SHADER,
    needs: [
      ...ATTIC_SHADER.needs,
      ordinary('attic', {
        lamp: [3.6, 2.3, 1.05],
        ambient: [0.006, 0.004, 0.003],
        grid: 1,
        panel: [0.1, 0.1],
        stutter: 0.12,
        visibility: 15,
        exposure: 1.1,
        glow: 0.3,
        fringe: 0.006,
        vignette: 0.5,
        noise: 0.026,
      }),
    ],
  },
};
