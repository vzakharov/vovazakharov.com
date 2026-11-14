import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { STAINED_SECTION_SHADER } from './stained-section.shader.generated';

const AIR = linear(hex(0xf4_ea_ee));

/**
 * A stained tissue section, walked through: muscle underfoot, glands in the
 * walls, fat overhead, all in the two dyes of a pathology slide — and seen
 * down the barrel of the microscope, pointer and all.
 */
export const STAINED_SECTION: FloorTheme = {
  name: 'Stained section',
  air: AIR,
  pillar: 0.02,
  dark: 0,
  sound: { footing: 'soft', hum: 0, air: 0.1, echo: 0.2 },
  decor: [
    { thing: 'lab-bench', perRoom: 0.3 },
    { thing: 'mannequin', perRoom: 0.08 },
    { thing: 'mirror', perRoom: 0.2 },
    { thing: 'bin', perRoom: 0.1 },
  ],
  shader: STAINED_SECTION_SHADER,
};
