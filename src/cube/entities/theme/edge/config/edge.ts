import type { Floors } from '../../kit';
import { GREYBOX } from './53-greybox';
import { TEXTURE_TEST } from './54-texture-test';
import { MISSING_TEXTURE } from './55-missing-texture';
import { NORMALS } from './56-normals';
import { FLAT_FIELDS } from './57-flat-fields';
import { WIREFRAME } from './58-wireframe';
import { POINT_CLOUD } from './59-point-cloud';
import { DEPTH_BUFFER } from './60-depth-buffer';
import { TEST_CARD } from './61-test-card';
import { SIXTEEN_COLOURS } from './62-sixteen-colours';
import { ONE_BIT } from './63-one-bit';
import { STATIC } from './64-static';
import { CLEAR_COLOUR } from './65-clear-colour';
import { HOME } from './66-home';
import { LAST_ROOM } from './67-last-room';

/**
 * Floors 53 to 67: where there is less and less left to build a room from —
 * first the textures go, then the light, then the surfaces, then the signal.
 */
export const EDGE_FLOORS: Floors = {
  53: GREYBOX,
  54: TEXTURE_TEST,
  55: MISSING_TEXTURE,
  56: NORMALS,
  57: FLAT_FIELDS,
  58: WIREFRAME,
  59: POINT_CLOUD,
  60: DEPTH_BUFFER,
  61: TEST_CARD,
  62: SIXTEEN_COLOURS,
  63: ONE_BIT,
  64: STATIC,
  65: CLEAR_COLOUR,
  66: HOME,
  67: LAST_ROOM,
};
