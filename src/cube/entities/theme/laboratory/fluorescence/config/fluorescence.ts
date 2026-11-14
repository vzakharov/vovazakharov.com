import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { FLUORESCENCE_SHADER } from './fluorescence.shader.generated';

const AIR = linear(hex(0x00_00_02));

/**
 * Cells under a fluorescence microscope, from among them: nothing is lit and
 * everything that was stained glows — nuclei blue, fibres green, the cells'
 * small engines red — on a black that has no far wall.
 */
export const FLUORESCENCE: FloorTheme = {
  name: 'Fluorescence',
  air: AIR,
  pillar: 0.02,
  dark: 0.3,
  sound: { footing: 'soft', hum: 0, air: 0.05, echo: 2.6 },
  decor: [
    { thing: 'balloon', perRoom: 0.2 },
    { thing: 'mannequin', perRoom: 0.1 },
    { thing: 'floor-lamp', perRoom: 0.2 },
    { thing: 'tank', perRoom: 0.2 },
  ],
  shader: {
    ...FLUORESCENCE_SHADER,
    needs: [
      ...FLUORESCENCE_SHADER.needs,
      ordinary('fluorescence', {
        lamp: [0.22, 0.1, 0.9],
        ambient: [0, 0, 0.002],
        grid: 2,
        panel: [0.2, 0.2],
        stutter: 0,
        visibility: 45,
        exposure: 1.2,
        glow: 0.5,
        fringe: 0.004,
        vignette: 0.4,
        noise: 0.02,
      }),
    ],
  },
};
