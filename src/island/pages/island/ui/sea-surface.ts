import {
  code,
  dFdx,
  dFdy,
  length,
  max,
  positionWorld,
  uniform,
  wgslFn,
} from 'three/tsl';
import { Color, type Node, Vector3 } from 'three/webgpu';

import type { Vec3 } from '@/island/shared/globe';

import type { Sunlit } from '../lib/day';
import { RIPPLE_PERIOD } from '../lib/ripple-table';
import { SEA_LISTING } from '../lib/sea-wgsl';

/** What the sea is drawn under, this frame. */
export type SeaFrame = Sunlit & {
  /** The eye from the planet's centre, metres. */
  readonly eye: Vec3;
  /** The sky's colour at the horizon, which the far sea fades to. */
  readonly horizon: Color;
  /** The sea's clock, seconds into its hour. */
  readonly seconds: number;
};

export type SeaSurface = {
  /**
   * The sea's colour over a floor at height `bed`, its body `under` the
   * surface unlit: a `vec3`, which three's types cannot read off the WGSL.
   */
  readonly colour: (bed: Node<'float'>, under: Node<'vec3'>) => Node;
  readonly update: (frame: SeaFrame) => void;
};

const wrapped = (metres: number) =>
  ((metres % RIPPLE_PERIOD) + RIPPLE_PERIOD) % RIPPLE_PERIOD;

/**
 * The sea's surface as nodes: ripples under the wind, the sky mirrored in
 * them, the sun's glint, foam at the waterline and the haze toward the
 * horizon, all in the WGSL of `SEA_LISTING`, which only the WebGPU backend
 * compiles.
 */
export function seaSurface(): SeaSurface {
  const eyeNode = uniform(new Vector3());
  const sun = uniform(new Vector3(0, 1, 0));
  const horizon = uniform(new Color());
  const seconds = uniform(0);
  /**
   * The eye modulo the ripples' period, taken in float64. A fragment's place
   * is this plus its position from the eye, so it is finest where the eye is
   * nearest and the ripples are seen, anywhere on the planet.
   */
  const anchor = uniform(new Vector3());
  const place = anchor.add(positionWorld);
  const footprint = max(
    length(dFdx(positionWorld)),
    length(dFdy(positionWorld)),
  );
  const shade = wgslFn(
    `fn seaShade(
      place: vec3f, world: vec3f, eye: vec3f, sun: vec3f, bed: f32, under: vec3f,
      footprint: f32, seconds: f32, horizon: vec3f,
    ) -> vec3f {
      return seaColour(place, world, eye, sun, bed, under, footprint, seconds, horizon);
    }`,
    [code(SEA_LISTING)],
  );

  return {
    colour: (bed, under) =>
      shade({
        place,
        world: positionWorld,
        eye: eyeNode,
        sun,
        bed,
        under,
        footprint,
        seconds,
        horizon,
      }),
    update: (frame) => {
      const [x, y, z] = frame.eye;
      eyeNode.value.set(x, y, z);
      anchor.value.set(wrapped(x), wrapped(y), wrapped(z));
      sun.value.set(...frame.sun);
      horizon.value.copy(frame.horizon);
      seconds.value = frame.seconds;
    },
  };
}
