import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { BUBBLE_CHAMBER_SHADER } from './bubble-chamber.shader.generated';

const AIR = linear(hex(0x00_05_08));

/**
 * A bubble chamber between flashes: nothing here is big enough to be a
 * thing any more, only the trails things left — straight for the fast,
 * curled tight for the light — drawn in bubbles on every side of a dark tank.
 */
export const BUBBLE_CHAMBER: FloorTheme = {
  name: 'Bubble chamber',
  air: AIR,
  pillar: 0.018,
  dark: 0.25,
  sound: { footing: 'metal', hum: 25, air: 0.15, echo: 3.5 },
  decor: [
    { thing: 'tank', perRoom: 0.3 },
    { thing: 'pipe', perRoom: 0.6 },
    { thing: 'ladder', perRoom: 0.15 },
    { thing: 'cable-reel', perRoom: 0.2 },
  ],
  shader: {
    ...BUBBLE_CHAMBER_SHADER,
    needs: [
      ...BUBBLE_CHAMBER_SHADER.needs,
      ordinary('bubble-chamber', {
        lamp: [0.75, 0.95, 1.1],
        ambient: [0.001, 0.004, 0.005],
        grid: 2,
        panel: [0.26, 0.26],
        stutter: 0.5,
        visibility: 50,
        exposure: 1.2,
        glow: 0.4,
        fringe: 0.008,
        vignette: 0.6,
        noise: 0.035,
      }),
    ],
  },
};
