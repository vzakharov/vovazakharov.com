// Lit ground as the swash's dampness leaves it: a TSL `wgslFn`'s source, so
// the module holds this one function, the rest of the sea reached from
// `island-sea.wgsl`.

import super::island_sea::seaDampTint;

/// `lit` darkened where a sheet has just left the sand at `bed`.
fn seaDamp(lit: vec4f, world: vec3f, bed: f32, swell: vec2f) -> vec4f {
  return vec4f(lit.rgb * seaDampTint(world, bed, swell), lit.a);
}
