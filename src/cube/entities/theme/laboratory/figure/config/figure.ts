import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { FIGURE_SHADER } from './figure.shader.generated';

const AIR = linear(hex(0xe9_e2_cf));

/**
 * The cell as the textbook drew it, to walk about in: a bilayer of lollipops
 * along every wall, bean-shaped organelles on the floor, callouts with
 * nothing written in them — in flat colour and an ink line, on paper.
 */
export const FIGURE: FloorTheme = {
  name: 'Fig. 49',
  air: AIR,
  pillar: 0.022,
  dark: 0,
  sound: { footing: 'hollow', hum: 0, air: 0.02, echo: 0.1 },
  decor: [
    { thing: 'whiteboard', perRoom: 0.4 },
    { thing: 'desk', perRoom: 0.3 },
    { thing: 'bookshelf', perRoom: 0.3 },
    { thing: 'ladder', perRoom: 0.1 },
  ],
  shader: FIGURE_SHADER,
};
