import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { GRANDMOTHER_SHADER } from './grandmother.shader.generated';

const AIR = linear(hex(0x1c_12_0a));

/**
 * Her front room, as the one colour print of it kept it: cabbage roses gone
 * tobacco-yellow, clean oblongs where the pictures hung, a carpet of swirls,
 * combed plaster overhead. The frame is that print — faded, soft, light-struck.
 */
export const GRANDMOTHER: FloorTheme = {
  name: 'Grandmother’s',
  air: AIR,
  pillar: 0.016,
  dark: 0.06,
  sound: { footing: 'carpet', hum: 0, air: 0.03, echo: 0.3 },
  decor: [
    { thing: 'armchair', perRoom: 1 },
    { thing: 'sofa', perRoom: 0.4 },
    { thing: 'floor-lamp', perRoom: 0.5 },
    { thing: 'tv', perRoom: 0.3 },
    { thing: 'wall-clock', perRoom: 0.4 },
    { thing: 'bookshelf', perRoom: 0.3 },
    { thing: 'curtain', perRoom: 0.5 },
    { thing: 'potted-plant', perRoom: 0.5 },
  ],
  shader: GRANDMOTHER_SHADER,
};
