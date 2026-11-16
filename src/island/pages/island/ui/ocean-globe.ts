import { type Material, Mesh, SphereGeometry } from 'three/webgpu';

import { R } from '@/island/shared/globe';

/**
 * A sphere whose facets' sag stays below the tiles' sea, so it never shows
 * through them.
 */
const GLOBE_RADIUS = R - 1500;

/**
 * The globe outside the tiles, and under them before they load, in `ocean`.
 * It is drawn first and writes no depth, so every tile draws over it however
 * far its own depth is pushed.
 */
export function oceanGlobe(ocean: Material): Mesh {
  const globe = new Mesh(new SphereGeometry(GLOBE_RADIUS, 256, 128), ocean);
  globe.renderOrder = -1;
  ocean.depthWrite = false;
  return globe;
}
