import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { AQUARIUM_TUNNEL_SHADER } from './aquarium-tunnel.shader.generated';

const AIR = linear(hex(0x02_0a_12));

/**
 * The tunnel through an aquarium's big tank, with the tank on every side
 * of every room: shoals going by behind the glass, the light of a surface
 * overhead, and now and then something much too large, far back, in no
 * hurry.
 */
export const AQUARIUM_TUNNEL: FloorTheme = {
  name: 'Aquarium tunnel',
  air: AIR,
  pillar: 0.02,
  dark: 0.12,
  sound: { footing: 'carpet', hum: 50, air: 0.25, echo: 1.4 },
  decor: [
    { thing: 'bench', perRoom: 0.8 },
    { thing: 'tank', perRoom: 0.3 },
    { thing: 'potted-plant', perRoom: 0.2 },
    { thing: 'bin', perRoom: 0.2 },
    { thing: 'exit-sign', perRoom: 0.3 },
    { thing: 'balloon', perRoom: 0.1 },
    { thing: 'wet-floor-sign', perRoom: 0.15 },
  ],
  shader: {
    ...AQUARIUM_TUNNEL_SHADER,
    needs: [
      ...AQUARIUM_TUNNEL_SHADER.needs,
      ordinary('aquarium-tunnel', {
        lamp: [0.5, 1.5, 1.9],
        ambient: [0.004, 0.012, 0.018],
        grid: 1,
        panel: [1.2, 1.2],
        stutter: 0.05,
        visibility: 40,
        exposure: 1.2,
        glow: 0.3,
        fringe: 0.006,
        vignette: 0.45,
        noise: 0.018,
      }),
    ],
  },
};
