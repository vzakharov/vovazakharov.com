import { mix, smoothstep } from 'three/tsl';
import type { Node } from 'three/webgpu';

import type { Look } from '@/island/shared/play';

import { BAND_HEIGHTS, LAND_PALETTE, SHORE_TOP } from '../lib/land-colour';
import { beachOf } from './land-beach';
import { lowlandOf, woodedOf } from './land-lowland';
import {
  type Band,
  COUNTRY,
  DISTRICT,
  FIELD,
  type Ground,
  HILL,
  mixerOf,
  paint,
  PATCH,
  type Ragged,
  REGION,
  SLOPE,
} from './land-mix';
import type { OctaveNoise } from './land-noise';
import { alpineOf, moorOf, rockOf, snowOf } from './land-upland';

type F = Node<'float'>;
type V = Node<'vec3'>;

/** A surface by the colour it is painted. */
export type Coloured = {
  /** The ground's own colour, before the lamps. */
  readonly colour: V;
};

export type Banded = Coloured & {
  /** How rough its small relief stands, 0 smooth. */
  readonly roughness: F;
  /** How much of it is bare dry sand the wind ripples, 0 none. */
  readonly rippled: F;
};

/** How steep ground reads as higher when a band is told, metres for a wall. */
const STEEP_LIFT = 600;

/**
 * What each of the four bands the height tells apart — beach, green lowland,
 * brown upland, mountain — is made of, their borders broken by slope and by
 * `octaves` at every scale given. Past the plain `look` come rock's beds and
 * the forest's floor near the eye.
 */
export function landBands(
  ground: Ground,
  octaves: readonly OctaveNoise[],
  look: Look,
): Banded {
  const { level, stops, steep, sand } = ground;
  const m = mixerOf(octaves);
  const inland = smoothstep(SHORE_TOP, 150, level);
  const borders = m.ragged([
    [REGION, 170],
    [DISTRICT, 110],
    [HILL, 60],
    [FIELD, 26],
    [SLOPE, 11],
    [PATCH, 4],
  ]);
  const border: Ragged = {
    sum: borders.sum.mul(inland),
    lost: borders.lost.mul(inland),
  };
  // Low ground stays lowland however it leans: a dune's lee is no upland.
  const banded = level.add(
    steep.mul(STEEP_LIFT).mul(smoothstep(120, 420, level)),
  );
  const band: Band = { ground, mix: m, banded, border, look };
  const upland = m.edge(banded, ...BAND_HEIGHTS.upland, border);
  const mountain = m.edge(banded, ...BAND_HEIGHTS.mountain, border);

  const wooded = woodedOf(band);
  const moor = moorOf(band);
  const alpine = alpineOf(band);
  const stone = rockOf(band, upland, mountain);
  const snow = snowOf(band);
  const beach = beachOf(band, sand.mul(wooded.cover.mul(0.85).oneMinus()));

  const tint = m.mottled([
    [COUNTRY, 0.08],
    [REGION, 0.05],
  ]);
  const grown = mix(
    mix(
      mix(mix(lowlandOf(band), moor.colour, upland), alpine.colour, mountain),
      wooded.colour,
      wooded.cover,
    ),
    stone.colour,
    stone.rock,
  ).mul(tint);
  const snowed = mix(
    grown,
    paint(LAND_PALETTE.snow).mul(m.mottled([[PATCH, 0.025]])),
    snow,
  );

  /** The relief's slope: sand lies smooth, turf rolls, tussock and scree stand, rock stands rough. */
  const turf = mix(
    mix(mix(0.12, 0.2, wooded.cover), mix(0.2, 0.42, moor.clump), upland),
    mix(0.24, 0.5, alpine.scree),
    mountain,
  );
  return {
    colour: mix(
      stops,
      mix(snowed, beach.colour, beach.sand),
      smoothstep(0.5, 4, level),
    ),
    roughness: mix(
      mix(mix(turf, 0.42, stone.rock), 0.06, snow),
      mix(0.3, 0.05, beach.bare),
      beach.sand,
    ),
    rippled: beach.sand.mul(beach.bare).mul(smoothstep(1.5, 4, level)),
  };
}
