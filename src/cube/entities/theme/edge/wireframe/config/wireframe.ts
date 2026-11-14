import type { FloorTheme } from '../../../kit';
import { WIREFRAME_SHADER } from './wireframe.shader.generated';

/**
 * The surfaces are gone and the mesh under them is left: every face two
 * triangles' worth of green line on a vector tube, the lamps drawn as the
 * rectangles they would have been.
 */
export const WIREFRAME: FloorTheme = {
  name: 'Wireframe',
  air: [0, 0, 0],
  pillar: 0.03,
  dark: 0,
  sound: { footing: 'hollow', hum: 60, air: 0, echo: 2.4 },
  decor: [
    { thing: 'monolith', perRoom: 0.3 },
    { thing: 'crate', perRoom: 0.5 },
    { thing: 'staircase', perRoom: 0.15 },
    { thing: 'arcade-cabinet', perRoom: 0.1 },
  ],
  shader: WIREFRAME_SHADER,
};
