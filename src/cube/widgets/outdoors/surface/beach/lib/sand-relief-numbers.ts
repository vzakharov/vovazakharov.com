import { f32, vecf, wgsl } from '@/cube/shared/shader';

/** Where the wind blows to, a unit vector on the ground plane (x east, z south). */
const WIND = [-Math.cos(2.44), -Math.sin(2.44)] as const;

/** The wind's heading and half a turn, as the WGSL constants the sand reads. */
export const SAND_RELIEF_NUMBERS = wgsl(
  'sand/sand-relief-numbers',
  /* wgsl */ `
const SAND_WIND = ${vecf(WIND)};
/// Half a turn, in radians.
const SAND_PI = ${f32(Math.PI)};
`,
);
