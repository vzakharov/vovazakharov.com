import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { TEXTURE_TEST_SHADER } from './texture-test.shader.generated';

const AIR = linear(hex(0x1c_1c_22));

/**
 * The map an artist lays on a model to see how a texture will sit: numbered
 * squares gone unnumbered, a hue for every square, a ring and a cross in
 * each. It was meant to be replaced.
 */
export const TEXTURE_TEST: FloorTheme = {
  name: 'Texture test',
  air: AIR,
  pillar: 0.025,
  dark: 0.05,
  sound: { footing: 'hollow', hum: 120, air: 0.05, echo: 0.9 },
  decor: [
    { thing: 'mannequin', perRoom: 0.4 },
    { thing: 'crate', perRoom: 0.4 },
    { thing: 'monolith', perRoom: 0.15 },
    { thing: 'mirror', perRoom: 0.2 },
  ],
  shader: {
    ...TEXTURE_TEST_SHADER,
    needs: [
      ...TEXTURE_TEST_SHADER.needs,
      ordinary('texture-test', {
        lamp: [1.3, 1.32, 1.4],
        ambient: [0.015, 0.015, 0.018],
        grid: 2,
        panel: [0.6, 0.6],
        stutter: 0.05,
        visibility: 55,
        exposure: 1,
        glow: 0.12,
        fringe: 0.004,
        vignette: 0.35,
        noise: 0.012,
      }),
    ],
  },
};
