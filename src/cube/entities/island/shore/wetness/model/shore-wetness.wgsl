// How damp the island's sand is at a point and a moment: nature's wetness,
// read where the island's own height and the swell's arrival time put it.

import package::cube::entities::island::land::model::island_height::islandHeight;
import package::cube::entities::island::sea::model::shore_cusps::cuspAt;
import package::nature::shared::shore::wetness::{drySince, dampAfter, filmAfter};
import package::nature::shared::swell::swell_course::{SWELL_RUNS, SWELL_PACE};
import package::nature::shared::shore::shore_level::{shoreFacing, shoreDelay, shoreDepth, sheltered};
import package::cube::entities::island::shore::level::model::water_level::shoreRise;

/// Seconds since the swash last lay on the sand at `xz` at time `t`.
fn shoreDrySince(xz: vec2f, t: f32) -> f32 {
  let bed = islandHeight(xz);
  let rise = shoreRise(xz);
  let facing = shoreFacing(dot(rise, SWELL_RUNS), length(rise), bed);
  let tau = t - dot(xz, SWELL_RUNS) * SWELL_PACE - shoreDelay(shoreDepth(bed));
  return drySince(tau, bed, sheltered(facing) * cuspAt(xz));
}

/// The sand at `xz` at time `t`: x how damp it is (1 soaked), y how much of
/// a film of water stands on it (1 a mirror).
fn shoreWetness(xz: vec2f, t: f32) -> vec2f {
  let dry = shoreDrySince(xz, t);
  return vec2f(dampAfter(dry), filmAfter(dry));
}
