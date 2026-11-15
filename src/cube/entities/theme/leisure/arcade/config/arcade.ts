import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { ARCADE_SHADER } from './arcade.shader.generated';

const AIR = linear(hex(0x08_04_12));

/**
 * An arcade with the machines taken out: the carpet still shouting, the neon
 * still on, and the whole of it seen as its own screens would show it.
 */
export const ARCADE: FloorTheme = {
  name: 'Arcade',
  air: AIR,
  pillar: 0.025,
  dark: 0.1,
  sound: { footing: 'carpet', hum: 60, air: 0.15, echo: 0.6 },
  decor: [
    { thing: 'arcade-cabinet', perRoom: 2.4 },
    { thing: 'vending-machine', perRoom: 0.4 },
    { thing: 'chair-stack', perRoom: 0.2 },
    { thing: 'bin', perRoom: 0.3 },
    { thing: 'exit-sign', perRoom: 0.2 },
    { thing: 'payphone', perRoom: 0.15 },
    { thing: 'socket', perRoom: 0.6 },
  ],
  shader: ARCADE_SHADER,
};
