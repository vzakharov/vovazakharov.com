import {
  attribute,
  clamp,
  dot,
  float,
  inverseSqrt,
  length,
  normalize,
  normalWorldGeometry,
  positionWorld,
  smoothstep,
  transformNormalToView,
  uniform,
  vec3,
} from 'three/tsl';
import { type Node, Vector3 } from 'three/webgpu';

import { COVER_ATTRIBUTE } from '../model/cover-attribute';
import {
  type Coloured,
  FIELD,
  GRAIN,
  HAND,
  landBands,
  type Parts,
  PATCH,
  SLOPE,
  STEP,
} from './land-bands';
import { type Following, landNoise, QUIET } from './land-noise';

type F = Node<'float'>;
type V = Node<'vec3'>;

/** The land's look in one of the scene's two: what its material is dressed in. */
type LandDress = Coloured & {
  /** The ground's normal in view space: a land material's `normalNode`. */
  readonly normal: V;
};

export type LandSurface = Following & {
  /** The fine look: every scale of the surface, down to the grain underfoot. */
  readonly fine: LandDress;
  /** The plain look: the country's colours alone, on the mesh's own shape. */
  readonly plain: LandDress;
};

/**
 * How far a mesh's lean is drawn out from afar, so relief a pixel averages
 * over still reads by its light: none within `FAR_FROM`, all of it past
 * `FAR_TO`, metres.
 */
const FAR_RELIEF = 3;
const FAR_FROM = 40_000;
const FAR_TO = 1_500_000;

/** The plain look reads the octaves coarser than this one. */
const PLAIN_OCTAVES = FIELD;

/** The relief's octaves and each one's share of a surface's roughness. */
const RELIEF: Parts = [
  [FIELD, 0.2],
  [SLOPE, 0.35],
  [PATCH, 0.45],
  [STEP, 0.45],
  [HAND, 0.4],
  [GRAIN, 0.3],
];
/** A lattice's mean squared slope per cell, by which relief gone under a pixel still dims its ground. */
const SLOPE_VARIANCE = 1.4;

/**
 * The land's surface as nodes: what each of the four bands the height tells
 * apart — beach, green lowland, brown upland, mountain — is made of, their
 * borders broken by slope and by noise at every scale from a country to a
 * hand, and the small relief on them. `height` is the ground's, metres above
 * the sea, and `stops` its colour by height alone, which the surface keeps at
 * the waterline, where the sea's colour meets it.
 */
export function landSurface(height: F, stops: V): LandSurface {
  const noise = landNoise();
  const { footprint, octaves } = noise;
  const eye = uniform(new Vector3(0, 1, 0));
  const zenith = normalize(eye.add(positionWorld));
  const away = length(positionWorld);
  const lean = normalWorldGeometry.sub(
    zenith.mul(dot(normalWorldGeometry, zenith)),
  );
  /** The mesh's normal, its lean drawn out with distance. */
  const shape = normalize(
    normalWorldGeometry.add(
      lean.mul(smoothstep(FAR_FROM, FAR_TO, away).mul(FAR_RELIEF)),
    ),
  );
  /** How far the ground leans off level, 0 flat and 1 a wall. */
  const steep = clamp(dot(normalWorldGeometry, zenith).oneMinus(), 0, 1);
  const ground = {
    level: height,
    stops,
    steep,
    away,
    cover: attribute(COVER_ATTRIBUTE, 'float'),
    footprint,
  };
  const fine = landBands(ground, octaves, true);
  let slope: V = vec3(0);
  let lost: F = float(0);
  for (const [i, share] of RELIEF) {
    const octave = octaves[i] ?? QUIET;
    slope = slope.add(octave.slope.mul(share));
    lost = lost.add(octave.told.oneMinus().mul(share * share * SLOPE_VARIANCE));
  }
  const relief = slope.mul(fine.roughness);
  const { colour } = landBands(ground, octaves.slice(0, PLAIN_OCTAVES), false);

  return {
    fine: {
      // Relief under a pixel's width leaves no slope to light, only less light.
      colour: fine.colour.mul(
        inverseSqrt(lost.mul(fine.roughness).mul(fine.roughness).add(1)),
      ),
      normal: transformNormalToView(
        normalize(shape.sub(relief.sub(shape.mul(dot(relief, shape))))),
      ),
    },
    plain: { colour, normal: transformNormalToView(shape) },
    update: ([x, y, z]) => {
      eye.value.set(x, y, z);
      noise.update([x, y, z]);
    },
  };
}
