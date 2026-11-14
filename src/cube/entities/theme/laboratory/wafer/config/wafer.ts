import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { WAFER_SHADER } from './wafer.shader.generated';

const AIR = linear(hex(0x12_0c_00));

/**
 * The yellow room, from the wafer's side: a floor of finished dies, a mirror
 * that turns every colour as the eye moves over it, and walls of wafers
 * racked edge-on to the ceiling, under light with the blue taken out.
 */
export const WAFER: FloorTheme = {
  name: 'Wafer',
  air: AIR,
  pillar: 0.02,
  dark: 0.05,
  sound: { footing: 'tile', hum: 120, air: 0.6, echo: 0.7 },
  decor: [
    { thing: 'monolith', perRoom: 0.3 },
    { thing: 'lab-bench', perRoom: 0.3 },
    { thing: 'locker', perRoom: 0.3 },
    { thing: 'mirror', perRoom: 0.3 },
    { thing: 'vent', perRoom: 0.5 },
  ],
  shader: {
    ...WAFER_SHADER,
    needs: [
      ...WAFER_SHADER.needs,
      ordinary('wafer', {
        lamp: [1.7, 1.25, 0.22],
        ambient: [0.012, 0.008, 0.0005],
        grid: 2,
        panel: [1.2, 0.55],
        stutter: 0,
        visibility: 55,
        exposure: 1.05,
        glow: 0.2,
        fringe: 0.004,
        vignette: 0.35,
        noise: 0.012,
      }),
    ],
  },
};
