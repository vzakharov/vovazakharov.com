import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { GYMNASIUM_SHADER } from './gymnasium.shader.generated';

const AIR = linear(hex(0x16_12_0b));

/**
 * A school gym between two lessons that never start: varnished maple under
 * the lines of five games at once, pine to the shoulder, lamps in cages.
 */
export const GYMNASIUM: FloorTheme = {
  name: 'Gymnasium',
  air: AIR,
  pillar: 0.03,
  dark: 0.03,
  sound: { footing: 'wood', hum: 100, air: 0.12, echo: 2.6 },
  decor: [
    { thing: 'bench', perRoom: 1 },
    { thing: 'chair-stack', perRoom: 0.5 },
    { thing: 'ladder', perRoom: 0.3 },
    { thing: 'traffic-cone', perRoom: 0.8 },
    { thing: 'mattress', perRoom: 0.4 },
    { thing: 'wall-clock', perRoom: 0.2 },
    { thing: 'door', perRoom: 0.3 },
    { thing: 'fire-extinguisher', perRoom: 0.2 },
  ],
  shader: {
    ...GYMNASIUM_SHADER,
    needs: [
      ...GYMNASIUM_SHADER.needs,
      ordinary('gymnasium', {
        lamp: [1.55, 1.42, 1.15],
        ambient: [0.012, 0.011, 0.009],
        grid: 2,
        panel: [0.7, 0.7],
        stutter: 0.04,
        visibility: 60,
        exposure: 1,
        glow: 0.12,
        fringe: 0.004,
        vignette: 0.32,
        noise: 0.012,
      }),
    ],
  },
};
