import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { WET_LAB_SHADER } from './wet-lab.shader.generated';

const AIR = linear(hex(0x0d_14_10));

/**
 * A wet lab hosed down and left: glazed tile to head height with one green
 * course, sealed sea-green vinyl that never quite dried, and stains nobody
 * wrote up.
 */
export const WET_LAB: FloorTheme = {
  name: 'Wet lab',
  air: AIR,
  pillar: 0.022,
  dark: 0.06,
  sound: { footing: 'wet', hum: 100, air: 0.35, echo: 1.9 },
  decor: [
    { thing: 'lab-bench', perRoom: 1.2 },
    { thing: 'tank', perRoom: 0.4 },
    { thing: 'drain', perRoom: 0.7 },
    { thing: 'barrel', perRoom: 0.2 },
    { thing: 'pipe', perRoom: 0.6 },
    { thing: 'fire-extinguisher', perRoom: 0.2 },
    { thing: 'wet-floor-sign', perRoom: 0.15 },
  ],
  shader: {
    ...WET_LAB_SHADER,
    needs: [
      ...WET_LAB_SHADER.needs,
      ordinary('wet-lab', {
        lamp: [1.25, 1.5, 1.3],
        ambient: [0.006, 0.01, 0.008],
        grid: 2,
        panel: [0.2, 1.5],
        stutter: 0.15,
        visibility: 42,
        exposure: 1,
        glow: 0.16,
        fringe: 0.005,
        vignette: 0.36,
        noise: 0.016,
      }),
    ],
  },
};
