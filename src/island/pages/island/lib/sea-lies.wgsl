// Whether water lies on a fragment: a TSL `wgslFn`'s source, so the module
// holds this one function, the rest of the sea reached from `island-sea.wgsl`.

import super::island_sea::{seaSwellAt, SEA_SHEET_THINNEST};

/// Whether water lies at a point: always over a floor under the still sea,
/// ashore only under a sheet.
fn seaLies(world: vec3f, bed: f32, swell: vec2f) -> bool {
  return bed <= 0.0 || seaSwellAt(world, bed, swell) - bed > SEA_SHEET_THINNEST;
}
