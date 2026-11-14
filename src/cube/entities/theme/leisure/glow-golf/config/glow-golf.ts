import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { GLOW_GOLF_SHADER } from './glow-golf.shader.generated';

const AIR = linear(hex(0x05_02_0e));

/**
 * Mini golf under black light: nothing in the room is lit, everything
 * painted in it shines — a fairway wandering through every room to a hole
 * nobody putts at, and a cosmos on the walls.
 */
export const GLOW_GOLF: FloorTheme = {
  name: 'Glow golf',
  air: AIR,
  pillar: 0.02,
  dark: 0,
  sound: { footing: 'carpet', hum: 60, air: 0.15, echo: 0.5 },
  decor: [
    { thing: 'traffic-cone', perRoom: 0.6 },
    { thing: 'barrel', perRoom: 0.5 },
    { thing: 'monolith', perRoom: 0.2 },
    { thing: 'balloon', perRoom: 0.4 },
    { thing: 'bench', perRoom: 0.3 },
    { thing: 'bin', perRoom: 0.2 },
    { thing: 'exit-sign', perRoom: 0.3 },
  ],
  shader: GLOW_GOLF_SHADER,
};
