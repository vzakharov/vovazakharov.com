import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { INCUBATOR_SHADER } from './incubator.shader.generated';

const AIR = linear(hex(0x28_08_30));

/**
 * An incubator held at body heat, seen by a thermal camera: no colour but
 * warmth — the heating coils through the plaster, a handprint cooling on a
 * wall, and across the floor the footprints of someone who is walking it
 * right now and gives off nothing else.
 */
export const INCUBATOR: FloorTheme = {
  name: 'Incubator',
  air: AIR,
  pillar: 0.022,
  dark: 0.1,
  sound: { footing: 'carpet', hum: 60, air: 0.45, echo: 0.3 },
  decor: [
    { thing: 'radiator', perRoom: 0.8 },
    { thing: 'tank', perRoom: 0.3 },
    { thing: 'bed', perRoom: 0.15 },
    { thing: 'pipe', perRoom: 0.5 },
    { thing: 'vent', perRoom: 0.5 },
    { thing: 'office-chair', perRoom: 0.2 },
  ],
  shader: INCUBATOR_SHADER,
};
