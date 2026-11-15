import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { DARKROOM_SHADER } from './darkroom.shader.generated';

const AIR = linear(hex(0x0a_00_00));

/**
 * A darkroom with the safelights left on: blackout curtains for walls, a wet
 * floor that holds every lamp twice, and prints pegged on a line, still
 * coming up.
 */
export const DARKROOM: FloorTheme = {
  name: 'Darkroom',
  air: AIR,
  pillar: 0.018,
  dark: 0.2,
  sound: { footing: 'wet', hum: 0, air: 0.1, echo: 0.4 },
  decor: [
    { thing: 'lab-bench', perRoom: 0.8 },
    { thing: 'tank', perRoom: 0.5 },
    { thing: 'curtain', perRoom: 0.6 },
    { thing: 'wall-clock', perRoom: 0.3 },
    { thing: 'bin', perRoom: 0.3 },
    { thing: 'drain', perRoom: 0.4 },
  ],
  shader: {
    ...DARKROOM_SHADER,
    needs: [
      ...DARKROOM_SHADER.needs,
      ordinary('darkroom', {
        lamp: [2.6, 0.1, 0.03],
        ambient: [0.004, 0.0005, 0.0003],
        grid: 2,
        panel: [0.3, 0.22],
        stutter: 0,
        visibility: 30,
        exposure: 1.5,
        glow: 0.4,
        fringe: 0.007,
        vignette: 0.5,
        noise: 0.03,
      }),
    ],
  },
};
