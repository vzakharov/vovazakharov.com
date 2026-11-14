import { hex, linear } from '@/cube/shared/lib/colour';

import type { FloorTheme } from '../../../kit';
import { PAINTED_SKY_SHADER } from './painted-sky.shader.generated';

const AIR = linear(hex(0x1c_24_30));

/**
 * A playground somebody moved indoors and painted the outdoors round: hills
 * and clouds on every wall, a sun round every lamp, rubber underfoot — and
 * the whole of it drawn, as the page of the picture book it was copied from.
 */
export const PAINTED_SKY: FloorTheme = {
  name: 'Playground under a painted sky',
  air: AIR,
  pillar: 0.02,
  dark: 0.03,
  sound: { footing: 'soft', hum: 0, air: 0.1, echo: 0.9 },
  decor: [
    { thing: 'slide', perRoom: 0.7 },
    { thing: 'balloon', perRoom: 0.6 },
    { thing: 'bench', perRoom: 0.5 },
    { thing: 'traffic-cone', perRoom: 0.3 },
    { thing: 'ladder', perRoom: 0.3 },
    { thing: 'potted-plant', perRoom: 0.4 },
    { thing: 'bin', perRoom: 0.2 },
  ],
  shader: PAINTED_SKY_SHADER,
};
