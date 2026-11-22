import {
  attribute,
  clamp,
  cross,
  dot,
  length,
  mix,
  modelWorldMatrix,
  normalize,
  positionLocal,
  sin,
  smoothstep,
  step,
  uniform,
  vec3,
  vec4,
} from 'three/tsl';
import { Vector3 } from 'three/webgpu';

/** The instance attribute holding a tree's foot (relative to the view's anchor) and the distance past which it is gone. */
export const FOOT_ATTRIBUTE = 'treeFoot';

/**
 * The share of its tier's reach from which a tier's trees go, each at a
 * distance of its own up to the whole reach: a tier thins out tree by tree, and
 * no tree is ever drawn at another size than its own.
 */
export const GOES_FROM = 0.65;

/** How far the wind is seen moving a tree: from the first distance it fades, to still at the second, metres. */
const WIND_SEEN = [150, 400] as const;

/** Metres a crown 10 m up swings at a gust's peak; the swing grows as the square of the height. */
const SWAY = 0.09;

/**
 * Where a tree's vertex is drawn, from its place as an instance: where it
 * stands, bent by the wind, or all at its foot — so not at all — once the eye
 * is past the distance the instance names. `centre` is the planet's middle as
 * the instances see it and `seconds` the wind's clock, both the caller's to
 * set.
 */
export function treeNodes() {
  const foot = attribute(FOOT_ATTRIBUTE, 'vec4');
  /** The eye sits at the world's origin, so the foot's world position is its offset from the eye. */
  const away = length(modelWorldMatrix.mul(vec4(foot.xyz, 1)).xyz);
  const shown = step(away, foot.w);
  const centre = uniform(new Vector3());
  const up = normalize(foot.xyz.sub(centre));
  const off = positionLocal.sub(foot.xyz);
  /**
   * Wind: gusts cross the ground as waves, and each tree bends with the one
   * over its foot, its top the most and its foot not at all.
   */
  const seconds = uniform(0);
  const downwind = normalize(cross(up, vec3(0.3, 0.2, 1)));
  const gust = dot(foot.xyz.sub(centre), downwind)
    .mul(0.045)
    .sub(seconds.mul(1.1));
  const swing = sin(gust)
    .mul(0.6)
    .add(sin(gust.mul(2.7).add(seconds.mul(0.9))).mul(0.4));
  const bent = clamp(dot(off, up).div(10), 0, 3)
    .pow2()
    .mul(SWAY)
    .mul(smoothstep(WIND_SEEN[0], WIND_SEEN[1], away).oneMinus());
  const swayed = positionLocal.add(downwind.mul(swing).mul(bent));
  return { drawnAt: mix(foot.xyz, swayed, shown), centre, seconds };
}
