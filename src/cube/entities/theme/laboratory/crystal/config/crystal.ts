import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { CRYSTAL_SHADER } from './crystal.shader.generated';

const AIR = linear(hex(0x05_04_10));

/**
 * Inside a crystal: walls of facets that each throw the lamps a different
 * way, a floor of salt grown in stepped squares, and a geode's violet teeth
 * for a ceiling.
 */
export const CRYSTAL: FloorTheme = {
  name: 'Crystal',
  air: AIR,
  pillar: 0.026,
  dark: 0.1,
  sound: { footing: 'tile', hum: 0, air: 0.05, echo: 3.2 },
  decor: [
    { thing: 'monolith', perRoom: 0.5 },
    { thing: 'mirror', perRoom: 0.5 },
    { thing: 'crate', perRoom: 0.15 },
    { thing: 'staircase', perRoom: 0.1 },
  ],
  shader: {
    ...CRYSTAL_SHADER,
    needs: [
      ...CRYSTAL_SHADER.needs,
      ordinary('crystal', {
        lamp: [1, 1.06, 1.35],
        ambient: [0.008, 0.01, 0.02],
        grid: 3,
        panel: [0.16, 0.16],
        stutter: 0,
        visibility: 45,
        exposure: 1.1,
        glow: 0.35,
        fringe: 0.012,
        vignette: 0.45,
        noise: 0.012,
      }),
    ],
  },
};
