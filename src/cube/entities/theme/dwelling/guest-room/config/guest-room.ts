import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { GUEST_ROOM_SHADER } from './guest-room.shader.generated';

const AIR = linear(hex(0x16_0c_0c));

/**
 * The spare room nobody was allowed to sleep in, where the headboard has
 * taken the walls: buttoned rose satin from skirting to ceiling, cream pile
 * still in the hoover's stripes, the dents of a bed that is not there, a
 * pleated shade.
 */
export const GUEST_ROOM: FloorTheme = {
  name: 'Guest room',
  air: AIR,
  pillar: 0.016,
  dark: 0.06,
  sound: { footing: 'soft', hum: 0, air: 0.02, echo: 0.12 },
  decor: [
    { thing: 'bed', perRoom: 0.7 },
    { thing: 'wardrobe', perRoom: 0.6 },
    { thing: 'mirror', perRoom: 0.6 },
    { thing: 'curtain', perRoom: 0.8 },
    { thing: 'armchair', perRoom: 0.3 },
    { thing: 'floor-lamp', perRoom: 0.4 },
    { thing: 'mattress', perRoom: 0.15 },
  ],
  shader: {
    ...GUEST_ROOM_SHADER,
    needs: [
      ...GUEST_ROOM_SHADER.needs,
      ordinary('guest-room', {
        lamp: [4.3, 3, 2.5],
        ambient: [0.011, 0.008, 0.008],
        grid: 1,
        panel: [0.4, 0.4],
        stutter: 0,
        visibility: 40,
        exposure: 1,
        glow: 0.2,
        fringe: 0.004,
        vignette: 0.4,
        noise: 0.014,
      }),
    ],
  },
};
