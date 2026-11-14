// A floor's lens: each pixel what the theme's lens makes of the scene.

import super::lens_stage::{lensOf, vignetted};

@fragment
fn lensFragment(@builtin(position) at: vec4f) -> @location(0) vec4f {
  let l = lensOf(at);
  return vec4f(vignetted(themeLens(l), l.uv), 1.0);
}
