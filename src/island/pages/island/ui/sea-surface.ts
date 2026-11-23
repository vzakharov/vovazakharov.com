import {
  code,
  dFdx,
  dFdy,
  dot,
  float,
  length,
  max,
  modelPosition,
  normalize,
  positionGeometry,
  positionWorld,
  reflect,
  uniform,
  vec3,
  vertexStage,
  wgslFn,
} from 'three/tsl';
import { type Node, Vector2, Vector3 } from 'three/webgpu';

import { assemble } from '@/gpu/shared/shader';

import type { Vec3 } from '@/island/shared/globe';

import type { Sunlit } from '../lib/day';
import { GROUP_PERIOD, RIPPLE_BANDS, RIPPLE_PERIOD } from '../lib/ripple-table';
import { SEA_DAMP } from '../lib/sea-damp.shader.generated';
import { SEA_LIES } from '../lib/sea-lies.shader.generated';
import { SEA_LIFT } from '../lib/sea-lift.shader.generated';
import { intoPeriod, swellAt } from '../lib/sea-numbers';
import { SEA_SHADING } from '../lib/sea-shading.shader.generated';
import { worldCell } from './lattice-value';

/** What the sea is drawn under, this frame. */
export type SeaFrame = Sunlit & {
  /** The eye from the planet's centre, metres. */
  readonly eye: Vec3;
  /** The sea's clock, seconds into its hour. */
  readonly time: number;
};

/** The sky's radiance arriving from a unit world direction, in the scene's exposure, with or without its clouds. */
type Radiance = (direction: Node<'vec3'>, cloudless?: boolean) => Node<'vec3'>;

/** How a sea mesh is shaded. */
type Shading = {
  /**
   * Its triangles are kilometres wide, as the globe's: it reads the mirrored
   * sky per fragment, where any other reads it per vertex.
   */
  readonly wide?: boolean;
  /** The swift look: a cloudless sky in the water, and the finest bands only in `hidden`. */
  readonly swift?: boolean;
};

/** The ripples' bands the swift look draws as slopes; the finer ones go to `hidden`. */
const SWIFT_BANDS = RIPPLE_BANDS - 4;

export type SeaSurface = {
  /**
   * The sea's colour over a floor at height `bed`, its body `under` the
   * surface unlit: a `vec3`, which three's types cannot read off the WGSL.
   */
  readonly colour: (
    bed: Node<'float'>,
    under: Node<'vec3'>,
    shading?: Shading,
  ) => Node;
  /**
   * A sea vertex lifted by the swell over a floor at `bed`: a material's
   * `positionNode`.
   */
  readonly lifted: (bed: Node<'float'>) => Node;
  /** Whether water lies on a fragment over a floor at `bed`: a material's `maskNode`. */
  readonly lies: (bed: Node<'float'>) => Node;
  /**
   * Lit ground at height `bed` as the swash's dampness leaves it: a `vec4`, a
   * land material's `outputNode` over its own `lit` output.
   */
  readonly damp: (lit: Node<'vec4'>, bed: Node<'float'>) => Node;
  readonly update: (frame: SeaFrame) => void;
};

/**
 * The sea's surface as nodes: ripples under the wind, the sky mirrored in
 * them out of `radiance`, the sun's glint and foam at the waterline, all in
 * the WGSL of `island-sea.wgsl`, which only the WebGPU backend compiles.
 */
export function seaSurface(radiance: Radiance): SeaSurface {
  const eyeNode = uniform(new Vector3());
  const sun = uniform(new Vector3(0, 1, 0));
  const seconds = uniform(0);
  /**
   * The eye modulo the ripples' period, taken in float64. A fragment's place
   * is this plus its position from the eye, so it is finest where the eye is
   * nearest and the ripples are seen, anywhere on the planet.
   */
  const anchor = uniform(new Vector3());
  const place = anchor.add(positionWorld);
  /** The eye modulo the slow fields' period, and a fragment's place in them. */
  const fieldAnchor = uniform(new Vector3());
  const field = fieldAnchor.add(positionWorld);
  /** The world's shift of every lattice: where it numbers cell nought. */
  const grain = worldCell(vec3(0, 0, 0));
  const zenith = normalize(eyeNode.add(positionWorld));
  const flat = reflect(normalize(positionWorld), zenith);
  /** What a still sea would mirror, kept off the ground: the sky toward it. */
  const stillward = normalize(
    flat.add(zenith.mul(max(float(0.03).sub(dot(flat, zenith)), 0))),
  );
  // Both ask `radiance` at each call, so it answers as it stands then.
  const mirroredSky = ({ wide = false, swift = false }: Shading) => {
    const mirrored = radiance(stillward, swift);
    return wide ? mirrored : vertexStage(mirrored);
  };
  // The zenith turns a degree over a hundred kilometres: a vertex's sky is any fragment's.
  const overheadSky = () => vertexStage(radiance(zenith));
  const footprint = max(
    length(dFdx(positionWorld)),
    length(dFdy(positionWorld)),
  );
  /** The swell at the eye: its clock, and the eye's place along the crests. */
  const swell = uniform(new Vector2());
  // One listing of what the entries need, which every entry includes, so a
  // shader calling two of them declares the sea once; an entry's own listing
  // is its one function.
  const listing = code(
    assemble(
      [SEA_LIFT, SEA_LIES, SEA_DAMP, SEA_SHADING].flatMap(({ needs }) => needs),
    ),
  );
  const lift = wgslFn(SEA_LIFT.listing, [listing]);
  const lies = wgslFn(SEA_LIES.listing, [listing]);
  const damp = wgslFn(SEA_DAMP.listing, [listing]);
  const shade = wgslFn(SEA_SHADING.listing, [listing]);

  return {
    colour: (bed, under, shading = {}) =>
      shade({
        place,
        field,
        grain,
        world: positionWorld,
        eye: eyeNode,
        sun,
        bed,
        under,
        footprint,
        seconds,
        mirrored: mirroredSky(shading),
        overhead: overheadSky(),
        swell,
        bands: float(shading.swift === true ? SWIFT_BANDS : RIPPLE_BANDS),
      }),
    lifted: (bed) =>
      lift({
        local: positionGeometry,
        origin: modelPosition,
        eye: eyeNode,
        bed,
        swell,
      }),
    lies: (bed) => lies({ world: positionWorld, bed, swell }),
    damp: (lit, bed) => damp({ lit, world: positionWorld, bed, swell }),
    update: (frame) => {
      const [x, y, z] = frame.eye;
      eyeNode.value.set(x, y, z);
      anchor.value.set(
        intoPeriod(x, RIPPLE_PERIOD),
        intoPeriod(y, RIPPLE_PERIOD),
        intoPeriod(z, RIPPLE_PERIOD),
      );
      fieldAnchor.value.set(
        intoPeriod(x, GROUP_PERIOD),
        intoPeriod(y, GROUP_PERIOD),
        intoPeriod(z, GROUP_PERIOD),
      );
      sun.value.set(...frame.sun);
      seconds.value = frame.time;
      swell.value.set(...swellAt(frame.eye, frame.time));
    },
  };
}
