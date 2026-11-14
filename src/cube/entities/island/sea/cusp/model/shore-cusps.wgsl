// The shore's cusps in the world frame: the twin of `cuspAt` in
// shore-cusps.ts, which `swell.test.ts` runs this against.

import super::shore_cusped::cusped;
import package::cube::entities::island::sea::swell::model::swell_course::{SWELL_RUNS_X, SWELL_RUNS_Z};

/// `cusped` at `xz` in the world frame.
fn cuspAt(xz: vec2f) -> f32 {
  return cusped(xz.x * SWELL_RUNS_Z - xz.y * SWELL_RUNS_X);
}
