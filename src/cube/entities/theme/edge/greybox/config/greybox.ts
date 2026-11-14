import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { GREYBOX_SHADER } from './greybox.shader.generated';

const AIR = linear(hex(0x2a_2b_2d));

/**
 * A level blocked out and never dressed: measuring-grid grey underfoot,
 * builder's orange on every wall with its metre marks, and lamps placed
 * where lamps will go.
 */
export const GREYBOX: FloorTheme = {
  name: 'Greybox',
  air: AIR,
  pillar: 0.03,
  dark: 0,
  sound: { footing: 'concrete', hum: 100, air: 0.05, echo: 1.1 },
  decor: [
    { thing: 'crate', perRoom: 0.8 },
    { thing: 'mannequin', perRoom: 0.3 },
    { thing: 'traffic-cone', perRoom: 0.3 },
    { thing: 'ladder', perRoom: 0.15 },
    { thing: 'staircase', perRoom: 0.1 },
  ],
  shader: {
    ...GREYBOX_SHADER,
    needs: [
      ...GREYBOX_SHADER.needs,
      ordinary('greybox', {
        lamp: [1.35, 1.35, 1.35],
        ambient: [0.02, 0.02, 0.02],
        grid: 2,
        panel: [1, 1],
        stutter: 0,
        visibility: 60,
        exposure: 1,
        glow: 0.1,
        fringe: 0.003,
        vignette: 0.3,
        noise: 0.01,
      }),
    ],
  },
};
