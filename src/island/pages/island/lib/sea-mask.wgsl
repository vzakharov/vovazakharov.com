// Whether water lies on a fragment: a TSL `wgslFn`'s source, so the module
// holds this one function, the rest of the sea reached from `island-sea.wgsl`.

import super::island_sea::seaLies;

/// `seaLies`, under the name a material's mask calls.
fn seaMask(world: vec3f, bed: f32, swell: vec2f) -> bool {
  return seaLies(world, bed, swell);
}
