import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { MEMBRANE_SHADER } from './membrane.shader.generated';

const AIR = linear(hex(0x14_03_0c));

/**
 * Inside a membrane: every wall is lipid heads packed shoulder to shoulder
 * and never quite still, proteins sit in them like portholes, and the light
 * comes in through the channels overhead.
 */
export const MEMBRANE: FloorTheme = {
  name: 'Membrane',
  air: AIR,
  pillar: 0.03,
  dark: 0.08,
  sound: { footing: 'soft', hum: 40, air: 0.25, echo: 0.6 },
  decor: [
    { thing: 'balloon', perRoom: 0.3 },
    { thing: 'pipe', perRoom: 0.4 },
    { thing: 'mattress', perRoom: 0.15 },
    { thing: 'curtain', perRoom: 0.2 },
  ],
  shader: {
    ...MEMBRANE_SHADER,
    needs: [
      ...MEMBRANE_SHADER.needs,
      ordinary('membrane', {
        lamp: [1.5, 1.3, 1.45],
        ambient: [0.012, 0.004, 0.008],
        grid: 2,
        panel: [1, 1],
        stutter: 0,
        visibility: 30,
        exposure: 1.1,
        glow: 0.28,
        fringe: 0.006,
        vignette: 0.45,
        noise: 0.014,
      }),
    ],
  },
};
