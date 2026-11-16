// The island's water level, `waterLevel(xz, t)`: nature's shore level, fed
// the island's own bed, which way its shore faces, and its cusps.

import package::cube::entities::island::land::model::island_height::islandHeight;
import package::cube::entities::island::sea::model::shore_cusps::cuspAt;
import package::nature::shared::shore::shore_level::{shoreFacing, sheltered, swellLevel};
import package::nature::shared::swell::swell_course::SWELL_RUNS;
import package::nature::shared::shore::shore_level_numbers::SHORE_FACING_REACH;

/// The bed's rise per metre at `xz`, along x and z.
fn shoreRise(xz: vec2f) -> vec2f {
  let reach = SHORE_FACING_REACH;
  return
    vec2f(
      islandHeight(xz + vec2f(reach, 0.0)) - islandHeight(
        xz - vec2f(reach, 0.0),
      ),
      islandHeight(xz + vec2f(0.0, reach)) - islandHeight(
        xz - vec2f(0.0, reach),
      ),
    ) / (2.0 * reach);
}

/// The sea's slow surface at `xz` at time `t`: metres over the still sea,
/// with the swell, its surf and the swash and no wind wave.
fn waterLevel(xz: vec2f, t: f32) -> f32 {
  let bed = islandHeight(xz);
  let rise = shoreRise(xz);
  let facing = shoreFacing(dot(rise, SWELL_RUNS), length(rise), bed);
  return swellLevel(dot(xz, SWELL_RUNS), bed, sheltered(facing), cuspAt(xz), t);
}
