import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { lit } from '../../lit';
import { TEST_CARD_SHADER } from './test-card.shader.generated';

const AIR = linear(hex(0x05_06_08));

/**
 * What a station sends when it has nothing to send: colour bars on every
 * wall, grey steps and frequency bursts underfoot, a convergence grid and
 * its circle overhead, all seen on a tube that needs degaussing.
 */
export const TEST_CARD: FloorTheme = {
  name: 'Test card',
  air: AIR,
  pillar: 0.03,
  dark: 0.1,
  sound: { footing: 'hollow', hum: 1000, air: 0, echo: 0.6 },
  decor: [
    { thing: 'tv', perRoom: 1 },
    { thing: 'wall-clock', perRoom: 0.4 },
    { thing: 'office-chair', perRoom: 0.3 },
    { thing: 'cable-reel', perRoom: 0.3 },
  ],
  shader: {
    ...TEST_CARD_SHADER,
    needs: [
      ...TEST_CARD_SHADER.needs,
      lit(
        'test-card',
        'Lamps(vec3f(1.1, 1.15, 1.3), vec3f(0.01), 2, vec2f(0.5, 0.5), 0.15)',
        40,
      ),
    ],
  },
};
