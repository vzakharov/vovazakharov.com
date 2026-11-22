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
  STEP,
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

/** The heights between which a rough shore's rock gives way to what grows over it, metres above the sea. */
const SHORE_ROCK = [3, 9] as const;

/** How dark the sea keeps a rough shore's rock at the waterline, and the height it has dried by, metres. */
const WET_ROCK = 0.5;
const DRY_BY = 2.5;

/** How rough bare rock's small relief stands. */
const ROCK_ROUGH = 0.42;

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
  const { level, stops, steep, sand, rocky } = ground;
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
  // A rough shore is bare rock from the water up, wet and dark where the sea
  // reaches it, its upper edge broken; nothing grows on it and no sand lies.
  const shore = m.edge(
    rocky.mul(smoothstep(...SHORE_ROCK, level).oneMinus()),
    0.3,
    0.5,
    m.ragged([
      [SLOPE, 0.2],
      [PATCH, 0.2],
      [STEP, 0.1],
    ]),
  );
  return {
    colour: mix(
      mix(
        stops,
        mix(snowed, beach.colour, beach.sand),
        smoothstep(0.5, 4, level),
      ),
      stone.colour.mul(mix(WET_ROCK, 1, smoothstep(0.2, DRY_BY, level))),
      shore,
    ),
    roughness: mix(
      mix(
        mix(mix(turf, ROCK_ROUGH, stone.rock), 0.06, snow),
        mix(0.3, 0.05, beach.bare),
        beach.sand,
      ),
      ROCK_ROUGH,
      shore,
    ),
    rippled: beach.sand
      .mul(beach.bare)
      .mul(smoothstep(1.5, 4, level))
      .mul(shore.oneMinus()),
  };
}
