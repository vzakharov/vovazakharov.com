import type { FloorTheme } from '../../../kit';
import { POINT_CLOUD_SHADER } from './point-cloud.shader.generated';

/**
 * The building as a surveyor's scan of it: no surfaces, only the points
 * where a beam came back, coloured by how high each is. The floor keeps
 * the rings of the scanner's sweep; where nothing came back there is
 * nothing.
 */
export const POINT_CLOUD: FloorTheme = {
  name: 'Point cloud',
  air: [0, 0, 0],
  pillar: 0.03,
  dark: 0,
  sound: { footing: 'hollow', hum: 0, air: 0.02, echo: 3 },
  decor: [
    { thing: 'mannequin', perRoom: 0.4 },
    { thing: 'ladder', perRoom: 0.2 },
    { thing: 'chair-stack', perRoom: 0.3 },
    { thing: 'potted-plant', perRoom: 0.3 },
    { thing: 'staircase', perRoom: 0.1 },
  ],
  shader: POINT_CLOUD_SHADER,
};
