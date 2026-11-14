import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { SCHOOL_CORRIDOR_SHADER } from './school-corridor.shader.generated';

const AIR = linear(hex(0x0b_10_12));

/**
 * A school after the last bell of the last year: gloss paint to shoulder
 * height, chequered lino buffed by no one, and tubes that have started to go.
 */
export const SCHOOL_CORRIDOR: FloorTheme = {
  name: 'School corridor',
  air: AIR,
  pillar: 0.025,
  dark: 0.12,
  sound: { footing: 'tile', hum: 100, air: 0.1, echo: 2.2 },
  decor: [
    { thing: 'locker', perRoom: 1.5 },
    { thing: 'bench', perRoom: 0.4 },
    { thing: 'radiator', perRoom: 0.5 },
    { thing: 'notice-board', perRoom: 0.4 },
    { thing: 'door', perRoom: 0.5 },
    { thing: 'wet-floor-sign', perRoom: 0.1 },
    { thing: 'exit-sign', perRoom: 0.15 },
  ],
  shader: {
    ...SCHOOL_CORRIDOR_SHADER,
    needs: [
      ...SCHOOL_CORRIDOR_SHADER.needs,
      ordinary('school-corridor', {
        lamp: [1.3, 1.44, 1.52],
        ambient: [0.006, 0.008, 0.01],
        grid: 2,
        panel: [0.16, 1.4],
        stutter: 0.3,
        visibility: 38,
        exposure: 1,
        glow: 0.16,
        fringe: 0.006,
        vignette: 0.4,
        noise: 0.02,
      }),
    ],
  },
};
