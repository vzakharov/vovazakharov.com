import { f32, wgsl } from '@/cube/shared/shader';

import { SAND_MESH } from './sand-mesh';

/** `SAND_MESH` as the WGSL constants the sand's vertex stage places it by. */
export const SAND_MESH_NUMBERS = wgsl(
  'sand/sand-mesh-numbers',
  /* wgsl */ `
const SAND_SPOKES = ${String(SAND_MESH.spokes)}u;
/// The angle between neighbouring spokes, radians.
const SAND_SPOKE_TURN = ${f32((2 * Math.PI) / SAND_MESH.spokes)};
const SAND_INNER = ${f32(SAND_MESH.inner)};
const SAND_GROWTH = ${f32(SAND_MESH.growth)};
/// \`log(SAND_GROWTH)\`: a ring's spacing over its radius plus \`SAND_INNER\`.
const SAND_GROWTH_LOG = ${f32(Math.log(SAND_MESH.growth))};
`,
);
