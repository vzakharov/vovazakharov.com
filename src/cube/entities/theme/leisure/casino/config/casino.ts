import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { CASINO_SHADER } from './casino.shader.generated';

const AIR = linear(hex(0x10_06_08));

/**
 * A gaming floor with no clock and no way to tell the hour: a carpet made
 * to keep the eye off the floor, lacquer and gilt, a ceiling of gold glass,
 * and bulbs chasing each other round every wall for nobody's jackpot.
 */
export const CASINO: FloorTheme = {
  name: 'Gaming floor',
  air: AIR,
  pillar: 0.03,
  dark: 0.02,
  sound: { footing: 'carpet', hum: 60, air: 0.2, echo: 0.5 },
  decor: [
    { thing: 'arcade-cabinet', perRoom: 2 },
    { thing: 'armchair', perRoom: 0.8 },
    { thing: 'potted-plant', perRoom: 0.4 },
    { thing: 'floor-lamp', perRoom: 0.3 },
    { thing: 'mirror', perRoom: 0.4 },
    { thing: 'bin', perRoom: 0.2 },
    { thing: 'payphone', perRoom: 0.15 },
  ],
  shader: {
    ...CASINO_SHADER,
    needs: [
      ...CASINO_SHADER.needs,
      ordinary('casino', {
        lamp: [0.75, 0.5, 0.26],
        ambient: [0.008, 0.004, 0.004],
        grid: 3,
        panel: [0.2, 0.2],
        stutter: 0,
        visibility: 45,
        exposure: 1.2,
        glow: 0.32,
        fringe: 0.006,
        vignette: 0.42,
        noise: 0.018,
      }),
    ],
  },
};
