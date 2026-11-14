import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { CUT_PAPER_SHADER } from './cut-paper.shader.generated';

const AIR = linear(hex(0xee_e3_c8));

/**
 * No light at all, so no shading: every face is one flat colour out of six,
 * rolled per room, and only an inked line says where one face ends and the
 * next begins. A building as a cut-paper poster of itself.
 */
export const CUT_PAPER: FloorTheme = {
  name: 'Flat fields',
  air: AIR,
  pillar: 0.035,
  dark: 0,
  sound: { footing: 'soft', hum: 0, air: 0, echo: 0.2 },
  decor: [
    { thing: 'armchair', perRoom: 0.4 },
    { thing: 'potted-plant', perRoom: 0.5 },
    { thing: 'floor-lamp', perRoom: 0.3 },
    { thing: 'balloon', perRoom: 0.2 },
    { thing: 'door', perRoom: 0.4 },
  ],
  shader: CUT_PAPER_SHADER,
};
