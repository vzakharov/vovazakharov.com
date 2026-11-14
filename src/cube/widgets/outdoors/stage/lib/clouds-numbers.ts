import { ATMOSPHERE } from '@/cube/shared/cube-boundary';
import { f32, vecf, wgsl } from '@/cube/shared/shader';

import { CLOUD_TILE, CLOUDS } from './cloud-field';

const { rayleigh, mie } = ATMOSPHERE;

/**
 * The most the billows add to a cloud's body or take from it, in radii: what
 * `billows` can return, and the margin a march keeps before it reads them.
 */
const BILLOW = { broad: 0.95, knobs: 0.3, fine: 0.14 } as const;
const BILLOW_REACH = (BILLOW.broad + BILLOW.knobs + BILLOW.fine) / 2;

/** A cloud's edge: its density is whole this many kilometres inside it. */
const EDGE = 0.18;

/** Lattice cells to a kilometre, for a lattice of `cells` to the tile. */
const cellsPerKm = (cells: number): string => f32(cells / CLOUD_TILE);

/**
 * The clouds' numbers as `clouds-wgsl.wgsl` reads them: their extinction and
 * edge, the march's skin, the billows' weights, reach and lattices, the
 * grain's, the ice cloud's height and reach, the tile, and the clear air
 * between the eye and a cloud.
 */
export const CLOUDS_NUMBERS = wgsl(
  'sky/clouds-numbers',
  /* wgsl */ `
const CLOUD_EXTINCTION = ${f32(CLOUDS.extinction)};
const CLOUD_EDGE = ${f32(EDGE)};
const SKIN = ${f32(Math.sqrt(EDGE / CLOUDS.extinction) * 0.7)};
const BILLOW_BROAD = ${f32(BILLOW.broad)};
const BILLOW_KNOBS = ${f32(BILLOW.knobs)};
const BILLOW_FINE = ${f32(BILLOW.fine)};
const BILLOW_REACH = ${f32(BILLOW_REACH)};
const BILLOW_BROAD_SCALE = ${f32(CLOUDS.billow[0])};
const BILLOW_KNOB_SCALE = ${f32(CLOUDS.billow[1])};
const BILLOW_FINE_SCALE = ${f32(CLOUDS.billow[1] * 2.3)};
const GRAIN_PER_KM = ${cellsPerKm(CLOUDS.grain)};
const GRAIN_PERIOD = ${String(CLOUDS.grain)};
const CIRRUS_HEIGHT = ${f32(CLOUDS.cirrus)};
const CIRRUS_REACH = ${f32(CLOUDS.cirrusReach)};
const CLOUD_TILE_KM = ${f32(CLOUD_TILE)};
const RAYLEIGH_SCATTER = ${vecf(rayleigh.scatter)};
const RAYLEIGH_HEIGHT = ${f32(rayleigh.height)};
const MIE_EXTINCTION = ${vecf(mie.scatter.map((s, c) => s + (mie.absorb[c] ?? 0)))};
const MIE_HEIGHT = ${f32(mie.height)};
`,
);
