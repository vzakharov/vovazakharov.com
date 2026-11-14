import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { MISSING_TEXTURE_SHADER } from './missing-texture.shader.generated';

const AIR = linear(hex(0x14_02_14));

/**
 * What an engine draws where a texture should have been: magenta and black
 * squares, lit by nothing and so lit in the dark. Here and there a patch of
 * the wall that was meant has loaded after all.
 */
export const MISSING_TEXTURE: FloorTheme = {
  name: 'Missing texture',
  air: AIR,
  pillar: 0.025,
  dark: 0.3,
  sound: { footing: 'hollow', hum: 0, air: 0.02, echo: 1.4 },
  decor: [
    { thing: 'door', perRoom: 0.5 },
    { thing: 'exit-sign', perRoom: 0.2 },
    { thing: 'crate', perRoom: 0.3 },
    { thing: 'monolith', perRoom: 0.1 },
  ],
  shader: {
    ...MISSING_TEXTURE_SHADER,
    needs: [
      ...MISSING_TEXTURE_SHADER.needs,
      ordinary('missing-texture', {
        lamp: [1.25, 1.05, 1.3],
        ambient: [0.012, 0.004, 0.012],
        grid: 2,
        panel: [0.625, 0.625],
        stutter: 0.25,
        visibility: 45,
        exposure: 1,
        glow: 0.22,
        fringe: 0.006,
        vignette: 0.4,
        noise: 0.015,
      }),
    ],
  },
};
