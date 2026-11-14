import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { STAIRWELL_SHADER } from './stairwell.shader.generated';

const AIR = linear(hex(0x0c_10_0d));

/**
 * A stairwell's landing that goes on sideways: board-marked concrete with a
 * painted dado and the floor's number, studded rubber underfoot, the next
 * flight's underside overhead and one caged lamp a room.
 */
export const STAIRWELL: FloorTheme = {
  name: 'Stairwell landing',
  air: AIR,
  pillar: 0.035,
  dark: 0.14,
  sound: { footing: 'concrete', hum: 50, air: 0.3, echo: 3.4 },
  decor: [
    { thing: 'staircase', perRoom: 0.35 },
    { thing: 'pipe', perRoom: 0.8 },
    { thing: 'fire-extinguisher', perRoom: 0.4 },
    { thing: 'exit-sign', perRoom: 0.5 },
    { thing: 'door', perRoom: 0.4 },
    { thing: 'bin', perRoom: 0.1 },
    { thing: 'traffic-cone', perRoom: 0.05 },
  ],
  shader: {
    ...STAIRWELL_SHADER,
    needs: [
      ...STAIRWELL_SHADER.needs,
      ordinary('stairwell', {
        lamp: [2.1, 2.4, 1.9],
        ambient: [0.006, 0.008, 0.006],
        grid: 1,
        panel: [0.3, 0.3],
        stutter: 0.2,
        visibility: 30,
        exposure: 1.1,
        glow: 0.2,
        fringe: 0.006,
        vignette: 0.45,
        noise: 0.022,
      }),
    ],
  },
};
