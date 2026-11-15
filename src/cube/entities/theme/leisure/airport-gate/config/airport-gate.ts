import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { AIRPORT_GATE_SHADER } from './airport-gate.shader.generated';

const AIR = linear(hex(0x0d_10_15));

/**
 * A gate with the last flight long gone: carpet, steel, and every wall a
 * window onto the same apron at night, whichever way it faces.
 */
export const AIRPORT_GATE: FloorTheme = {
  name: 'Gate',
  air: AIR,
  pillar: 0.03,
  dark: 0.15,
  sound: { footing: 'carpet', hum: 400, air: 0.5, echo: 1.2 },
  decor: [
    { thing: 'bench', perRoom: 2.2 },
    { thing: 'bin', perRoom: 0.5 },
    { thing: 'vending-machine', perRoom: 0.3 },
    { thing: 'payphone', perRoom: 0.2 },
    { thing: 'potted-plant', perRoom: 0.4 },
    { thing: 'tv', perRoom: 0.3 },
    { thing: 'wall-clock', perRoom: 0.2 },
    { thing: 'socket', perRoom: 0.6 },
  ],
  shader: {
    ...AIRPORT_GATE_SHADER,
    needs: [
      ...AIRPORT_GATE_SHADER.needs,
      ordinary('airport-gate', {
        lamp: [1.2, 1.25, 1.3],
        ambient: [0.008, 0.01, 0.014],
        grid: 2,
        panel: [0.18, 1.8],
        stutter: 0.03,
        visibility: 60,
        exposure: 1.1,
        glow: 0.22,
        fringe: 0.005,
        vignette: 0.38,
        noise: 0.016,
      }),
    ],
  },
};
