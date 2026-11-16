// The shore's cusps in the island's world frame: the twin of `cuspAt` in
// shore-cusps.ts.

import package::nature::shared::shore::shore_cusped::cusped;
import package::nature::shared::swell::swell_course::{SWELL_RUNS_X, SWELL_RUNS_Z};

/// `cusped` at `xz` in the world frame.
fn cuspAt(xz: vec2f) -> f32 {
  return cusped(xz.x * SWELL_RUNS_Z - xz.y * SWELL_RUNS_X);
}
