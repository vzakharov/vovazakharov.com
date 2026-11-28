// Lit ground as the swash's dampness leaves it: a TSL `wgslFn`'s source, so
// the module holds this one function, the rest of the sea reached from
// `island-sea.wgsl`.

import super::island_sea::{seaNear, seaTau, seaTongue};
import package::nature::shared::shore::wetness::{drySince, dampAfter};

/// `lit` at a point ashore over a floor at `bed`, dark where a sheet has just
/// left the sand, drying back to its own colour.
fn seaDamp(lit: vec4f, world: vec3f, bed: f32, swell: vec2f) -> vec4f {
  let near = seaNear(world);
  if (bed > 1.5 || near <= 0.0) {
    return lit;
  }
  let tau = seaTau(world, bed, swell);
  let damp = near * dampAfter(drySince(tau, bed, seaTongue(world, swell)));
  return vec4f(lit.rgb * mix(vec3f(1.0), vec3f(0.6, 0.57, 0.52), damp), lit.a);
}
