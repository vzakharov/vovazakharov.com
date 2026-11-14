import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { NURSERY_SHADER } from './nursery.shader.generated';

const AIR = linear(hex(0x02_04_0b));

/**
 * A child's room long after bedtime. The big light is off for good; what
 * lights each room is the lamp on its ceiling that turns and throws stars and
 * moons round the walls, over a paper of smaller stars, bunting, and a rug
 * of roads to nowhere. The stuck-on stars overhead still hold a little green.
 */
export const NURSERY: FloorTheme = {
  name: 'Nursery, night',
  air: AIR,
  pillar: 0.016,
  dark: 0.12,
  sound: { footing: 'carpet', hum: 0, air: 0.02, echo: 0.25 },
  decor: [
    { thing: 'bed', perRoom: 0.8 },
    { thing: 'wardrobe', perRoom: 0.5 },
    { thing: 'bookshelf', perRoom: 0.4 },
    { thing: 'balloon', perRoom: 0.3 },
    { thing: 'curtain', perRoom: 0.5 },
    { thing: 'window', perRoom: 0.4 },
    { thing: 'slide', perRoom: 0.08 },
    { thing: 'cardboard-box', perRoom: 0.3 },
  ],
  shader: NURSERY_SHADER,
};
