import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { ICE_RINK_SHADER } from './ice-rink.shader.generated';

const AIR = linear(hex(0x26_2e_34));

/**
 * A rink after the last session: ice cut up by skates nobody took off it,
 * white boards under glass, the seats beyond in the dark, a face-off circle
 * in every room and nobody to drop the puck.
 */
export const ICE_RINK: FloorTheme = {
  name: 'Ice rink',
  air: AIR,
  pillar: 0.02,
  dark: 0.05,
  sound: { footing: 'tile', hum: 120, air: 0.4, echo: 2.8 },
  decor: [
    { thing: 'bench', perRoom: 0.8 },
    { thing: 'traffic-cone', perRoom: 0.6 },
    { thing: 'door', perRoom: 0.4 },
    { thing: 'wall-clock', perRoom: 0.2 },
    { thing: 'bin', perRoom: 0.2 },
    { thing: 'wet-floor-sign', perRoom: 0.2 },
    { thing: 'vending-machine', perRoom: 0.1 },
  ],
  shader: {
    ...ICE_RINK_SHADER,
    needs: [
      ...ICE_RINK_SHADER.needs,
      ordinary('ice-rink', {
        lamp: [1.2, 1.33, 1.46],
        ambient: [0.012, 0.015, 0.018],
        grid: 2,
        panel: [0.45, 0.45],
        stutter: 0.02,
        visibility: 34,
        exposure: 1,
        glow: 0.22,
        fringe: 0.004,
        vignette: 0.3,
        noise: 0.012,
      }),
    ],
  },
};
