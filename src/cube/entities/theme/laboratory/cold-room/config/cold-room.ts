import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { COLD_ROOM_SHADER } from './cold-room.shader.generated';

const AIR = linear(hex(0x9a_b6_c6));

/**
 * A walk-in freezer the size of a floor: ribbed insulated panels furred with
 * frost from the floor up, tread plate under a skin of ice, and a fog that
 * keeps the far wall to itself.
 */
export const COLD_ROOM: FloorTheme = {
  name: 'Cold room',
  air: AIR,
  pillar: 0.02,
  dark: 0.15,
  sound: { footing: 'metal', hum: 50, air: 0.8, echo: 0.9 },
  decor: [
    { thing: 'crate', perRoom: 1 },
    { thing: 'barrel', perRoom: 0.5 },
    { thing: 'tank', perRoom: 0.4 },
    { thing: 'locker', perRoom: 0.3 },
    { thing: 'pipe', perRoom: 0.8 },
    { thing: 'door', perRoom: 0.3 },
  ],
  shader: {
    ...COLD_ROOM_SHADER,
    needs: [
      ...COLD_ROOM_SHADER.needs,
      ordinary('cold-room', {
        lamp: [1.5, 2, 2.4],
        ambient: [0.012, 0.02, 0.028],
        grid: 2,
        panel: [0.9, 0.14],
        stutter: 0.1,
        visibility: 21,
        exposure: 1,
        glow: 0.3,
        fringe: 0.004,
        vignette: 0.3,
        noise: 0.014,
      }),
    ],
  },
};
