import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { RECEPTION_SHADER } from './reception.shader';

const AIR = linear(hex(0x17_14_0f));

/**
 * The whole cube as one room: a reception nobody staffs. Terrazzo, a green
 * dado under cream plaster, and four big panels that have never flickered.
 */
export const RECEPTION: FloorTheme = {
  name: 'Reception',
  air: AIR,
  pillar: 0.03,
  dark: 0,
  sound: { footing: 'tile', hum: 100, air: 0.15, echo: 1.6 },
  decor: [
    { thing: 'potted-plant', perRoom: 2 },
    { thing: 'bench', perRoom: 1 },
    { thing: 'wall-clock', perRoom: 1 },
    { thing: 'notice-board', perRoom: 1 },
    { thing: 'door', perRoom: 1 },
  ],
  shader: {
    ...RECEPTION_SHADER,
    needs: [
      ...RECEPTION_SHADER.needs,
      ordinary('reception', {
        lamp: [1.5, 1.38, 1.14],
        ambient: [0.012, 0.011, 0.01],
        grid: 2,
        panel: [1.2, 1.2],
        stutter: 0,
        visibility: 70,
        exposure: 1,
        glow: 0.1,
        fringe: 0.004,
        vignette: 0.3,
        noise: 0.012,
      }),
    ],
  },
};
