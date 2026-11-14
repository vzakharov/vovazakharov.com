import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { CINEMA_CORRIDOR_SHADER } from './cinema-corridor.shader.generated';

const AIR = linear(hex(0x0c_05_04));

/**
 * The corridor between a cinema's screens, with every film already running
 * behind doors that are not there: velvet, brass, a carpet of gold rings
 * and a line of light along the floor to walk by.
 */
export const CINEMA_CORRIDOR: FloorTheme = {
  name: 'Cinema corridor',
  air: AIR,
  pillar: 0.03,
  dark: 0.08,
  sound: { footing: 'carpet', hum: 50, air: 0.1, echo: 0.35 },
  decor: [
    { thing: 'door', perRoom: 1.2 },
    { thing: 'curtain', perRoom: 0.8 },
    { thing: 'exit-sign', perRoom: 0.5 },
    { thing: 'armchair', perRoom: 0.4 },
    { thing: 'bin', perRoom: 0.3 },
    { thing: 'vending-machine', perRoom: 0.15 },
    { thing: 'floor-lamp', perRoom: 0.15 },
  ],
  shader: {
    ...CINEMA_CORRIDOR_SHADER,
    needs: [
      ...CINEMA_CORRIDOR_SHADER.needs,
      ordinary('cinema-corridor', {
        lamp: [0.55, 0.32, 0.15],
        ambient: [0.006, 0.003, 0.002],
        grid: 3,
        panel: [0.13, 0.13],
        stutter: 0.05,
        visibility: 40,
        exposure: 1.25,
        glow: 0.3,
        fringe: 0.005,
        vignette: 0.45,
        noise: 0.022,
      }),
    ],
  },
};
