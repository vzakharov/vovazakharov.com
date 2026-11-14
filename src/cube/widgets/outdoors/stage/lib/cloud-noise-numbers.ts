import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import { f32, vecf, wgsl } from '@/cube/shared/shader';

import {
  CLOUD_LANE,
  CLOUDS,
  DRIFT_PER_SECOND,
  SUN_IN_FIELD,
  WIND_AXIS,
} from './cloud-field';

const hash = pathHash('0');

/** What every lattice and every cell of the clouds is salted with. */
const { salt: SALT } = rollWith(
  roll.struct({ salt: roll.uniform(0, 2 ** 31) }),
  (path) => hash(`island/sky/clouds/${path}`),
);

/**
 * The cloud field as `cloud-noise.wgsl` holds it: its salt, its layer and
 * reach in kilometres, its cells and tile, the wind's axes and the sun in
 * them, the drift, each cell's odds and size, and the island's lane.
 */
export const CLOUD_NOISE_NUMBERS = wgsl(
  'sky/cloud-noise-numbers',
  /* wgsl */ `
const CLOUD_SALT = ${String(Math.floor(SALT))}u;
const CLOUD_BASE = ${f32(CLOUDS.base)};
const CLOUD_CEILING = ${f32(CLOUDS.ceiling)};
const CLOUD_REACH = ${f32(CLOUDS.reach)};
const CLOUD_CELL = ${f32(CLOUDS.cell)};
const CLOUD_BOUND = ${f32(CLOUDS.bound)};
const TILE_CELLS = ${String(CLOUDS.tileCells)};
const WIND_AXIS = ${vecf(WIND_AXIS)};
const WIND_SIDE = ${vecf([-WIND_AXIS[1], WIND_AXIS[0]])};
/// Towards the sun, in the field's axes.
const SUN_IN_FIELD = ${vecf(SUN_IN_FIELD)};
const CLOUD_DRIFT = ${f32(DRIFT_PER_SECOND)};
const CLOUD_CHANCE = ${f32(CLOUDS.chance)};
const CLOUD_RADIUS_LEAST = ${f32(CLOUDS.radius.least)};
const CLOUD_RADIUS_MOST = ${f32(CLOUDS.radius.most)};
const LANE_SHUT_BEHIND = ${f32(CLOUD_LANE.shut.behind)};
const LANE_OPEN_BEHIND = ${f32(CLOUD_LANE.open.behind)};
const LANE_OPEN_AHEAD = ${f32(CLOUD_LANE.open.ahead)};
const LANE_SHUT_AHEAD = ${f32(CLOUD_LANE.shut.ahead)};
const LANE_CLEAR = ${f32(CLOUDS.lane.clear)};
const LANE_SPREAD = ${f32(CLOUDS.lane.full - CLOUDS.lane.clear)};
`,
);
