// The light falling on a matte face outdoors, to be multiplied by what the
// face is made of.

import package::cube::shared::cube_boundary::sun::{SUN_LIGHT, SUN_DIR, SKY_FILL};
import super::cube_shadow::cubeShadow;

/// The light on a matte face at `p` in the world frame: the sun where the
/// cube's shadow lets it through, and the sky's fill, more of it the more of
/// the sky the face looks at.
fn daylight(p: vec3f, normal: vec3f) -> vec3f {
  let sun = SUN_LIGHT * max(dot(normal, SUN_DIR), 0.0) * cubeShadow(p);
  return sun + SKY_FILL * (0.5 + 0.5 * normal.y);
}
