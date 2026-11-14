import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { DRAWING_SHADER } from './drawing.shader.generated';

const AIR = linear(hex(0xd8_cf_b8));

/**
 * Home as a six-year-old drew it, and the drawing is where you are: wax
 * crayon on sugar paper, a window and a door wherever there was room, flowers
 * along the bottom, a sun for every lamp. Nothing is lit, only coloured in;
 * the frame draws its own black outlines, and they do not keep still.
 */
export const DRAWING: FloorTheme = {
  name: 'My house',
  air: AIR,
  pillar: 0.018,
  dark: 0.1,
  sound: { footing: 'hollow', hum: 0, air: 0.02, echo: 0.15 },
  decor: [
    { thing: 'bed', perRoom: 0.3 },
    { thing: 'sofa', perRoom: 0.3 },
    { thing: 'tv', perRoom: 0.3 },
    { thing: 'potted-plant', perRoom: 0.5 },
    { thing: 'balloon', perRoom: 0.4 },
    { thing: 'armchair', perRoom: 0.3 },
    { thing: 'bookshelf', perRoom: 0.2 },
  ],
  shader: DRAWING_SHADER,
};
