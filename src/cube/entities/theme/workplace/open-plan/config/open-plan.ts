import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { OPEN_PLAN_SHADER } from './open-plan.shader.generated';

const AIR = linear(hex(0x10_13_0f));

/**
 * An office cleared for a tenant who never came: carpet tiles laid
 * chequerwise, pinstriped sage paper, troffers humming over nothing.
 */
export const OPEN_PLAN: FloorTheme = {
  name: 'Open plan',
  air: AIR,
  pillar: 0.03,
  dark: 0,
  sound: { footing: 'carpet', hum: 120, air: 0.3, echo: 0.5 },
  decor: [
    { thing: 'desk', perRoom: 1.2 },
    { thing: 'office-chair', perRoom: 1.5 },
    { thing: 'cubicle-screen', perRoom: 0.8 },
    { thing: 'filing-cabinet', perRoom: 0.5 },
    { thing: 'water-cooler', perRoom: 0.25 },
    { thing: 'copier', perRoom: 0.25 },
    { thing: 'bin', perRoom: 0.5 },
    { thing: 'vent', perRoom: 0.5 },
  ],
  shader: {
    ...OPEN_PLAN_SHADER,
    needs: [
      ...OPEN_PLAN_SHADER.needs,
      ordinary('open-plan', {
        lamp: [1.2, 1.34, 1.22],
        ambient: [0.009, 0.011, 0.01],
        grid: 2,
        panel: [0.6, 1.2],
        stutter: 0,
        visibility: 45,
        exposure: 1,
        glow: 0.12,
        fringe: 0.005,
        vignette: 0.35,
        noise: 0.016,
      }),
    ],
  },
};
