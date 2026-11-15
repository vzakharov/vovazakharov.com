import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { METRO_PLATFORM_SHADER } from './metro-platform.shader.generated';

const AIR = linear(hex(0x0e_0f_0b));

/**
 * A platform with no track beside it: cream tiles under a red frieze whose
 * name plates were never lettered, the yellow line you stand behind in
 * every room, bills torn off their boards, a wind from a tunnel that is
 * not there.
 */
export const METRO_PLATFORM: FloorTheme = {
  name: 'Platform',
  air: AIR,
  pillar: 0.035,
  dark: 0.06,
  sound: { footing: 'tile', hum: 100, air: 0.7, echo: 3.2 },
  decor: [
    { thing: 'bench', perRoom: 1 },
    { thing: 'bin', perRoom: 0.5 },
    { thing: 'wall-clock', perRoom: 0.3 },
    { thing: 'payphone', perRoom: 0.2 },
    { thing: 'vending-machine', perRoom: 0.2 },
    { thing: 'exit-sign', perRoom: 0.3 },
    { thing: 'pipe', perRoom: 0.4 },
    { thing: 'fire-extinguisher', perRoom: 0.2 },
  ],
  shader: {
    ...METRO_PLATFORM_SHADER,
    needs: [
      ...METRO_PLATFORM_SHADER.needs,
      ordinary('metro-platform', {
        lamp: [1.25, 1.42, 1.15],
        ambient: [0.02, 0.023, 0.018],
        grid: 2,
        panel: [1.5, 0.12],
        stutter: 0.1,
        visibility: 45,
        exposure: 1.1,
        glow: 0.18,
        fringe: 0.006,
        vignette: 0.42,
        noise: 0.02,
      }),
    ],
  },
};
