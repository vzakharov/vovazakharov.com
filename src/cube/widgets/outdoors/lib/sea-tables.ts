import { f32, wgsl } from '@/cube/shared/shader';

import { CASCADES } from './cascade';

/**
 * The sea's mesh: rings about the point under the eye, each a little wider
 * than the last, so the triangles are centimetres at the eye and reach the
 * far plane in `RINGS` steps. Only the sector the eye faces is laid.
 */
export const RINGS = 512;
export const SPOKES = 640;

/**
 * The cascades' count and each one's tile side, metres, and the mesh's
 * spokes, as WGSL constants: `CASCADES`, `SIDES`, `SPOKES`.
 */
export const SEA_TABLES = wgsl(
  'sea/tables',
  /* wgsl */ `
const CASCADES = ${String(CASCADES.length)}u;
const SIDES = array<f32, ${String(CASCADES.length)}>(${CASCADES.map(({ tileSide }) => f32(tileSide)).join(', ')});
const SPOKES = ${String(SPOKES)}u;
`,
);
