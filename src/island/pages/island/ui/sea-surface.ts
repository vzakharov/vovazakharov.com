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

import type { Vec3 } from '@/island/shared/globe';

import type { Sunlit } from '../lib/day';
import { GROUP_PERIOD, RIPPLE_PERIOD } from '../lib/ripple-table';
import { intoPeriod, SEA_LISTING, swellAt } from '../lib/sea-wgsl';
import { worldCell } from './lattice-value';

/** What the sea is drawn under, this frame. */
export type SeaFrame = Sunlit & {
  /** The eye from the planet's centre, metres. */
  readonly eye: Vec3;
  /** The sea's clock, seconds into its hour. */
  readonly time: number;
};

/** The sky's radiance arriving from a unit world direction, in the scene's exposure. */
type Radiance = (direction: Node<'vec3'>) => Node<'vec3'>;

export type SeaSurface = {
  /**
   * The sea's colour over a floor at height `bed`, its body `under` the
   * surface unlit: a `vec3`, which three's types cannot read off the WGSL.
   * A mesh whose triangles are `wide` — kilometres, as the globe's — reads
   * the mirrored sky per fragment; any other reads it per vertex.
   */
  readonly colour: (
    bed: Node<'float'>,
    under: Node<'vec3'>,
    wide?: boolean,
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
 * the WGSL of `SEA_LISTING`, which only the WebGPU backend
 * compiles.
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
  /** What a still sea would mirror, kept off the ground: the sky toward it, and the sky overhead. */
  const mirrored = radiance(
    normalize(flat.add(zenith.mul(max(float(0.03).sub(dot(flat, zenith)), 0)))),
  );
  const mirroredAtVertex = vertexStage(mirrored);
  // The zenith turns a degree over a hundred kilometres: a vertex's sky is any fragment's.
  const overhead = vertexStage(radiance(zenith));
  const footprint = max(
    length(dFdx(positionWorld)),
    length(dFdy(positionWorld)),
  );
  /** The swell at the eye: its clock, and the eye's place along the crests. */
  const swell = uniform(new Vector2());
  const listing = code(SEA_LISTING);
  const lift = wgslFn(
    `fn seaLift(local: vec3f, origin: vec3f, eye: vec3f, bed: f32, swell: vec2f) -> vec3f {
      let world = local + origin;
      return local + normalize(eye + world) * seaVertexLevel(world, bed, swell);
    }`,
    [listing],
  );
  const lies = wgslFn(
    `fn seaMask(world: vec3f, bed: f32, swell: vec2f) -> bool {
      return seaLies(world, bed, swell);
    }`,
    [listing],
  );
  const damp = wgslFn(
    `fn seaDamp(lit: vec4f, world: vec3f, bed: f32, swell: vec2f) -> vec4f {
      return vec4f(lit.rgb * seaDampTint(world, bed, swell), lit.a);
    }`,
    [listing],
  );
  const shade = wgslFn(
    `fn seaShade(
      place: vec3f, field: vec3f, grain: vec3f, world: vec3f, eye: vec3f, sun: vec3f, bed: f32,
      under: vec3f, footprint: f32, seconds: f32, mirrored: vec3f, overhead: vec3f, swell: vec2f,
    ) -> vec3f {
      return seaColour(
        place, field, grain, world, eye, sun, bed, under, footprint, seconds, mirrored, overhead, swell,
      );
    }`,
    [listing],
  );

  return {
    colour: (bed, under, wide = false) =>
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
        mirrored: wide ? mirrored : mirroredAtVertex,
        overhead,
        swell,
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
