import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { CLEAN_ROOM_SHADER } from './clean-room.shader.generated';

const AIR = linear(hex(0xd3_e0_e4));

/**
 * A clean room nothing has ever dirtied: powder-coated panels, a perforated
 * access floor, and windows onto a yellow room that the white air swallows a
 * few bays off.
 */
export const CLEAN_ROOM: FloorTheme = {
  name: 'Clean room',
  air: AIR,
  pillar: 0.02,
  dark: 0,
  sound: { footing: 'hollow', hum: 120, air: 0.7, echo: 0.5 },
  decor: [
    { thing: 'lab-bench', perRoom: 0.6 },
    { thing: 'locker', perRoom: 0.5 },
    { thing: 'vent', perRoom: 1 },
    { thing: 'bin', perRoom: 0.3 },
    { thing: 'door', perRoom: 0.4 },
    { thing: 'mirror', perRoom: 0.15 },
  ],
  shader: {
    ...CLEAN_ROOM_SHADER,
    needs: [
      ...CLEAN_ROOM_SHADER.needs,
      ordinary('clean-room', {
        lamp: [1.25, 1.36, 1.42],
        ambient: [0.03, 0.034, 0.036],
        grid: 3,
        panel: [0.12, 1.35],
        stutter: 0,
        visibility: 34,
        exposure: 1,
        glow: 0.2,
        fringe: 0.003,
        vignette: 0.22,
        noise: 0.008,
      }),
    ],
  },
};
