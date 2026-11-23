// A sea vertex lifted by the swell: a TSL `wgslFn`'s source, so the module
// holds this one function, the rest of the sea reached from `island-sea.wgsl`.

import super::island_sea::seaVertexLevel;

/// The vertex `local` of a mesh at `origin`, lifted along the up of an eye at
/// `eye` by the swell's level over a floor at `bed`.
fn seaLift(
  local: vec3f,
  origin: vec3f,
  eye: vec3f,
  bed: f32,
  swell: vec2f,
) -> vec3f {
  let world = local + origin;
  return local + normalize(eye + world) * seaVertexLevel(world, bed, swell);
}
