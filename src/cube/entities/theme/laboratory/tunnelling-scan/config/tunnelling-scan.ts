import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { TUNNELLING_SCAN_SHADER } from './tunnelling-scan.shader.generated';

const AIR = linear(hex(0x0a_03_00));

/**
 * A metal surface as a tunnelling microscope feels it: every atom a bump in
 * the instrument's orange, terraces one atom high, and here and there a ring
 * of placed atoms with the electrons inside standing in ripples.
 */
export const TUNNELLING_SCAN: FloorTheme = {
  name: 'Tunnelling scan',
  air: AIR,
  pillar: 0.024,
  dark: 0.1,
  sound: { footing: 'metal', hum: 30, air: 0.02, echo: 1.4 },
  decor: [
    { thing: 'monolith', perRoom: 0.4 },
    { thing: 'balloon', perRoom: 0.15 },
    { thing: 'staircase', perRoom: 0.15 },
    { thing: 'barrel', perRoom: 0.2 },
  ],
  shader: {
    ...TUNNELLING_SCAN_SHADER,
    needs: [
      ...TUNNELLING_SCAN_SHADER.needs,
      ordinary('tunnelling-scan', {
        lamp: [2.1, 1.75, 1.3],
        ambient: [0.012, 0.006, 0.002],
        grid: 1,
        panel: [0.34, 0.34],
        stutter: 0,
        visibility: 38,
        exposure: 1.15,
        glow: 0.3,
        fringe: 0.005,
        vignette: 0.45,
        noise: 0.022,
      }),
    ],
  },
};
