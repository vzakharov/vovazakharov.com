import {
  attribute,
  clamp,
  cross,
  dot,
  length,
  min,
  mix,
  modelWorldMatrix,
  normalize,
  positionLocal,
  sin,
  smoothstep,
  uniform,
  vec3,
  vec4,
} from 'three/tsl';
import { Vector3 } from 'three/webgpu';

import { tierReach } from '../model/tree-placing';

/** The instance attribute holding a tree's foot (relative to the view's anchor) and its tier's reach. */
export const FOOT_ATTRIBUTE = 'treeFoot';

/** The share of its tier's reach at which a tree starts to shrink away. */
const SHRINK_FROM = 0.55;

/**
 * How many times its own width a far tree widens to at most: wider, and a
 * stand's one crown lies across more relief than it is tall and sinks into it.
 */
const WIDEST = 2.5;

/** How far the wind is seen moving a tree: from the first distance it fades, to still at the second, metres. */
const WIND_SEEN = [150, 400] as const;

/** Metres a crown 10 m up swings at a gust's peak; the swing grows as the square of the height. */
const SWAY = 0.09;

/**
 * Where a tree's vertex is drawn, from its place as an instance: shrunk toward
 * the tree's foot as the eye draws away to its tier's reach, widened where it
 * stands for a stand, and bent by the wind. `centre` is the planet's middle as
 * the instances see it and `seconds` the wind's clock, both the caller's to
 * set.
 */
export function treeNodes() {
  const foot = attribute(FOOT_ATTRIBUTE, 'vec4');
  /** The eye sits at the world's origin, so the foot's world position is its offset from the eye. */
  const away = length(modelWorldMatrix.mul(vec4(foot.xyz, 1)).xyz);
  const shown = smoothstep(foot.w.mul(SHRINK_FROM), foot.w, away).oneMinus();
  /**
   * A tree of a coarser tier stands for the stand about it: it widens toward
   * its tier's cell share, `WIDEST` at most, over the span the tier below
   * shrinks away in, so the canopy thins with distance slower than the trees
   * drawn do.
   */
  const centre = uniform(new Vector3());
  const up = normalize(foot.xyz.sub(centre));
  const off = positionLocal.sub(foot.xyz);
  const rise = up.mul(dot(off, up));
  const widen = min(foot.w.div(tierReach(0)), WIDEST)
    .sub(1)
    .mul(smoothstep(foot.w.mul(SHRINK_FROM / 2), foot.w.mul(0.5), away))
    .add(1);
  const grown = foot.xyz.add(rise).add(off.sub(rise).mul(widen));
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
  const swayed = grown.add(downwind.mul(swing).mul(bent));
  return { drawnAt: mix(foot.xyz, swayed, shown), centre, seconds };
}
