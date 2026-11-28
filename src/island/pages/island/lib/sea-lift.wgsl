// A sea vertex lifted by the swell: a TSL `wgslFn`'s source, so the module
// holds this one function, the rest of the sea reached from `island-sea.wgsl`.

import super::island_sea::{seaSwellAt, seaNear, SEA_SHEET_RIDES};

/// The vertex `local` of a mesh at `origin`, lifted along the up of an eye at
/// `eye` over a floor at `bed`: by the swell's level over water, and to just
/// over the sand ashore, where `seaLies` cuts the surface to the sheet's
/// outline a fragment at a time.
fn seaLift(
  local: vec3f,
  origin: vec3f,
  eye: vec3f,
  bed: f32,
  swell: vec2f,
) -> vec3f {
  let world = local + origin;
  var level = seaSwellAt(world, bed, swell);
  if (bed > 0.0) {
    level = max(level, seaNear(world) * (bed + SEA_SHEET_RIDES));
  }
  return local + normalize(eye + world) * level;
}
