import type { FloorTheme } from '../../../kit';
import { DEPTH_BUFFER_SHADER } from './depth-buffer.shader.generated';

/**
 * Only how far away things are is left, and that is what is shown: white
 * at the eye, black where the building stops mattering, a contour at every
 * metre the way a map has them, in as few greys as the buffer had bits.
 */
export const DEPTH_BUFFER: FloorTheme = {
  name: 'Depth buffer',
  air: [0, 0, 0],
  pillar: 0.04,
  dark: 0,
  sound: { footing: 'soft', hum: 0, air: 0.3, echo: 0.1 },
  decor: [
    { thing: 'monolith', perRoom: 0.4 },
    { thing: 'mannequin', perRoom: 0.3 },
    { thing: 'bench', perRoom: 0.3 },
    { thing: 'barrel', perRoom: 0.3 },
    { thing: 'staircase', perRoom: 0.1 },
  ],
  shader: DEPTH_BUFFER_SHADER,
};
