import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary } from '../../../kit';
import { SERVICE_CORRIDOR_SHADER } from './service-corridor.shader.generated';

const AIR = linear(hex(0x10_12_12));

/**
 * The corridor behind a mall's shops, with no shops in front of it: painted
 * blockwork and a rubber bump rail, an oxide-red floor buffed by pallet
 * trucks, and two unbroken lines of light under a black deck and its duct.
 */
export const SERVICE_CORRIDOR: FloorTheme = {
  name: 'Service corridor',
  air: AIR,
  pillar: 0.02,
  dark: 0.06,
  sound: { footing: 'concrete', hum: 100, air: 0.6, echo: 1.8 },
  decor: [
    { thing: 'door', perRoom: 1.2 },
    { thing: 'crate', perRoom: 0.5 },
    { thing: 'cardboard-box', perRoom: 0.8 },
    { thing: 'shopping-cart', perRoom: 0.2 },
    { thing: 'bin', perRoom: 0.4 },
    { thing: 'fire-extinguisher', perRoom: 0.3 },
    { thing: 'vent', perRoom: 0.4 },
    { thing: 'wet-floor-sign', perRoom: 0.15 },
    { thing: 'mannequin', perRoom: 0.04 },
    { thing: 'ladder', perRoom: 0.08 },
  ],
  shader: {
    ...SERVICE_CORRIDOR_SHADER,
    needs: [
      ...SERVICE_CORRIDOR_SHADER.needs,
      ordinary('service-corridor', {
        lamp: [1.25, 1.45, 1.3],
        ambient: [0.007, 0.009, 0.008],
        grid: 2,
        panel: [2.36, 0.09],
        stutter: 0.06,
        visibility: 55,
        exposure: 1,
        glow: 0.18,
        fringe: 0.005,
        vignette: 0.38,
        noise: 0.016,
      }),
    ],
  },
};
