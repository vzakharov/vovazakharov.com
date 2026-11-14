import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { INDOOR_POOL_SHADER } from './indoor-pool.shader.generated';

const AIR = linear(hex(0x1a_2c_2e));

/**
 * A pool hall drained to the ankle and never refilled: every surface in
 * small tiles, the water still moving, its light crawling up the walls.
 */
export const INDOOR_POOL: FloorTheme = {
  name: 'Indoor pool',
  air: AIR,
  pillar: 0.035,
  dark: 0.04,
  sound: { footing: 'wet', hum: 50, air: 0.35, echo: 3.4 },
  decor: [
    { thing: 'pool-ladder', perRoom: 0.6 },
    { thing: 'drain', perRoom: 0.5 },
    { thing: 'bench', perRoom: 0.3 },
    { thing: 'wet-floor-sign', perRoom: 0.2 },
    { thing: 'potted-plant', perRoom: 0.3 },
    { thing: 'wall-clock', perRoom: 0.15 },
    { thing: 'locker', perRoom: 0.2 },
  ],
  shader: INDOOR_POOL_SHADER,
};
