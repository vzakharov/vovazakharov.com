import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { CIRCUIT_BOARD_SHADER } from './circuit-board.shader.generated';

const AIR = linear(hex(0x02_0b_06));

/**
 * A circuit board as a city at night: streets of copper under green mask,
 * chips for tower blocks with a few windows lit, gold fingers for a kerb and
 * the underside of another board for a sky.
 */
export const CIRCUIT_BOARD: FloorTheme = {
  name: 'Circuit board',
  air: AIR,
  pillar: 0.03,
  dark: 0.12,
  sound: { footing: 'hollow', hum: 180, air: 0.3, echo: 1.1 },
  decor: [
    { thing: 'server-rack', perRoom: 0.8 },
    { thing: 'cable-reel', perRoom: 0.3 },
    { thing: 'monolith', perRoom: 0.2 },
    { thing: 'socket', perRoom: 1 },
    { thing: 'vent', perRoom: 0.4 },
  ],
  shader: {
    ...CIRCUIT_BOARD_SHADER,
    needs: [
      ...CIRCUIT_BOARD_SHADER.needs,
      ordinary('circuit-board', {
        lamp: [1.3, 1.5, 1.2],
        ambient: [0.003, 0.008, 0.005],
        grid: 3,
        panel: [0.22, 0.12],
        stutter: 0.1,
        visibility: 48,
        exposure: 1.15,
        glow: 0.3,
        fringe: 0.006,
        vignette: 0.42,
        noise: 0.016,
      }),
    ],
  },
};
