import { hex, linear } from '@/cube/shared/lib/colour';
import type { Box } from '@/cube/shared/outside';

import { type FloorTheme, type Shrub, sunlit } from '../../../kit';
import { RECEPTION_SHADER } from './reception.shader';

const AIR = linear(hex(0x17_14_0f));

/**
 * The potted plants the planted world stands in floor 1's room, where the
 * doorway's beam finds them: the one by the doorway and the one in the far
 * corner. The decor rolls their places and the light cannot ask it, so they
 * are written here and the page's `reception-shrubs.test.ts` holds them to
 * where it puts them.
 */
export const RECEPTION_SHRUBS: readonly Shrub[] = [
  { at: [4.415, 0.4252], draw: 0.9588 },
  { at: [0.441, 0.585], draw: 0.8749 },
];

/**
 * What else of the planted world's decor stands in the beam, as the boxes
 * of its parts, in metres of the shell's frame, the largest first: a bench's
 * south end support, its three seat slats, its two back slats and the post
 * that holds them. Written here and held to the decor by
 * `reception-beam-boxes.test.ts`, as the plants are.
 */
export const RECEPTION_BEAM_BOXES: readonly Box[] = [
  { min: [0.1, 0, 3.42], max: [0.5, 0.42, 3.47] },
  { min: [0.09, 0.42, 2.075], max: [0.21, 0.46, 3.575] },
  { min: [0.23, 0.42, 2.075], max: [0.35, 0.46, 3.575] },
  { min: [0.37, 0.42, 2.075], max: [0.49, 0.46, 3.575] },
  { min: [0.07, 0.58, 2.075], max: [0.1, 0.68, 3.575] },
  { min: [0.07, 0.74, 2.075], max: [0.1, 0.84, 3.575] },
  { min: [0.1, 0.42, 3.42], max: [0.14, 0.86, 3.47] },
];

/**
 * The whole cube as one room: a reception nobody staffs. Terrazzo, a green
 * dado under cream plaster, and four big panels nobody switched on: the
 * evening sun through the doorway is all its light.
 */
export const RECEPTION: FloorTheme = {
  name: 'Reception',
  air: AIR,
  pillar: 0.03,
  dark: 0,
  sound: { footing: 'tile', hum: 100, air: 0.15, echo: 1.6 },
  decor: [
    { thing: 'potted-plant', perRoom: 2 },
    { thing: 'bench', perRoom: 1 },
    { thing: 'wall-clock', perRoom: 1 },
    { thing: 'notice-board', perRoom: 1 },
  ],
  shader: {
    ...RECEPTION_SHADER,
    needs: [
      ...RECEPTION_SHADER.needs,
      sunlit('reception', {
        ambient: [0.022, 0.02, 0.019],
        shrubs: RECEPTION_SHRUBS,
        boxes: RECEPTION_BEAM_BOXES,
        floor: [0.27, 0.24, 0.2],
        walls: [0.26, 0.26, 0.19],
        visibility: 70,
        exposure: 1.5,
        glow: 0.14,
        fringe: 0.004,
        vignette: 0.3,
        noise: 0.012,
      }),
    ],
  },
};
