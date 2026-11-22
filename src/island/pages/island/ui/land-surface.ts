import {
  attribute,
  clamp,
  cos,
  dot,
  float,
  inverseSqrt,
  length,
  mix,
  normalize,
  normalWorldGeometry,
  positionWorld,
  smoothstep,
  transformNormalToView,
  uniform,
  vec3,
} from 'three/tsl';
import { type Node, Vector3 } from 'three/webgpu';

import type { Look } from '@/island/shared/play';

import { ripplePhaseOf, SAND_RIPPLE } from '../lib/land-octaves';
import {
  COVER_ATTRIBUTE,
  ROCKY_ATTRIBUTE,
  SAND_ATTRIBUTE,
} from '../model/cover-attribute';
import { type Coloured, landBands } from './land-bands';
import { FIELD, GRAIN, HAND, type Parts, PATCH, SLOPE, STEP } from './land-mix';
import { ABSENT, type Following, landNoise, QUIET } from './land-noise';

type F = Node<'float'>;
type V = Node<'vec3'>;

/** The land in one of the scene's looks: what its material is dressed in. */
type LandDress = Coloured & {
  /** The ground's normal in view space: a land material's `normalNode`. */
  readonly normal: V;
};

export type LandSurface = Following & {
  /** The fine look: every scale of the surface, down to the grain underfoot. */
  readonly fine: LandDress;
  /** The swift look: the fine one less what only tells underfoot. */
  readonly swift: LandDress;
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

/** The swift look reads the octaves coarser than this one: a hand's breadth and a grain tell only underfoot. */
const SWIFT_OCTAVES = HAND;

/** The width of a fragment between which far sand's lean is taken out, metres, and the share of it taken. */
const SAND_SOFTENS = [0.3, 4] as const;
const SAND_SOFTENED = 0.75;

/** The relief's octaves and each one's share of a surface's roughness. */
const RELIEF: Parts = [
  [FIELD, 0.2],
  [SLOPE, 0.35],
  [PATCH, 0.45],
  [STEP, 0.45],
  [HAND, 0.4],
  [GRAIN, 0.3],
];
/** How steep the lee of a sand ripple stands. */
const RIPPLE_SLOPE = 0.3;

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
  const ripplePhase = uniform(0);
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
  /**
   * The shape as bare sand `sandy` is lit by: a dune's slip face narrower than
   * a pixel draws as a pen stroke, so from afar sand leans toward level and a
   * dune field is soft light and shade.
   */
  const softened = (sandy: F): V =>
    normalize(
      mix(
        shape,
        zenith,
        sandy.mul(smoothstep(...SAND_SOFTENS, footprint)).mul(SAND_SOFTENED),
      ),
    );
  const ground = {
    level: height,
    stops,
    steep,
    away,
    cover: attribute(COVER_ATTRIBUTE, 'float'),
    sand: attribute(SAND_ATTRIBUTE, 'float'),
    rocky: attribute(ROCKY_ATTRIBUTE, 'float'),
    footprint,
  };
  const wind = vec3(...SAND_RIPPLE.wind);
  /** A look past the plain one: the bands over the octaves coarser than `reach`, and their small relief. */
  const dressed = (look: Look, reach: number): LandDress => {
    const told = octaves.map((octave, i) => (i < reach ? octave : ABSENT));
    const at = (i: number) => told[i] ?? QUIET;
    const bands = landBands(ground, told, look);
    let slope: V = vec3(0);
    let lost: F = float(0);
    for (const [i, share] of RELIEF) {
      const octave = at(i);
      slope = slope.add(octave.slope.mul(share));
      lost = lost.add(
        octave.told.oneMinus().mul(share * share * SLOPE_VARIANCE),
      );
    }
    // The ripples' crests wander by a hand's breadth, as wind leaves them.
    const along = dot(wind, positionWorld)
      .div(SAND_RIPPLE.length)
      .add(ripplePhase)
      .add(at(HAND).value.mul(0.35))
      .add(at(STEP).value.mul(0.6));
    const ripple = wind.mul(cos(along.mul(Math.PI * 2))).mul(
      smoothstep(SAND_RIPPLE.length / 8, SAND_RIPPLE.length / 2.5, footprint)
        .oneMinus()
        .mul(bands.rippled)
        // Ripples stand high in one patch of sand and lie nearly flat in the next.
        .mul(at(PATCH).value.mul(0.5).add(0.6))
        .mul(RIPPLE_SLOPE),
    );
    const relief = slope.mul(bands.roughness).add(ripple);
    const lit = softened(bands.rippled);
    return {
      // Relief under a pixel's width leaves no slope to light, only less light.
      colour: bands.colour.mul(
        inverseSqrt(lost.mul(bands.roughness).mul(bands.roughness).add(1)),
      ),
      normal: transformNormalToView(
        normalize(lit.sub(relief.sub(lit.mul(dot(relief, lit))))),
      ),
    };
  };
  const { colour, rippled } = landBands(
    ground,
    octaves.slice(0, PLAIN_OCTAVES),
    'plain',
  );

  return {
    fine: dressed('fine', octaves.length),
    swift: dressed('swift', SWIFT_OCTAVES),
    plain: { colour, normal: transformNormalToView(softened(rippled)) },
    update: ([x, y, z]) => {
      eye.value.set(x, y, z);
      ripplePhase.value = ripplePhaseOf([x, y, z]);
      noise.update([x, y, z]);
    },
  };
}
